'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/store/template-store';
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
import { Calendar, MoreHorizontal, Plus, ArrowLeft, FileText, Layers, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { toast } from 'sonner';

interface PageProps {
  params: {
    templateId: string;
  };
}

export default function TemplateDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { template, isLoading, fetchTemplate, deleteTemplate } = useTemplateStore();

  useEffect(() => {
    if (params.templateId) {
      fetchTemplate(params.templateId);
    }
  }, [params.templateId, fetchTemplate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteTemplate = () => {
    if (params.templateId) {
      deleteTemplate(params.templateId);
      toast.success('Template deleted successfully');
      router.push('/templates');
    }
  };

  const handleUseTemplate = () => {
    router.push(`/projects/new?templateId=${params.templateId}`);
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

  if (!template) {
    return (
      <div className="container py-6">
        <EmptyState
          title="Template not found"
          description="We couldn't find the template you're looking for."
          action={<Button onClick={() => router.push('/templates')}>Go back to templates</Button>}
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
      
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">{template.title}</h1>
            <Badge variant="outline" className="capitalize">
              {template.category?.replace('-', ' ') || 'Uncategorized'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{template.description}</p>
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
              <DropdownMenuItem onClick={() => router.push(`/templates/${params.templateId}/edit`)}>
                Edit template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                Delete template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleUseTemplate}>
            Use Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Overview
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

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold capitalize">
                  {template.category?.replace('-', ' ') || 'Uncategorized'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(template.created_at)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Studies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{template.studies?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>View and manage template information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">{template.description || 'No description provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Created</h3>
                  <p className="text-muted-foreground">{formatDate(template.created_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Last Updated</h3>
                  <p className="text-muted-foreground">{formatDate(template.updated_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium">ID</h3>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{template.id}</code>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => router.push(`/templates/${params.templateId}/edit`)}>
                Edit Template
              </Button>
              <Button onClick={handleUseTemplate}>
                Use Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="studies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Template Studies</h2>
            <Button onClick={() => router.push(`/templates/${params.templateId}/edit?tab=studies`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Study
            </Button>
          </div>

          {template.studies && template.studies.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {template.studies.map((study) => (
                <Card key={study.id}>
                  <CardHeader>
                    <CardTitle>{study.title}</CardTitle>
                    <CardDescription className="capitalize">
                      {study.type?.replace('-', ' ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {study.description || 'No description provided'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No studies yet"
              description="Add studies to your template to help researchers get started quickly."
              action={
                <Button onClick={() => router.push(`/templates/${params.templateId}/edit?tab=studies`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Study
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>Manage template settings and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Template ID</h3>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{template.id}</code>
                </div>
                <div>
                  <h3 className="font-medium">Owner ID</h3>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{template.owner_id}</code>
                </div>
                <div>
                  <h3 className="font-medium">Created</h3>
                  <p className="text-muted-foreground">{formatDate(template.created_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Last Updated</h3>
                  <p className="text-muted-foreground">{formatDate(template.updated_at)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch space-y-2">
              <Button variant="outline" onClick={() => router.push(`/templates/${params.templateId}/edit`)}>
                Edit Template
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                Delete Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Template Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 