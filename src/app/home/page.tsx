'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { useProjectStore } from '@/store/project-store';
import { useTemplateStore } from '@/store/template-store';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  PlusIcon, Settings, Bell, ChevronRight, HelpCircle, LayoutGrid, 
  BookOpen, Sparkles, BarChart2, Clock, Calendar, Target, List 
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n/translations';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Create a reusable template card component with hover effects
const TemplateCard = ({
  imageSrc,
  title,
  description,
  onClick
}: {
  imageSrc: string;
  title: string;
  description?: string;
  onClick?: () => void;
}) => (
  <div 
    className="bg-[#F7F7FC] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-[279px] flex flex-col transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="w-full h-40 bg-gray-50 relative flex items-center justify-center p-8">
      <Image
        src={imageSrc}
        alt={title}
        width={197}
        height={143}
        className="object-contain"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
    <div className="p-4 text-center flex-1 flex flex-col items-center justify-center">
      <h3 className="text-[16px] font-medium text-[#303044] leading-6 mb-2">{title}</h3>
      {description && (
        <p className="text-[14px] text-[#667085] line-clamp-2">{description}</p>
      )}
    </div>
  </div>
);

// Create a resource card component with hover animation
const ResourceCard = ({
  icon,
  title,
  description,
  actionText,
  actionHref
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}) => (
  <Card className="rounded-xl p-6 hover:shadow-md transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
    <div className="flex-shrink-0 mb-4 bg-[#F2F2F7] w-10 h-10 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-[16px] font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-[14px] text-gray-600 mb-4 flex-grow">{description}</p>
    <Link
      href={actionHref}
      className="text-[14px] font-semibold text-[#7F56D9] inline-flex items-center hover:underline"
    >
      {actionText}
      <ChevronRight className="ml-1 h-4 w-4" />
    </Link>
  </Card>
);

// Project card component
const ProjectCard = ({
  title,
  description,
  category,
  studiesCount,
  onClick
}: {
  title: string;
  description?: string;
  category: string;
  studiesCount: number;
  onClick?: () => void;
}) => (
  <Card 
    className="rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="p-6 flex flex-col h-full">
      <div className="mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F9F5FF] text-[#7F56D9]">
          {category}
        </span>
      </div>
      <h3 className="text-[18px] font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-[14px] text-gray-600 mb-4 line-clamp-2 flex-grow">{description}</p>
      )}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[14px] text-gray-600">
          <span className="font-medium">{studiesCount}</span> {studiesCount === 1 ? 'study' : 'studies'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#7F56D9] hover:bg-[#F9F5FF] p-0 h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </Card>
);

// Stats card component
const StatsCard = ({
  title,
  value,
  trend,
  icon
}: {
  title: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon: React.ReactNode;
}) => (
  <Card className="rounded-xl p-6 hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-shrink-0 bg-[#F9F5FF] w-10 h-10 rounded-full flex items-center justify-center">
        {icon}
      </div>
      {trend && (
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          trend.positive ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"
        )}>
          {trend.value}
        </span>
      )}
    </div>
    <div className="mt-2">
      <h3 className="text-[24px] font-semibold text-gray-900">{value}</h3>
      <p className="text-[14px] text-gray-600">{title}</p>
    </div>
  </Card>
);

// Navigation component for the header
const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/home', active: pathname === '/home' },
    { label: 'Projects', href: '/projects', active: pathname === '/projects' },
    { label: 'Participants', href: '/participants', active: pathname === '/participants' },
    { label: 'Resources', href: '/resources', active: pathname === '/resources' },
  ];

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-[16px] font-semibold transition-colors duration-200",
            item.active
              ? "bg-[#303044] text-white"
              : "bg-transparent text-white hover:bg-[#14142B]/60"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

// Header component with profile menu
const Header = ({ user }: { user: any }) => {
  return (
    <header className="w-full bg-[#14142B] text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 h-[107px] flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/home" className="flex items-center mr-10">
            <div className="w-[142px] h-[52px] relative">
              <div className="w-[123.72px] h-[44px] absolute">
                <Image
                  src="/logo-white.svg"
                  alt="Afkar"
                  width={123.72}
                  height={44}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </Link>
          <div className="h-[35px] w-[1px] bg-[#37374B] mx-6"></div>

          {/* Navigation */}
          <Navigation />
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-[#303044] border-[#303044] text-white rounded-lg hover:bg-[#3b3b57] transition-colors"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="mr-1">Upgrade Plan</span>
          </Button>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10 hover:bg-[#303044] transition-colors">
              <Settings className="h-5 w-5 text-white" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10 hover:bg-[#303044] transition-colors">
              <Bell className="h-5 w-5 text-white" />
            </Button>
          </div>

          <Link href="/profile">
            <div className="w-11 h-11 rounded-full bg-[#212280] flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-[#2d2da6] transition-colors">
              {user?.first_name?.[0]}{user?.last_name?.[0] || ''}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { projects } = useProjectStore();
  const { templates } = useTemplateStore();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasProjects, setHasProjects] = useState(false);
  const { t } = useTranslations();

  // Optimize data loading with useMemo
  const displayedProjects = useMemo(() => 
    projects.slice(0, 3).map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      category: project.category,
      studiesCount: project.studies.length
    })), [projects]);

  // Optimize templates rendering with useMemo
  const featuredTemplates = useMemo(() => 
    templates.slice(0, 3).map(template => ({
      id: template.id,
      name: template.name,
      thumbnail: template.thumbnail,
      description: template.description
    })), [templates]);

  // Check if user has any projects
  useEffect(() => {
    const fetchUserProjects = () => {
      // Check if there are actual projects in the store
      const hasActualProjects = projects.length > 0;
      setHasProjects(hasActualProjects);
      
      // Simulate loading state for better UX
      setTimeout(() => {
        setIsPageLoading(false);
      }, 300);
    };

    fetchUserProjects();
  }, [projects]);

  // Handle authentication redirects
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Memoize handlers for better performance
  const handleNewProject = useCallback(() => {
    if (hasProjects) {
      // If projects exist, navigate to create a new study
      if (projects.length > 0) {
        const firstProjectId = projects[0].id;
        router.push(`/projects/${firstProjectId}/studies/new`);
        toast.info("Creating a new study in your project");
      } else {
        router.push('/projects');
      }
    } else {
      // If no projects, navigate to create a new project
      router.push('/projects/new');
      toast.success("Let's create your first project!");
    }
  }, [hasProjects, projects, router]);

  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, [router]);

  const handleTemplateClick = useCallback((templateId: string) => {
    router.push(`/templates/${templateId}/edit`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text={t('Loading...')} />
      </div>
    );
  }

  // Don't try to navigate during render, instead return null
  // and let the useEffect handle the redirect
  if (!user) {
    return null;
  }

  // Get user's display name
  const displayName = user?.first_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6FA]">
      {/* Header */}
      <Header user={user} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome section with personalized greeting */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-[#14142B]">
              {t('Welcome')}, {displayName}!
            </h1>
            <p className="text-[#667085] mt-2">{t('What would you like to explore today?')}</p>
          </div>
          
          {/* Quick stats section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatsCard 
              title="Active Projects" 
              value={projects.filter(p => p.status === 'active').length.toString()} 
              icon={<Target className="h-5 w-5 text-[#7F56D9]" />}
            />
            <StatsCard 
              title="Total Studies" 
              value={projects.reduce((acc, p) => acc + p.studies.length, 0).toString()}
              icon={<List className="h-5 w-5 text-[#7F56D9]" />}
            />
            <StatsCard 
              title="Last Activity" 
              value="2 days ago"
              icon={<Clock className="h-5 w-5 text-[#7F56D9]" />}
            />
            <StatsCard 
              title="Upcoming Deadlines" 
              value="3" 
              trend={{ value: "1 this week", positive: false }}
              icon={<Calendar className="h-5 w-5 text-[#7F56D9]" />}
            />
          </div>

          {/* Projects section */}
          <div className="bg-white p-6 rounded-xl mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#14142B]">
                  {hasProjects ? t('Your Projects') : t('Create Your First Project')}
                </h2>
                <p className="text-[#667085] mt-1">
                  {hasProjects
                    ? t('Create a new study or continue working on your projects')
                    : t('Start by creating a project to organize your studies')}
                </p>
              </div>

              <Button
                onClick={handleNewProject}
                className="mt-4 md:mt-0 bg-[#7F56D9] hover:bg-[#7F56D9]/90 text-white transition-colors"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {hasProjects ? t('New Study') : t('New Project')}
              </Button>
            </div>

            {isPageLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-6" />
                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : !hasProjects ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-[#F9FAFB] rounded-lg">
                <div className="w-40 h-40 mb-4">
                  <Image
                    src="/illustrations/empty-state.svg"
                    alt="Create your first project"
                    width={160}
                    height={160}
                    className="object-contain"
                    priority
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">{t('No projects yet')}</h3>
                <p className="text-[#667085] mb-6 max-w-md">
                  {t('Create your first project to start organizing your research studies')}
                </p>
                <Button
                  onClick={handleNewProject}
                  className="bg-[#7F56D9] hover:bg-[#7F56D9]/90 text-white transition-colors"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  {t('New Project')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.description}
                    category={project.category}
                    studiesCount={project.studiesCount}
                    onClick={() => handleProjectClick(project.id)}
                  />
                ))}
                {projects.length > 3 && (
                  <div className="flex items-center justify-center p-12 h-full border border-dashed border-gray-300 rounded-lg">
                    <Link
                      href="/projects"
                      className="text-[#7F56D9] font-medium hover:underline flex items-center"
                    >
                      {t('View All Projects')}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Templates section */}
          <div className="bg-white p-6 rounded-xl mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#14142B]">{t('Templates')}</h2>
                <p className="text-[#667085] mt-1">
                  {t('Start with pre-built templates to save time')}
                </p>
              </div>

              <Button
                variant="outline"
                className="mt-4 md:mt-0 border-[#7F56D9] text-[#7F56D9] hover:bg-[#F9F5FF] transition-colors"
                onClick={() => router.push('/templates')}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t('Create Template')}
              </Button>
            </div>

            {isPageLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#F7F7FC] rounded-xl overflow-hidden h-[279px] flex flex-col">
                    <div className="w-full h-40 bg-gray-50 flex items-center justify-center p-8">
                      <Skeleton className="h-28 w-36" />
                    </div>
                    <div className="p-4 text-center flex-1 flex items-center justify-center">
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    imageSrc={template.thumbnail}
                    title={template.name}
                    description={template.description}
                    onClick={() => handleTemplateClick(template.id)}
                  />
                ))}

                <div className="flex items-center justify-center p-12 h-[279px] border border-dashed border-gray-300 rounded-lg hover:border-[#7F56D9] transition-colors">
                  <Link
                    href="/templates"
                    className="text-[#7F56D9] font-medium hover:underline flex items-center"
                  >
                    {t('View All Templates')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Explore Afkar section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#14142B]">{t('Explore Afkar')}</h2>
              <p className="text-[#667085] mt-1">
                {t('Discover helpful resources and documentation')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ResourceCard
                icon={<HelpCircle className="h-5 w-5 text-[#7F56D9]" />}
                title={t('Help Center')}
                description={t('Get answers to your questions and learn how to use Afkar effectively')}
                actionText={t('Visit Help Center')}
                actionHref="/help"
              />

              <ResourceCard
                icon={<LayoutGrid className="h-5 w-5 text-[#7F56D9]" />}
                title={t('Templates Gallery')}
                description={t('Explore pre-built templates for various research needs and scenarios')}
                actionText={t('Browse Templates')}
                actionHref="/templates"
              />

              <ResourceCard
                icon={<BookOpen className="h-5 w-5 text-[#7F56D9]" />}
                title={t('Documentation')}
                description={t('Read comprehensive guides and tutorials on using Afkar features')}
                actionText={t('Read Documentation')}
                actionHref="/documentation"
              />
            </div>
          </div>
          
          {/* Recent activity section */}
          <div className="bg-white p-6 rounded-xl mt-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#14142B]">{t('Recent Activity')}</h2>
              <p className="text-[#667085] mt-1">
                {t('Your recent actions and updates')}
              </p>
            </div>
            
            {isPageLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-64 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity to display</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-[#F9F5FF] h-10 w-10 rounded-full flex items-center justify-center">
                    <BarChart2 className="h-5 w-5 text-[#7F56D9]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">Project created</p>
                    <p className="text-gray-500 text-sm">
                      You created "{projects[0]?.name || 'New project'}"
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(projects[0]?.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer with attribution */}
      <footer className="bg-white py-6 mt-8 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image 
                src="/logo.svg" 
                alt="Afkar" 
                width={100} 
                height={36} 
                className="h-9 w-auto" 
              />
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Afkar. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 