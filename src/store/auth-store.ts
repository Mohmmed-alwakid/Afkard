import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase'
import {
  AuthError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  TwoFactorRequiredError,
  NetworkError,
  SessionExpiredError,
  isRetryableError,
} from '@/lib/errors'
import {
  getStoredSession,
  storeSession,
  clearStoredSession,
  updateLastActive,
  isValidSession,
  shouldRefreshSession,
  isSessionInactive,
  validateDeviceId,
} from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { type Database } from '@/types/database'
import { PostgrestSingleResponse, Session } from '@supabase/supabase-js'

// Constants
const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000 // 1 minute

// Create a client-side Supabase client that will be consistent across the store
const supabaseClient = createBrowserClient()

type UserRole = Database['public']['Enums']['user_role']
type DbUser = Database['public']['Tables']['users']['Row']
type DbUserInsert = Database['public']['Tables']['users']['Insert']
type DbUserUpdate = Database['public']['Tables']['users']['Update']
type DbProfile = Database['public']['Tables']['profiles']['Row']
type DbProfileInsert = Database['public']['Tables']['profiles']['Insert']

export type User = DbUser & {
  preferences?: Record<string, any>
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  reset: () => void;
  isAuthenticated: boolean;
  twoFactorRequired: boolean;
  lastActive: number;
  rememberMe: boolean;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRole
    organization?: string
  }) => Promise<any>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (token: string, password: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  verify2FA: (code: string) => Promise<void>
  refreshSession: () => Promise<void>
  
  // State management
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setTwoFactorRequired: (required: boolean) => void
  updateLastActive: () => void
}

// Add the LoginResult interface
export interface LoginResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (attempts === 0 || !isRetryableError(error)) {
      throw error
    }

    await new Promise(resolve => setTimeout(resolve, delay))
    return retryWithBackoff(fn, attempts - 1, delay * 2)
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Initialize session check interval
      let sessionCheckInterval: NodeJS.Timeout | null = null;
      let refreshInterval: NodeJS.Timeout | null = null;

      // Function to clear all intervals
      const clearIntervals = () => {
        if (sessionCheckInterval) clearInterval(sessionCheckInterval);
        if (refreshInterval) clearInterval(refreshInterval);
      };

      // DEVELOPMENT ONLY: Set mock user for testing
      const setMockUser = () => {
        console.log('Setting mock user for development');
        const mockUser: User = {
          id: 'mock-user-id',
          email: 'demo@afkar.com',
          first_name: 'Demo',
          last_name: 'User',
          role: 'user',
          organization: 'Afkar',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        set({ 
          user: mockUser,
          isAuthenticated: true, 
          isLoading: false,
          isInitialized: true,
          lastActive: Date.now()
        });
        
        return { success: true, user: mockUser };
      };

      // DEVELOPMENT ONLY: Auto-login for development if needed
      if (process.env.NODE_ENV === 'development') {
        // Uncomment the next line to enable auto-login in development
        // setTimeout(setMockUser, 1000);
      }
      
      // Function to start session monitoring
      const startSessionMonitoring = () => {
        clearIntervals();

        // Check session validity periodically
        sessionCheckInterval = setInterval(async () => {
          const { data: { session } } = await supabaseClient.auth.getSession();
          if (!session) {
            console.log('No valid session found during check, logging out');
            get().logout();
            return;
          }

          // Check if session is expired or about to expire
          const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
          const now = new Date();
          
          if (!expiresAt || expiresAt <= now) {
            console.log('Session expired during check, logging out');
            get().logout();
            return;
          }

          // If session is about to expire, try to refresh it
          if (expiresAt.getTime() - now.getTime() < REFRESH_INTERVAL) {
            try {
              await get().refreshSession();
            } catch (error) {
              console.error('Failed to refresh session:', error);
              get().logout();
            }
          }
        }, SESSION_CHECK_INTERVAL);

        // Set up regular session refresh
        refreshInterval = setInterval(async () => {
          try {
            await get().refreshSession();
          } catch (error) {
            console.error('Failed to refresh session:', error);
          }
        }, REFRESH_INTERVAL);
      };

      // Initialize auth state
      const initializeAuth = async () => {
        try {
          console.log('Initializing auth state...');
          const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            clearStoredSession();
            set({ user: null, isAuthenticated: false });
            return;
          }
          
          if (session) {
            console.log('Found existing session, validating...');
            // Validate the session
            const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
            const now = new Date();
            
            if (!expiresAt || expiresAt <= now) {
              console.log('Session expired, clearing state');
              clearStoredSession();
              set({ user: null, isAuthenticated: false });
              return;
            }

            console.log('Session valid, fetching user data...');
            // Try to get user data
            const { data: userData, error: userError } = await supabaseClient
              .from('users')
              .select('*, profiles(*)')
              .eq('id', session.user.id)
              .single() as PostgrestSingleResponse<DbUser & { profiles: DbProfile[] }>;

            if (userError) {
              console.error('Error fetching user data:', userError);
              clearStoredSession();
              set({ user: null, isAuthenticated: false });
              return;
            }

            if (userData) {
              console.log('User data fetched successfully');
              const user = {
                ...userData,
                preferences: userData.profiles?.[0]?.preferences as Record<string, any> | undefined
              } satisfies User;

              set({ 
                user,
                isAuthenticated: true,
                lastActive: Date.now()
              });

              // Start session monitoring
              startSessionMonitoring();
            }
          } else {
            console.log('No existing session found');
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          clearStoredSession();
          set({ user: null, isAuthenticated: false });
        }
      };

      // Call initialize immediately
      initializeAuth();

      return {
        user: null,
        session: null,
        isLoading: false,
        error: null,
        isInitialized: false,
        reset: () => set({
          user: null,
          session: null,
          isLoading: false,
          error: null,
          isInitialized: false,
        }),
        isAuthenticated: false,
        twoFactorRequired: false,
        lastActive: Date.now(),
        rememberMe: false,

        setUser: (user) => set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setTwoFactorRequired: (required) => set({ twoFactorRequired: required }),

        updateLastActive: () => {
          updateLastActive()
          set({ lastActive: Date.now() })
        },

        login: async (email: string, password: string, rememberMe = false) => {
          try {
            set({ isLoading: true, error: null });
            console.log('Starting login process for:', email);

            // Clear any existing session first
            await supabaseClient.auth.signOut();
            clearStoredSession();

            const { data, error } = await supabaseClient.auth.signInWithPassword({ 
              email, 
              password,
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            });

            if (error) {
              console.error('Login error from Supabase:', error);
              set({
                isLoading: false,
                error: error.message || 'Authentication failed',
                isAuthenticated: false,
                user: null,
              });
              return { 
                success: false, 
                error: error.message || 'Authentication failed'
              };
            }

            if (!data.session) {
              console.error('No session returned from login');
              set({
                isLoading: false,
                error: 'No session returned',
                isAuthenticated: false,
                user: null,
              });
              return { 
                success: false, 
                error: 'No session returned from authentication service'
              };
            }

            console.log('Login successful, session obtained');

            // Store session - note we changed to use only one parameter
            storeSession(data.session);
            
            // Set rememberMe flag separately if needed
            set({ rememberMe });

            // Get user data
            const { data: userData, error: userError } = await supabaseClient
              .from('users')
              .select('*, profiles(*)')
              .eq('id', data.session.user.id)
              .single() as PostgrestSingleResponse<DbUser & { profiles: DbProfile[] }>;

            if (userError) {
              console.error('Error fetching user data:', userError);
              set({
                isLoading: false,
                error: 'Failed to fetch user data',
                isAuthenticated: true, // User is authenticated but we couldn't fetch their data
                session: data.session,
              });
              return { 
                success: true, 
                session: data.session,
                error: 'User authenticated but failed to fetch user data'
              };
            }

            if (!userData) {
              console.error('No user data found');
              set({
                isLoading: false,
                error: 'User not found',
                isAuthenticated: true, // User is authenticated but we couldn't fetch their data
                session: data.session,
              });
              return { 
                success: true, 
                session: data.session,
                error: 'User authenticated but profile not found'
              };
            }

            console.log('User data fetched successfully');

            const user = {
              ...userData,
              preferences: userData.profiles?.[0]?.preferences as Record<string, any> | undefined
            } satisfies User;

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              rememberMe,
              lastActive: Date.now(),
            });

            // Start session monitoring
            startSessionMonitoring();

            return { 
              success: true,
              user, 
              session: data.session 
            };
          } catch (error) {
            console.error('Login process error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            
            set({
              isLoading: false,
              error: errorMessage,
              isAuthenticated: false,
              user: null,
            });
            
            // Return a structured error response instead of throwing
            return {
              success: false,
              error: errorMessage
            };
          }
        },

        register: async ({ email, password, firstName, lastName, role, organization }) => {
          console.log('Registration attempt with:', email);
          
          try {
            set({ isLoading: true, error: null });
            
            // Simplify data to minimize potential issues
            const metadata = {
              first_name: firstName,
              last_name: lastName,
              role,
              email
            };
            
            // Try registration with simplified approach
            const { data, error } = await supabaseClient.auth.signUp({
              email,
              password,
              options: {
                data: metadata
              }
            });
            
            if (error) {
              console.error('Auth signup error:', error);
              
              // Handle specific errors with user-friendly messages
              if (error.message.includes('already exists')) {
                throw new Error('This email is already registered.');
              }
              
              throw error;
            }
            
            // Short delay to allow trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return data;
          } catch (error: any) {
            console.error('Registration error:', error);
            
            // Specific handling for the exact error you're seeing
            if (error.message && error.message.includes('Database error saving new user')) {
              set({ error: 'Unable to create account. Please try again later.' });
              throw new Error('Unable to create account. Please try again later.');
            }
            
            set({ error: error.message || 'Registration failed' });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        logout: async () => {
          try {
            set({ isLoading: true });
            
            // Clear all intervals first
            clearIntervals();
            
            // Sign out from Supabase
            await supabaseClient.auth.signOut();
            
            // Clear stored session
            clearStoredSession();
            
            // Reset state
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              twoFactorRequired: false,
              error: null,
              lastActive: Date.now()
            });

            console.log('Logout completed successfully');
            return true;
          } catch (error) {
            console.error('Logout error:', error);
            if (error instanceof AuthError) {
              set({ error: error.message });
            } else {
              set({ error: 'An unexpected error occurred during logout' });
            }
            return false;
          } finally {
            set({ isLoading: false });
          }
        },

        resetPassword: async (email) => {
          try {
            set({ isLoading: true, error: null })

            const { error } = await retryWithBackoff(async () => 
              supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              })
            )

            if (error) {
              throw new AuthError(error.message, error.name)
            }
          } catch (error) {
            if (error instanceof AuthError) {
              set({ error: error.message })
            } else {
              set({ error: 'An unexpected error occurred' })
            }
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        updatePassword: async (token, password) => {
          try {
            set({ isLoading: true, error: null })

            const { error } = await retryWithBackoff(async () => 
              supabaseClient.auth.updateUser({
                password,
              })
            )

            if (error) {
              throw new AuthError(error.message, error.name)
            }
          } catch (error) {
            if (error instanceof AuthError) {
              set({ error: error.message })
            } else {
              set({ error: 'An unexpected error occurred' })
            }
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        updateProfile: async (data) => {
          try {
            set({ isLoading: true, error: null })

            const { error } = await retryWithBackoff(async () => 
              supabaseClient
                .from('users')
                .update(data)
                .eq('id', get().user?.id)
            )

            if (error) {
              throw new AuthError(error.message, error.name)
            }

            set((state) => ({
              user: state.user ? { ...state.user, ...data } : null,
            }))
          } catch (error) {
            if (error instanceof AuthError) {
              set({ error: error.message })
            } else {
              set({ error: 'An unexpected error occurred' })
            }
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        verifyEmail: async (token) => {
          try {
            set({ isLoading: true, error: null })

            const { error } = await retryWithBackoff(async () => 
              supabaseClient.auth.verifyOtp({
                token_hash: token,
                type: 'email',
              })
            )

            if (error) {
              throw new AuthError(error.message, error.name)
            }
          } catch (error) {
            if (error instanceof AuthError) {
              set({ error: error.message })
            } else {
              set({ error: 'An unexpected error occurred' })
            }
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        verify2FA: async (code) => {
          try {
            set({ isLoading: true, error: null })

            const { error } = await retryWithBackoff(async () => 
              supabaseClient.auth.verifyOtp({
                token_hash: code,
                type: 'email',
              })
            )

            if (error) {
              throw new AuthError(error.message, error.name)
            }

            set({ twoFactorRequired: false })
          } catch (error) {
            if (error instanceof AuthError) {
              set({ error: error.message })
            } else {
              set({ error: 'An unexpected error occurred' })
            }
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        refreshSession: async () => {
          try {
            console.log('Refreshing session...');
            set({ isLoading: true, error: null });

            // Get current session
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (!session) {
              console.log('No session found during refresh');
              set({ user: null, isAuthenticated: false, isLoading: false });
              return;
            }

            console.log('Got session for user:', session.user.email);

            // Fetch user data
            const { data: userData, error: userError } = await supabaseClient
              .from('users')
              .select('*, profiles(*)')
              .eq('id', session.user.id)
              .single() as PostgrestSingleResponse<DbUser & { profiles: DbProfile[] }>;

            if (userError || !userData) {
              console.error('Error fetching user data:', userError);
              set({ isLoading: false, error: 'Error fetching user data' });
              return;
            }

            console.log('Got user data:', userData.email);

            const user = {
              ...userData,
              preferences: userData.profiles?.[0]?.preferences as Record<string, any> | undefined
            } satisfies User;

            // Update state
            set({ 
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              lastActive: Date.now()
            });

            console.log('Session refresh complete, isAuthenticated:', true);
          } catch (error) {
            console.error('Session refresh error:', error);
            set({ isLoading: false, error: 'Failed to refresh session' });
          }
        },

        updateUser: async (data: Partial<DbUserUpdate>) => {
          try {
            set({ isLoading: true })
            const user = get().user
            
            if (!user?.id) {
              throw new Error('No user ID available for update')
            }

            // Filter out any undefined values and ensure required fields
            const filteredData = Object.fromEntries(
              Object.entries(data).filter(([_, v]) => v !== undefined)
            ) as Partial<DbUserUpdate>

            // Create a properly typed update object
            const updateData = {
              ...filteredData,
              updated_at: new Date().toISOString()
            } satisfies Partial<DbUserUpdate>

            const { error } = await supabaseClient
              .from('users')
              .update(updateData)
              .eq('id', user.id)
              .select()
              .single() as PostgrestSingleResponse<DbUser>

            if (error) throw error

            // Update the user state with the new data
            const updatedUser = {
              ...user,
              ...updateData
            } satisfies User

            set({ user: updatedUser })
          } catch (error) {
            console.error('Error updating user:', error)
            set({ error: 'Failed to update user profile' })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },
      };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({
        rememberMe: state.rememberMe,
      }),
    }
  )
) 