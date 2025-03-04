'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase-browser';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = 'researcher' | 'participant';

interface UserState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  fetchUser: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  clearUser: () => void;
}

export const useUser = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  
  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ user: null, profile: null, isLoading: false });
        return;
      }
      
      // Fetch user profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        set({ error: new Error(error.message), isLoading: false });
        return;
      }
      
      set({ user, profile, isLoading: false });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ error: error as Error, isLoading: false });
    }
  },
  
  updateProfile: async (profileData) => {
    const currentUser = get().user;
    
    if (!currentUser) {
      set({ error: new Error('No user logged in') });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', currentUser.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        set({ error: new Error(error.message) });
        return;
      }
      
      // Refetch user data to get the updated profile
      await get().fetchUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: error as Error });
    }
  },
  
  clearUser: () => {
    set({ user: null, profile: null, error: null });
  }
})); 