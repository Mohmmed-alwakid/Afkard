'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const router = useRouter();

  useEffect(() => {
    // Log auth status for debugging
    const info = `
      isAuthenticated: ${isAuthenticated}
      isLoading: ${isLoading}
      User: ${user ? JSON.stringify(user, null, 2) : 'null'}
    `;
    
    setDebugInfo(info);
    console.log('Auth status in test page:', { isAuthenticated, user });
    
    // If authenticated, we should redirect to home after a delay
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        console.log('Should redirect to home now');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, user]);

  const handleGoHome = () => {
    router.push('/home');
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Auth Status</h2>
        <pre className="whitespace-pre-wrap bg-white p-4 rounded border">
          {debugInfo}
        </pre>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2">
            {isAuthenticated 
              ? '✅ You are authenticated!' 
              : '❌ You are not authenticated!'}
          </p>
          
          {isAuthenticated ? (
            <div className="space-x-4">
              <Button onClick={handleGoHome}>Go to Home</Button>
              <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
            </div>
          ) : (
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          )}
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">Navigation Test</h2>
          <div className="flex gap-4">
            <Button onClick={() => router.push('/home')}>
              Go to Home (should redirect if not auth)
            </Button>
            <Button onClick={() => router.push('/login')}>
              Go to Login (should redirect if auth)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 