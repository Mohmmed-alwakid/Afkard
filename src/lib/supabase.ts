import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { cache } from 'react'
import { AuthError, NetworkError } from './errors'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { VerifyOtpParams } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'

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
type Tables = Database['public']['Tables']
type Row<T extends keyof Tables> = Tables[T]['Row']
type Insert<T extends keyof Tables> = Tables[T]['Insert']
type Update<T extends keyof Tables> = Tables[T]['Update']

// Supabase client with enhanced configuration
const supabase = createClientComponentClient<Database>()

// Enhanced query builder with caching
export const createQueryBuilder = <T extends keyof Tables>(table: T) => {
  const queryTable = () => supabase.from(table)

  return {
    async getOne(id: string): Promise<Row<T> | null> {
      const { data, error } = await queryTable()
        .select()
        .eq('id', id)
        .single()

      if (error) {
        console.error(`[${table}] Get one error:`, error)
        return null
      }

      return data
    },

    async getMany(): Promise<Row<T>[]> {
      const { data, error } = await queryTable()
        .select()

      if (error) {
        console.error(`[${table}] Get many error:`, error)
        return []
      }

      return data || []
    },

    async create(data: Insert<T>): Promise<Row<T> | null> {
      const { data: result, error } = await queryTable()
        .insert(data)
        .select()
        .single()

      if (error) {
        console.error(`[${table}] Create error:`, error)
        return null
      }

      return result
    },

    async update(id: string, data: Update<T>): Promise<Row<T> | null> {
      const { data: result, error } = await queryTable()
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error(`[${table}] Update error:`, error)
        return null
      }

      return result
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await queryTable()
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`[${table}] Delete error:`, error)
        return false
      }

      return true
    },

    subscribe(
      event: 'INSERT' | 'UPDATE' | 'DELETE',
      callback: (payload: { new: Row<T>; old: Row<T> }) => void
    ) {
      const channel = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table: table.toString(),
          },
          callback
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }
  }
}

// Query builders for each table
export const queryBuilder = {
  users: createQueryBuilder('users'),
  profiles: createQueryBuilder('profiles'),
  projects: createQueryBuilder('projects'),
  studies: createQueryBuilder('studies'),
  study_participants: createQueryBuilder('study_participants'),
} as const

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
      // During static build, this might not be available
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('Supabase session requested during build phase - returning null session');
        return { data: { session: null }, error: null };
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      return { data: { session }, error }
    } catch (error) {
      console.error('Error getting session:', error);
      return { data: { session: null }, error: error as Error };
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
  console.error('Query Error:', error)
  if (error instanceof Error) {
    throw error
  }
  throw new Error('An unknown error occurred')
}

function handleStorageError(error: any): never {
  console.error('Storage Error:', error)
  if (error instanceof Error) {
    throw error
  }
  throw new Error('A storage error occurred')
}

class AuthError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTH_ERROR',
    public status: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string = 'DATABASE_ERROR',
    public status: number = 500
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

function handleAuthError(error: unknown): never {
  if (error instanceof AuthError) {
    throw error
  }
  throw new AuthError('An authentication error occurred', 'AUTH_ERROR', 401)
}

function handleDatabaseError(error: unknown): never {
  if (error instanceof DatabaseError) {
    throw error
  }
  throw new DatabaseError('A database error occurred', 'DATABASE_ERROR', 500)
}

// Export types
export type { Database }
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Helper types
export type UserRole = Tables['users']['Row']['role']
export type StudyType = Tables['studies']['Row']['type']
export type StudyStatus = Tables['studies']['Row']['status']
export type ProjectStatus = Tables['projects']['Row']['status']

// Row types
export type User = Tables['users']['Row']
export type Profile = Tables['profiles']['Row']
export type Project = Tables['projects']['Row']
export type Study = Tables['studies']['Row']
export type StudyParticipant = Tables['study_participants']['Row']

// Insert types
export type UserInsert = Tables['users']['Insert']
export type ProfileInsert = Tables['profiles']['Insert']
export type ProjectInsert = Tables['projects']['Insert']
export type StudyInsert = Tables['studies']['Insert']

// Update types
export type UserUpdate = Tables['users']['Update']
export type ProfileUpdate = Tables['profiles']['Update']
export type ProjectUpdate = Tables['projects']['Update']
export type StudyUpdate = Tables['studies']['Update']

// Export the supabase client explicitly
export { supabase } 