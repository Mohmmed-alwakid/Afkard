/**
 * @deprecated MARKED FOR REMOVAL
 * This file contains a secondary auth provider implementation that appears to be unused.
 * The main application uses src/components/auth/auth-provider.tsx instead.
 * 
 * TODO:
 * 1. Check for any references to this component (none expected)
 * 2. Remove this file completely in the next cleanup cycle
 * 3. Consolidate any unique functionality into the main auth provider
 */
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FullScreenLoading } from '@/components/ui/loading-state';
import { isPublicRoute, isAuthRoute, isProtectedRoute } from '@/config/auth.config';
import { handleAuthError } from '@/lib/auth-errors';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);
  const mountedRef = useRef(false);
  
  const {
    isLoading,
    isAuthenticated,
    error,
    refreshSession,
    logout,
  } = useAuthStore();

  // Initialize auth state
  useEffect(() => {
    mountedRef.current = true;
    let refreshTimer: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        // Only try to refresh session if we're on a protected route
        if (isProtectedRoute(pathname)) {
          await refreshSession();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        const authError = handleAuthError(error);
        
        if (mountedRef.current && isProtectedRoute(pathname)) {
          router.push(`/login?error=${encodeURIComponent(authError.message)}&returnUrl=${pathname}`);
        }
      } finally {
        if (mountedRef.current) {
          setIsInitializing(false);
        }
      }
    };

    // Set up periodic session refresh only if authenticated
    const setupRefreshTimer = () => {
      if (isAuthenticated) {
        refreshTimer = setInterval(async () => {
          try {
            await refreshSession();
          } catch (error) {
            console.error('Error refreshing session:', error);
            await logout();
            if (mountedRef.current && isProtectedRoute(pathname)) {
              router.push('/login?error=Session%20expired');
            }
          }
        }, 4 * 60 * 1000); // Refresh every 4 minutes
      }
    };

    initAuth();
    setupRefreshTimer();

    return () => {
      mountedRef.current = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [isAuthenticated]);

  // Handle route changes based on auth state
  useEffect(() => {
    if (!isInitializing && mountedRef.current) {
      // If on auth route and authenticated, redirect to dashboard
      if (isAuthenticated && isAuthRoute(pathname)) {
        router.push('/dashboard');
        return;
      }
      
      // If on protected route and not authenticated, redirect to login
      if (!isAuthenticated && isProtectedRoute(pathname)) {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      }
    }
  }, [isAuthenticated, pathname, isInitializing]);

  // Handle session refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isAuthenticated && mountedRef.current) {
        try {
          await refreshSession();
        } catch (error) {
          console.error('Error refreshing session:', error);
          await logout();
          if (mountedRef.current && isProtectedRoute(pathname)) {
            router.push('/login?error=Session%20expired');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  // Don't show loading state for public routes
  if (isInitializing && !isPublicRoute(pathname)) {
    return <FullScreenLoading text="Initializing application..." />;
  }

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, error }}>
      {isLoading && !isPublicRoute(pathname) ? <FullScreenLoading /> : children}
    </AuthContext.Provider>
  );
} 