import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { 
  isPublicRoute, 
  isAuthRoute, 
  isProtectedRoute,
  isStaticAsset,
  AUTH_CONFIG,
  URL_CONFIG,
  ROUTES
} from '@/config/auth.config'

// Types
interface AuthState {
  hasAuthCookie: boolean;
  session: any | null;
  sessionError: Error | null;
}

// Constants
const MIDDLEWARE_CONFIG = {
  DEBUG: process.env.NODE_ENV === 'development',
  COOKIE_OPTIONS: {
    ...AUTH_CONFIG.COOKIE.OPTIONS,
    secure: process.env.NODE_ENV === 'production',
  }
} as const;

// Utility Functions
const log = (message: string, data?: any) => {
  if (MIDDLEWARE_CONFIG.DEBUG) {
    console.log(`[Middleware] ${message}`, data || '');
  }
};

const handleError = (error: unknown, pathname: string) => {
  console.error('[Middleware Error]', error);
  log('Error handling request', { pathname, error });
  
  // Always allow access to auth routes even if there's an error
  if (isAuthRoute(pathname)) {
    return NextResponse.next();
  }
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  const redirectUrl = new URL('/login', URL_CONFIG.PUBLIC);
  redirectUrl.searchParams.set('error', 'An unexpected error occurred');
  return NextResponse.redirect(redirectUrl);
};

// Auth Handlers
const getAuthState = async (req: NextRequest, res: NextResponse): Promise<AuthState> => {
  try {
    const supabase = createMiddlewareClient({ req, res });
    
    // Get cookie first
    const authCookie = await req.cookies.get(AUTH_CONFIG.COOKIE.NAME);
    log('Cookie check', { 
      cookieName: AUTH_CONFIG.COOKIE.NAME,
      hasCookie: !!authCookie?.value 
    });

    // Only try to get session if we have a cookie
    let session = null;
    let sessionError = null;

    if (authCookie?.value) {
      const { data, error } = await supabase.auth.getSession();
      session = data?.session;
      sessionError = error;
      
      log('Session check', { 
        hasSession: !!session,
        hasError: !!error,
        error: error?.message
      });
    }

    return {
      hasAuthCookie: !!authCookie?.value,
      session,
      sessionError,
    };
  } catch (error) {
    console.error('[Auth State Error]', error);
    return {
      hasAuthCookie: false,
      session: null,
      sessionError: error as Error,
    };
  }
};

const handleAppPort = async (
  req: NextRequest,
  res: NextResponse,
  authState: AuthState
): Promise<NextResponse> => {
  const { pathname } = req.nextUrl;
  
  log('Handling app port request', {
    pathname,
    hasSession: !!authState.session,
    hasError: !!authState.sessionError
  });

  // For root path, allow access regardless of auth state
  if (pathname === '/') {
    log('Allowing access to root path');
    return res;
  }

  // If no valid session for protected routes
  if (!authState.session && isProtectedRoute(pathname)) {
    log('No valid session for protected route, redirecting to login', {
      pathname,
      hasError: !!authState.sessionError,
    });
    
    // Redirect to login with return URL
    const redirectUrl = new URL('/login', URL_CONFIG.PUBLIC);
    redirectUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow access to all other routes
  log('Allowing access');
  return res;
};

const handlePublicPort = async (
  req: NextRequest,
  res: NextResponse,
  authState: AuthState
): Promise<NextResponse> => {
  const { pathname } = req.nextUrl;

  log('Handling public port request', {
    pathname,
    isAuthRoute: isAuthRoute(pathname),
    isPublicRoute: isPublicRoute(pathname),
    isProtectedRoute: isProtectedRoute(pathname),
    hasSession: !!authState.session
  });

  // Always allow access to static assets and root path
  if (isStaticAsset(pathname) || pathname === '/') {
    log('Allowing static asset or root path');
    return res;
  }

  // Handle auth routes
  if (isAuthRoute(pathname)) {
    if (authState.session) {
      log('Redirecting authenticated user from auth route to dashboard');
      return NextResponse.redirect(`${URL_CONFIG.APP}/dashboard`);
    }
    log('Allowing unauthenticated access to auth route');
    return res;
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!authState.session) {
      log('Redirecting unauthenticated user to login');
      const redirectUrl = new URL('/login', URL_CONFIG.PUBLIC);
      redirectUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    log('Redirecting authenticated user to app domain');
    return NextResponse.redirect(`${URL_CONFIG.APP}${pathname}`);
  }

  // Allow access to public routes
  if (isPublicRoute(pathname)) {
    log('Allowing public route');
    return res;
  }

  // For any other routes, if authenticated redirect to app domain
  if (authState.session) {
    log('Redirecting authenticated user to app domain for unknown route');
    return NextResponse.redirect(`${URL_CONFIG.APP}${pathname}`);
  }

  // Default: allow access for unauthenticated users
  log('Allowing public access by default');
  return res;
};

// Main Middleware
export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const { pathname } = req.nextUrl;

    log('Processing request', { pathname });

    // Get authentication state
    const authState = await getAuthState(req, res);

    // Always allow access to static assets
    if (isStaticAsset(pathname)) {
      log('Allowing static asset');
      return res;
    }

    // Always allow access to root path
    if (pathname === '/') {
      log('Allowing access to root path');
      return res;
    }

    // Handle auth routes
    if (isAuthRoute(pathname)) {
      if (authState.session) {
        log('Redirecting authenticated user from auth route to dashboard');
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      log('Allowing unauthenticated access to auth route');
      return res;
    }

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!authState.session) {
        log('Redirecting unauthenticated user to login');
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      log('Allowing authenticated access to protected route');
      return res;
    }

    // Allow access to public routes
    if (isPublicRoute(pathname)) {
      log('Allowing public route');
      return res;
    }

    // Default: allow access
    log('Allowing access by default');
    return res;

  } catch (error) {
    return handleError(error, req.nextUrl.pathname);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/health (health check endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/health).*)',
  ],
} 