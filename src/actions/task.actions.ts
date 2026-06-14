'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      column: true,
      project: { select: { id: true, name: true, teamId: true } },
      creator: { select: { id: true, name: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
      labels: { include: { label: true } },
      comments: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, image: true } } } },
      checklists: { orderBy: { createdAt: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
      attachments: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, image: true } } } },
    },
  });
  if (!task) throw new Error('Tarefa não encontrada');
  return task;
}

export async function createTask(data: { title: string; description?: string; columnId: string; projectId: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; dueDate?: string; assigneeIds?: string[] }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const lastTask = await prisma.task.findFirst({ where: { columnId: data.columnId }, orderBy: { position: 'desc' } });

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      columnId: data.columnId,
      projectId: data.projectId,
      creatorId: session.user.id,
      position: (lastTask?.position ?? -1) + 1,
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignees: data.assigneeIds?.length ? { create: data.assigneeIds.map((userId) => ({ userId })) } : undefined,
    },
    include: { assignees: { include: { user: { select: { id: true, name: true, image: true } } } }, labels: { include: { label: true } } },
  });

  await prisma.activityLog.create({ data: { action: 'TASK_CREATED', entityType: 'TASK', entityId: task.id, userId: session.user.id, projectId: data.projectId, metadata: { title: data.title } } });
  revalidatePath(`/projects/${data.projectId}`);
  return task;
}

export async function updateTask(taskId: string, data: { title?: string; description?: string; columnId?: string; position?: number; priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; dueDate?: string | null; estimatedHours?: number | null; isArchived?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Tarefa não encontrada');

  const updateData: any = { ...data };
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: { assignees: { include: { user: { select: { id: true, name: true, image: true } } } }, labels: { include: { label: true } } },
  });

  if (data.columnId) {
    await prisma.activityLog.create({ data: { action: 'TASK_MOVED', entityType: 'TASK', entityId: taskId, userId: session.user.id, projectId: task.projectId, metadata: { columnId: data.columnId } } });
  }

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath(`/tasks/${taskId}`);
  return updated;
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Tarefa não encontrada');

  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${task.projectId}`);
}

export async function reorderTasks(updates: { id: string; columnId: string; position: number }[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  for (const update of updates) {
    await prisma.task.update({ where: { id: update.id }, data: { columnId: update.columnId, position: update.position } });
  }
}

export async function addAssignee(taskId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  await prisma.taskAssignee.create({ data: { taskId, userId } });
  revalidatePath(`/tasks/${taskId}`);
}

export async function removeAssignee(taskId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  await prisma.taskAssignee.delete({ where: { taskId_userId: { taskId, userId } } });
  revalidatePath(`/tasks/${taskId}`);
}

export async function addLabel(taskId: string, labelId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  await prisma.taskLabel.create({ data: { taskId, labelId } });
  revalidatePath(`/tasks/${taskId}`);
}

export async function removeLabel(taskId: string, labelId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  await prisma.taskLabel.delete({ where: { taskId_labelId: { taskId, labelId } } });
  revalidatePath(`/tasks/${taskId}`);
}
