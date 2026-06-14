'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createChecklist(taskId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const checklist = await prisma.checklist.create({ data: { title, taskId }, include: { items: true } });
  revalidatePath(`/tasks/${taskId}`);
  return checklist;
}

export async function deleteChecklist(checklistId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
  if (!checklist) throw new Error('Checklist não encontrado');

  await prisma.checklist.delete({ where: { id: checklistId } });
  revalidatePath(`/tasks/${checklist.taskId}`);
}

export async function addChecklistItem(checklistId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const lastItem = await prisma.checklistItem.findFirst({ where: { checklistId }, orderBy: { position: 'desc' } });
  const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
  if (!checklist) throw new Error('Checklist não encontrado');

  const item = await prisma.checklistItem.create({ data: { text, checklistId, position: (lastItem?.position ?? -1) + 1 } });
  revalidatePath(`/tasks/${checklist.taskId}`);
  return item;
}

export async function toggleChecklistItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId }, include: { checklist: true } });
  if (!item) throw new Error('Item não encontrado');

  const updated = await prisma.checklistItem.update({ where: { id: itemId }, data: { isChecked: !item.isChecked } });
  revalidatePath(`/tasks/${item.checklist.taskId}`);
  return updated;
}

export async function deleteChecklistItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId }, include: { checklist: true } });
  if (!item) throw new Error('Item não encontrado');

  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/tasks/${item.checklist.taskId}`);
}
