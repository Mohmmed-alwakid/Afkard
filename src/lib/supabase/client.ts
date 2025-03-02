import { createClient } from '@supabase/supabase-js'
import type { ExtendedDatabase } from '@/types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const isBrowser = typeof window !== 'undefined'

// Custom storage implementation that works in both browser and server environments
const customStorage = {
  getItem: (key: string) => {
    if (!isBrowser) return null
    
    try {
      // Try sessionStorage first
      const sessionValue = window.sessionStorage.getItem(key)
      if (sessionValue) return sessionValue
      
      // Fallback to localStorage
      return window.localStorage.getItem(key)
    } catch (error) {
      console.error('Storage access error:', error)
      return null
    }
  },
  setItem: (key: string, value: string) => {
    if (!isBrowser) return
    
    try {
      // Store in both storages for persistence
      window.sessionStorage.setItem(key, value)
      window.localStorage.setItem(key, value)
    } catch (error) {
      console.error('Storage access error:', error)
    }
  },
  removeItem: (key: string) => {
    if (!isBrowser) return
    
    try {
      window.sessionStorage.removeItem(key)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage access error:', error)
    }
  }
}

// Client-side Supabase client (to be used in components)
export const createBrowserClient = () => {
  return createClient<ExtendedDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'afkar_auth_token',
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'afkar',
        'x-client-info': 'next-js-14',
      },
    },
    // Enable development features
    ...(process.env.NODE_ENV === 'development' && {
      db: {
        schema: 'public',
      },
    }),
  })
}

// Server-side Supabase client (to be used in Server Components, API routes, etc.)
export const supabase = createClient<ExtendedDatabase>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // Don't persist sessions on the server
      storageKey: 'afkar_auth_token',
      storage: customStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-application-name': 'afkar',
        'x-client-info': 'next-js-14',
      },
    },
  }
);

// Helper to get the current user's profile
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Helper to get user's organizations
export async function getUserOrganizations(userId: string) {
  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organizations (
        id,
        name,
        slug,
        logo_url
      )
    `)
    .eq('user_id', userId);

  return memberships;
}

// Helper to get organization projects
export async function getOrganizationProjects(organizationId: string) {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  return projects;
}

// Helper to get project tasks
export async function getProjectTasks(projectId: string) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_to (
        id,
        username,
        avatar_url
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return tasks;
}

// Helper to get task comments
export async function getTaskComments(taskId: string) {
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  return comments;
}

// Helper to create activity log
export async function createActivityLog(
  userId: string,
  entityType: 'profile' | 'organization' | 'project' | 'task' | 'comment',
  entityId: string,
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'unassigned',
  metadata: Record<string, unknown> = {}
) {
  const { data: activityLog } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      metadata
    })
    .select()
    .single();

  return activityLog;
} 