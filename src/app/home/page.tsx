'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

// Create a reusable template card component
const TemplateCard = ({ 
  imageSrc, 
  title, 
  onClick 
}: { 
  imageSrc: string; 
  title: string; 
  onClick?: () => void;
}) => (
  <div 
    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="w-full h-40 bg-gray-50 relative">
      <Image 
        src={imageSrc} 
        alt={title}
        fill
        className="object-cover"
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="text-sm font-medium text-gray-800">{title}</h3>
    </div>
  </div>
);

// Create a resource card component
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
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <Link href={actionHref} className="text-primary text-sm font-medium hover:underline">
      {actionText}
    </Link>
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const redirected = useRef(false);
  
  // Check auth state only once 
  useEffect(() => {
    // Prevent executing during SSR
    if (typeof window === 'undefined') return;
    
    // Skip if still loading or we've already redirected
    if (isLoading || redirected.current) return;
    
    console.log('Home page auth check:', { 
      isAuthenticated, 
      hasUser: !!user,
      isLoading
    });
    
    setCheckingAuth(false);
    
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login');
      redirected.current = true;
      router.push('/login?returnUrl=/home');
      return;
    }
    
    // If authenticated, we stay on this page - it's the home page
    console.log('User authenticated, displaying home page content');
  }, [isLoading, isAuthenticated, user, router]);

  // Function to handle new study button
  const handleNewStudy = () => {
    router.push('/projects/new');
  };

  // Function to handle template creation
  const handleCreateTemplate = () => {
    router.push('/templates/new');
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LoadingSpinner size="xl" className="text-primary" />
        <p className="text-lg font-medium">Loading your dashboard...</p>
      </div>
    );
  }
  
  // If user is not authenticated, show nothing (will redirect)
  if (!isAuthenticated || !user) {
    return <div className="min-h-screen"></div>;
  }
  
  // Get user's first name or username for greeting
  const displayName = user.first_name || user.email?.split('@')[0] || 'User';
  
  // Authenticated user home page content
  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-12">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Welcome to Afkar Platform, {displayName} 🎉
        </h1>
        
        {/* Projects section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Image 
                src="/illustrations/empty-projects.svg" 
                alt="No projects" 
                width={260} 
                height={180} 
                className="mx-auto"
              />
            </div>
            <h2 className="text-xl font-semibold mb-4">Get to start by creating a project</h2>
            <p className="text-gray-500 mb-4">Currently you don't have any projects synced on your dashboard</p>
            <p className="text-gray-500">Let's add some data create new project</p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              className="bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-md flex items-center gap-2"
              onClick={handleNewStudy}
            >
              <PlusIcon className="h-5 w-5" />
              New Study
            </Button>
          </div>
        </div>
        
        {/* Templates section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Create Afkar Template</h2>
              <p className="text-gray-500 text-sm mt-1">
                Choose from our pre-built afkar templates or create your own maze from the ground up.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md"
              onClick={handleCreateTemplate}
            >
              Create template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <TemplateCard 
              imageSrc="/templates/usability-testing.png" 
              title="Usability testing a new product" 
            />
            <TemplateCard 
              imageSrc="/templates/insights.png" 
              title="Collect insights on features" 
            />
            <TemplateCard 
              imageSrc="/templates/usability-testing-2.png" 
              title="Usability testing a new product" 
            />
            <TemplateCard 
              imageSrc="/templates/usability-testing-3.png" 
              title="Usability testing a new product" 
            />
          </div>
        </div>
        
        {/* Resources section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Explore Afkar</h2>
          <p className="text-gray-500 text-sm mb-6">
            Elevate your research by learning the basics, and access advanced tips and resources
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResourceCard 
              icon={<div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Image src="/icons/help.svg" alt="Help" width={24} height={24} />
              </div>}
              title="Help Center"
              description="Check out articles with frequently asked questions, tips, and tricks."
              actionText="Open Help Center"
              actionHref="/help"
            />
            <ResourceCard 
              icon={<div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Image src="/icons/blog.svg" alt="Blog" width={24} height={24} />
              </div>}
              title="Afkar Blogs"
              description="Build your Afkar skills through free live training sessions and on-demand videos"
              actionText="Open Afkar Blogs"
              actionHref="/blogs"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 