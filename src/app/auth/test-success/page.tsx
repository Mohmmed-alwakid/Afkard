'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export default function TestSuccessPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Log authentication state
      console.log('Auth State:', {
        isAuthenticated,
        hasUser: !!user,
        userData: user
      });

      // If authenticated, redirect after 3 seconds
      if (isAuthenticated && user) {
        const redirectTimer = setTimeout(() => {
          router.push('/dashboard');
        }, 3000);

        return () => clearTimeout(redirectTimer);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Verifying Authentication...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-semibold mb-4">Authentication Failed</h2>
          <p className="mb-4">Unable to verify your authentication.</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-2">Login Successful!</h2>
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mt-4">
            <p className="font-semibold">Welcome, {user.first_name}!</p>
          </div>
        </div>

        <div className="mt-8 space-y-4 text-left">
          <h3 className="text-lg font-semibold text-gray-900">Session Details:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><span className="font-medium">Name:</span> {user.first_name} {user.last_name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
            {user.organization && (
              <p><span className="font-medium">Organization:</span> {user.organization}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="text-sm text-gray-600 mb-4">
            <p>You will be automatically redirected to your dashboard in 3 seconds...</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-[#6A55FF] text-white rounded hover:bg-[#5444cc] transition-colors"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    </div>
  );
} 