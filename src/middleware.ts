import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Define route types for clarity
const PUBLIC_ROUTES = ['/', '/about', '/contact', '/terms', '/privacy', '/help', '/faq']
const AUTH_ROUTES = [
  '/login', 
  '/signup', 
  '/signup/researcher', 
  '/signup/participant', 
  '/reset-password', 
  '/verify', 
  '/verify-email',
  '/callback',
  '/signup/verification'
]
const DASHBOARD_ROUTES = ['/dashboard', '/profile', '/projects', '/home']

// CRITICAL FIX: Update to use a unified home page
const HOME_PATH = '/home';

// Add anti-loop detection
const MAX_REDIRECTS = 3; // Maximum number of redirects before breaking the loop
const MAX_REDIRECT_TIME = 30; // Maximum seconds for redirect throttling

const STATIC_PATTERNS = [
  /^\/_next\//,
  /^\/static\//,
  /^\/api\//,
  /\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2)$/
]

// Simple debug logging for development
const DEBUG = true // Always enable debugging while fixing this issue
const log = (message: string, data?: any) => {
  if (DEBUG) console.log(`[Middleware] ${message}`, data || '')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  log('Request path', { pathname, url: request.url })
  
  // Anti-Loop Protection: Check redirect count and throttle if needed
  const redirectCount = parseInt(request.headers.get('x-redirect-count') || '0');
  const lastRedirectTime = request.headers.get('x-last-redirect-time');
  const currentTime = Date.now();
  
  // Check if we need to break a redirect loop
  if (redirectCount >= MAX_REDIRECTS) {
    log('Breaking redirect loop - too many redirects', { redirectCount });
    return NextResponse.next();
  }
  
  // Throttle redirects if they happen too quickly (prevent DOS)
  if (lastRedirectTime && (currentTime - parseInt(lastRedirectTime)) < (MAX_REDIRECT_TIME * 1000)) {
    if (redirectCount > 1) {
      log('Throttling redirects - too many redirects in a short time', { 
        redirectCount, 
        timeSinceLastRedirect: (currentTime - parseInt(lastRedirectTime)) / 1000 
      });
      return NextResponse.next();
    }
  }
  
  // Skip middleware for client-side redirector pages
  if (pathname === '/home' || pathname === '/researcher') {
    log('Skipping middleware checks for client-side auth redirector page', { pathname })
    return NextResponse.next()
  }
  
  // Always allow access to static assets
  if (STATIC_PATTERNS.some(pattern => pattern.test(pathname))) {
    log('Static asset: Allowing access', { pathname })
    return NextResponse.next()
  }
  
  // Always allow access to public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    log('Public route: Allowing access', { pathname })
    return NextResponse.next()
  }
  
  // Special handling for signup paths - explicitly allow access to all signup routes
  if (pathname === '/signup' || pathname.startsWith('/signup/')) {
    log('Signup route: Allowing access without additional checks', { pathname })
    return NextResponse.next()
  }
  
  // Special handling for verification pages
  if (pathname === '/verify-email' || pathname.startsWith('/verify')) {
    log('Verification route: Allowing access without additional checks', { pathname })
    return NextResponse.next()
  }
  
  // Login page handling
  if (pathname === '/login') {
    log('Login route: Processing with auth checks', { pathname })
    
    try {
      // Initialize Supabase client with the request
      const response = NextResponse.next()
      const supabase = createMiddlewareClient({ req: request, res: response })
      
      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession()
      log('Login route session check', { 
        hasSession: !!session,
        sessionUser: session?.user?.email
      })
      
      // If user is authenticated, redirect to home
      if (session && session.user && session.user.id) {
        // Extract return URL if present, but sanitize it
        const url = new URL(request.url)
        const returnUrl = url.searchParams.get('returnUrl')
        log('Login route with session', { returnUrl })
        
        // If there's a return URL, redirect there
        if (returnUrl && returnUrl.startsWith('/')) {
          log('Redirecting authenticated user to return URL:', returnUrl)
          return NextResponse.redirect(new URL(returnUrl, request.url))
        }
        
        // Otherwise redirect to home
        log('Redirecting authenticated user from login to home')
        return NextResponse.redirect(new URL(HOME_PATH, request.url))
      }
      
      // Otherwise, allow access to login page for unauthenticated users
      log('Unauthenticated user on login page: Allowing access')
      return response
    } catch (error) {
      // For any errors on login route, just allow access
      log('Error in login route middleware', { error })
      return NextResponse.next()
    }
  }
  
  // Other auth routes (not signup or login)
  if (AUTH_ROUTES.includes(pathname)) {
    log('Other auth route: Allowing access', { pathname })
    return NextResponse.next()
  }
  
  // For the dashboard/home routes, add anti-loop check with timeout
  if (DASHBOARD_ROUTES.some(route => pathname.startsWith(route))) {
    log('Protected route access check:', { pathname });
    
    try {
      // Check if this is potentially a redirect loop
      const referer = request.headers.get('referer') || '';
      const potentialLoop = referer.includes('/login') && redirectCount > 0;
      
      if (potentialLoop) {
        log('Potential login-dashboard redirect loop detected', { referer, redirectCount });
        // Allow access and let client-side handle auth
        return NextResponse.next();
      }

      // Create a response without redirects first
      const response = NextResponse.next()
      
      try {
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
        
        // Log detailed session info for debugging
        log('Protected route session check', { 
          route: pathname,
          hasSession: !!session,
          sessionUser: session?.user?.email,
          timestamp: new Date().toISOString()
        })
        
        // If no valid session or user, redirect to login with count headers
        if (!session || !session.user || !session.user.id) {
          log('No valid session for protected route, redirecting to login')
          const redirectUrl = new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url);
          const redirectResponse = NextResponse.redirect(redirectUrl);
          
          // Update redirect tracking headers
          redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
          redirectResponse.headers.set('x-last-redirect-time', currentTime.toString());
          
          return redirectResponse;
        }
        
        // Allow access to protected route - user is authenticated
        log('Allow access to protected route - valid session');
        return response;
      } catch (sessionError) {
        // Handle session check errors
        log('Error checking session for protected route', { error: sessionError })
        // Be lenient with errors - allow access and let client-side handle auth
        return response
      }
    } catch (error) {
      // Handle overall errors
      log('Critical error in protected route middleware', { error })
      // On critical errors, let client-side handle auth
      return NextResponse.next();
    }
  }
  
  // For other routes, default to requiring authentication
  try {
    // Initialize Supabase client with the request
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession()
    
    // If no session, redirect to login
    if (!session) {
      log('No session for protected route, redirecting to login', { path: pathname })
      const redirectUrl = new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      
      // Update redirect tracking headers
      redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
      redirectResponse.headers.set('x-last-redirect-time', currentTime.toString());
      
      return redirectResponse;
    }
    
    // Allow access for authenticated users
    log('Authenticated access to protected route', { path: pathname })
    return response
  } catch (error) {
    // On errors, allow access and let client-side handle auth
    log('Error in protected route middleware', { error, path: pathname })
    return NextResponse.next()
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 