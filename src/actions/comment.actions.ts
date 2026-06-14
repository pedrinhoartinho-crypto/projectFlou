'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createComment(taskId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const comment = await prisma.comment.create({
    data: { content, taskId, userId: session.user.id },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  revalidatePath(`/tasks/${taskId}`);
  return comment;
}

export async function updateComment(commentId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id) throw new Error('Sem permissão');

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  revalidatePath(`/tasks/${comment.taskId}`);
  return updated;
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id) throw new Error('Sem permissão');

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/tasks/${comment.taskId}`);
}
