'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Task } from '@/types/database';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Define interfaces for the joined data
interface TaskWithRelations extends Omit<Task, 'assigned_to'> {
  assigned_to?: {
    username?: string;
    avatar_url?: string | null;
  } | null;
  projects?: {
    name?: string;
  } | null;
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  in_progress: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  completed: 'bg-green-500/20 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
} as const;

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
  medium: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  high: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  urgent: 'bg-red-500/20 text-red-600 dark:text-red-400',
} as const;

export function TaskList() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchTasks() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to (
            username,
            avatar_url
          ),
          projects (
            name
          )
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setTasks(data as TaskWithRelations[]);
      }
      setIsLoading(false);
    }

    fetchTasks();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No tasks assigned to you
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="grid gap-1">
            <div className="font-semibold">{task.title}</div>
            <div className="text-sm text-muted-foreground">
              {task.projects?.name}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className={cn('capitalize', statusColors[task.status])}
            >
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge
              variant="secondary"
              className={cn('capitalize', priorityColors[task.priority])}
            >
              {task.priority}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
} 