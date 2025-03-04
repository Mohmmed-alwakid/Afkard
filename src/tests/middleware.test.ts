import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { middleware } from '../middleware';
import { createMockSupabaseClient, mockSession } from './mocks/supabase';

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn()
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      redirect: jest.fn().mockImplementation((url) => ({
        headers: new Map([['location', url]]),
        status: 307,
        statusText: 'Temporary Redirect'
      })),
      next: jest.fn().mockImplementation(() => undefined)
    }
  };
});

describe('Authentication Middleware', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    (createMiddlewareClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url, 'http://localhost:3000'));
  };

  it('should allow access to public routes', async () => {
    const request = createMockRequest('/');
    const response = await middleware(request);
    
    expect(response).toBeUndefined();
  });

  it('should allow access to auth routes when unauthenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    
    const request = createMockRequest('/login');
    const response = await middleware(request);
    
    expect(response).toBeUndefined();
  });

  it('should redirect to dashboard when accessing auth routes while authenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    
    const request = createMockRequest('/login');
    const response = await middleware(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'));
  });

  it('should redirect to login when accessing protected routes while unauthenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    
    const request = createMockRequest('/dashboard');
    const response = await middleware(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/login'));
  });

  it('should allow access to protected routes when authenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    
    const request = createMockRequest('/dashboard');
    const response = await middleware(request);
    
    expect(response).toBeUndefined();
  });

  it('should handle session errors gracefully', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: new Error('Session error') 
    });
    
    const request = createMockRequest('/dashboard');
    const response = await middleware(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/login'));
  });

  it('should allow access to static assets', async () => {
    const request = createMockRequest('/_next/static/test.js');
    const response = await middleware(request);
    
    expect(response).toBeUndefined();
  });

  it('should handle role-based access control', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { 
        session: {
          ...mockSession,
          user: { ...mockSession.user, role: 'admin' }
        }
      }, 
      error: null 
    });
    
    const request = createMockRequest('/admin');
    const response = await middleware(request);
    
    expect(response).toBeUndefined();
  });

  it('should block unauthorized role access', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    
    const request = createMockRequest('/admin');
    const response = await middleware(request);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/unauthorized'));
  });
}); 