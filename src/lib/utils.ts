import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function for logging messages with optional error objects
 */
export const log = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`❌ ${message}`, error);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },
  success: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ ${message}`, ...args);
    }
  }
};
