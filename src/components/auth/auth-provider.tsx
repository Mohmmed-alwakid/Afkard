"use client"

import * as React from "react"
import { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo,
  Suspense 
} from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { toast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session, User, AuthError as SupabaseAuthError } from '@supabase/supabase-js'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from "@/components/ui/button"
import { AUTH_CONFIG, URL_CONFIG } from "@/config/auth.config"

// Configuration constants
const DEBUG = process.env.NODE_ENV === 'development';
const SESSION_EXPIRY_BUFFER = 15 * 60 * 1000; // 15 minutes in milliseconds

// Logging helper for conditional logging
const logDebug = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Error logging helper
const logError = (message: string, error: any) => {
  if (DEBUG) {
    console.error(`❌ ${message}:`, error);
  } else {
    // In production, avoid logging sensitive information
    console.error(`❌ ${message}`);
  }
};

// Type definitions
type UserRole = 'researcher' | 'participant' | 'admin';

interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

type RouteAccess = 'public' | 'private' | 'restricted';

interface RouteConfig {
  path: string;
  roles: UserRole[];
  access: RouteAccess;
  redirectTo?: string;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  '/': {
    path: '/',
    roles: [],
    access: 'public',
    redirectTo: undefined
  },
  '/login': {
    path: '/login',
    roles: [],
    access: 'public',
    redirectTo: '/dashboard'
  },
  '/researcher': {
    path: '/researcher',
    roles: ['researcher', 'admin'],
    access: 'restricted',
    redirectTo: '/login'
  },
  '/dashboard': {
    path: '/dashboard',
    roles: ['participant', 'researcher', 'admin'],
    access: 'private',
    redirectTo: '/login'
  },
  '/home': {
    path: '/home',
    roles: ['participant', 'researcher', 'admin'],
    access: 'private',
    redirectTo: '/login'
  }
} as const;

const publicPaths = ['/login', '/signup', '/reset-password', '/verify', '/', '/about', '/contact', '/terms'];
const authPaths = ['/login', '/signup', '/reset-password', '/verify', '/callback'];

// Route paths - CRITICAL FIX: Use correct URL paths (not route group paths)
const dashboardPaths = {
  home: "/home",
  researcher: "/researcher",
  admin: "/admin"
};

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
} as const;

type LoadingState = 'idle' | 'initializing' | 'refreshing_session' | 'redirecting';

const LOADING_MESSAGES: Record<LoadingState, string> = {
  idle: '',
  initializing: 'Initializing authentication...',
  refreshing_session: 'Refreshing session...',
  redirecting: 'Redirecting...',
};

interface ResourceManager {
  timeouts: Set<NodeJS.Timeout>;
  intervals: Set<NodeJS.Timeout>;
  subscriptions: Set<{ unsubscribe: () => void }>;
  listeners: Set<{
    target: EventTarget;
    type: string;
    listener: EventListener;
  }>;
}

function createResourceManager(): ResourceManager {
  return {
    timeouts: new Set(),
    intervals: new Set(),
    subscriptions: new Set(),
    listeners: new Set(),
  };
}

// Helper function for retrying operations
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < config.maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      if (attempt === config.maxAttempts) break;
      
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function validateRouteAccess(
  pathname: string,
  isAuthenticated: boolean,
  userRole?: UserRole
): { isAllowed: boolean; redirectTo?: string } {
  // Special case for the root path - allow it, but redirect authenticated users to dashboard
  if (pathname === '/') {
    if (isAuthenticated) {
      console.log('Authenticated user on root path, redirecting to dashboard');
      return { 
        isAllowed: false, 
        redirectTo: userRole === 'researcher' ? '/researcher' : '/dashboard' 
      };
    }
    return { isAllowed: true };
  }

  // Handle static assets and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return { isAllowed: true };
  }

  // Always allow public routes
  if (publicPaths.includes(pathname)) {
    // If authenticated on auth routes, redirect to appropriate dashboard
    if (isAuthenticated && ['/login', '/signup', '/reset-password'].includes(pathname)) {
      return {
        isAllowed: false,
        redirectTo: userRole === 'researcher' ? '/researcher' : '/dashboard'
      };
    }
    return { isAllowed: true };
  }

  // Check protected routes
  const routeConfig = ROUTE_CONFIG[pathname as keyof typeof ROUTE_CONFIG];
  if (!routeConfig) {
    // For unknown routes, require authentication by default
    return isAuthenticated 
      ? { isAllowed: true }
      : { isAllowed: false, redirectTo: '/login' };
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return {
      isAllowed: false,
      redirectTo: '/login?returnUrl=' + encodeURIComponent(pathname)
    };
  }

  // Check role-based access
  if (routeConfig.roles.length > 0 && userRole) {
    const hasAccess = routeConfig.roles.includes(userRole);
    if (!hasAccess) {
      return {
        isAllowed: false,
        redirectTo: routeConfig.redirectTo || '/dashboard'
      };
    }
  }

  return { isAllowed: true };
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <pre className="text-sm bg-gray-100 p-4 rounded mb-4 overflow-auto max-w-full">
        {error.message}
      </pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

interface AuthProviderProps {
  children: React.ReactNode
}

// Add session expiration check with buffer
const isSessionExpired = (session: Session | null, buffer = 0): boolean => {
  if (!session?.expires_at) return true;
  
  const expiresAt = new Date(session.expires_at * 1000);
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();
  
  logDebug('🕒 Session expiry check:', {
    expiresAt: expiresAt.toISOString(),
    now: now.toISOString(),
    timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + 's',
    buffer: Math.floor(buffer / 1000) + 's'
  });
  
  return timeUntilExpiry <= buffer;
};

// Add session refresh check
const shouldRefreshSession = (session: Session | null): boolean => {
  if (!session?.expires_at) return false;
  
  // Refresh if less than 5 minutes until expiry
  return isSessionExpired(session, 5 * 60 * 1000);
};

function ClientAuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    user,
    isAuthenticated,
    refreshSession,
    logout,
  } = useAuthStore()

  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isMounted, setIsMounted] = useState(false)
  const initializationTimeout = useRef<NodeJS.Timeout>()
  const [sessionChecked, setSessionChecked] = useState(false);
  const supabase = createClientComponentClient();

  const resources = useRef<ResourceManager>(createResourceManager());

  // Helper functions for resource management
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay);
    resources.current.timeouts.add(timeout);
    return timeout;
  }, []);

  const addInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    resources.current.intervals.add(interval);
    return interval;
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      resources.current.timeouts.forEach(clearTimeout);
      resources.current.timeouts.clear();
      resources.current.intervals.forEach(clearInterval);
      resources.current.intervals.clear();
    };
  }, []);

  // Handle client-side mounting
  useEffect(() => {
    logDebug('Auth Provider mounted')
    setIsMounted(true)
    return () => {
      if (initializationTimeout.current) {
        clearTimeout(initializationTimeout.current)
      }
    }
  }, [])

  // Update session refresh with retry logic
  const refreshWithRetry = useCallback(async () => {
    logDebug('Starting session refresh');
    let timeoutId: NodeJS.Timeout;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Session refresh timed out'));
        }, 10000);
      });

      const refreshPromise = withRetry(async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session) throw new Error('No session found');
        
        // Check if session is expired or about to expire
        if (isSessionExpired(session, SESSION_EXPIRY_BUFFER)) {
          throw new Error('Session expired or about to expire');
        }
        
        await refreshSession();
        return session;
      }, {
        maxAttempts: 2,
        baseDelay: 1000,
        maxDelay: 2000,
      });

      const result = await Promise.race([refreshPromise, timeoutPromise]);
      return result;
    } catch (error) {
      logError('Session refresh failed', error);
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [refreshSession, supabase.auth]);

  // Update auth state change handler
  const handleAuthChange = useCallback(async (
    event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED',
    session: Session | null
  ) => {
    logDebug('Auth state changed:', event, !!session);
    console.log(`🔐 Auth state change: ${event}`, { 
      hasSession: !!session,
      email: session?.user?.email,
      path: pathname 
    });
    
    if (!session) {
      logDebug('No session in auth change, signing out');
      console.log('⚠️ No session detected in auth change event');
      
      // Only direct to login if this is a sign-out event and user is not on a public path
      if (event === 'SIGNED_OUT' && !publicPaths.includes(pathname) && !authPaths.includes(pathname)) {
        console.log('📤 User signed out, redirecting to login');
        router.push('/login');
      }
      
      setLoadingState('idle');
      return;
    }

    try {
      setLoadingState('refreshing_session');
      
      // Check session expiration with buffer
      if (isSessionExpired(session, SESSION_EXPIRY_BUFFER)) {
        logDebug('⚠️ Session expired or about to expire, logging out');
        console.log('⚠️ Session expired, logging out user');
        
        if (typeof logout === 'function') {
          await logout();
        } else {
          // Fallback if logout is not available
          await supabase.auth.signOut();
        }
        
        // Only redirect to login if not on a public path or auth path
        if (!publicPaths.includes(pathname) && !authPaths.includes(pathname)) {
          router.push('/login');
        }
        return;
      }

      // Get user role from session
      const role = session.user?.user_metadata?.role || 'participant';
      logDebug('User role:', role);

      // If this is a SIGNED_IN event, consider redirecting to appropriate dashboard
      if (event === 'SIGNED_IN') {
        logDebug(`User signed in with session`, { session: !!session, email: session?.user?.email });
        
        // Get user role from session
        const role = session.user?.user_metadata?.role || 'participant';
        logDebug(`User role: ${role}`);
        
        // Only redirect if on public or auth paths
        if (publicPaths.includes(pathname) || authPaths.includes(pathname)) {
          // Always use the unified dashboard path
          const dashboardPath = '/dashboard';
          logDebug(`Redirecting to ${dashboardPath} after sign-in`);
          console.log('🚀 Redirecting user after sign in to:', dashboardPath);
          
          // CRITICAL FIX: Use window.location.href instead of router.push to avoid ReferenceError
          window.location.href = dashboardPath;
          return;
        }
      }

      // Allow route access check to happen naturally
      setLoadingState('idle');
    } catch (error) {
      logError('Auth change handler error', error);
      console.error('❌ Error in auth change handler:', error);
      setLoadingState('idle');
    }
  }, [logout, pathname, publicPaths, authPaths]);

  // Listen for auth state changes
  useEffect(() => {
    if (!isMounted) return;

    let isSubscribed = true;
    let initTimeoutId: NodeJS.Timeout;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initialize auth state
    const initAuth = async () => {
      if (!isSubscribed) return;

      logDebug('Initializing auth state');
      try {
        setLoadingState('initializing');

        // Set initialization timeout
        initTimeoutId = setTimeout(() => {
          if (isSubscribed) {
            logDebug('Auth initialization timed out');
            setLoadingState('idle');
            // Only redirect if not on a public path
            if (!publicPaths.includes(pathname)) {
              router.push('/login');
            }
          }
        }, 10000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          logDebug('Initial session found:', session.user?.email);
          await handleAuthChange('SIGNED_IN', session);
        } else {
          logDebug('No initial session');
          setLoadingState('idle');
        }
      } catch (error) {
        logError('Error initializing auth', error);
        setLoadingState('idle');
        // Only redirect if not on a public path
        if (!publicPaths.includes(pathname)) {
          router.push('/login');
        }
      } finally {
        if (initTimeoutId) clearTimeout(initTimeoutId);
      }
    };

    initAuth();

    return () => {
      logDebug('Cleaning up auth subscriptions');
      isSubscribed = false;
      if (initTimeoutId) clearTimeout(initTimeoutId);
      subscription.unsubscribe();
    };
  }, [isMounted, handleAuthChange, router, supabase.auth]);

  // Memoize route validation
  const validateCurrentRoute = useCallback(() => {
    return validateRouteAccess(pathname, isAuthenticated, user?.role as UserRole);
  }, [pathname, isAuthenticated, user?.role]);

  // Update session check effect with expiration handling
  useEffect(() => {
    const checkSession = async () => {
      try {
        logDebug('🔍 Checking session state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          logDebug('✅ Session found:', {
            user: session.user?.email,
            role: session.user?.user_metadata?.role
          });
          
          if (isSessionExpired(session)) {
            logDebug('⚠️ Session expired, logging out');
            await logout();
            // Only redirect if not on a public path
            if (!publicPaths.includes(pathname)) {
              router.push('/login');
            }
            return;
          }
          
          if (!isAuthenticated) {
            logDebug('🔄 Active session found but not authenticated, refreshing');
            await handleAuthChange('SIGNED_IN', session);
          }
        } else {
          logDebug('❌ No session found');
          if (isAuthenticated) {
            logDebug('⚠️ No session but authenticated state exists, logging out');
            await logout();
            // Only redirect if not on a public path
            if (!publicPaths.includes(pathname)) {
              router.push('/login');
            }
          }
        }
        
        setSessionChecked(true);
      } catch (error) {
        logError('Session check failed', error);
        await logout();
        // Only redirect if not on a public path
        if (!publicPaths.includes(pathname)) {
          router.push('/login');
        }
      }
    };

    if (!sessionChecked) {
      checkSession();
    }
  }, [sessionChecked, isAuthenticated, handleAuthChange, logout, router, supabase.auth]);

  // Update route protection effect
  useEffect(() => {
    if (!isMounted || loadingState !== 'idle') return;

    const checkRouteAccess = async () => {
      try {
        // Skip checks for public paths
        if (publicPaths.includes(pathname)) {
          return;
        }

        // Check session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && isSessionExpired(session)) {
          logDebug('⚠️ Session expired during route check, logging out');
          await logout();
          if (!publicPaths.includes(pathname)) {
            router.push('/login');
          }
          return;
        }

        const { isAllowed, redirectTo } = validateCurrentRoute();
        
        if (!isAllowed && redirectTo) {
          logDebug('🚫 Route access denied, redirecting to:', redirectTo);
          setLoadingState('redirecting');
          router.replace(redirectTo);
        }
      } catch (error) {
        logError('Route protection check failed', error);
        if (!publicPaths.includes(pathname)) {
          router.push('/login');
        }
      }
    };

    checkRouteAccess();
  }, [isMounted, loadingState, validateCurrentRoute, router, logout, supabase.auth]);

  // Add session refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = addInterval(async () => {
      try {
        await refreshWithRetry();
      } catch (error) {
        logError('Failed to refresh session', error);
      }
    }, AUTH_CONFIG.SESSION.REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refreshWithRetry, addInterval]);

  // Update loading overlay component
  const LoadingStateOverlay = useMemo(() => {
    if (loadingState === 'idle') return null;

    return (
      <LoadingOverlay 
        text={LOADING_MESSAGES[loadingState]}
        showSpinner={loadingState !== 'redirecting'}
      />
    );
  }, [loadingState]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setLoadingState('idle');
        window.location.reload();
      }}
    >
      {LoadingStateOverlay}
      {(loadingState === 'idle' || loadingState === 'redirecting') && children}
    </ErrorBoundary>
  );
}

// Main exported component with Suspense
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
      </div>
    }>
      <ClientAuthProvider>{children}</ClientAuthProvider>
    </Suspense>
  );
}