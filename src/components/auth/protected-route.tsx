'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { FullScreenLoading } from '@/components/ui/loading-state';
import { UserRole } from '@/config/auth.config';
import { useAuthStore } from '@/store/auth-store';
import { handleAuthError } from '@/lib/auth-errors';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireVerified?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireVerified = true,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!isLoading) {
          if (!isAuthenticated) {
            router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
            return;
          }

          if (user) {
            // Check email verification if required
            if (requireVerified && !user.email_confirmed_at) {
              router.push(`/verify-email?returnUrl=${encodeURIComponent(pathname)}`);
              return;
            }

            // Check role permissions if specified
            if (allowedRoles && !allowedRoles.includes(user.role)) {
              router.push('/unauthorized');
              return;
            }
          }
        }
      } catch (error) {
        console.error('Protected route error:', error);
        const authError = handleAuthError(error);
        setError(authError.message);
      }
    };

    checkAccess();
  }, [isLoading, isAuthenticated, user, pathname, requireVerified, allowedRoles]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          <h3 className="text-lg font-semibold mb-2">Access Error</h3>
          <p>{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !user) {
    return fallback || <FullScreenLoading text="Verifying access..." />;
  }

  if (requireVerified && !user.email_confirmed_at) {
    return null; // Will redirect in useEffect
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

export function ResearcherRoute(props: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['researcher', 'admin']}>
      {props.children}
    </ProtectedRoute>
  );
}

export function ParticipantRoute(props: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['participant']}>
      {props.children}
    </ProtectedRoute>
  );
}

export function AdminRoute(props: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['admin']}>
      {props.children}
    </ProtectedRoute>
  );
} 