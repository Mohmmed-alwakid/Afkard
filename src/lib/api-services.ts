import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerClient } from '@/lib/supabase-server';
import { z } from 'zod';
import { type User } from '@supabase/supabase-js';

// Type Definitions
export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: 'researcher' | 'participant' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'archived';
}

export interface Study {
  id: string;
  title: string;
  description: string;
  project_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'completed';
  reward_amount?: number;
}

// Zod Schemas for Validation
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.enum(['researcher', 'participant', 'admin']),
  avatar_url: z.string().url().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  owner_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.enum(['draft', 'active', 'archived'])
});

export const StudySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  project_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.enum(['draft', 'active', 'completed']),
  reward_amount: z.number().optional()
});

// Helper function to handle API responses
const handleApiResponse = <T>(
  data: T | null,
  error: any,
  schema?: z.ZodType<T>
): { data: T | null; error: string | null; isValid: boolean } => {
  if (error) {
    return {
      data: null,
      error: error.message || 'An error occurred',
      isValid: false
    };
  }

  if (!data) {
    return {
      data: null,
      error: 'No data found',
      isValid: false
    };
  }

  // If schema is provided, validate data
  if (schema) {
    try {
      schema.parse(data);
      return { data, error: null, isValid: true };
    } catch (validationError: any) {
      return {
        data: null,
        error: `Validation error: ${validationError.message}`,
        isValid: false
      };
    }
  }

  return { data, error: null, isValid: true };
};

// User Services
export const UserService = {
  // Get user profile (can be used in both client and server components)
  async getUserProfile(userId: string, isServer = false) {
    const supabase = isServer ? createServerClient() : createClientComponentClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    return handleApiResponse<UserProfile>(data, error, UserProfileSchema);
  },
  
  // Update user profile (client-side only)
  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();
    
    return handleApiResponse<UserProfile>(data, error, UserProfileSchema);
  }
};

// Project Services
export const ProjectService = {
  // Get projects for a user (can be used in both client and server components)
  async getUserProjects(userId: string, isServer = false) {
    const supabase = isServer ? createServerClient() : createClientComponentClient();
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    return handleApiResponse<Project[]>(data, error);
  },
  
  // Get a single project
  async getProject(projectId: string, isServer = false) {
    const supabase = isServer ? createServerClient() : createClientComponentClient();
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    return handleApiResponse<Project>(data, error, ProjectSchema);
  },
  
  // Check if user has any projects
  async hasProjects(userId: string, isServer = false) {
    const supabase = isServer ? createServerClient() : createClientComponentClient();
    
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);
    
    return {
      hasProjects: (count || 0) > 0,
      error: error ? error.message : null
    };
  },
  
  // Create a new project
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    return handleApiResponse<Project>(data, error, ProjectSchema);
  }
};

// Study Services
export const StudyService = {
  // Get studies for a project
  async getProjectStudies(projectId: string, isServer = false) {
    const supabase = isServer ? createServerClient() : createClientComponentClient();
    
    const { data, error } = await supabase
      .from('studies')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    return handleApiResponse<Study[]>(data, error);
  },
  
  // Get a single study
  async getStudy(studyId: string, isServer = false) {
    const supabase = isServer ? createServerClient() : createClientComponentClient();
    
    const { data, error } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .single();
    
    return handleApiResponse<Study>(data, error, StudySchema);
  },
  
  // Create a new study
  async createStudy(study: Omit<Study, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('studies')
      .insert(study)
      .select()
      .single();
    
    return handleApiResponse<Study>(data, error, StudySchema);
  }
};

// Auth-related services that augment the auth store
export const AuthService = {
  // Get the current session
  async getCurrentSession(isServer = false) {
    try {
      // During static build, return a null session
      if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('Auth session requested during build - returning null session');
        return { data: { session: null } };
      }
      
      // Use a separate variable to avoid potential stack overflows
      let supabaseClient;
      
      if (isServer) {
        const { createServerClient } = await import('@/lib/supabase-server');
        supabaseClient = await createServerClient();
      } else {
        const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
        supabaseClient = createClientComponentClient();
      }
      
      return await supabaseClient.auth.getSession();
    } catch (error) {
      console.error('Error getting current session:', error);
      return { data: { session: null } };
    }
  },
  
  // Get the current user
  async getCurrentUser(isServer = false) {
    try {
      const { data } = await AuthService.getCurrentSession(isServer);
      
      // Handle case where session might be null
      if (!data?.session) {
        return { user: null };
      }
      
      return { user: data.session.user };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null };
    }
  }
};

// Add the apiService export
export const apiService = {
  // Add your API service methods here
  getStudies: async () => {
    // Implementation
    return [];
  },
  createStudy: async (data: any) => {
    // Implementation
    return { id: 'mock-id', ...data };
  },
  // Add other methods as needed
}; 