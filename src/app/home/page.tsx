'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthStore } from '@/store/auth-store';

// This component now serves as the actual home page for authenticated users
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

  if (checkingAuth || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LoadingSpinner size="xl" className="text-primary" />
        <p className="text-lg font-medium">Loading your home page...</p>
      </div>
    );
  }
  
  // If user is not authenticated, show nothing (will redirect)
  if (!isAuthenticated || !user) {
    return <div className="min-h-screen"></div>;
  }
  
  // Authenticated user home page content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Afkar, {user.first_name || user.email?.split('@')[0]}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-3">Your Activity</h2>
          <p className="text-gray-600">View your recent activity and progress.</p>
          <button className="mt-4 text-primary font-medium text-sm">View Activity →</button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-3">Recent Projects</h2>
          <p className="text-gray-600">Access your latest research projects.</p>
          <button className="mt-4 text-primary font-medium text-sm">View Projects →</button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-3">Available Studies</h2>
          <p className="text-gray-600">Discover new studies to participate in.</p>
          <button className="mt-4 text-primary font-medium text-sm">Browse Studies →</button>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">0</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">0</div>
            <div className="text-sm text-gray-600">Completed Studies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">0</div>
            <div className="text-sm text-gray-600">Pending Results</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">0</div>
            <div className="text-sm text-gray-600">New Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
} 