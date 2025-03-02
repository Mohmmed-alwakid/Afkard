import { Session } from '@supabase/supabase-js'
import { ConcurrentSessionError, SessionExpiredError } from './errors'
import { AUTH_COOKIE_NAME, SESSION_EXPIRY } from '@/config/auth.config'
import { SessionSchema } from '@/config/auth.config'
import { handleAuthError } from '@/lib/auth-errors'

const SESSION_KEY = 'afkar_auth_token'
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

// Cookie utility functions
function setCookie(name: string, value: string, expiresInMs: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + expiresInMs);
  
  // For localhost development
  if (window.location.hostname === 'localhost') {
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    
    // Set additional cookie for cross-port access
    if (window.location.port === '3000' || window.location.port === '3001') {
      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; domain=localhost; SameSite=Lax`;
    }
  } else {
    // Production settings
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; secure`;
  }
  
  console.log('🍪 Setting cookie:', {
    name,
    value: value.substring(0, 10) + '...',
    expires: expires.toUTCString(),
    domain: window.location.hostname,
    port: window.location.port
  });
}

function getCookie(name: string): string | null {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const cookie = cookies.find(c => c.startsWith(`${name}=`));
    const value = cookie ? cookie.split('=')[1] : null;
    
    console.log('🔍 Getting cookie:', {
      name,
      found: !!value,
      value: value ? value.substring(0, 10) + '...' : null
    });
    
    return value;
  } catch (error) {
    console.error('❌ Error getting cookie:', error);
    return null;
  }
}

function deleteCookie(name: string) {
  try {
    if (window.location.hostname === 'localhost') {
      // Clear cookie without domain
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      
      // Clear cookie with localhost domain
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; SameSite=Lax`;
    } else {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; secure`;
    }
    
    console.log('🗑️ Deleted cookie:', name);
  } catch (error) {
    console.error('❌ Error deleting cookie:', error);
  }
}

export const storeSession = async (session: Session, rememberMe: boolean = false): Promise<void> => {
  try {
    // Validate session data
    const result = SessionSchema.safeParse(session);
    if (!result.success) {
      console.error('❌ Session validation failed:', result.error.errors);
      throw new Error('Invalid session data: ' + result.error.errors.map(e => e.message).join(', '));
    }

    await retry(async () => {
      console.log('🔍 Storing session...');
      
      // Store session in localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());

      // Set the auth cookie with proper domain for cross-port access
      setCookie(AUTH_COOKIE_NAME, session.access_token, SESSION_EXPIRY);
      console.log('✅ Auth cookie set:', {
        name: AUTH_COOKIE_NAME,
        value: session.access_token.substring(0, 10) + '...',
        expires: new Date(Date.now() + SESSION_EXPIRY).toISOString()
      });

      // Generate and store device ID if not exists
      if (!localStorage.getItem(DEVICE_ID_KEY)) {
        localStorage.setItem(DEVICE_ID_KEY, crypto.randomUUID());
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Update last active timestamp
      await updateLastActive();

      // Broadcast session change
      broadcastSessionChange('session_updated', {
        session,
        metadata: {
          deviceId: localStorage.getItem(DEVICE_ID_KEY) || '',
          lastActive: Date.now(),
          rememberMe
        }
      });
      
      console.log('✅ Session stored successfully');
    });
  } catch (error) {
    console.error('❌ Error storing session:', error);
    const authError = handleAuthError(error);
    await clearStoredSession();
    throw authError;
  }
}

export const getStoredSession = async (): Promise<Session | null> => {
  try {
    return await retry(async () => {
      console.log('🔍 Checking session storage...');
      
      // Check cookie first
      const cookieToken = getCookie(AUTH_COOKIE_NAME);
      if (!cookieToken) {
        console.log('❌ No auth cookie found');
        await clearStoredSession();
        return null;
      }
      console.log('✅ Found auth cookie');

      // Check localStorage
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) {
        console.log('❌ No session found in localStorage');
        await clearStoredSession();
        return null;
      }
      console.log('✅ Found session in localStorage');

      let session: Session;
      try {
        session = JSON.parse(sessionStr);
      } catch (e) {
        console.error('❌ Failed to parse stored session:', e);
        await clearStoredSession();
        return null;
      }

      // Validate session data
      const result = SessionSchema.safeParse(session);
      if (!result.success) {
        console.error('❌ Session validation failed:', result.error.errors);
        await clearStoredSession();
        return null;
      }

      // Verify cookie matches session
      if (cookieToken !== session.access_token) {
        console.error('❌ Cookie token mismatch');
        await clearStoredSession();
        return null;
      }

      // Check session validity
      if (!isValidSession(session)) {
        console.log('❌ Session invalid, clearing stored session');
        await clearStoredSession();
        return null;
      }

      return session;
    });
  } catch (error) {
    console.error('❌ Error getting stored session:', error);
    const authError = handleAuthError(error);
    await clearStoredSession();
    throw authError;
  }
}

export const clearStoredSession = async (): Promise<void> => {
  try {
    await retry(async () => {
      console.log('🔍 Clearing session...');
      
      // Clear localStorage items
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LAST_ACTIVE_KEY);
      localStorage.removeItem('rememberMe');
      
      // Clear the cookie with proper domain
      deleteCookie(AUTH_COOKIE_NAME);
      
      console.log('✅ Session cleared successfully');
      
      // Broadcast session cleared
      broadcastSessionChange('session_cleared');
    });
  } catch (error) {
    console.error('❌ Error clearing session:', error);
    throw handleAuthError(error);
  }
}

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