import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerClient } from '@/lib/supabase-server';
import { z } from 'zod';
import { type User } from '@supabase/supabase-js';
import { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '@/types/task';

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

// Add Task schema to the existing schemas
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  due_date: z.string().datetime().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  study_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  is_completed: z.boolean()
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
    try {
      // Validate userId to prevent invalid UUID errors
      if (!userId || userId === 'undefined') {
        console.error('Invalid userId provided to getUserProfile:', userId);
        return {
          data: null,
          error: 'Invalid user ID provided'
        };
      }
      
      let supabase;
      
      if (isServer) {
        // Dynamic import to avoid circular dependencies
        const { createServerClient } = await import('@/lib/supabase-server');
        supabase = await createServerClient(); 
      } else {
        // Client-side supabase
        supabase = createClientComponentClient();
      }
      
      // Verify we have a valid Supabase client
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('Invalid Supabase client in getUserProfile');
        return { 
          data: null, 
          error: 'Failed to initialize database client' 
        };
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error(`Error fetching user profile for userId ${userId}:`, error);
      } else if (!data) {
        console.warn(`No profile found for userId ${userId}`);
      }
      
      return handleApiResponse<UserProfile>(data, error, UserProfileSchema);
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error in getUserProfile' 
      };
    }
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
    try {
      let supabase;
      
      if (isServer) {
        // Dynamic import to avoid circular dependencies
        const { createServerClient } = await import('@/lib/supabase-server');
        supabase = await createServerClient(); 
      } else {
        // Client-side supabase
        supabase = createClientComponentClient();
      }
      
      // Verify we have a valid Supabase client
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('Invalid Supabase client in getUserProjects');
        return { 
          data: null, 
          error: 'Failed to initialize database client' 
        };
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      
      return handleApiResponse<Project[]>(data, error);
    } catch (error) {
      console.error('Error in getUserProjects:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error getting projects' 
      };
    }
  },
  
  // Get a single project
  async getProject(projectId: string, isServer = false) {
    try {
      let supabase;
      
      if (isServer) {
        // Dynamic import to avoid circular dependencies
        const { createServerClient } = await import('@/lib/supabase-server');
        supabase = await createServerClient(); 
      } else {
        // Client-side supabase
        supabase = createClientComponentClient();
      }
      
      // Verify we have a valid Supabase client
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('Invalid Supabase client in getProject');
        return { 
          data: null, 
          error: 'Failed to initialize database client' 
        };
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      return handleApiResponse<Project>(data, error);
    } catch (error) {
      console.error('Error in getProject:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error getting project' 
      };
    }
  },
  
  // Check if user has any projects
  async hasProjects(userId: string, isServer = false) {
    try {
      let supabase;
      
      if (isServer) {
        // Dynamic import to avoid circular dependencies
        const { createServerClient } = await import('@/lib/supabase-server');
        supabase = await createServerClient(); 
      } else {
        // Client-side supabase
        supabase = createClientComponentClient();
      }
      
      // Verify we have a valid Supabase client
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('Invalid Supabase client in hasProjects');
        return { 
          hasProjects: false, 
          error: 'Failed to initialize database client' 
        };
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', userId)
        .limit(1);
      
      if (error) {
        console.error('Error checking projects:', error);
        return { hasProjects: false, error: error.message };
      }
      
      return { hasProjects: data && data.length > 0, error: null };
    } catch (error) {
      console.error('Exception in hasProjects:', error);
      return { 
        hasProjects: false, 
        error: error instanceof Error ? error.message : 'Unknown error checking projects' 
      };
    }
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
    try {
      let supabase;
      
      if (isServer) {
        // Dynamic import to avoid circular dependencies
        const { createServerClient } = await import('@/lib/supabase-server');
        supabase = await createServerClient(); 
      } else {
        // Client-side supabase
        supabase = createClientComponentClient();
      }
      
      // Verify we have a valid Supabase client
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('Invalid Supabase client in getProjectStudies');
        return { 
          data: null, 
          error: 'Failed to initialize database client' 
        };
      }
      
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      return handleApiResponse<Study[]>(data, error);
    } catch (error) {
      console.error('Error in getProjectStudies:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error getting studies' 
      };
    }
  },
  
  // Get a single study
  async getStudy(studyId: string, isServer = false) {
    try {
      let supabase;
      
      if (isServer) {
        // Dynamic import to avoid circular dependencies
        const { createServerClient } = await import('@/lib/supabase-server');
        supabase = await createServerClient(); 
      } else {
        // Client-side supabase
        supabase = createClientComponentClient();
      }
      
      // Verify we have a valid Supabase client
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('Invalid Supabase client in getStudy');
        return { 
          data: null, 
          error: 'Failed to initialize database client' 
        };
      }
      
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .eq('id', studyId)
        .single();
      
      return handleApiResponse<Study>(data, error);
    } catch (error) {
      console.error('Error in getStudy:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error getting study' 
      };
    }
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
        console.log('No session found in getCurrentUser');
        return { user: null };
      }
      
      // Add validation to ensure user has a valid ID
      const user = data.session.user;
      if (!user || !user.id) {
        console.warn('Session exists but user or user ID is missing');
        return { user: null };
      }
      
      return { user };
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
  async createTask(task: TaskCreate) {
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            ...task,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      return handleApiResponse<Task>(data, error, TaskSchema);
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error: 'Failed to create task', isValid: false };
    }
  },

  async updateTask(taskId: string, updates: TaskUpdate) {
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      return handleApiResponse<Task>(data, error, TaskSchema);
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, error: 'Failed to update task', isValid: false };
    }
  },

  async deleteTask(taskId: string) {
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      return { 
        data: true, 
        error: error ? 'Failed to delete task' : null, 
        isValid: !error 
      };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { data: null, error: 'Failed to delete task', isValid: false };
    }
  },

  async getTask(taskId: string, isServer = false) {
    try {
      const supabase = isServer
        ? createServerClient()
        : createClientComponentClient();

      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(first_name, last_name, avatar_url)')
        .eq('id', taskId)
        .single();

      return handleApiResponse<Task>(data, error, TaskSchema);
    } catch (error) {
      console.error('Error fetching task:', error);
      return { data: null, error: 'Failed to fetch task', isValid: false };
    }
  },

  async getUserTasks(userId: string, isServer = false) {
    try {
      const supabase = isServer
        ? createServerClient()
        : createClientComponentClient();

      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(first_name, last_name, avatar_url)')
        .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
        .order('due_date', { ascending: true });

      return handleApiResponse<Task[]>(data, error);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return { data: null, error: 'Failed to fetch user tasks', isValid: false };
    }
  },

  async getProjectTasks(projectId: string, isServer = false) {
    try {
      const supabase = isServer
        ? createServerClient()
        : createClientComponentClient();

      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(first_name, last_name, avatar_url)')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      return handleApiResponse<Task[]>(data, error);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      return { data: null, error: 'Failed to fetch project tasks', isValid: false };
    }
  },

  async getStudyTasks(studyId: string, isServer = false) {
    try {
      const supabase = isServer
        ? createServerClient()
        : createClientComponentClient();

      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(first_name, last_name, avatar_url)')
        .eq('study_id', studyId)
        .order('due_date', { ascending: true });

      return handleApiResponse<Task[]>(data, error);
    } catch (error) {
      console.error('Error fetching study tasks:', error);
      return { data: null, error: 'Failed to fetch study tasks', isValid: false };
    }
  },

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    return this.updateTask(taskId, { 
      status, 
      is_completed: status === TaskStatus.DONE,
      updated_at: new Date().toISOString()
    });
  },

  async assignTask(taskId: string, userId: string) {
    return this.updateTask(taskId, { 
      assigned_to: userId,
      updated_at: new Date().toISOString()
    });
  },
}; 