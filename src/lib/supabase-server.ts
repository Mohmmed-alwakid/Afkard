import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export function createServerClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        // Get session from cookie storage instead of localStorage
        // since we're on the server
        cookieOptions: {
          name: 'sb-auth-token',
          // Let the cookie work in all routes
          path: '/',
          // http only for security
          httpOnly: true,
          // Strict same site for security
          sameSite: 'strict',
          // Secure in production
          secure: process.env.NODE_ENV === 'production',
        },
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
      global: {
        // Disable fetch retries for reliability
        fetchOptions: {
          mode: 'cors',
        },
      },
    }
  );
} 