'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const defaultColumns = [
  { name: 'A Fazer', color: '#6b7280' },
  { name: 'Em Andamento', color: '#3b82f6' },
  { name: 'Em Revisão', color: '#f59e0b' },
  { name: 'Concluído', color: '#10b981' },
];

export async function getProjects() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  return prisma.project.findMany({
    where: {
      OR: [
        { team: { members: { some: { userId: session.user.id } } } },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      team: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, image: true } },
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            where: { isArchived: false },
            orderBy: { position: 'asc' },
            include: {
              assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
              labels: { include: { label: true } },
              _count: { select: { comments: true, attachments: true, checklists: true } },
            },
          },
          _count: { select: { tasks: true } },
        },
      },
      members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
      labels: { orderBy: { name: 'asc' } },
      _count: { select: { tasks: true, members: true } },
    },
  });
  if (!project) throw new Error('Projeto não encontrado');
  return project;
}

export async function createProject(data: { name: string; description?: string; teamId: string; startDate?: string; endDate?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      teamId: data.teamId,
      ownerId: session.user.id,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      columns: { create: defaultColumns.map((col, idx) => ({ name: col.name, position: idx, color: col.color })) },
      members: { create: { userId: session.user.id, role: 'ADMIN' } },
    },
    include: { columns: { orderBy: { position: 'asc' } } },
  });
  revalidatePath('/projects');
  return project;
}

export async function updateProject(projectId: string, data: { name?: string; description?: string; status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'; startDate?: string | null; endDate?: string | null }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const member = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: session.user.id } } });
  if (!member || member.role === 'VIEWER') throw new Error('Sem permissão');

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...data,
      startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
      endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  return project;
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== session.user.id) throw new Error('Sem permissão');

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath('/projects');
}

export async function addProjectMember(projectId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER') {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const member = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: session.user.id } } });
  if (!member || member.role === 'VIEWER') throw new Error('Sem permissão');

  await prisma.projectMember.create({ data: { projectId, userId, role } });
  revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectMember(projectId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const member = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: session.user.id } } });
  if (!member || member.role === 'VIEWER') throw new Error('Sem permissão');

  await prisma.projectMember.delete({ where: { projectId_userId: { projectId, userId } } });
  revalidatePath(`/projects/${projectId}`);
}

export async function createLabel(projectId: string, name: string, color: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const label = await prisma.label.create({ data: { name, color, projectId } });
  revalidatePath(`/projects/${projectId}`);
  return label;
}

export async function deleteLabel(labelId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  await prisma.label.delete({ where: { id: labelId } });
}
