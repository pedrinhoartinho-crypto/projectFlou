'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  await prisma.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  });
  revalidatePath('/notifications');
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Não autorizado');

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath('/notifications');
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function createNotification(data: { type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'COMMENT_ADDED' | 'TEAM_INVITE' | 'PROJECT_INVITE' | 'DUE_DATE_REMINDER'; title: string; message: string; userId: string; link?: string }) {
  return prisma.notification.create({ data });
}
