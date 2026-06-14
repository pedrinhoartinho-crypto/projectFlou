'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTeam, inviteMember, removeMember, updateMemberRole } from '@/actions/team.actions';
import { createProject } from '@/actions/project.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, FolderKanban, Settings, Loader2, Mail, Trash2 } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'VIEWER'>('MEMBER');
  const [projectName, setProjectName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const data = await getTeam(teamId as string);
      setTeam(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [teamId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inviteMember(teamId as string, inviteEmail, inviteRole);
      setInviteOpen(false);
      setInviteEmail('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const project = await createProject({ name: projectName, teamId: teamId as string });
      setProjectOpen(false);
      setProjectName('');
      router.push(`/projects/${project.id}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Remover este membro da equipe?')) return;
    try {
      await removeMember(teamId as string, userId);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!team) return <div className="text-center py-20"><p className="text-muted-foreground">Equipe não encontrada</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.description && <p className="text-muted-foreground">{team.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Projeto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Projeto</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Nome do projeto" required />
                <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Criando...' : 'Criar'}</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Mail className="h-4 w-4 mr-2" />Convidar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Convidar Membro</DialogTitle></DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email do convidado" required />
                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Membro</SelectItem>
                    <SelectItem value="VIEWER">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Enviando...' : 'Enviar Convite'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FolderKanban className="h-5 w-5" />Projetos</h2>
          {team.projects?.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum projeto ainda</p>
          ) : (
            <div className="grid gap-3">
              {team.projects?.map((project: any) => (
                <Card key={project.id} className="cursor-pointer hover:shadow-md transition" onClick={() => router.push(`/projects/${project.id}`)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project._count?.tasks || 0} tarefas</p>
                    </div>
                    <Badge variant={project.status === 'ACTIVE' ? 'success' : project.status === 'PLANNING' ? 'warning' : 'secondary'}>{project.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5" />Membros ({team.members?.length})</h2>
          <div className="space-y-2">
            {team.members?.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user.image || ''} />
                    <AvatarFallback className="text-xs">{getInitials(member.user.name || '?')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">{member.role}</Badge>
                  {team.ownerId !== member.userId && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveMember(member.userId)}>
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
