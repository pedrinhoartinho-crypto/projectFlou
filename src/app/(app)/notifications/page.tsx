'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '@/actions/notification.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Loader2, CheckCheck, MailOpen } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getNotifications();
      setNotifications(data as any);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleMarkAsRead(id: string) {
    try { await markAsRead(id); setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n)); }
    catch (e) { console.error(e); }
  }

  async function handleMarkAllAsRead() {
    try { await markAllAsRead(); setNotifications(notifications.map(n => ({ ...n, isRead: true }))); }
    catch (e) { console.error(e); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Fique por dentro das novidades</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
          <p className="text-muted-foreground">Você está em dia!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
              onClick={() => {
                if (!notification.isRead) handleMarkAsRead(notification.id);
              }}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.createdAt)}</p>
                </div>
                {notification.link && (
                  <Link href={notification.link} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
