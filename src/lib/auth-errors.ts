export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  RATE_LIMITED: 'rate_limited',
  SESSION_EXPIRED: 'session_expired',
  NETWORK_ERROR: 'network_error',
  USER_NOT_FOUND: 'user_not_found',
  INVALID_TOKEN: 'invalid_token',
  WEAK_PASSWORD: 'weak_password',
  EMAIL_IN_USE: 'email_in_use',
  INVALID_RESET_TOKEN: 'invalid_reset_token',
  EXPIRED_RESET_TOKEN: 'expired_reset_token',
  INVALID_2FA_CODE: 'invalid_2fa_code',
  MISSING_2FA_CODE: 'missing_2fa_code',
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_CODES;

export const getAuthErrorMessage = (code: AuthErrorCode): string => {
  const messages: Record<AuthErrorCode, string> = {
    INVALID_CREDENTIALS: 'Incorrect email or password. Please try again.',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
    RATE_LIMITED: 'Too many login attempts. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    USER_NOT_FOUND: 'User not found. Please check your credentials.',
    INVALID_TOKEN: 'Invalid authentication token. Please log in again.',
    WEAK_PASSWORD: 'Password is too weak. Please use a stronger password.',
    EMAIL_IN_USE: 'This email is already registered.',
    INVALID_RESET_TOKEN: 'Invalid password reset token.',
    EXPIRED_RESET_TOKEN: 'Password reset token has expired.',
    INVALID_2FA_CODE: 'Invalid two-factor authentication code.',
    MISSING_2FA_CODE: 'Two-factor authentication code is required.',
  };

  return messages[code];
};

export const handleAuthError = (error: unknown): AuthError => {
  if (error instanceof AuthError) {
    return error;
  }

  const err = error as any;
  
  // Handle Supabase errors
  if (err?.message?.includes('Invalid login credentials')) {
    return new AuthError(
      getAuthErrorMessage('INVALID_CREDENTIALS'),
      AUTH_ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  if (err?.message?.includes('Email not confirmed')) {
    return new AuthError(
      getAuthErrorMessage('EMAIL_NOT_VERIFIED'),
      AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
    );
  }

  if (err?.message?.includes('Rate limit')) {
    return new AuthError(
      getAuthErrorMessage('RATE_LIMITED'),
      AUTH_ERROR_CODES.RATE_LIMITED,
      429
    );
  }

  // Handle network errors
  if (err?.message?.includes('network') || err?.name === 'NetworkError') {
    return new AuthError(
      getAuthErrorMessage('NETWORK_ERROR'),
      AUTH_ERROR_CODES.NETWORK_ERROR,
      503
    );
  }

  // Handle session errors
  if (err?.message?.includes('session')) {
    return new AuthError(
      getAuthErrorMessage('SESSION_EXPIRED'),
      AUTH_ERROR_CODES.SESSION_EXPIRED,
      401
    );
  }

  // Default error
  return new AuthError(
    'An unexpected authentication error occurred',
    'unknown_error',
    500
  );
}; 