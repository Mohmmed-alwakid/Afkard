import { Database } from './database'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at?: string
  updated_at?: string
}

export interface OrganizationMember {
  user_id: string
  organization_id: string
  role: string
  created_at?: string
  organizations?: Organization
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: string
  created_at?: string
  updated_at?: string
  assigned_to?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export interface Comment {
  id: string
  task_id: string
  content: string
  created_at?: string
  updated_at?: string
  user?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export interface ActivityLog {
  id: string
  user_id: string
  entity_type: 'profile' | 'organization' | 'project' | 'task' | 'comment'
  entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'unassigned'
  metadata: Record<string, unknown>
  created_at?: string
}

export interface ExtendedDatabase extends Database {
  public: {
    Tables: {
      organization_members: {
        Row: OrganizationMember
        Insert: Omit<OrganizationMember, 'organizations'>
        Update: Partial<Omit<OrganizationMember, 'organizations'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'assigned_to'>
        Update: Partial<Omit<Task, 'assigned_to'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'user'>
        Update: Partial<Omit<Comment, 'user'>>
      }
      activity_logs: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>
      }
    } & Database['public']['Tables']
    Views: Database['public']['Views']
    Functions: Database['public']['Functions']
    Enums: Database['public']['Enums']
    CompositeTypes: Database['public']['CompositeTypes']
  }
} 