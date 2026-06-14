'use client';

import { useState, useEffect } from 'react';
import { getProjects, deleteProject } from '@/actions/project.actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderKanban, MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';

const statusLabels: Record<string, string> = { PLANNING: 'Planejamento', ACTIVE: 'Ativo', COMPLETED: 'Concluído', ARCHIVED: 'Arquivado' };
const statusVariants: Record<string, 'warning' | 'success' | 'secondary' | 'outline'> = { PLANNING: 'warning', ACTIVE: 'success', COMPLETED: 'secondary', ARCHIVED: 'outline' };

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getProjects();
      setProjects(data as any);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(projectId: string) {
    if (!confirm('Excluir este projeto? Esta ação não pode ser desfeita.')) return;
    try { await deleteProject(projectId); load(); }
    catch (e) { console.error(e); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">Todos os seus projetos</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum projeto</h3>
          <p className="text-muted-foreground mb-4">Crie um projeto dentro de uma equipe</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md transition" onClick={() => router.push(`/projects/${project.id}`)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>Abrir</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(project.id)}>Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Badge variant={statusVariants[project.status]} className="mb-2">{statusLabels[project.status]}</Badge>
                <p className="text-sm text-muted-foreground">{project.team?.name}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>{project._count?.tasks || 0} tarefas</span>
                  <span>{project._count?.members || 0} membros</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
