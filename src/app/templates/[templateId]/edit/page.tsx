"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { useTemplateStore } from '@/store/template-store';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardTitle, Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  ChevronRight, 
  PlusCircle, 
  Settings, 
  Trash2, 
  Users, 
  FileText, 
  BarChart, 
  Microscope, 
  Lightbulb, 
  Eye, 
  Layers, 
  Clipboard, 
  CheckCircle2, 
  AlertCircle,
  type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/empty-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type StudyType = 'usability' | 'survey' | 'interview' | 'card-sorting' | 'a-b-testing' | 'first-click';

const StudyTypeCard = ({
  title,
  description,
  icon: Icon,
  type,
  onClick,
  isActive = false,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  type: StudyType;
  onClick: (type: StudyType) => void;
  isActive?: boolean;
}) => (
  <Card 
    className={`cursor-pointer transition-all hover:border-primary ${isActive ? 'border-primary bg-primary/5' : ''}`}
    onClick={() => onClick(type)}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
    <CardFooter className="pt-0">
      <div className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {isActive ? 'Selected' : 'Select'}
      </div>
    </CardFooter>
  </Card>
);

interface PageProps {
  params: {
    templateId: string;
  };
}

export default function EditTemplatePage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { template, isLoading, fetchTemplate, updateTemplate } = useTemplateStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  
  const [activeTab, setActiveTab] = useState('details');
  const [studyType, setStudyType] = useState<StudyType | null>(null);
  const [studies, setStudies] = useState<any[]>([]);
  const [currentStudy, setCurrentStudy] = useState({
    title: '',
    description: '',
    type: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (params.templateId) {
      fetchTemplate(params.templateId);
    }
  }, [params.templateId, fetchTemplate]);
  
  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title || '',
        description: template.description || '',
        category: template.category || '',
      });
      
      if (template.studies) {
        setStudies(template.studies);
      }
    }
  }, [template]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };
  
  const handleStudyInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentStudy((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSaveTemplate = () => {
    if (!formData.title) {
      toast.error('Please enter a template title');
      return;
    }
    
    const updatedTemplate = {
      ...template,
      ...formData,
      studies,
      updated_at: new Date().toISOString(),
    };
    
    updateTemplate(params.templateId, updatedTemplate);
    toast.success('Template saved successfully');
    router.push('/templates');
  };
  
  const handleStudyTypeSelect = (type: StudyType) => {
    setStudyType(type);
    setCurrentStudy((prev) => ({ ...prev, type }));
  };
  
  const handleAddStudy = () => {
    if (!currentStudy.title || !currentStudy.type) {
      toast.error('Please enter a study title and select a type');
      return;
    }
    
    const newStudy = {
      id: Date.now().toString(),
      ...currentStudy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setStudies((prev) => [...prev, newStudy]);
    setCurrentStudy({
      title: '',
      description: '',
      type: '',
    });
    setStudyType(null);
    
    toast.success('Study added to template');
  };
  
  const handleDeleteStudy = (studyId: string) => {
    setStudies((prev) => prev.filter((study) => study.id !== studyId));
    setStudyToDelete(null);
    setIsDeleteDialogOpen(false);
    toast.success('Study removed from template');
  };
  
  const confirmDeleteStudy = (studyId: string) => {
    setStudyToDelete(studyId);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!template) {
    return (
      <div className="container py-8">
        <EmptyState
          title="Template not found"
          description="The template you're looking for doesn't exist or you don't have access to it."
          action={
            <Button onClick={() => router.push('/templates')}>
              Go back to templates
            </Button>
          }
        />
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => router.push('/templates')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Template</h1>
          <p className="text-muted-foreground">
            Customize your template and add studies
          </p>
        </div>
        <Button onClick={handleSaveTemplate}>Save Template</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="studies" className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            Studies
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter template title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this template is for"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ux-research">UX Research</SelectItem>
                    <SelectItem value="market-research">Market Research</SelectItem>
                    <SelectItem value="product-testing">Product Testing</SelectItem>
                    <SelectItem value="customer-feedback">Customer Feedback</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="studies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Study to Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="study-title">Study Title</Label>
                <Input
                  id="study-title"
                  name="title"
                  value={currentStudy.title}
                  onChange={handleStudyInputChange}
                  placeholder="Enter study title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="study-description">Description</Label>
                <Textarea
                  id="study-description"
                  name="description"
                  value={currentStudy.description}
                  onChange={handleStudyInputChange}
                  placeholder="Describe what this study is for"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Study Type</Label>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <StudyTypeCard
                    title="Usability Testing"
                    description="Evaluate how easy your product is to use"
                    icon={Eye}
                    type="usability"
                    onClick={handleStudyTypeSelect}
                    isActive={studyType === 'usability'}
                  />
                  <StudyTypeCard
                    title="Survey"
                    description="Collect feedback from a large audience"
                    icon={Clipboard}
                    type="survey"
                    onClick={handleStudyTypeSelect}
                    isActive={studyType === 'survey'}
                  />
                  <StudyTypeCard
                    title="Interview"
                    description="In-depth conversations with users"
                    icon={Users}
                    type="interview"
                    onClick={handleStudyTypeSelect}
                    isActive={studyType === 'interview'}
                  />
                  <StudyTypeCard
                    title="Card Sorting"
                    description="Understand how users organize information"
                    icon={Layers}
                    type="card-sorting"
                    onClick={handleStudyTypeSelect}
                    isActive={studyType === 'card-sorting'}
                  />
                  <StudyTypeCard
                    title="A/B Testing"
                    description="Compare two versions to see which performs better"
                    icon={BarChart}
                    type="a-b-testing"
                    onClick={handleStudyTypeSelect}
                    isActive={studyType === 'a-b-testing'}
                  />
                  <StudyTypeCard
                    title="First Click Test"
                    description="Test where users first click to complete a task"
                    icon={Lightbulb}
                    type="first-click"
                    onClick={handleStudyTypeSelect}
                    isActive={studyType === 'first-click'}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddStudy} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Study to Template
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Template Studies ({studies.length})</h3>
            
            {studies.length === 0 ? (
              <EmptyState
                title="No studies added"
                description="Add studies to your template to help researchers get started quickly."
                action={
                  <Button onClick={() => setActiveTab('studies')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Study
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {studies.map((study) => (
                  <Card key={study.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{study.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDeleteStudy(study.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <span className="capitalize">{study.type.replace('-', ' ')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {study.description || 'No description provided'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template ID</Label>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                    {params.templateId}
                  </code>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Created</Label>
                <div className="text-muted-foreground">
                  {new Date(template.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="text-muted-foreground">
                  {new Date(template.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the study from your template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => studyToDelete && handleDeleteStudy(studyToDelete)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 