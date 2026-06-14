'use client';

import { useState, useEffect } from 'react';
import { getTeams, createTeam, deleteTeam } from '@/actions/team.actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, FolderKanban, MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Team } from '@/types';

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const data = await getTeams();
      setTeams(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createTeam({ name, description: description || undefined });
      setOpen(false);
      setName('');
      setDescription('');
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(teamId: string) {
    if (!confirm('Tem certeza que deseja excluir esta equipe?')) return;
    try {
      await deleteTeam(teamId);
      load();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipes</h1>
          <p className="text-muted-foreground">Gerencie suas equipes e colaboradores</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Equipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Equipe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da equipe" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (opcional)" />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {creating ? 'Criando...' : 'Criar Equipe'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma equipe</h3>
          <p className="text-muted-foreground mb-4">Crie sua primeira equipe para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="cursor-pointer hover:shadow-md transition" onClick={() => router.push(`/teams/${team.id}`)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => router.push(`/teams/${team.id}`)}>Abrir</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(team.id)}>Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {team.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{team.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><FolderKanban className="h-4 w-4" />{team._count?.projects || 0} projetos</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{team._count?.members || 0} membros</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
