import { Session } from '@supabase/supabase-js';
import { logger } from './logger';

export interface TestSession {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    role: 'participant' | 'researcher' | 'admin';
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
    user_metadata: Record<string, unknown>;
  };
}

export class AuthTestHelper {
  private static instance: AuthTestHelper;
  private currentTest: string = '';
  private testResults: Map<string, boolean> = new Map();
  private testLogs: Map<string, string[]> = new Map();

  private constructor() {}

  static getInstance(): AuthTestHelper {
    if (!AuthTestHelper.instance) {
      AuthTestHelper.instance = new AuthTestHelper();
    }
    return AuthTestHelper.instance;
  }

  startTest(testName: string) {
    this.currentTest = testName;
    this.testLogs.set(testName, []);
    logger.info('Test', `Starting test: ${testName}`);
  }

  log(message: string) {
    const logs = this.testLogs.get(this.currentTest) || [];
    logs.push(message);
    this.testLogs.set(this.currentTest, logs);
    logger.debug('Test', message);
  }

  endTest(success: boolean) {
    this.testResults.set(this.currentTest, success);
    logger.info('Test', `Test completed: ${this.currentTest}`, { success });
  }

  // Test session creation
  createTestSession(role: 'participant' | 'researcher' | 'admin'): TestSession {
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      access_token: `test_token_${role}_${now.getTime()}`,
      refresh_token: `test_refresh_${role}_${now.getTime()}`,
      expires_at: Math.floor(expires.getTime() / 1000),
      user: {
        id: `test_user_${now.getTime()}`,
        email: `test_${role}@example.com`,
        role: role,
        email_confirmed_at: now.toISOString(),
        last_sign_in_at: now.toISOString(),
        user_metadata: {
          role: role,
          first_name: 'Test',
          last_name: 'User'
        }
      }
    };
  }

  // Cookie testing
  async testCookiePersistence(session: TestSession): Promise<boolean> {
    try {
      // Store session
      await window.localStorage.setItem('test_session', JSON.stringify(session));
      document.cookie = `test_cookie=${session.access_token}; path=/`;

      // Verify localStorage
      const storedSession = window.localStorage.getItem('test_session');
      if (!storedSession) {
        this.log('❌ Session not stored in localStorage');
        return false;
      }

      // Verify cookie
      const cookies = document.cookie.split(';').map(c => c.trim());
      const testCookie = cookies.find(c => c.startsWith('test_cookie='));
      if (!testCookie || testCookie.split('=')[1] !== session.access_token) {
        this.log('❌ Cookie not set correctly');
        return false;
      }

      this.log('✅ Cookie persistence test passed');
      return true;
    } catch (error) {
      this.log(`❌ Cookie persistence test failed: ${error}`);
      return false;
    } finally {
      // Cleanup
      window.localStorage.removeItem('test_session');
      document.cookie = 'test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    }
  }

  // Route testing
  async testRouteAccess(routes: string[]): Promise<boolean> {
    const results = await Promise.all(routes.map(async route => {
      try {
        const response = await fetch(route);
        this.log(`Route ${route}: ${response.status}`);
        return response.ok;
      } catch (error) {
        this.log(`❌ Route ${route} test failed: ${error}`);
        return false;
      }
    }));

    return results.every(result => result);
  }

  // Session expiry testing
  async testSessionExpiry(session: TestSession): Promise<boolean> {
    try {
      // Create expired session
      const expiredSession = {
        ...session,
        expires_at: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      };

      // Store expired session
      await window.localStorage.setItem('expired_test_session', JSON.stringify(expiredSession));

      // Verify expiry detection
      const storedSession = window.localStorage.getItem('expired_test_session');
      if (!storedSession) return false;

      const parsed = JSON.parse(storedSession);
      const isExpired = parsed.expires_at < Math.floor(Date.now() / 1000);

      this.log(`Session expiry test: ${isExpired ? 'passed' : 'failed'}`);
      return isExpired;
    } catch (error) {
      this.log(`❌ Session expiry test failed: ${error}`);
      return false;
    } finally {
      // Cleanup
      window.localStorage.removeItem('expired_test_session');
    }
  }

  // Get test results
  getTestResults(): { name: string; success: boolean; logs: string[] }[] {
    return Array.from(this.testResults.entries()).map(([name, success]) => ({
      name,
      success,
      logs: this.testLogs.get(name) || []
    }));
  }

  // Clear test data
  clearTestData() {
    this.testResults.clear();
    this.testLogs.clear();
    this.currentTest = '';
  }
}

export const authTestHelper = AuthTestHelper.getInstance(); 