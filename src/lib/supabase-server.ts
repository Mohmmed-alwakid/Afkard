"use server";

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { createClientComponentClient as createClientComponent } from '@supabase/auth-helpers-nextjs';

/**
 * Create a Supabase client for use in the server components
 */
export async function createServerClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // We can't set cookies during SSG
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch (error) {
            // We can't remove cookies during SSG
            console.error('Error removing cookie:', error);
          }
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

/**
 * Create a Supabase client for use with direct API calls
 */
export const createDirectClient = async (name: string) => {
  const cookieStore = cookies();
  try {
    const value = await cookieStore.get(name)?.value;
    return value;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
};

// Replace the export statement at line 71
// Instead of direct re-export, let's create a proper export
export const createClientComponentClient = createClientComponent; 