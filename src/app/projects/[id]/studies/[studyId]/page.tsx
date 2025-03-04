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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash,
  Calendar,
  Clock,
  Tag,
  Play,
  Share2,
  Users,
  UserPlus,
  ChevronRight,
  ListChecks,
  BarChart,
  Plus,
  Mail,
  FileText,
  ExternalLink,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

interface PageProps {
  params: {
    id: string;
    studyId: string;
  };
}

export default function StudyDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { getProjectById, getStudyById, updateStudy, deleteStudy } = useProjectStore();
  const [project, setProject] = useState<ReturnType<typeof getProjectById>>(undefined);
  const [study, setStudy] = useState<ReturnType<typeof getStudyById>>(undefined);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  // Fetch project and study data
  useEffect(() => {
    const fetchData = () => {
      try {
        const projectData = getProjectById(params.id);
        const studyData = getStudyById(params.id, params.studyId);
        setProject(projectData);
        setStudy(studyData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, params.studyId, getProjectById, getStudyById]);
  
  // Handle study deletion
  const handleDeleteStudy = () => {
    if (window.confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
      deleteStudy(params.id, params.studyId);
      router.push(`/projects/${params.id}`);
    }
  };
  
  // Handle study status update
  const handleStatusUpdate = (status: 'draft' | 'active' | 'completed' | 'archived') => {
    updateStudy(params.id, params.studyId, { status });
    // Refresh study data
    setStudy(getStudyById(params.id, params.studyId));
  };
  
  // Handle share link generation and copying
  const handleCopyLink = () => {
    const shareLink = `${window.location.origin}/studies/${params.studyId}/participate`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  // Fake data for tabs
  const participants = [];
  const questions = [];
  const results = {
    completionRate: 0,
    averageTime: '0 min',
    responses: 0,
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading study details..." />
      </div>
    );
  }
  
  if (!project || !study) {
    return (
      <div className="container max-w-7xl py-8 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-2xl font-bold mb-4">Study Not Found</h1>
          <p className="text-gray-500 mb-6">
            The study you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <Link href={`/projects/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Format dates
  const formattedCreatedAt = new Date(study.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedUpdatedAt = new Date(study.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Generate share link
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/studies/${params.studyId}/participate`;
  
  // Study type display name
  const studyTypeDisplay = study.type === 'test' ? 'Usability Test' : 
                           study.type === 'interview' ? 'Interview' : 'Survey';
  
  return (
    <div className="container max-w-7xl py-8 px-4 md:px-6">
      {/* Breadcrumb and Header */}
      <div className="mb-8">
        <div className="flex items-center mb-6 text-sm text-gray-500">
          <Button 
            variant="ghost" 
            className="p-0" 
            onClick={() => router.push('/projects')}
          >
            Projects
          </Button>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Button 
            variant="ghost" 
            className="p-0" 
            onClick={() => router.push(`/projects/${params.id}`)}
          >
            {project.name}
          </Button>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">{study.title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Badge 
              className={
                study.type === 'test' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                study.type === 'interview' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                'bg-green-100 text-green-800 hover:bg-green-200'
              }
            >
              {studyTypeDisplay}
            </Badge>
            <h1 className="text-2xl font-bold">{study.title}</h1>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {study.status === 'draft' ? (
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => handleStatusUpdate('active')}
              >
                <Play className="h-4 w-4 mr-2" />
                Launch Study
              </Button>
            ) : study.status === 'active' ? (
              <Button 
                variant="outline"
                className="text-primary border-primary hover:bg-primary/10"
                onClick={() => handleStatusUpdate('completed')}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                Complete Study
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('active')}
              >
                <Play className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleCopyLink}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isCopied ? 'Copied!' : 'Share'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/projects/${params.id}/studies/${params.studyId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusUpdate('archived')} className="text-amber-600">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Archive Study
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteStudy} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Study
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <Badge 
            className={`px-3 py-1 ${
              study.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              study.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
              study.status === 'archived' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' :
              'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
          </Badge>
          
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Created: {formattedCreatedAt}
          </Badge>
          
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Updated: {formattedUpdatedAt}
          </Badge>
        </div>
        
        {study.description && (
          <p className="text-gray-600 mb-4">{study.description}</p>
        )}
      </div>
      
      {/* Study Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Participants</CardTitle>
                <CardDescription>Total participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{study.participants || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Responses</CardTitle>
                <CardDescription>Total responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{study.responses || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Status</CardTitle>
                <CardDescription>Current study status</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge 
                  className={`px-3 py-1 ${
                    study.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    study.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                    study.status === 'archived' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' :
                    'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                </Badge>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p>{study.title}</p>
                </div>
                
                {study.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p>{study.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p>{studyTypeDisplay}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Project</h3>
                  <p>{project.name}</p>
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
            
            <Card>
              <CardHeader>
                <CardTitle>Share Study</CardTitle>
                <CardDescription>
                  Distribute this link to recruit participants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    value={shareLink}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button onClick={handleCopyLink}>
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Or invite via email</h3>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="email@example.com"
                      className="flex-1"
                    />
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <Link href={shareLink} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview Study
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Participants Tab */}
        <TabsContent value="participants">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Participants</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Participants
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Mail className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            </div>
          </div>
          
          {participants.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Share your study link or invite participants directly via email.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleCopyLink}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitations
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant, index) => (
                    <TableRow key={index}>
                      {/* Participant rows would go here */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
        
        {/* Questions Tab */}
        <TabsContent value="questions">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
          
          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start creating questions for your study to gather insights from participants.
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Questions would be listed here */}
            </div>
          )}
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Results & Analytics</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          {study.responses === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Share your study with participants to collect responses and see results here.
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Study
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{results.completionRate}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{results.averageTime}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{results.responses}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Study Settings</CardTitle>
              <CardDescription>
                Configure general settings for your study
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Study Title
                </label>
                <Input
                  id="title"
                  value={study.title}
                  onChange={() => {}}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={study.description || ''}
                  onChange={() => {}}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Danger Zone</h3>
                <p className="text-gray-500 mb-4">
                  These actions are irreversible. Please be certain.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 w-full justify-start"
                    onClick={() => handleStatusUpdate('archived')}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Archive Study
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-700 hover:bg-red-50 w-full justify-start"
                    onClick={handleDeleteStudy}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Study
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 