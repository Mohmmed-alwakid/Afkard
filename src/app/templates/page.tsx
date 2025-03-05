"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { useTemplateStore } from '@/store/template-store';
import { useProjectStore } from '@/store/project-store';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  PlusIcon,
  Settings,
  Bell,
  Trash2,
  Edit,
  Search,
  Filter,
  Share2,
  ChevronRight,
  Check,
  Copy,
  Tags,
  Calendar,
  User,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewTemplateModal } from '@/components/new-template-modal';
import { useTranslations } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export default function TemplatesPage() {
  // Check if we're in the browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Only initialize router and pathname in browser environment
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const { templates, deleteTemplate } = useTemplateStore();
  const { addProject } = useProjectStore();
  const { t } = useTranslations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  // Use useEffect to handle navigation to avoid SSR issues
  useEffect(() => {
    if (!user && !isLoading && isBrowser) {
      router.push('/login');
    }
  }, [user, isLoading, router, isBrowser]);
  
  // Filter templates based on search and category filter
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group templates by category for the "All" view
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);
  
  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplateToDelete(null);
  };
  
  const handleCreateFromTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Create a new project from the template
    const newProject = {
      id: uuidv4(),
      name: template.name,
      description: template.description || '',
      category: template.category,
      goal: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studies: template.studies.map(study => ({
        id: uuidv4(),
        type: study.type,
        title: study.title,
        description: study.description || '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: 0,
        responses: 0,
      })),
    };
    
    addProject(newProject);
    
    // Navigate to the new project
    router.push(`/projects/${newProject.id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text={t('Loading...')} />
      </div>
    );
  }
  
  // Return loading state instead of redirecting during SSR
  if (!user) {
    if (!isBrowser) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text={t('Loading...')} />
        </div>
      );
    }
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6FA]">
      {/* Header */}
      <header className="bg-[#14142B] w-full">
        <div className="container mx-auto px-4 h-[107px] flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-10">
              <div className="w-[142px] h-[52px] relative">
                <div className="w-[123.72px] h-[44px] absolute">
                  <Image 
                    src="/logo-white.svg" 
                    alt="Afkar" 
                    width={123.72} 
                    height={44} 
                    className="object-contain" 
                  />
                </div>
              </div>
            </Link>
            <div className="h-[35px] w-[1px] bg-[#37374B] mx-6"></div>
            
            {/* Navigation */}
            <nav className="flex gap-2">
              <Link 
                href="/home"
                className={cn(
                  "h-10 px-3 py-2 flex items-center rounded-md text-sm font-semibold",
                  pathname === '/home' ? "bg-[#303044] text-white" : "text-[#F4EBFF]"
                )}
              >
                Home
              </Link>
              <Link 
                href="/projects"
                className={cn(
                  "h-10 px-3 py-2 flex items-center rounded-md text-sm font-semibold",
                  pathname === '/projects' ? "bg-[#303044] text-white" : "text-[#F4EBFF]"
                )}
              >
                Projects
              </Link>
              <Link 
                href="/templates"
                className={cn(
                  "h-10 px-3 py-2 flex items-center rounded-md text-sm font-semibold",
                  pathname === '/templates' ? "bg-[#303044] text-white" : "text-[#F4EBFF]"
                )}
              >
                Templates
              </Link>
              <Link 
                href="/participants"
                className={cn(
                  "h-10 px-3 py-2 flex items-center rounded-md text-sm font-semibold",
                  pathname === '/participants' ? "bg-[#303044] text-white" : "text-[#F4EBFF]"
                )}
              >
                Participants
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="bg-[#303044] border-[#303044] text-white rounded-lg"
            >
              <span className="mr-2">Upgrade Plan</span>
            </Button>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10">
                <Settings className="h-5 w-5 text-white" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10">
                <Bell className="h-5 w-5 text-white" />
              </Button>
            </div>
            
            <Link href="/profile">
              <div className="w-11 h-11 rounded-full bg-[#212280] flex items-center justify-center text-white font-semibold cursor-pointer">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[30px] font-semibold text-[#101828]">{t('Templates')}</h1>
              <p className="text-[#667085] mt-1">
                {t('Create and manage templates for your research projects')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsNewTemplateModalOpen(true)}
                className="bg-[#7F56D9] hover:bg-[#7F56D9]/90 text-white"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t('Create Template')}
              </Button>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('Search templates...')}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Tabs 
                defaultValue="all" 
                className="w-full md:w-auto"
                onValueChange={setSelectedCategory}
              >
                <TabsList className="bg-white border border-gray-200 p-1 rounded-md">
                  <TabsTrigger value="all" className="rounded-sm">
                    {t('All')}
                  </TabsTrigger>
                  <TabsTrigger value="usability" className="rounded-sm">
                    {t('Usability')}
                  </TabsTrigger>
                  <TabsTrigger value="ux-research" className="rounded-sm">
                    {t('UX Research')}
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="rounded-sm">
                    {t('Feedback')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Templates Grid */}
          {selectedCategory === 'all' ? (
            // Show grouped by category view
            <div className="space-y-8">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-semibold capitalize">
                    {category.replace('-', ' ')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryTemplates.map((template) => (
                      <Card key={template.id} className="border border-gray-200 overflow-hidden h-full">
                        <div className="h-40 bg-gray-50 relative flex items-center justify-center p-8">
                          <Image 
                            src={template.thumbnail} 
                            alt={template.name}
                            width={197}
                            height={143}
                            className="object-contain"
                          />
                        </div>
                        
                        <CardContent className="p-6">
                          <CardTitle className="text-xl font-semibold mb-2">{template.name}</CardTitle>
                          <p className="text-[#667085] text-sm mb-4 line-clamp-2">{template.description}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-[#667085] mb-4">
                            <Tags className="h-4 w-4" />
                            <span className="capitalize">{template.category.replace('-', ' ')}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-[#667085]">
                            <BookOpen className="h-4 w-4" />
                            <span>{template.studies.length} studies</span>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between p-6 pt-0">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleCreateFromTemplate(template.id)}
                          >
                            {t('Use Template')}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => router.push(`/templates/${template.id}/edit`)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {t('Edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setTemplateToDelete(template.id)}
                                className="cursor-pointer text-red-600"
                                disabled={template.isDefault}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('Delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(groupedTemplates).length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-40 h-40 mb-4">
                    <Image
                      src="/illustrations/no-results.svg"
                      alt="No templates found"
                      width={160}
                      height={160}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('No templates found')}</h3>
                  <p className="text-[#667085] mb-6">{t('Try adjusting your search or filter to find what you are looking for.')}</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    {t('Clear filters')}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Show filtered by category view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="border border-gray-200 overflow-hidden h-full">
                  <div className="h-40 bg-gray-50 relative flex items-center justify-center p-8">
                    <Image 
                      src={template.thumbnail} 
                      alt={template.name}
                      width={197}
                      height={143}
                      className="object-contain"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-semibold mb-2">{template.name}</CardTitle>
                    <p className="text-[#667085] text-sm mb-4 line-clamp-2">{template.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-[#667085] mb-4">
                      <Tags className="h-4 w-4" />
                      <span className="capitalize">{template.category.replace('-', ' ')}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-[#667085]">
                      <BookOpen className="h-4 w-4" />
                      <span>{template.studies.length} studies</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between p-6 pt-0">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCreateFromTemplate(template.id)}
                    >
                      {t('Use Template')}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => router.push(`/templates/${template.id}/edit`)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {t('Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setTemplateToDelete(template.id)}
                          className="cursor-pointer text-red-600"
                          disabled={template.isDefault}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-40 h-40 mb-4">
                    <Image
                      src="/illustrations/no-results.svg"
                      alt="No templates found"
                      width={160}
                      height={160}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('No templates found')}</h3>
                  <p className="text-[#667085] mb-6">{t('Try adjusting your search or filter to find what you are looking for.')}</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    {t('Clear filters')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* New Template Modal */}
      <NewTemplateModal 
        open={isNewTemplateModalOpen} 
        onOpenChange={setIsNewTemplateModalOpen} 
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete Template')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Are you sure you want to delete this template? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 