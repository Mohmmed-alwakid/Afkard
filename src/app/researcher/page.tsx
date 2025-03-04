'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthStore } from '@/store/auth-store';

// This redirector component will now point to the unified dashboard
export default function ResearcherRedirect() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // First check auth state before redirecting
  useEffect(() => {
    if (!isLoading) {
      setCheckingAuth(false);
      
      // Only redirect to dashboard if authenticated and proper role
      if (isAuthenticated && user) {
        const userRole = user.role || 'participant';
        
        if (userRole === 'researcher' || userRole === 'admin') {
          console.log('User authenticated as researcher, redirecting to dashboard');
          // CRITICAL FIX: Use window.location.href instead of router.push to avoid ReferenceError
          window.location.href = '/dashboard';
        } else {
          console.log('User not authorized as researcher, redirecting to dashboard');
          // CRITICAL FIX: Use window.location.href instead of router.push to avoid ReferenceError
          window.location.href = '/dashboard';
        }
      } else {
        console.log('User not authenticated, redirecting to login');
        // CRITICAL FIX: Use window.location.href instead of router.push to avoid ReferenceError
        window.location.href = `/login?returnUrl=/dashboard`;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading spinner while checking auth and redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <LoadingSpinner size="xl" className="text-primary" />
      <p className="text-lg font-medium">
        {checkingAuth ? 'Checking authentication...' : 'Redirecting to dashboard...'}
      </p>
    </div>
  );
} 