import { Session, User } from '@supabase/supabase-js';

const now = new Date().toISOString();
const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

export const mockUser: User = {
  id: '123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2023-01-01T00:00:00.000Z',
  phone: undefined,
  confirmation_sent_at: undefined,
  confirmed_at: '2023-01-01T00:00:00.000Z',
  recovery_sent_at: undefined,
  last_sign_in_at: '2023-01-01T00:00:00.000Z',
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {},
  identities: [],
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z'
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: mockUser,
  expires_at: 9999999999
};

export const createMockSupabaseClient = () => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    updateUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
});

export const mockSupabaseClient = createMockSupabaseClient();

export const createClientComponentClient = jest.fn().mockReturnValue(mockSupabaseClient);
export const createServerComponentClient = jest.fn().mockReturnValue(mockSupabaseClient);
export const createMiddlewareClient = jest.fn().mockReturnValue(mockSupabaseClient);

// Mock the auth store functions
export const mockAuthStore = {
  signIn: jest.fn().mockResolvedValue({ user: mockSession.user, session: mockSession }),
  signUp: jest.fn().mockResolvedValue({ user: mockSession.user }),
  signOut: jest.fn().mockResolvedValue(undefined),
  refreshSession: jest.fn().mockResolvedValue({ session: mockSession }),
  updateProfile: jest.fn().mockResolvedValue({ user: mockSession.user }),
  resetPassword: jest.fn().mockResolvedValue(undefined),
  updatePassword: jest.fn().mockResolvedValue(undefined),
  getSession: jest.fn().mockResolvedValue({ session: mockSession }),
  initSession: jest.fn().mockResolvedValue({ session: mockSession }),
}; 