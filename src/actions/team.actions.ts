'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/utils';
import { sendInviteEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function getTeams() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  return prisma.team.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { projects: true, members: true } },
      owner: { select: { id: true, name: true, image: true } },
      members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTeam(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      owner: { select: { id: true, name: true, image: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
      _count: { select: { projects: true } },
      projects: { take: 5, orderBy: { updatedAt: 'desc' }, include: { _count: { select: { tasks: true, members: true } } } },
    },
  });
  if (!team) throw new Error('Equipe não encontrada');
  return team;
}

export async function createTeam(data: { name: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id, role: 'ADMIN' } },
    },
  });
  revalidatePath('/teams');
  return team;
}

export async function updateTeam(teamId: string, data: { name?: string; description?: string; image?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const member = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: session.user.id } } });
  if (!member || member.role === 'VIEWER') throw new Error('Sem permissão');

  const team = await prisma.team.update({ where: { id: teamId }, data });
  revalidatePath(`/teams/${teamId}`);
  return team;
}

export async function deleteTeam(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== session.user.id) throw new Error('Sem permissão');

  await prisma.team.delete({ where: { id: teamId } });
  revalidatePath('/teams');
}

export async function inviteMember(teamId: string, email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER') {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const member = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: session.user.id } } });
  if (!member || member.role === 'VIEWER') throw new Error('Sem permissão');

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new Error('Equipe não encontrada');

  const existingMember = await prisma.teamMember.findFirst({ where: { teamId, user: { email } } });
  if (existingMember) throw new Error('Usuário já é membro da equipe');

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({ data: { teamId, email, token, role, expiresAt } });
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/teams/invite/${token}`;
  await sendInviteEmail(email, team.name, inviteUrl);

  return invitation;
}

export async function removeMember(teamId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const member = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: session.user.id } } });
  if (!member || member.role === 'VIEWER') throw new Error('Sem permissão');

  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
  revalidatePath(`/teams/${teamId}`);
}

export async function updateMemberRole(teamId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const currentMember = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: session.user.id } } });
  if (!currentMember || currentMember.role !== 'ADMIN') throw new Error('Sem permissão');

  await prisma.teamMember.update({ where: { teamId_userId: { teamId, userId } }, data: { role } });
  revalidatePath(`/teams/${teamId}`);
}

export async function acceptInvite(token: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation || invitation.expiresAt < new Date()) throw new Error('Convite inválido ou expirado');
  if (invitation.email !== session.user.email) throw new Error('Este convite não é para você');
  if (invitation.acceptedAt) throw new Error('Convite já foi aceito');

  await prisma.$transaction([
    prisma.teamMember.create({ data: { teamId: invitation.teamId, userId: session.user.id, role: invitation.role } }),
    prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } }),
  ]);

  revalidatePath('/teams');
  return invitation.teamId;
}
