/**
 * @jest-environment jsdom
 */
import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { Session } from '@supabase/supabase-js';
import { clearSession, getStoredSession, storeSession } from '@/lib/session';
import { mockSession } from '../mocks/supabase';

describe('Session Management', () => {
  let mockCookies: Record<string, { value: string; options: Record<string, string | boolean> }> = {};
  let mockLocalStorage: Record<string, string> = {};
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Clear mocks
    mockCookies = {};
    mockLocalStorage = {};

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key]),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
      configurable: true,
    });

    // Mock document.cookie methods directly
    document.cookie = '';
    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => {
      return Object.entries(mockCookies)
        .map(([key, { value }]) => `${key}=${value}`)
        .join('; ');
    });

    jest.spyOn(document, 'cookie', 'set').mockImplementation((cookieStr: string) => {
      const [cookie, ...options] = cookieStr.split(';').map(str => str.trim());
      const [key, value] = cookie.split('=');
      
      const cookieOptions: Record<string, string | boolean> = {};
      options.forEach(option => {
        const [optKey, optValue] = option.split('=');
        if (!optValue) {
          cookieOptions[optKey.toLowerCase()] = true;
        } else {
          cookieOptions[optKey.toLowerCase()] = optValue;
        }
      });

      mockCookies[key] = { value, options: cookieOptions };
    });

    // Mock process.env
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    mockLocalStorage = {};
    mockCookies = {};
    jest.resetAllMocks();

    // Restore original NODE_ENV
    if (originalNodeEnv) {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('Cookie Management', () => {
    test('should set secure cookies in production', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      await storeSession(mockSession);
      expect(mockCookies['session'].options).toHaveProperty('secure', true);
      expect(mockCookies['session'].options).toHaveProperty('samesite', 'lax');
    });

    test('should not set secure cookies in development', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      await storeSession(mockSession);
      expect(mockCookies['session'].options.secure).toBeFalsy();
    });

    test('should set correct cookie attributes', async () => {
      await storeSession(mockSession);
      expect(mockCookies['session'].options).toHaveProperty('path', '/');
      expect(mockCookies['session'].options).toHaveProperty('samesite', 'lax');
      expect(mockCookies['session'].options).toHaveProperty('expires');
    });
  });

  describe('Session Storage', () => {
    test('should store session in both localStorage and cookie', async () => {
      await storeSession(mockSession);
      expect(mockLocalStorage['session']).toBeDefined();
      expect(mockCookies['session']).toBeDefined();
      expect(mockCookies['session'].value).toBe(JSON.stringify(mockSession));
    });

    test('should retrieve valid session from localStorage', async () => {
      mockLocalStorage['session'] = JSON.stringify(mockSession);
      const session = await getStoredSession();
      expect(session).toEqual(mockSession);
    });

    test('should retrieve valid session from cookie when localStorage is empty', async () => {
      mockCookies['session'] = { 
        value: JSON.stringify(mockSession),
        options: { path: '/', samesite: 'lax' }
      };
      const session = await getStoredSession();
      expect(session).toEqual(mockSession);
    });

    test('should return null for expired session', async () => {
      const expiredSession: Session = {
        ...mockSession,
        expires_at: Date.now() / 1000 - 3600, // 1 hour ago
      };
      mockLocalStorage['session'] = JSON.stringify(expiredSession);
      const session = await getStoredSession();
      expect(session).toBeNull();
    });
  });

  describe('Session Clearing', () => {
    test('should clear session from both localStorage and cookie', async () => {
      mockLocalStorage['session'] = JSON.stringify(mockSession);
      mockCookies['session'] = { 
        value: JSON.stringify(mockSession),
        options: { path: '/', samesite: 'lax' }
      };

      await clearSession();

      expect(mockLocalStorage['session']).toBeUndefined();
      expect(mockCookies['session']).toBeUndefined();
    });

    test('should handle errors when clearing session', async () => {
      const removeItemSpy = jest.spyOn(window.localStorage, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(clearSession()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors when storing session', async () => {
      const setItemSpy = jest.spyOn(window.localStorage, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(storeSession(mockSession)).resolves.not.toThrow();
    });

    test('should return null when storage is corrupted', async () => {
      mockLocalStorage['session'] = 'invalid-json';
      mockCookies['session'] = { 
        value: 'invalid-json',
        options: { path: '/', samesite: 'lax' }
      };

      const session = await getStoredSession();
      expect(session).toBeNull();
    });
  });
}); 