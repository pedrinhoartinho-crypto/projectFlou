'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Save } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const body: any = { name };
      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await update({ name: data.name });
      setMessage('Perfil atualizado com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setMessage(e.message || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="text-lg">{getInitials(session?.user?.name || 'U')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('sucesso') ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Alterar Senha</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Senha Atual</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Deixe em branco para manter" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nova Senha</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
