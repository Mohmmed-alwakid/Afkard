'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/tasks/task-card';

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectTasksPage({ params }: PageProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Normally we would fetch tasks here based on the projectId
  const tasks: any[] = []; // This would be populated from your API or store

  const handleCreateTask = () => {
    router.push(`/projects/${params.projectId}/tasks/new`);
  };

  const filterTasks = (status: string) => {
    if (status === 'all') return tasks;
    return tasks.filter(task => task.status === status);
  };

  const filteredTasks = filterTasks(activeFilter);

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Project Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track tasks for this project
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Tabs 
        value={activeFilter} 
        onValueChange={setActiveFilter}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredTasks.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => router.push(`/projects/${params.projectId}/tasks/${task.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tasks found"
          description={
            activeFilter === 'all'
              ? "You haven't created any tasks for this project yet."
              : `You don't have any ${activeFilter} tasks.`
          }
          action={
            <Button onClick={handleCreateTask}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          }
        />
      )}
    </div>
  );
} 