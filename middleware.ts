import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Simple debug logging for development
const DEBUG = true
const log = (message: string, data?: any) => {
  if (DEBUG) console.log(`[Middleware] ${message}`, data || '')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  log('Request path', { pathname, url: request.url })
  
  // Skip middleware for static assets
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.startsWith('/api/') ||
    /\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2)$/.test(pathname)
  ) {
    return NextResponse.next()
  }
  
  // For the /dashboard route, check authentication
  if (pathname === '/dashboard') {
    try {
      // Initialize Supabase client with the request
      const response = NextResponse.next()
      const supabase = createMiddlewareClient({ req: request, res: response })
      
      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession()
      
      // If no session, redirect to login
      if (!session) {
        log('No session for dashboard, redirecting to login')
        return NextResponse.redirect(new URL(`/login?returnUrl=${pathname}`, request.url))
      }
      
      // User is authenticated, allow access
      log('Authenticated user accessing dashboard')
      return response
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