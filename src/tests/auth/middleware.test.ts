import { NextRequest, NextResponse } from '../mocks/next-server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { mockSession } from '../mocks/supabase';
import { middleware } from '@/middleware';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
  },
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn().mockReturnValue(mockSupabaseClient),
}));

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access to public routes', async () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = await middleware(request);
    expect(response).toBeUndefined();
  });

  it('should redirect to dashboard when accessing auth routes while authenticated', async () => {
    const request = new NextRequest('http://localhost:3000/login');
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } });

    const response = await middleware(request);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('Location')).toBe('http://localhost:3000/dashboard');
  });

  it('should redirect to login when accessing protected routes while unauthenticated', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: null } });

    const response = await middleware(request);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('Location')).toBe('http://localhost:3000/login?returnUrl=%2Fdashboard');
  });

  it('should allow access to protected routes when authenticated', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } });

    const response = await middleware(request);
    expect(response).toBeUndefined();
  });

  it('should handle session errors gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    mockSupabaseClient.auth.getSession.mockRejectedValueOnce(new Error('Session error'));

    const response = await middleware(request);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('Location')).toBe('http://localhost:3000/login?error=An+unexpected+error+occurred');
  });

  it('should allow access to static assets', async () => {
    const request = new NextRequest('http://localhost:3000/_next/static/test.js');
    const response = await middleware(request);
    expect(response).toBeUndefined();
  });

  it('should handle role-based access control', async () => {
    const request = new NextRequest('http://localhost:3000/admin');
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: {
        session: {
          ...mockSession,
          user: { ...mockSession.user, role: 'admin' },
        },
      },
    });

    const response = await middleware(request);
    expect(response).toBeUndefined();
  });

  it('should block unauthorized role access', async () => {
    const request = new NextRequest('http://localhost:3000/admin');
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
      data: {
        session: {
          ...mockSession,
          user: { ...mockSession.user, role: 'user' },
        },
      },
    });

    const response = await middleware(request);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('Location')).toBe('http://localhost:3000/unauthorized');
  });
});