import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Define authentication-exempt routes
const AUTH_ROUTES = ['/login', '/signup', '/reset-password', '/verify', '/callback']

// Maximum number of redirect attempts to prevent loops
const MAX_REDIRECTS = 3

// Simple debug logging for development
const DEBUG = true
const log = (message: string, data?: any) => {
  if (DEBUG) console.log(`[Root Middleware] ${message}`, data || '')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  log('Request path', { pathname, url: request.url })
  
  // Anti-loop protection - very important
  const redirectCount = parseInt(request.headers.get('x-redirect-count') || '0');
  if (redirectCount >= MAX_REDIRECTS) {
    log('Breaking redirect loop - too many redirects', { redirectCount });
    // Force a clean slate by next - no more redirects
    return NextResponse.next({
      request: {
        headers: new Headers(request.headers)
      }
    });
  }
  
  // Skip middleware for static assets
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.startsWith('/api/') ||
    /\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2)$/.test(pathname)
  ) {
    log('Static asset - skipping middleware', { pathname });
    return NextResponse.next()
  }
  
  // Skip middleware for auth routes and signup sub-routes
  if (AUTH_ROUTES.includes(pathname) || pathname.startsWith('/signup/')) {
    log('Auth route - skipping middleware', { pathname });
    return NextResponse.next()
  }
  
  // For the /dashboard route, check authentication with loop prevention
  if (pathname === '/dashboard') {
    try {
      // Check if this might be a redirect loop from login
      const referer = request.headers.get('referer') || '';
      if (referer.includes('/login')) {
        log('Potential login-dashboard loop detected, proceeding to client-side auth', { referer, redirectCount });
        return NextResponse.next();
      }
      
      // Initialize Supabase client with the request - wrap in try/catch
      try {
        const response = NextResponse.next()
        const supabase = createMiddlewareClient({ req: request, res: response })
        
        // Get the user's session with timeout to prevent hanging
        let sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 3000); // 3 second timeout
        });
        
        // Use Promise.race to implement the timeout
        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        // If no session, redirect to login with tracking header
        if (!session) {
          log('No session for dashboard, redirecting to login')
          const redirectResponse = NextResponse.redirect(new URL(`/login?returnUrl=${pathname}`, request.url));
          redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
          return redirectResponse;
        }
        
        // User is authenticated, allow access
        log('Authenticated user accessing dashboard')
        return response
      } catch (sessionError) {
        // On session error, allow through to client-side
        log('Session error - proceeding to client', { error: sessionError });
        return NextResponse.next();
      }
    } catch (error) {
      // For any errors, log and allow access (client-side will handle auth)
      log('Error in middleware', { error, pathname })
      return NextResponse.next()
    }
  }
  
  // For all other routes, just proceed
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 