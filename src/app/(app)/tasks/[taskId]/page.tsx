'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTask, updateTask, deleteTask, addAssignee, removeAssignee, addLabel, removeLabel } from '@/actions/task.actions';
import { createComment, updateComment, deleteComment } from '@/actions/comment.actions';
import { createChecklist, deleteChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } from '@/actions/checklist.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Calendar, Trash2, Plus, CheckSquare, Paperclip, MessageSquare, X, Clock } from 'lucide-react';
import { getInitials, formatDate, formatRelativeTime } from '@/lib/utils';

const priorityColors: Record<string, string> = { LOW: 'bg-gray-100 text-gray-700', MEDIUM: 'bg-blue-100 text-blue-700', HIGH: 'bg-amber-100 text-amber-700', URGENT: 'bg-red-100 text-red-700' };

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  async function load() {
    try {
      const data = await getTask(taskId as string);
      setTask(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [taskId]);

  async function handleUpdateTitle() {
    if (!task?.title.trim()) return;
    try { await updateTask(taskId as string, { title: task.title }); }
    catch (e) { console.error(e); }
  }

  async function handleUpdateField(field: string, value: any) {
    try { await updateTask(taskId as string, { [field]: value }); load(); }
    catch (e) { console.error(e); }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    try { await createComment(taskId as string, commentText); setCommentText(''); load(); }
    catch (e) { console.error(e); }
  }

  async function handleDeleteComment(commentId: string) {
    try { await deleteComment(commentId); load(); }
    catch (e) { console.error(e); }
  }

  async function handleCreateChecklist() {
    if (!newChecklistTitle.trim()) return;
    try { await createChecklist(taskId as string, newChecklistTitle); setNewChecklistTitle(''); load(); }
    catch (e) { console.error(e); }
  }

  async function handleAddItem(checklistId: string) {
    const text = newItemText[checklistId];
    if (!text?.trim()) return;
    try { await addChecklistItem(checklistId, text); setNewItemText({ ...newItemText, [checklistId]: '' }); load(); }
    catch (e) { console.error(e); }
  }

  async function handleToggleItem(itemId: string) {
    try { await toggleChecklistItem(itemId); load(); }
    catch (e) { console.error(e); }
  }

  async function handleDeleteTask() {
    if (!confirm('Excluir esta tarefa?')) return;
    try { await deleteTask(taskId as string); router.push(`/projects/${task?.projectId}`); }
    catch (e) { console.error(e); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!task) return <div className="text-center py-20"><p className="text-muted-foreground">Tarefa não encontrada</p></div>;

  const totalItems = task.checklists?.reduce((sum: number, cl: any) => sum + cl.items.length, 0) || 0;
  const checkedItems = task.checklists?.reduce((sum: number, cl: any) => sum + cl.items.filter((i: any) => i.isChecked).length, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />Voltar
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-4">
          <input
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            onBlur={handleUpdateTitle}
            className="text-2xl font-bold bg-transparent border-none outline-none w-full focus:ring-0 p-0"
          />

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={task.priority} onValueChange={(v) => handleUpdateField('priority', v)}>
              <SelectTrigger className="w-[130px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Baixa</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <input
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleUpdateField('dueDate', e.target.value || null)}
                className="bg-transparent border-none text-sm focus:ring-0 p-0"
              />
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <input
                type="number"
                value={task.estimatedHours || ''}
                onChange={(e) => handleUpdateField('estimatedHours', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0h"
                className="w-16 bg-transparent border-none text-sm focus:ring-0 p-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.assignees?.map((a: any) => (
              <div key={a.id} className="relative group">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={a.user.image || ''} />
                  <AvatarFallback className="text-xs">{getInitials(a.user.name || '?')}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => removeAssignee(taskId as string, a.userId).then(load)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Descrição</h3>
            <Textarea
              value={task.description || ''}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              onBlur={() => handleUpdateField('description', task.description)}
              placeholder="Adicione uma descrição..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist ({checkedItems}/{totalItems})
            </h3>
            <div className="space-y-3">
              {task.checklists?.map((cl: any) => (
                <div key={cl.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{cl.title}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteChecklist(cl.id).then(load)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {cl.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 group">
                        <Checkbox checked={item.isChecked} onCheckedChange={() => handleToggleItem(item.id)} />
                        <span className={`text-sm flex-1 ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteChecklistItem(item.id).then(load)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={newItemText[cl.id] || ''}
                      onChange={(e) => setNewItemText({ ...newItemText, [cl.id]: e.target.value })}
                      placeholder="Adicionar item"
                      className="h-8 text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(cl.id); }}
                    />
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => handleAddItem(cl.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="Novo checklist"
                  className="h-8 text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateChecklist(); }}
                />
                <Button size="sm" variant="outline" className="h-8" onClick={handleCreateChecklist}>
                  <Plus className="h-4 w-4 mr-1" />Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentários ({task.comments?.length || 0})
            </h3>
            <div className="space-y-3">
              {task.comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user.image || ''} />
                    <AvatarFallback className="text-xs">{getInitials(comment.user.name || '?')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleDeleteComment(comment.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">?</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="min-h-[60px] text-sm"
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>Enviar</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
