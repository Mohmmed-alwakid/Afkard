import { MAX_LOGIN_ATTEMPTS, LOGIN_ATTEMPT_WINDOW } from '@/config/auth.config';

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blocked: boolean;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry>;

  constructor() {
    this.attempts = new Map();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now - entry.firstAttempt >= LOGIN_ATTEMPT_WINDOW) {
        this.attempts.delete(key);
      }
    }
  }

  check(key: string): { allowed: boolean; remainingAttempts: number; blockedUntil?: Date } {
    this.cleanup();
    
    const entry = this.attempts.get(key);
    if (!entry) {
      this.attempts.set(key, { attempts: 1, firstAttempt: Date.now(), blocked: false });
      return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
    }

    if (entry.blocked) {
      const blockedUntil = new Date(entry.firstAttempt + LOGIN_ATTEMPT_WINDOW);
      if (Date.now() >= entry.firstAttempt + LOGIN_ATTEMPT_WINDOW) {
        this.attempts.delete(key);
        return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
      }
      return { allowed: false, remainingAttempts: 0, blockedUntil };
    }

    entry.attempts++;
    if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
      entry.blocked = true;
      const blockedUntil = new Date(entry.firstAttempt + LOGIN_ATTEMPT_WINDOW);
      return { allowed: false, remainingAttempts: 0, blockedUntil };
    }

    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - entry.attempts };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter(); 