'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjectStore } from '@/store/project-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, MoreHorizontal, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { StudyCard } from '@/components/study-card';
import { StudyCardSkeleton } from '@/components/study-card-skeleton';
import { StudyTypeModal } from '@/components/study-type-modal';

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStudyTypeModal, setShowStudyTypeModal] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Unwrap params correctly with React.use()
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.projectId;
  
  // Update to use the available functions in the store
  const { projects, getProjectById, deleteProject, deleteStudy } = useProjectStore();
  const [project, setProject] = useState(getProjectById(projectId));
  const [studies, setStudies] = useState(project?.studies || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      const projectData = getProjectById(projectId);
      setProject(projectData);
      setStudies(projectData?.studies || []);
      setIsLoading(false);
    }
  }, [projectId, getProjectById, projects]);

  // Function to refresh project data
  const refreshProject = () => {
    if (projectId) {
      const projectData = getProjectById(projectId);
      setProject(projectData);
      setStudies(projectData?.studies || []);
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

  const handleStudyCreate = (projectId: string, studyData: any) => {
    // Navigate to the new study page with the project ID
    router.push(`/projects/${projectId}/studies/new?type=${studyData.type}`);
  };

  const handleStudyTypeSelect = (type: string) => {
    setShowStudyTypeModal(false);
    router.push(`/projects/${projectId}/studies/new?type=${type}`);
  };

  const handleDeleteProject = () => {
    if (projectId) {
      deleteProject(projectId);
      router.push('/projects');
    }
  };

  const handleDeleteStudy = (studyId: string) => {
    if (projectId) {
      deleteStudy(projectId, studyId);
      // Refresh project data after deletion
      refreshProject();
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
            <TabsTrigger value="studies">Studies</TabsTrigger>
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

          <TabsContent value="studies" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <StudyCardSkeleton />
              <StudyCardSkeleton />
              <StudyCardSkeleton />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-6">
        <EmptyState
          title="Project not found"
          description="We couldn't find the project you're looking for."
          action={<Button onClick={() => router.push('/projects')}>Go back to projects</Button>}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/projects/${projectId}/edit`)}>
                  Edit project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setShowStudyTypeModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Study
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="studies">Studies</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Studies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studies?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>View and manage project information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground">{project.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Created</h3>
                    <p className="text-muted-foreground">{formatDate(project.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Last Updated</h3>
                    <p className="text-muted-foreground">{formatDate(project.updated_at)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">ID</h3>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{project.id}</code>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/edit`)}>
                  Edit Project
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="studies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Studies</h2>
              <Button onClick={() => setShowStudyTypeModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Study
              </Button>
            </div>

            {studies && studies.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {studies.map((study) => (
                  <StudyCard
                    key={study.id}
                    study={study}
                    projectId={projectId}
                    onDelete={() => handleDeleteStudy(study.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No studies yet"
                description="Create your first study to get started with your research."
                action={
                  <Button onClick={() => setShowStudyTypeModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Study
                  </Button>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Tasks</h2>
              <Button onClick={() => router.push(`/projects/${projectId}/tasks`)}>View Tasks</Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Manage tasks related to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-4 text-muted-foreground">
                  Visit the Tasks tab to manage your project tasks
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/projects/${projectId}/tasks`)}>
                  Go to Tasks
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Manage project settings and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Project ID</h3>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{project.id}</code>
                  </div>
                  <div>
                    <h3 className="font-medium">Owner ID</h3>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{project.owner_id}</code>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch space-y-2">
                <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/edit`)}>
                  Edit Project
                </Button>
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Project
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Study Type Modal */}
        <StudyTypeModal
          isOpen={showStudyTypeModal}
          onClose={() => setShowStudyTypeModal(false)}
          onSelect={handleStudyTypeSelect}
        />

        {/* Delete Project Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project and all associated studies.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProject}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
} 