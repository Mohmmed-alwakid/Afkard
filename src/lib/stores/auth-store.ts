import { create } from 'zustand';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthState {
  session: Session | null;
  user: User | null;
  error: AuthError | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: { [key: string]: any }) => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  error: null,
  isLoading: false,
  isAuthenticated: false,

  reset: () => {
    set({
      session: null,
      user: null,
      error: null,
      isLoading: false,
      isAuthenticated: false,
    });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({
        session: data.session,
        user: data.user,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      set({ error: error as AuthError });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      set({
        session: data.session,
        user: data.user,
        isAuthenticated: !!data.session,
        error: null,
      });
    } catch (error) {
      set({ error: error as AuthError });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      set({ error: error as AuthError });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({
        session: data.session,
        user: data.session?.user ?? null,
        isAuthenticated: !!data.session,
        error: null,
      });
    } catch (error) {
      set({ error: error as AuthError });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      set({ error: error as AuthError });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (error) {
      set({ error: error as AuthError });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profile: { [key: string]: any }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: profile,
      });
      if (error) throw error;
      set({
        user: data.user,
        error: null,
      });
    } catch (error) {
      set({ error: error as AuthError });
    } finally {
      set({ isLoading: false });
    }
  },
})); 