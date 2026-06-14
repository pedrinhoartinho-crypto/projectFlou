'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Bell } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Link href="/notifications">
          <Button variant="ghost" size="icon" title="Notificações">
            <Bell className="h-5 w-5" />
          </Button>
        </Link>

        <Link href="/profile">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(session?.user?.name || 'U')}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
