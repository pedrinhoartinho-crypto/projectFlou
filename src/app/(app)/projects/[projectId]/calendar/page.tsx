'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '@/actions/project.actions';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectCalendarPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getProject(projectId as string);
      setProject(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [projectId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!project) return <div className="text-center py-20"><p className="text-muted-foreground">Projeto não encontrado</p></div>;

  const tasksWithDates = project.columns?.flatMap((col: any) =>
    col.tasks?.filter((t: any) => t.dueDate).map((t: any) => ({ ...t, columnName: col.name, columnColor: col.color }))
  ) || [];

  const groupedByDate: Record<string, any[]> = {};
  tasksWithDates.forEach((t: any) => {
    const date = new Date(t.dueDate).toISOString().split('T')[0];
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(t);
  });

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nenhuma tarefa com data definida</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const d = new Date(date + 'T12:00:00');
            const isOverdue = d < new Date() && groupedByDate[date].some((t: any) => t.columnName !== 'Concluído');
            return (
              <div key={date} className="border border-border rounded-lg overflow-hidden">
                <div className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${isOverdue ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400' : 'bg-muted'}`}>
                  {d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  {isOverdue && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">Atrasado</span>}
                </div>
                <div className="divide-y divide-border">
                  {groupedByDate[date].map((task: any) => (
                    <div key={task.id} className="px-4 py-3 flex items-center justify-between hover:bg-accent/50 cursor-pointer" onClick={() => router.push(`/tasks/${task.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.columnColor }} />
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{task.columnName}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
