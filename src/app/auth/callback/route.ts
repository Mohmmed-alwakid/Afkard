import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/config/auth.config';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
        );
      }

      // Get the session cookie - adding await keyword
      const sessionCookie = await cookieStore.get(AUTH_COOKIE_NAME);
      
      // Create the response with redirect
      const response = NextResponse.redirect(new URL(next, request.url));
      
      // If we have a session cookie, set it in the response
      if (sessionCookie) {
        response.cookies.set(AUTH_COOKIE_NAME, sessionCookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }

      return response;
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL('/login?error=Authentication%20failed', request.url)
      );
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const dynamic = 'force-dynamic'; 