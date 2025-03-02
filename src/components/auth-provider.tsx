import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const handleNavigation = useCallback(() => {
    console.log('Navigation handler running with authenticated:', isAuthenticated, 'path:', pathname);
    
    // Don't navigate if still loading
    if (isLoading) {
      console.log('Auth is still loading, skipping navigation');
      return;
    }

    // Public routes that don't require auth
    const isPublicRoute = ['/login', '/signup', '/forgot-password', '/reset-password', '/verification'].some(
      (route) => pathname?.startsWith(route)
    );

    if (isAuthenticated && user) {
      console.log('User is authenticated, checking if redirection needed');
      
      // If on public routes or root, redirect to home
      if (isPublicRoute || pathname === '/') {
        console.log('On public route or root while authenticated, redirecting to home');
        router.replace('/home');
      }
    } else if (!isAuthenticated && !isLoading) {
      console.log('User is not authenticated, checking if protection needed');
      
      // If not on public route, redirect to login
      if (!isPublicRoute && pathname !== '/') {
        console.log('On protected route while not authenticated, redirecting to login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, user, pathname, router, isLoading]);

  // Run navigation check when authentication state or route changes
  useEffect(() => {
    console.log('Auth state or route changed, checking navigation');
    handleNavigation();
  }, [handleNavigation, isAuthenticated, pathname]);

  return <>{children}</>;
};

export default AuthProvider; 