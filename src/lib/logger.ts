import { Session } from '@supabase/supabase-js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  error?: Error;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL as LogLevel];
  }

  private addEntry(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[entry.level];

      console.log(
        `${emoji} [${entry.category}] ${entry.message}`,
        entry.data || '',
        entry.error || ''
      );
    }
  }

  debug(category: string, message: string, data?: unknown) {
    if (!this.shouldLog('debug')) return;
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'debug',
      category,
      message,
      data
    });
  }

  info(category: string, message: string, data?: unknown) {
    if (!this.shouldLog('info')) return;
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'info',
      category,
      message,
      data
    });
  }

  warn(category: string, message: string, data?: unknown) {
    if (!this.shouldLog('warn')) return;
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'warn',
      category,
      message,
      data
    });
  }

  error(category: string, message: string, error?: Error, data?: unknown) {
    if (!this.shouldLog('error')) return;
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      message,
      data,
      error
    });
  }

  // Session-specific logging
  logSessionEvent(event: string, session: Session | null, metadata?: Record<string, unknown>) {
    this.info('Session', event, {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.user_metadata?.role,
      ...metadata
    });
  }

  // Auth-specific logging
  logAuthEvent(event: string, metadata?: Record<string, unknown>) {
    this.info('Auth', event, metadata);
  }

  // Route-specific logging
  logRouteEvent(event: string, pathname: string, metadata?: Record<string, unknown>) {
    this.info('Route', event, {
      pathname,
      ...metadata
    });
  }

  // Get logs for analysis
  getLogs(
    filter?: {
      level?: LogLevel;
      category?: string;
      since?: Date;
    }
  ): LogEntry[] {
    return this.logs.filter(log => {
      if (filter?.level && log.level !== filter.level) return false;
      if (filter?.category && log.category !== filter.category) return false;
      if (filter?.since && new Date(log.timestamp) < filter.since) return false;
      return true;
    });
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance(); 