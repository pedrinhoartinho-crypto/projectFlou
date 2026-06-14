'use client';

import { useRouter } from 'next/navigation';
import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: any;
  index: number;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

export function TaskCard({ task, index }: TaskCardProps) {
  const router = useRouter();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...(provided.draggableProps as any)}
          {...provided.dragHandleProps}
          className={`bg-card p-3 rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
          onClick={() => router.push(`/tasks/${task.id}`)}
        >
          <Badge className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
          <p className="text-sm font-medium leading-snug mt-2 mb-2">{task.title}</p>

          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((tl: any) => (
                <span
                  key={tl.id}
                  className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: tl.label.color }}
                >
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
              {task.dueDate && (
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              {(task._count?.comments || 0) > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="h-3 w-3" />
                  {task._count.comments}
                </span>
              )}
              {(task._count?.attachments || 0) > 0 && (
                <span className="flex items-center gap-0.5">
                  <Paperclip className="h-3 w-3" />
                  {task._count.attachments}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
