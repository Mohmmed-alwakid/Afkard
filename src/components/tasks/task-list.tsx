'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useTasksStore, useFilteredTasks } from '@/store/tasks';
import { TaskCard } from './task-card';
import { TaskForm } from './task-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskListProps {
  userId: string;
  projectId?: string;
  studyId?: string;
  showFilters?: boolean;
  maxHeight?: string;
  emptyStateMessage?: string;
}

export function TaskList({
  userId,
  projectId,
  studyId,
  showFilters = true,
  maxHeight = '800px',
  emptyStateMessage = 'No tasks found'
}: TaskListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'kanban'>('all');
  
  const {
    tasks,
    isLoading,
    hasError,
    errorMessage,
    selectedTask,
    filterStatus,
    filterPriority,
    filterAssignee,
    searchQuery,
    fetchUserTasks,
    fetchProjectTasks,
    fetchStudyTasks,
    deleteTask,
    setSelectedTask,
    setFilterStatus,
    setFilterPriority,
    setFilterAssignee,
    setSearchQuery,
    clearFilters,
  } = useTasksStore();
  
  const filteredTasks = useFilteredTasks();
  
  // Fetch tasks based on context (user, project, or study)
  useEffect(() => {
    const loadTasks = async () => {
      if (projectId) {
        await fetchProjectTasks(projectId);
      } else if (studyId) {
        await fetchStudyTasks(studyId);
      } else {
        await fetchUserTasks(userId);
      }
    };
    
    loadTasks();
  }, [userId, projectId, studyId, fetchUserTasks, fetchProjectTasks, fetchStudyTasks]);
  
  // Group tasks by status for kanban view
  const tasksByStatus = {
    [TaskStatus.TODO]: filteredTasks.filter(task => task.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.REVIEW]: filteredTasks.filter(task => task.status === TaskStatus.REVIEW),
    [TaskStatus.DONE]: filteredTasks.filter(task => task.status === TaskStatus.DONE),
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDeleteAlertOpen(true);
    }
  };
  
  const confirmDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask.id);
      setIsDeleteAlertOpen(false);
      setSelectedTask(null);
    }
  };
  
  const handleTaskSuccess = (task: Task) => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedTask(null);
  };
  
  const renderTaskList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      );
    }
    
    if (hasError) {
      return (
        <div className="p-4 text-center">
          <p className="text-destructive">Error: {errorMessage}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => {
              if (projectId) {
                fetchProjectTasks(projectId);
              } else if (studyId) {
                fetchStudyTasks(studyId);
              } else {
                fetchUserTasks(userId);
              }
            }}
          >
            Retry
          </Button>
        </div>
      );
    }
    
    if (filteredTasks.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-muted-foreground mb-4">{emptyStateMessage}</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>
    );
  };
  
  const renderKanbanView = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ))}
        </div>
      );
    }
    
    if (hasError) {
      return (
        <div className="p-4 text-center">
          <p className="text-destructive">Error: {errorMessage}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => {
              if (projectId) {
                fetchProjectTasks(projectId);
              } else if (studyId) {
                fetchStudyTasks(studyId);
              } else {
                fetchUserTasks(userId);
              }
            }}
          >
            Retry
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 p-2 bg-muted rounded-md">
              <h3 className="font-medium">{status.replace('_', ' ')}</h3>
              <Badge>{statusTasks.length}</Badge>
            </div>
            
            <ScrollArea className="flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <div className="space-y-2 pr-2">
                {statusTasks.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-md">
                    No tasks
                  </div>
                ) : (
                  statusTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">Tasks</h2>
          <p className="text-muted-foreground">
            {projectId ? 'Project tasks' : studyId ? 'Study tasks' : 'Your tasks'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 bg-muted/50 p-4 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select
              value={filterStatus || ''}
              onValueChange={(value) => setFilterStatus(value ? value as TaskStatus : null)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filterPriority || ''}
              onValueChange={(value) => setFilterPriority(value ? value as TaskPriority : null)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
            
            {(filterStatus || filterPriority || filterAssignee || searchQuery) && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveView(value as 'all' | 'kanban')}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <ScrollArea style={{ maxHeight }}>
            <div className="pr-4">
              {renderTaskList()}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="kanban" className="mt-0">
          {renderKanbanView()}
        </TabsContent>
      </Tabs>
      
      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your workflow.
            </DialogDescription>
          </DialogHeader>
          
          <TaskForm
            userId={userId}
            projectId={projectId}
            studyId={studyId}
            onSuccess={handleTaskSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <TaskForm
              task={selectedTask}
              userId={userId}
              onSuccess={handleTaskSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTask(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{selectedTask?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteAlertOpen(false);
              setSelectedTask(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 