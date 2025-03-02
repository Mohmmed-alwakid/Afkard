export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class NetworkError extends AuthError {
  constructor(message: string) {
    super(message, 'network_error', undefined, true)
    this.name = 'NetworkError'
  }
}

export class SessionError extends AuthError {
  constructor(message: string) {
    super(message, 'session_error', 401, false)
    this.name = 'SessionError'
  }
}

export class RateLimitError extends AuthError {
  constructor(message: string) {
    super(message, 'rate_limit', 429, true)
    this.name = 'RateLimitError'
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 'invalid_credentials', 401, false)
    this.name = 'InvalidCredentialsError'
  }
}

export class EmailNotVerifiedError extends AuthError {
  constructor() {
    super('Email not verified', 'email_not_verified', 403, false)
    this.name = 'EmailNotVerifiedError'
  }
}

export class TwoFactorRequiredError extends AuthError {
  constructor() {
    super('Two-factor authentication required', 'two_factor_required', 403, false)
    this.name = 'TwoFactorRequiredError'
  }
}

export class CsrfError extends AuthError {
  constructor() {
    super('Invalid CSRF token', 'invalid_csrf', 403, false)
    this.name = 'CsrfError'
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('Session has expired', 'session_expired', 401, false)
    this.name = 'SessionExpiredError'
  }
}

export class ConcurrentSessionError extends AuthError {
  constructor() {
    super('Session was invalidated by another login', 'concurrent_session', 401, false)
    this.name = 'ConcurrentSessionError'
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

export function isRetryableError(error: unknown): boolean {
  return isAuthError(error) && error.retryable
} 