'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Task, TaskStatus } from '@/types/task';
import { useTasksStore } from '@/store/tasks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskWidgetProps {
  userId: string;
  limit?: number;
}

export function TaskWidget({ userId, limit = 5 }: TaskWidgetProps) {
  const { tasks, isLoading, hasError, fetchUserTasks, updateTaskStatus } = useTasksStore();
  
  useEffect(() => {
    fetchUserTasks(userId);
  }, [userId, fetchUserTasks]);
  
  // Get tasks sorted by priority and due date
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      // First sort by status (todo and in_progress first)
      const statusOrder = {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 1,
        [TaskStatus.REVIEW]: 2,
        [TaskStatus.DONE]: 3,
      };
      
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by due date if both have due dates
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      
      // Tasks with due dates come before those without
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      
      // Finally sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, limit);
  
  // Task counts by status
  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    review: tasks.filter(t => t.status === TaskStatus.REVIEW).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
  };
  
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <Clock className="h-4 w-4 text-slate-500" />;
      case TaskStatus.IN_PROGRESS:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case TaskStatus.REVIEW:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case TaskStatus.DONE:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };
  
  const handleMarkAsDone = async (taskId: string) => {
    await updateTaskStatus(taskId, TaskStatus.DONE);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-24" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-40" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }
  
  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Error loading tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load your tasks. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => fetchUserTasks(userId)}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your recent tasks</CardDescription>
          </div>
          <Link href="/dashboard/tasks">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between mb-4">
          <div className="grid grid-cols-4 w-full gap-2">
            <div className="flex flex-col items-center justify-center p-2 bg-slate-100 rounded-md">
              <span className="text-xs text-muted-foreground">To Do</span>
              <span className="text-lg font-bold">{taskCounts.todo}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-blue-100 rounded-md">
              <span className="text-xs text-muted-foreground">In Progress</span>
              <span className="text-lg font-bold">{taskCounts.inProgress}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-yellow-100 rounded-md">
              <span className="text-xs text-muted-foreground">Review</span>
              <span className="text-lg font-bold">{taskCounts.review}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-green-100 rounded-md">
              <span className="text-xs text-muted-foreground">Done</span>
              <span className="text-lg font-bold">{taskCounts.done}</span>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[220px] pr-4">
          {sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-muted-foreground mb-2">No tasks found</p>
              <Link href="/dashboard/tasks">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Task
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    {getStatusIcon(task.status)}
                    <div className="min-w-0">
                      <Link href={`/dashboard/tasks?id=${task.id}`}>
                        <h4 className="font-medium text-sm truncate hover:text-primary">
                          {task.title}
                        </h4>
                      </Link>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {task.status !== TaskStatus.DONE && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full hover:bg-green-100 hover:text-green-700"
                      onClick={() => handleMarkAsDone(task.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter>
        <Link href="/dashboard/tasks" className="w-full">
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 