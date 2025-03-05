import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CreateStudyForm } from '@/components/studies/create-study-form';
import { Suspense } from 'react';
import { apiService } from '@/lib/api-services';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Create Study | Afkar',
  description: 'Create a new study to collect valuable insights from users',
};

// Force dynamic rendering to prevent build-time auth errors
export const dynamic = 'force-dynamic';

async function NewStudyContent() {
  // Get the current user
  const { user } = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user profile to check role
  const userProfileResult = await apiService.getUserProfile(user.id, true);
  if (!userProfileResult.data || userProfileResult.error) {
    redirect('/login');
  }
  
  const userProfile = userProfileResult.data;
  
  // Check if user is a researcher
  if (userProfile.role !== 'researcher' && userProfile.role !== 'admin') {
    redirect('/home');
  }
  
  // Get user projects
  const userProjectsResult = await apiService.getUserProjects(user.id, true);
  const userProjects = userProjectsResult.data || [];
  
  // If no projects exist, redirect to create a project first
  if (userProjects.length === 0) {
    redirect('/dashboard/projects/new?redirectAfter=studies/new');
  }
  
  return (
    <CreateStudyForm
      userId={user.id}
      userProjects={userProjects.map(project => ({
        id: project.id,
        title: project.title
      }))}
    />
  );
}

export default function NewStudyPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<StudyFormSkeleton />}>
        <NewStudyContent />
      </Suspense>
    </div>
  );
}

function StudyFormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-8 w-60 mb-8" />
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
} 