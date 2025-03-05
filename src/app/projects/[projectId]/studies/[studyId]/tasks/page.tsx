'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/tasks/task-card';
import { useProjectStore } from '@/store/project-store';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PageProps {
  params: {
    projectId: string;
    studyId: string;
  };
}

export default function StudyTasksPage({ params }: PageProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Unwrap params correctly with React.use()
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.projectId;
  const studyId = unwrappedParams.studyId;
  
  // Update to use the available functions in the store
  const { projects, getProjectById, getStudyById } = useProjectStore();
  const [project, setProject] = useState(getProjectById(projectId));
  const [study, setStudy] = useState(getStudyById(projectId, studyId));
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (projectId && studyId) {
      const projectData = getProjectById(projectId);
      const studyData = getStudyById(projectId, studyId);
      
      setProject(projectData);
      setStudy(studyData);
      setIsLoading(false);
    }
  }, [projectId, studyId, getProjectById, getStudyById, projects]);
  
  // Normally we would fetch tasks here based on the studyId
  const tasks: any[] = []; // This would be populated from your API or store

  const handleCreateTask = () => {
    router.push(`/projects/${projectId}/studies/${studyId}/tasks/new`);
  };

  const filterTasks = (status: string) => {
    if (status === 'all') return tasks;
    return tasks.filter(task => task.status === status);
  };

  const filteredTasks = filterTasks(activeFilter);

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-72 mb-6" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="container py-6">
        <EmptyState
          title="Study not found"
          description="We couldn't find the study you're looking for."
          action={<Button onClick={() => router.push(`/projects/${projectId}`)}>Go back to project</Button>}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent" 
                onClick={() => router.push(`/projects/${projectId}`)}
              >
                {project?.name}
              </Button>
              <span>/</span>
              <Button 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent" 
                onClick={() => router.push(`/projects/${projectId}/studies/${studyId}`)}
              >
                {study?.title}
              </Button>
              <span>/</span>
              <h1 className="text-xl font-bold">Tasks</h1>
            </div>
          </div>
          <Button onClick={handleCreateTask}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Task
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
                onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/tasks/${task.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tasks found"
            description={
              activeFilter === 'all'
                ? "You haven't created any tasks for this study yet."
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
    </TooltipProvider>
  );
} 