import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Define route types for clarity
const PUBLIC_ROUTES = ['/', '/about', '/contact', '/terms', '/privacy', '/help', '/faq']
const AUTH_ROUTES = ['/login', '/signup', '/reset-password', '/verify', '/callback']
const DASHBOARD_ROUTES = ['/dashboard', '/profile']

// CRITICAL FIX: Update to use a single unified dashboard
const DASHBOARD_PATH = '/dashboard';

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
  
  // Skip middleware for client-side redirector pages
  if (pathname === '/home' || pathname === '/researcher') {
    log('Skipping middleware checks for client-side auth redirector page', { pathname })
    return NextResponse.next()
  }
  
  // Handle potential redirection loops
  const referer = request.headers.get('referer') || '';
  const referPath = referer ? new URL(referer).pathname : '';
  
  if (pathname === referPath) {
    log('Breaking potential redirection loop', { pathname, referer });
    return NextResponse.next();
  }
  
  // Handle root path and old dashboard paths with redirects to new unified dashboard
  if (pathname === '/' || pathname === '/home' || pathname === '/researcher') {
    log('Root or Legacy Dashboard PATH: Handling with corrected paths', { pathname })
    
    // Create a response without redirects first
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    try {
      // Quick session check without automatic redirects
      const { data: { session } } = await supabase.auth.getSession()
      
      log('Session check for dashboard path', { 
        hasSession: !!session,
        sessionUser: session?.user?.email,
        userRole: session?.user?.user_metadata?.role
      })
      
      // For the root path, handle redirection appropriately
      if (pathname === '/') {
        if (!session) {
          // If not authenticated, stay on home page
          return response;
        }
        
        // If authenticated, redirect to unified dashboard
        log('Redirecting root path to unified dashboard');
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
      }
      
      // Handle legacy dashboard routes (researcher & home) 
      if (pathname === '/researcher' || pathname === '/home') {
        if (!session) {
          // Redirect to login with dashboard return URL if not authenticated
          log('No session for dashboard route, redirecting to login')
          return NextResponse.redirect(new URL(`/login?returnUrl=${DASHBOARD_PATH}`, request.url))
        }
        
        // Redirect to unified dashboard
        log('Redirecting legacy dashboard path to unified dashboard');
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
      }
      
      // Otherwise just proceed
      return response
    } catch (error) {
      log('Error checking session for dashboard path', { error })
      return response
    }
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
  
  // Always allow access to auth routes
  if (AUTH_ROUTES.includes(pathname)) {
    log('Auth route: Processing with auth checks', { pathname })
    
    try {
      // Initialize Supabase client with the request
      const response = NextResponse.next()
      const supabase = createMiddlewareClient({ req: request, res: response })
      
      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession()
      log('Auth route session check', { 
        hasSession: !!session,
        sessionUser: session?.user?.email
      })
      
      // If user is authenticated on auth routes, consider redirecting
      if (session) {
        // Extract return URL if present, but sanitize it
        const url = new URL(request.url)
        const returnUrl = url.searchParams.get('returnUrl')
        log('Auth route with session', { returnUrl })
        
        // Skip redirect if the URL already has a returnUrl to avoid loops
        if (returnUrl) {
          log('URL has returnUrl, allowing to proceed to prevent loops')
          return response
        }
        
        // For login specifically, redirect to unified dashboard 
        if (pathname === '/login') {
          log('Redirecting authenticated user from login to unified dashboard')
          return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
        }
        
        // For other auth routes, just proceed without redirects
        log('Authenticated user on other auth route: allowing access')
        return response
      }
      
      // Otherwise, allow access to auth route for unauthenticated users
      log('Unauthenticated user on auth route: Allowing access')
      return response
    } catch (error) {
      // For any errors on auth routes, just allow access
      log('Error in auth route middleware', { error })
      return NextResponse.next()
    }
  }
  
  // Handle middleware errors gracefully by adding more logging and fallbacks
  if (pathname === '/dashboard') {
    log('Dashboard access check');
    
    try {
      // Create a response without redirects first
      const response = NextResponse.next()
      const supabase = createMiddlewareClient({ req: request, res: response })
      
      // Get the user's session with error handling
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        // Log detailed session info for debugging
        log('Dashboard session check', { 
          hasSession: !!session,
          sessionUser: session?.user?.email,
          userRole: session?.user?.user_metadata?.role,
          timestamp: new Date().toISOString()
        })
        
        // If no session, redirect to login
        if (!session) {
          log('No session for dashboard access, redirecting to login')
          return NextResponse.redirect(new URL(`/login?returnUrl=/dashboard`, request.url))
        }
        
        // Allow access to dashboard - it's a valid path 
        log('Allow access to dashboard');
        return response;
      } catch (sessionError) {
        // Handle session check errors
        log('Error checking session for dashboard', { error: sessionError })
        // Be lenient with errors - allow access and let client-side handle auth
        return response
      }
    } catch (error) {
      // Handle overall errors
      log('Critical error in dashboard middleware', { error })
      // On critical errors, redirect to login as a fallback
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // For protected routes, check authentication
  try {
    // Initialize Supabase client with the request
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession()
    log('Protected route session check', { 
      hasSession: !!session,
      sessionUser: session?.user?.email,
      path: pathname
    })
    
    // If no session, redirect to login with returnUrl
    if (!session) {
      log('No session: Redirecting to login', { pathname })
      // Add the returnUrl, but don't use /login as returnUrl to avoid loops
      const returnPath = pathname === '/login' ? '/' : pathname
      const loginUrl = new URL(`/login${returnPath !== '/' ? `?returnUrl=${encodeURIComponent(returnPath)}` : ''}`, request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // User is authenticated, allow access
    log('Authenticated: Allowing access', { pathname })
    return response
  } catch (error) {
    // For any errors, log details and handle appropriately
    log('Error in middleware', { error, pathname })
    
    if (PUBLIC_ROUTES.includes(pathname) || AUTH_ROUTES.includes(pathname)) {
      log('Error but route is public/auth: allowing access')
      return NextResponse.next()
    }
    
    log('Error and route is protected: redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
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