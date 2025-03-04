import { createClient } from '@/lib/supabase/client';

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive?: string;
  tags: string[];
  studyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantInvite {
  email: string;
  studyId: string;
  name?: string;
  message?: string;
}

export interface ParticipantFilters {
  status?: 'active' | 'pending' | 'inactive';
  search?: string;
  tags?: string[];
  studyId?: string;
}

export interface ParticipantStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  completionRate: number;
}

/**
 * Service for managing participants
 */
export class ParticipantService {
  /**
   * Get all participants with optional filtering
   */
  static async getParticipants(filters?: ParticipantFilters): Promise<Participant[]> {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('participants')
        .select('*');
      
      // Apply filters
      if (filters) {
        // Status filter
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        // Search filter
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }
        
        // Tags filter (if any tag matches)
        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags);
        }
        
        // Study filter
        if (filters.studyId) {
          query = query.contains('studyIds', [filters.studyId]);
        }
      }
      
      const { data, error } = await query.order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to get participants:', error);
      return [];
    }
  }
  
  /**
   * Get a participant by ID
   */
  static async getParticipantById(id: string): Promise<Participant | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching participant:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to get participant with ID ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new participant
   */
  static async createParticipant(participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Participant | null> {
    try {
      const supabase = createClient();
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('participants')
        .insert({
          ...participant,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating participant:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to create participant:', error);
      return null;
    }
  }
  
  /**
   * Update an existing participant
   */
  static async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('participants')
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating participant:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to update participant with ID ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a participant
   */
  static async deleteParticipant(id: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting participant:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to delete participant with ID ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Send invitation emails to participants
   */
  static async inviteParticipants(invites: ParticipantInvite[]): Promise<boolean> {
    try {
      const supabase = createClient();
      
      // In a real application, you would implement email sending logic here
      // For this demo, we'll just simulate the action
      
      console.log('Sending invitations to participants:', invites);
      
      // Simulate the time it takes to send emails
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to invite participants:', error);
      return false;
    }
  }
  
  /**
   * Get participant statistics
   */
  static async getParticipantStats(studyId?: string): Promise<ParticipantStats> {
    try {
      const participants = await this.getParticipants(studyId ? { studyId } : undefined);
      
      const total = participants.length;
      const active = participants.filter(p => p.status === 'active').length;
      const pending = participants.filter(p => p.status === 'pending').length;
      const inactive = participants.filter(p => p.status === 'inactive').length;
      
      // Calculate completion rate (if study is provided)
      // For demo purposes, we'll just generate a random completion rate
      const completionRate = studyId ? Math.floor(Math.random() * 100) : 0;
      
      return {
        total,
        active,
        pending,
        inactive,
        completionRate,
      };
    } catch (error) {
      console.error('Failed to get participant stats:', error);
      return {
        total: 0,
        active: 0,
        pending: 0,
        inactive: 0,
        completionRate: 0,
      };
    }
  }
} 