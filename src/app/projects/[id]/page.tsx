'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewStudyModal } from '@/components/new-study-modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  MoreHorizontal,
  PlusIcon,
  Edit,
  Trash,
  Calendar,
  Users,
  BarChart,
  FileText,
  ChevronRight,
  Clock,
  Tag,
} from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { getProjectById, addStudy, deleteProject, deleteStudy } = useProjectStore();
  const [project, setProject] = useState<ReturnType<typeof getProjectById>>(undefined);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewStudyModal, setShowNewStudyModal] = useState(false);
  
  // Fetch project data
  useEffect(() => {
    const fetchProject = () => {
      try {
        const projectData = getProjectById(params.id);
        setProject(projectData);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [params.id, getProjectById]);
  
  // Handle study creation
  const handleStudyCreate = (projectId: string, studyData: any) => {
    addStudy(projectId, {
      title: studyData.title,
      type: studyData.type,
      description: studyData.description || '',
      status: 'draft',
    });
    
    // Refresh project data
    setProject(getProjectById(params.id));
  };
  
  // Handle project deletion
  const handleDeleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(params.id);
      router.push('/projects');
    }
  };
  
  // Handle study deletion
  const handleDeleteStudy = (studyId: string) => {
    if (window.confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
      deleteStudy(params.id, studyId);
      // Refresh project data
      setProject(getProjectById(params.id));
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading project details..." />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="container max-w-7xl py-8 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-500 mb-6">
            The project you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Format dates
  const formattedCreatedAt = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedUpdatedAt = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  return (
    <div className="container max-w-7xl py-8 px-4 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <Button 
              variant="ghost" 
              className="mr-4 p-0" 
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/projects/${params.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDeleteProject} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Created: {formattedCreatedAt}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Updated: {formattedUpdatedAt}
          </Badge>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
            <Tag className="h-3.5 w-3.5 mr-1" />
            {project.category}
          </Badge>
          <Badge 
            className={`px-3 py-1 ${
              project.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
              'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {project.status}
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-gray-600 mb-4">{project.description}</p>
        )}
      </div>
      
      {/* Project Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="studies">Studies ({project.studies.length})</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Studies</CardTitle>
                <CardDescription>Total research studies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{project.studies.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Participants</CardTitle>
                <CardDescription>Total research participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Responses</CardTitle>
                <CardDescription>Total study responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p>{project.name}</p>
              </div>
              
              {project.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p>{project.description}</p>
                </div>
              )}
              
              {project.goal && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                  <p>{project.goal}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p>{project.category}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p>{project.status}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p>{formattedCreatedAt}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p>{formattedUpdatedAt}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Studies Tab */}
        <TabsContent value="studies">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Studies</h2>
            <Button 
              onClick={() => setShowNewStudyModal(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Study
            </Button>
          </div>
          
          {project.studies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No studies yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Create your first study to start collecting data for your research project.
                </p>
                <Button 
                  onClick={() => setShowNewStudyModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Study
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {project.studies.map((study) => (
                <Card key={study.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                        <div className="mb-2 md:mb-0">
                          <Badge 
                            className={
                              study.type === 'test' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                              study.type === 'interview' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                              'bg-green-100 text-green-800 hover:bg-green-200'
                            }
                          >
                            {study.type === 'test' ? 'Usability Test' : 
                             study.type === 'interview' ? 'Interview' : 'Survey'}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold">{study.title}</h3>
                      </div>
                      
                      {study.description && (
                        <p className="text-gray-600 mt-2">{study.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-6 mt-4">
                        <div className="flex items-center">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(study.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 ${
                              study.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                              study.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {study.participants || 0} Participants
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {study.responses || 0} Responses
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-2 p-6 md:border-l border-gray-100 bg-gray-50">
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1"
                      >
                        <Link href={`/projects/${params.id}/studies/${study.id}`}>
                          View
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${params.id}/studies/${study.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteStudy(study.id)} className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Participants Tab */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>
                Manage participants for this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
              <p className="text-gray-500 mb-6 max-w-md text-center">
                Start recruiting participants for your studies to see them here.
              </p>
              <Button>Recruit Participants</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                View aggregated results from all studies in this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No results yet</h3>
              <p className="text-gray-500 mb-6 max-w-md text-center">
                Create studies and collect responses to see results here.
              </p>
              <Button variant="outline" onClick={() => setActiveTab('studies')}>
                Go to Studies
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* New Study Modal */}
      <NewStudyModal
        projectId={params.id}
        open={showNewStudyModal}
        onOpenChange={setShowNewStudyModal}
        onStudyCreate={handleStudyCreate}
      />
    </div>
  );
} 