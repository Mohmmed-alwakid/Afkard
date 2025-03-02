import { z } from 'zod';

// Configuration Constants
export const AUTH_CONFIG = {
  SESSION: {
    EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_INTERVAL: 10 * 60 * 1000, // 10 minutes
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  },
  COOKIE: {
    NAME: 'sb-ohsitwbtihwtpywjahpv-auth-token',
    OPTIONS: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    }
  },
  ROUTES: {
    PUBLIC: [
      '/',
      '/about',
      '/contact',
      '/terms',
      '/privacy',
      '/cookies',
      '/help',
      '/support',
      '/faq',
    ],
    AUTH: [
      '/login',
      '/signup',
      '/reset-password',
      '/verify',
      '/verify-email',
      '/magic-link',
      '/callback',
    ],
    PROTECTED: {
      PARTICIPANT: [
        '/dashboard',
        '/profile',
        '/studies',
        '/studies/[id]',
        '/preferences',
        '/rewards',
      ],
      RESEARCHER: [
        '/researcher',
        '/researcher/dashboard',
        '/projects',
        '/projects/new',
        '/projects/[id]',
        '/studies/create',
        '/studies/manage',
        '/participants',
        '/participants/invite',
      ],
      ADMIN: [
        '/admin',
        '/admin/dashboard',
        '/admin/users',
        '/admin/settings',
      ],
    },
  },
} as const;

// URL Configuration
export const URL_CONFIG = {
  APP: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  PUBLIC: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;

// Type Definitions
export type UserRole = 'participant' | 'researcher' | 'admin';

export const UserRoleSchema = z.enum(['participant', 'researcher', 'admin']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: UserRoleSchema,
  email_confirmed_at: z.string().datetime().nullable(),
  organization: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const SessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_at: z.number().optional(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: UserRoleSchema,
    email_confirmed_at: z.string().nullable(),
    last_sign_in_at: z.string().nullable(),
    user_metadata: z.record(z.unknown()).optional(),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;

// Helper functions for route validation
export function isStaticAsset(pathname: string): boolean {
  return pathname.startsWith('/_next/') || 
         pathname.startsWith('/static/') || 
         pathname.startsWith('/api/') ||
         /\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2)$/.test(pathname);
}

export function isPublicRoute(pathname: string): boolean {
  return AUTH_CONFIG.ROUTES.PUBLIC.some(route => 
    pathname === route || 
    (route.includes('[') && new RegExp('^' + route.replace(/\[.*?\]/g, '[^/]+') + '$').test(pathname))
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_CONFIG.ROUTES.AUTH.some(route => pathname === route);
}

export function isProtectedRoute(pathname: string, role: UserRole): boolean {
  const routes = role === 'admin' 
    ? [...AUTH_CONFIG.ROUTES.PROTECTED.ADMIN, ...AUTH_CONFIG.ROUTES.PROTECTED.RESEARCHER, ...AUTH_CONFIG.ROUTES.PROTECTED.PARTICIPANT]
    : role === 'researcher'
    ? [...AUTH_CONFIG.ROUTES.PROTECTED.RESEARCHER, ...AUTH_CONFIG.ROUTES.PROTECTED.PARTICIPANT]
    : AUTH_CONFIG.ROUTES.PROTECTED.PARTICIPANT;

  return routes.some(route => 
    pathname === route || 
    (route.includes('[') && new RegExp('^' + route.replace(/\[.*?\]/g, '[^/]+') + '$').test(pathname))
  );
}

export function getDefaultRedirect(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'researcher':
      return '/researcher/dashboard';
    default:
      return '/dashboard';
  }
}

export function getLoginRedirect(returnUrl?: string | null): string {
  if (!returnUrl) return '/login';
  
  // Validate return URL
  const isValidUrl = [
    ...AUTH_CONFIG.ROUTES.PROTECTED.PARTICIPANT,
    ...AUTH_CONFIG.ROUTES.PROTECTED.RESEARCHER,
    ...AUTH_CONFIG.ROUTES.PROTECTED.ADMIN,
  ].some(route => 
    returnUrl === route || 
    (route.includes('[') && new RegExp('^' + route.replace(/\[.*?\]/g, '[^/]+') + '$').test(returnUrl))
  );

  return isValidUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login';
} 