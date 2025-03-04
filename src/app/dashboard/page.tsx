import { Suspense } from 'react';
import { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error-boundary';
import { ResearcherDashboard } from '@/components/researcher/dashboard';
import { HomePageClient } from '@/components/dashboard/home-page-client';
import { UserService, ProjectService, AuthService } from '@/lib/api-services';

export const metadata: Metadata = {
  title: 'Dashboard - Afkar',
  description: 'Your personalized Afkar dashboard',
};

// Create a unified dashboard component that shows content based on role
export default async function DashboardPage() {
  try {
    // Get current user
    const user = await AuthService.getCurrentUser(true);
    
    // Check if user is authenticated
    if (!user) {
      redirect('/login?returnUrl=/dashboard');
    }
    
    // Get user profile with role information
    const { data: userProfile, error: profileError } = 
      await UserService.getUserProfile(user.id, true);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Continue with default values if profile can't be fetched
    }

    if (!userProfile) {
      console.error('No user profile found');
      redirect('/login?error=profile_missing');
    }

    const userRole = userProfile.role || 'participant';
    const firstName = userProfile.first_name || user.email?.split('@')[0] || 'User';
    
    // Check if researcher has projects - only query for researchers
    let hasProjects = false;
    if (userRole === 'researcher' || userRole === 'admin') {
      const { hasProjects: hasProjectsResult, error: projectsError } = 
        await ProjectService.hasProjects(user.id, true);
      
      if (projectsError) {
        console.error('Projects fetch error:', projectsError);
      } else {
        hasProjects = hasProjectsResult;
      }
    }

    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
          {/* Render different dashboards based on user role */}
          {(userRole === 'researcher' || userRole === 'admin') ? (
            <ResearcherDashboard />
          ) : (
            <HomePageClient 
              userProfile={userProfile}
              userRole={userRole}
              firstName={firstName}
              hasProjects={hasProjects}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Unexpected error in Dashboard:', error);
    redirect('/login?error=unexpected');
  }
} 