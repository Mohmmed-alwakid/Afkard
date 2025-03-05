'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Calendar, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PageProps {
  params: {
    projectId: string;
    studyId: string;
  };
}

export default function StudyDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Unwrap params correctly with React.use()
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.projectId;
  const studyId = unwrappedParams.studyId;
  
  // Update to use the available functions in the store
  const { projects, getProjectById, getStudyById, deleteStudy } = useProjectStore();
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

  // Function to refresh data
  const refreshData = () => {
    if (projectId && studyId) {
      const projectData = getProjectById(projectId);
      const studyData = getStudyById(projectId, studyId);
      
      setProject(projectData);
      setStudy(studyData);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteStudy = () => {
    if (projectId && studyId) {
      deleteStudy(projectId, studyId);
      router.push(`/projects/${projectId}`);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'success';
      default:
        return 'outline';
    }
  };

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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="container py-6">
        <EmptyState
          title="Study not found"
          description="We couldn't find the study you're looking for."
          action={<Button onClick={() => router.push(`/projects/${params.projectId}`)}>Go back to project</Button>}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push(`/projects/${projectId}`)}
                className="hover:bg-transparent p-0 h-auto"
              >
                <span className="text-muted-foreground">{project?.name}</span>
              </Button>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl font-semibold">{study?.title}</h1>
            </div>
            {study?.status && (
              <Badge variant={getStatusBadgeVariant(study.status)} className="mb-2">
                {study.status}
              </Badge>
            )}
            {study?.description && (
              <p className="text-muted-foreground max-w-2xl">{study.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/edit`)}>
                  Edit study
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  Delete study
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/tasks`)}>
              View Tasks
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Study Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold capitalize">{study.type}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(study.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={getStatusBadgeVariant(study.status)}>
                    {study.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Study Details</CardTitle>
                <CardDescription>View and manage study information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground">{study.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Target Audience</h3>
                    <p className="text-muted-foreground">{study.target_audience || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Methodology</h3>
                    <p className="text-muted-foreground">{study.methodology || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Created</h3>
                    <p className="text-muted-foreground">{formatDate(study.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Last Updated</h3>
                    <p className="text-muted-foreground">{formatDate(study.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/edit`)}>
                  Edit Study
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Results</CardTitle>
                <CardDescription>View the results and findings from this study</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No results available"
                  description="Results will be available once the study is completed."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Study Tasks</h2>
              <Button onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/tasks`)}>View All Tasks</Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Manage tasks related to this study</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No tasks yet"
                  description="Create tasks to track your study progress."
                  action={
                    <Button onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/tasks/new`)}>
                      Create Task
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Settings</CardTitle>
                <CardDescription>Manage study settings and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Study ID</h3>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{study.id}</code>
                  </div>
                  <div>
                    <h3 className="font-medium">Project ID</h3>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{study.project_id}</code>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant={getStatusBadgeVariant(study.status)}>
                        {study.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch space-y-2">
                <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/edit`)}>
                  Edit Study
                </Button>
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Study
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/edit`)}
          >
            Edit Study
          </Button>
        </div>
        
        <Button onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/tasks`)}>View All Tasks</Button>
        
        <Button onClick={() => router.push(`/projects/${projectId}/studies/${studyId}/tasks/new`)}>
          Add New Task
        </Button>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this study?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the study and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStudy} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
} 