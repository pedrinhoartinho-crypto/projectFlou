import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { SessionProvider } from '@/providers/session-provider';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'ProjectFlow - Gerenciamento de Projetos',
  description: 'Plataforma moderna de gerenciamento de projetos para equipes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
