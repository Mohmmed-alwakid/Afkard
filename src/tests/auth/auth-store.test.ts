import { renderHook, act } from '@testing-library/react'
import { describe, expect, test, beforeEach, jest } from '@jest/globals'
import { useAuthStore } from '@/lib/stores/auth-store'
import { mockUser, mockSession } from '../mocks/supabase'
import { AuthError, AuthResponse } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn<() => Promise<AuthResponse>>(),
    signInWithPassword: jest.fn<() => Promise<AuthResponse>>(),
    signUp: jest.fn<() => Promise<AuthResponse>>(),
    signOut: jest.fn<() => Promise<{ error: AuthError | null }>>(),
    resetPasswordForEmail: jest.fn<() => Promise<{ data: {}; error: AuthError | null }>>(),
    updateUser: jest.fn<() => Promise<{ data: { user: typeof mockUser }; error: AuthError | null }>>(),
  },
}

// Mock createClientComponentClient
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient,
}))

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.getState().reset()
  })

  describe('Login', () => {
    test('should handle successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession, user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login('test@example.com', 'password')
      })

      expect(result.current.session).toEqual(mockSession)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    test('should handle login error', async () => {
      const mockError = new AuthError('Invalid credentials')
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: mockError,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login('test@example.com', 'wrong-password')
      })

      expect(result.current.session).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toEqual(mockError)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Registration', () => {
    test('should handle successful registration', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { session: mockSession, user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.register('test@example.com', 'password')
      })

      expect(result.current.session).toEqual(mockSession)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    test('should handle registration error', async () => {
      const mockError = new AuthError('Email already exists')
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: mockError,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.register('existing@example.com', 'password')
      })

      expect(result.current.session).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toEqual(mockError)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Session Management', () => {
    test('should handle successful session refresh', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession, user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.refreshSession()
      })

      expect(result.current.session).toEqual(mockSession)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    test('should handle session refresh error', async () => {
      const mockError = new AuthError('Session expired')
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: mockError,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.refreshSession()
      })

      expect(result.current.session).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toEqual(mockError)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Password Management', () => {
    test('should handle successful password reset request', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        data: {},
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.resetPassword('test@example.com')
      })

      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    test('should handle successful password update', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.updatePassword('new-password')
      })

      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Profile Management', () => {
    test('should handle successful profile update', async () => {
      const updatedUser = {
        ...mockUser,
        user_metadata: { full_name: 'Updated Name' },
      }

      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: { user: updatedUser },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.updateProfile({ full_name: 'Updated Name' })
      })

      expect(result.current.user?.user_metadata.full_name).toBe('Updated Name')
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Logout', () => {
    test('should handle successful logout', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.session).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    test('should handle logout error', async () => {
      const mockError = new AuthError('Logout failed')
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
        error: mockError,
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.error).toEqual(mockError)
      expect(result.current.isLoading).toBe(false)
    })
  })
})