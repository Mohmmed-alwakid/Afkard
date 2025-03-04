import { Session } from '@supabase/supabase-js'
import { ConcurrentSessionError, SessionExpiredError } from './errors'
import { AUTH_COOKIE_NAME, SESSION_EXPIRY } from '@/config/auth.config'
import { SessionSchema } from '@/config/auth.config'
import { handleAuthError } from '@/lib/auth-errors'
import { log } from '@/lib/utils'

const SESSION_KEY = 'session'
const DEVICE_ID_KEY = 'afkar_device_id'
const LAST_ACTIVE_KEY = 'afkar_last_active'
const SESSION_EXPIRY_BUFFER = 5 * 60 * 1000 // 5 minutes in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

export interface SessionMetadata {
  deviceId: string
  lastActive: number
  rememberMe: boolean
}

export interface StoredSession {
  session: Session
  metadata: SessionMetadata
}

async function retry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retry(operation, retries - 1, delay * 2)
    }
    throw error
  }
}

interface CookieOptions {
  path?: string
  domain?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  expires?: Date
}

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  const cookieStr = `${name}=${encodeURIComponent(value)}`
  const optionsStr = Object.entries(options)
    .map(([key, value]) => {
      if (value === true) return key
      if (value === false) return ''
      if (value instanceof Date) return `${key}=${value.toUTCString()}`
      return `${key}=${value}`
    })
    .filter(Boolean)
    .join('; ')

  document.cookie = optionsStr ? `${cookieStr}; ${optionsStr}` : cookieStr
}

export const getCookie = (name: string): string | undefined => {
  const cookies = document.cookie.split(';')
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
}

export const deleteCookie = (name: string, options: CookieOptions = {}) => {
  setCookie(name, '', { ...options, maxAge: -1 })
}

export const safeParseJSON = <T>(jsonString: string | null | undefined, defaultValue: T): T => {
  if (!jsonString || jsonString.trim() === '') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

export function storeSession(session: Session | null): void {
  if (!session) {
    clearSession();
    return;
  }

  try {
    // Validate session before storing
    if (!session.access_token || !session.expires_at) {
      console.error('Invalid session data:', session);
      return;
    }

    // Store in localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Store in cookie with proper options
    const cookieOptions: CookieOptions = {
      expires: new Date((session.expires_at || 0) * 1000),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };
    
    setCookie(SESSION_KEY, JSON.stringify(session), cookieOptions);
    console.log('Session stored successfully');
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

export function getStoredSession(): Session | null {
  try {
    // Try localStorage first with safe parsing
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession && storedSession.trim() !== '') {
      const session = safeParseJSON<Session | null>(storedSession, null);
      if (session && session.access_token && session.expires_at && session.expires_at * 1000 > Date.now()) {
        return session;
      } else if (session) {
        // Session exists but is invalid or expired - clean it up
        localStorage.removeItem(SESSION_KEY);
      }
    }

    // Try cookie next with safe parsing
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith(`${SESSION_KEY}=`));
    if (sessionCookie) {
      const cookieValue = sessionCookie.split('=')[1];
      if (cookieValue && cookieValue.trim() !== '') {
        const session = safeParseJSON<Session | null>(decodeURIComponent(cookieValue), null);
        if (session && session.access_token && session.expires_at && session.expires_at * 1000 > Date.now()) {
          // Valid session from cookie - also save to localStorage for consistency
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          return session;
        } else {
          // Invalid session in cookie - clean it up
          deleteCookie(SESSION_KEY);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    // In case of any error, clean up potentially corrupted session data
    try {
      localStorage.removeItem(SESSION_KEY);
      deleteCookie(SESSION_KEY);
    } catch (cleanupError) {
      console.error('Error cleaning up session:', cleanupError);
    }
    return null;
  }
}

export function clearSession(): void {
  try {
    // Clear localStorage
    localStorage.removeItem(SESSION_KEY);

    // Clear cookie with proper options
    const cookieOptions: CookieOptions = {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };
    
    deleteCookie(SESSION_KEY, cookieOptions);
    console.log('Session cleared successfully');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

// Add this alias for backward compatibility
export const clearStoredSession = clearSession;

export const updateLastActive = async (): Promise<void> => {
  try {
    await retry(async () => {
      localStorage.setItem('lastActive', Date.now().toString())
    })
  } catch (error) {
    console.error('Error updating last active:', error)
    throw handleAuthError(error)
  }
}

export const isValidSession = (session: Session): boolean => {
  try {
    console.log('🔍 Validating session...');
    
    if (!session?.access_token) {
      console.log('❌ No valid session or access token');
      return false;
    }

    // Check cookie exists and matches
    const cookieToken = getCookie(AUTH_COOKIE_NAME);
    if (!cookieToken || cookieToken !== session.access_token) {
      console.log('❌ Cookie validation failed');
      return false;
    }

    // Check expiration
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      if (timeUntilExpiry <= SESSION_EXPIRY_BUFFER) {
        console.log('❌ Session expired or about to expire');
        return false;
      }
    }

    // Check inactivity
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
    if (lastActive) {
      const inactiveTime = Date.now() - parseInt(lastActive);
      if (inactiveTime > INACTIVITY_TIMEOUT) {
        console.log('❌ Session inactive for too long');
        return false;
      }
    }

    console.log('✅ Session is valid');
    return true;
  } catch (error) {
    console.error('❌ Error checking session validity:', error);
    return false;
  }
}

export const shouldRefreshSession = (session: Session): boolean => {
  try {
    if (!session.expires_at) return true

    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()

    // Refresh if less than 5 minutes until expiry
    return timeUntilExpiry < 5 * 60 * 1000
  } catch (error) {
    console.error('Error checking session refresh:', error)
    return true
  }
}

export const isSessionInactive = async (): Promise<boolean> => {
  try {
    return await retry(async () => {
      const lastActive = localStorage.getItem('lastActive')
      if (!lastActive) return true

      const inactiveTime = Date.now() - parseInt(lastActive)
      return inactiveTime > SESSION_EXPIRY
    })
  } catch (error) {
    console.error('Error checking session activity:', error)
    return true
  }
}

export const validateDeviceId = async (): Promise<string> => {
  try {
    return await retry(async () => {
      let deviceId = localStorage.getItem('deviceId')
      
      if (!deviceId) {
        deviceId = crypto.randomUUID()
        localStorage.setItem('deviceId', deviceId)
      }
      
      return deviceId
    })
  } catch (error) {
    console.error('Error validating device ID:', error)
    return crypto.randomUUID()
  }
}

type SessionChangeEvent = {
  type: 'session_updated'
  data: StoredSession
} | {
  type: 'session_cleared'
}

export function broadcastSessionChange(
  type: SessionChangeEvent['type'],
  data?: StoredSession
): void {
  const channel = new BroadcastChannel('auth_channel')
  channel.postMessage({ type, data })
  channel.close()
}

export function subscribeToSessionChanges(
  onSessionUpdate: (session: StoredSession) => void,
  onSessionClear: () => void
): () => void {
  const channel = new BroadcastChannel('auth_channel')

  const handleMessage = (event: MessageEvent<SessionChangeEvent>) => {
    switch (event.data.type) {
      case 'session_updated':
        onSessionUpdate(event.data.data)
        break
      case 'session_cleared':
        onSessionClear()
        break
    }
  }

  channel.addEventListener('message', handleMessage)
  return () => {
    channel.removeEventListener('message', handleMessage)
    channel.close()
  }
} 