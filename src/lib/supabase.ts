import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { cache } from 'react'
import { AuthError, NetworkError } from './errors'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { VerifyOtpParams } from '@supabase/supabase-js'

// Environment validation
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Constants
const CACHE_TIME = 5 * 60 * 1000 // 5 minutes
const STALE_TIME = 60 * 1000 // 1 minute

// Types
type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Supabase client with enhanced configuration
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'afkar_auth_token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'afkar',
        'x-client-info': 'next-js-14',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Enhanced query builder with caching
export const createQueryBuilder = <T extends keyof Database['public']['Tables']>(
  table: T
) => {
  const queryTable = () => supabase.from(table)

  return {
    // Cached query methods
    getById: cache(async (id: string): Promise<Row<T> | null> => {
      try {
        const { data, error } = await queryTable()
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        return data
      } catch (error) {
        handleQueryError(error)
      }
    }),

    getMany: cache(async (options?: {
      filters?: Record<string, any>
      limit?: number
      offset?: number
      orderBy?: { column: string; ascending?: boolean }
    }): Promise<Row<T>[]> => {
      try {
        let query = queryTable().select('*')

        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }

        if (options?.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true,
          })
        }

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        if (options?.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
        }

        const { data, error } = await query

        if (error) throw error
        return data
      } catch (error) {
        handleQueryError(error)
      }
    }),

    // Mutation methods
    create: async (data: Insert<T>): Promise<Row<T>> => {
      try {
        const { data: result, error } = await queryTable()
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return result
      } catch (error) {
        handleQueryError(error)
      }
    },

    update: async (id: string, data: Update<T>): Promise<Row<T>> => {
      try {
        const { data: result, error } = await queryTable()
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return result
      } catch (error) {
        handleQueryError(error)
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        const { error } = await queryTable().delete().eq('id', id)
        if (error) throw error
        return true
      } catch (error) {
        handleQueryError(error)
      }
    },

    // Realtime subscriptions
    // Note: Due to type limitations in the Supabase client, we need to use a simpler subscription pattern
    // See: https://github.com/supabase/supabase-js/issues/1581
    subscribe: (
      callback: (payload: RealtimePostgresChangesPayload<Row<T>>) => void,
      options?: { event?: 'INSERT' | 'UPDATE' | 'DELETE' }
    ): RealtimeChannel => {
      // Create a new channel for this subscription
      const channelId = `${table}_changes_${Math.random().toString(36).slice(2)}`
      
      // Set up the channel with basic configuration
      const channel = supabase.channel(channelId)

      // Add the subscription handler
      // @ts-ignore - Known type limitation with Supabase realtime
      channel.on('postgres_changes', {
        event: options?.event || '*',
        schema: 'public',
        table: table
      }, callback)

      // Return the subscribed channel
      return channel.subscribe()
    },
  }
}

// Query builders for each table
export const queryBuilder = {
  users: createQueryBuilder('users'),
  profiles: createQueryBuilder('profiles'),
  projects: createQueryBuilder('projects'),
  studies: createQueryBuilder('studies'),
  studyParticipants: createQueryBuilder('study_participants'),
  files: createQueryBuilder('files'),
  analytics: createQueryBuilder('analytics'),
}

// Storage helpers with enhanced error handling
export const storage = {
  avatars: {
    upload: async (file: Blob, path: string) => {
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
          })
        if (error) throw error
        return data
      } catch (error) {
        handleStorageError(error)
      }
    },
    getUrl: (path: string) => {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      return data.publicUrl
    },
    remove: async (path: string) => {
      try {
        const { error } = await supabase.storage.from('avatars').remove([path])
        if (error) throw error
        return true
      } catch (error) {
        handleStorageError(error)
      }
    },
  },
  studies: {
    upload: async (file: Blob, path: string) => {
      try {
        const { data, error } = await supabase.storage
          .from('studies')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
          })
        if (error) throw error
        return data
      } catch (error) {
        handleStorageError(error)
      }
    },
    getUrl: (path: string) => {
      const { data } = supabase.storage.from('studies').getPublicUrl(path)
      return data.publicUrl
    },
    remove: async (path: string) => {
      try {
        const { error } = await supabase.storage.from('studies').remove([path])
        if (error) throw error
        return true
      } catch (error) {
        handleStorageError(error)
      }
    },
  },
}

// Enhanced auth helpers with proper error handling and types
export const auth = {
  getSession: cache(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      handleAuthError(error)
    }
  }),

  getUser: cache(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      handleAuthError(error)
    }
  }),

  signIn: async (credentials: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials)
      if (error) throw error
      return data
    } catch (error) {
      handleAuthError(error)
    }
  },

  signUp: async (credentials: {
    email: string
    password: string
    options?: { data: Record<string, any> }
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp(credentials)
      if (error) throw error
      return data
    } catch (error) {
      handleAuthError(error)
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      handleAuthError(error)
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return true
    } catch (error) {
      handleAuthError(error)
    }
  },

  updatePassword: async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      return data
    } catch (error) {
      handleAuthError(error)
    }
  },

  verifyOtp: async (params: VerifyOtpParams) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp(params)
      if (error) throw error
      return data
    } catch (error) {
      handleAuthError(error)
    }
  },
}

// Error handlers
function handleQueryError(error: any): never {
  console.error('Database query error:', error)
  
  if (error.code === 'PGRST301') {
    throw new AuthError('Unauthorized', error.code, 401)
  }
  
  if (error.code?.startsWith('23')) {
    throw new Error('Database constraint violation: ' + error.message)
  }
  
  if (error.code === '40P01') {
    throw new Error('Database deadlock detected')
  }
  
  if (error.message?.includes('network')) {
    throw new NetworkError('Network error occurred')
  }
  
  throw new Error('An unexpected database error occurred')
}

function handleStorageError(error: any): never {
  console.error('Storage error:', error)
  
  if (error.statusCode === 413) {
    throw new Error('File too large')
  }
  
  if (error.statusCode === 400) {
    throw new Error('Invalid file type')
  }
  
  throw new Error('Storage operation failed: ' + error.message)
}

function handleAuthError(error: any): never {
  console.error('Auth error:', error)
  
  if (error.message?.includes('Email not confirmed')) {
    throw new Error('Please verify your email address')
  }
  
  if (error.message?.includes('Invalid login credentials')) {
    throw new Error('Invalid email or password')
  }
  
  if (error.message?.includes('Rate limit')) {
    throw new Error('Too many attempts. Please try again later')
  }
  
  throw new Error('Authentication failed: ' + error.message)
}

// Database types
export type Tables = {
  users: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: 'researcher' | 'participant'
    organization?: string
    title?: string
    bio?: string
    avatar_url?: string
    phone?: string
    email_verified: boolean
    two_factor_enabled: boolean
    last_sign_in: string | null
    created_at: string
    updated_at: string
  }
  profiles: {
    id: string
    user_id: string
    preferences: {
      theme: 'light' | 'dark' | 'system'
      language: 'en' | 'ar'
      notifications: {
        email: boolean
        push: boolean
        desktop: boolean
      }
      timezone: string
      currency: string
    }
    created_at: string
    updated_at: string
  }
  projects: {
    id: string
    name: string
    description?: string
    owner_id: string
    team_ids: string[]
    status: 'draft' | 'active' | 'archived' | 'deleted'
    settings: {
      privacy: 'private' | 'team' | 'public'
      allow_comments: boolean
      require_approval: boolean
    }
    metadata: Record<string, any>
    created_at: string
    updated_at: string
  }
  studies: {
    id: string
    project_id: string
    title: string
    description?: string
    type: 'test' | 'interview'
    status: 'draft' | 'active' | 'completed' | 'archived'
    target_audience: {
      age_range: [number, number]
      gender: ('male' | 'female' | 'other')[]
      location: string[]
      languages: string[]
      criteria: Record<string, any>
    }
    settings: {
      max_participants: number
      reward_amount: number
      estimated_duration: number
      auto_approve: boolean
    }
    metadata: Record<string, any>
    created_at: string
    updated_at: string
  }
  study_participants: {
    id: string
    study_id: string
    user_id: string
    status: 'pending' | 'accepted' | 'completed' | 'rejected'
    started_at: string | null
    completed_at: string | null
    feedback: {
      rating: number
      comments: string
      technical_issues: string[]
    } | null
    reward_status: 'pending' | 'paid' | 'cancelled'
    metadata: Record<string, any>
    created_at: string
    updated_at: string
  }
  files: {
    id: string
    name: string
    size: number
    type: string
    path: string
    owner_id: string
    project_id?: string
    study_id?: string
    metadata: Record<string, any>
    created_at: string
    updated_at: string
  }
  analytics: {
    id: string
    event: string
    properties: Record<string, any>
    user_id?: string
    session_id?: string
    created_at: string
  }
}

// Helper types
export type UserRole = Tables['users']['role']
export type StudyType = Tables['studies']['type']
export type StudyStatus = Tables['studies']['status']
export type ProjectStatus = Tables['projects']['status']

// Row types
export type User = Tables['users']
export type Profile = Tables['profiles']
export type Project = Tables['projects']
export type Study = Tables['studies']
export type StudyParticipant = Tables['study_participants']
export type File = Tables['files']
export type Analytics = Tables['analytics']

// Insert types
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
export type StudyInsert = Omit<Study, 'id' | 'created_at' | 'updated_at'>

// Update types
export type UserUpdate = Partial<UserInsert>
export type ProfileUpdate = Partial<ProfileInsert>
export type ProjectUpdate = Partial<ProjectInsert>
export type StudyUpdate = Partial<StudyInsert> 