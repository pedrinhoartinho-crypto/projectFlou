'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { getProject, updateProject, addProjectMember, removeProjectMember, createLabel, deleteLabel } from '@/actions/project.actions';
import { createTask, updateTask, deleteTask, reorderTasks } from '@/actions/task.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, ListTodo, Loader2, Trash2, Settings, LayoutGrid, CalendarDays } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const priorityColors: Record<string, string> = { LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200', HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200', URGENT: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' };

export default function ProjectKanbanPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  async function load() {
    try {
      const data = await getProject(projectId as string);
      setProject(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [projectId]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination || !project) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = project.columns.find((c: any) => c.id === source.droppableId);
    const destCol = project.columns.find((c: any) => c.id === destination.droppableId);
    if (!sourceCol || !destCol) return;

    const newColumns = project.columns.map((col: any) => {
      if (col.id === source.droppableId) {
        const tasks = [...col.tasks];
        const [moved] = tasks.splice(source.index, 1);
        moved.columnId = destination.droppableId;
        if (source.droppableId === destination.droppableId) {
          tasks.splice(destination.index, 0, moved);
        }
        return { ...col, tasks: tasks.map((t: any, i: number) => ({ ...t, position: i })) };
      }
      if (col.id === destination.droppableId && source.droppableId !== destination.droppableId) {
        const tasks = [...col.tasks];
        const moved = sourceCol.tasks[source.index];
        const updatedMoved = { ...moved, columnId: destination.droppableId };
        tasks.splice(destination.index, 0, updatedMoved);
        return { ...col, tasks: tasks.map((t: any, i: number) => ({ ...t, position: i })) };
      }
      return col;
    });

    setProject({ ...project, columns: newColumns });

    const updates = newColumns.flatMap((col: any) =>
      col.tasks.map((t: any, i: number) => ({ id: t.id, columnId: col.id, position: i }))
    );
    try { await reorderTasks(updates); }
    catch (e) { console.error(e); }
  }, [project]);

  async function handleCreateTask(columnId: string) {
    if (!newTaskTitle.trim()) return;
    setCreatingTask(true);
    try {
      const task = await createTask({ title: newTaskTitle, columnId, projectId: projectId as string });
      setNewTaskTitle('');
      setNewTaskColumn('');
      load();
    } catch (e: any) { alert(e.message); }
    finally { setCreatingTask(false); }
  }

  async function handleDeleteTask(taskId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Excluir tarefa?')) return;
    try { await deleteTask(taskId); load(); }
    catch (err) { console.error(err); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!project) return <div className="text-center py-20"><p className="text-muted-foreground">Projeto não encontrado</p></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${projectId}/calendar`)}>
            <CalendarDays className="h-4 w-4 mr-2" />Calendário
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${projectId}/settings`)}>
            <Settings className="h-4 w-4 mr-2" />Configurações
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4 kanban-scroll">
          {project.columns?.map((column: any) => (
            <div key={column.id} className="flex-shrink-0 w-72 bg-muted/30 rounded-xl flex flex-col max-h-full">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                  <h3 className="font-semibold text-sm">{column.name}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{column._count?.tasks || column.tasks?.length || 0}</span>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 overflow-y-auto px-2 pb-2 min-h-[200px] space-y-2 ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''}`}>
                    {column.tasks?.map((task: any, index: number) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...(provided.draggableProps as any)}
                            {...provided.dragHandleProps}
                            className={`bg-card p-3 rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                            onClick={() => router.push(`/tasks/${task.id}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1" onClick={(e) => handleDeleteTask(task.id, e)}>
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                              </Button>
                            </div>
                            <p className="text-sm font-medium leading-snug mb-2">{task.title}</p>
                            {task.labels?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {task.labels.map((tl: any) => (
                                  <span key={tl.id} className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: tl.label.color }}>
                                    {tl.label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {task.assignees?.length > 0 && (
                                  <div className="flex -space-x-1.5">
                                    {task.assignees.slice(0, 3).map((a: any) => (
                                      <Avatar key={a.id} className="h-5 w-5 border-2 border-background">
                                        <AvatarImage src={a.user.image || ''} />
                                        <AvatarFallback className="text-[8px]">{getInitials(a.user.name || '?')}</AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {task.dueDate && <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{formatDate(task.dueDate)}</span>}
                                {(task._count?.comments || 0) > 0 && <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{task._count?.comments}</span>}
                                {(task._count?.attachments || 0) > 0 && <span className="flex items-center gap-0.5"><Paperclip className="h-3 w-3" />{task._count?.attachments}</span>}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    <div className="pt-1">
                      {newTaskColumn === column.id ? (
                        <div className="space-y-2">
                          <Input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Título da tarefa"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTask(column.id); if (e.key === 'Escape') { setNewTaskColumn(''); setNewTaskTitle(''); } }}
                          />
                          <div className="flex items-center gap-2">
                            <Button size="sm" disabled={creatingTask || !newTaskTitle.trim()} onClick={() => handleCreateTask(column.id)}>
                              {creatingTask ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Adicionar'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setNewTaskColumn(''); setNewTaskTitle(''); }}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => setNewTaskColumn(column.id)}>
                          <Plus className="h-4 w-4 mr-1" />Nova tarefa
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
