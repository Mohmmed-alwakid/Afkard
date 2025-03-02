/**
 * @deprecated Use useAuthStore from src/store/auth-store.ts instead.
 * This context-based auth provider is being phased out.
 */
"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { toast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/store/auth-store"
import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await refreshProfile();
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    getUser();

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error getting user:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const returnUrl = searchParams.get('returnUrl');
        router.push(returnUrl || '/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Step 1: Create the auth user with minimal data first
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('User creation failed');

      // Generate a username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + 
                      Math.floor(Math.random() * 1000).toString();

      // Step 2: Create the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          full_name: `${firstName} ${lastName}`,
          avatar_url: null,
          bio: null,
          role: 'user',
          preferences: {
            theme: 'system',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              desktop: true
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency: 'USD'
          }
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
      });

    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const updatePassword = async (token: string, password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      router.push('/signin');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      // Only include fields that are valid for update
      const updateData: Partial<Profile> = {};
      if (data.username) updateData.username = data.username;
      if (data.full_name) updateData.full_name = data.full_name;
      if (data.avatar_url) updateData.avatar_url = data.avatar_url;
      if (data.bio) updateData.bio = data.bio;
      if (data.preferences) updateData.preferences = data.preferences;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) throw error;
      router.push('/signin');
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    resetPassword,
    updatePassword,
    updateProfile,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
} 