import { cookies } from 'next/headers';
import { createServerClient } from './supabase/server';
import { redirect } from 'next/navigation';

// Add dynamic export to force dynamic rendering
export const dynamic = 'force-dynamic';

export async function getCurrentUser() {
  try {
    // Check if we're in a server component context
    let user = null;
    
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase.auth.getUser();
      
      if (!error && data.user) {
        user = data.user;
      }
    } catch (error) {
      // If this fails due to static rendering, we'll return null
      console.error('Error getting current user:', error);
    }
    
    return { user };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null };
  }
}

export async function requireAuth() {
  const { user } = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return { user };
} 