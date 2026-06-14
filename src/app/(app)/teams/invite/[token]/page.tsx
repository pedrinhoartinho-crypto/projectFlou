'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { acceptInvite } from '@/actions/team.actions';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AcceptInvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function accept() {
      try {
        const teamId = await acceptInvite(token as string);
        setStatus('success');
        setMessage('Convite aceito com sucesso!');
        setTimeout(() => router.push(`/teams/${teamId}`), 2000);
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Erro ao aceitar convite');
      }
    }
    accept();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md p-8 text-center space-y-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Aceitando convite...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-lg font-medium text-green-600">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecionando...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-lg font-medium text-red-600">{message}</p>
            <Button onClick={() => router.push('/teams')}>Ir para Equipes</Button>
          </>
        )}
      </div>
    </div>
  );
}
