'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;
  
  /**
   * Optional text to display alongside the spinner
   */
  text?: string;
  
  /**
   * Whether to center the spinner and text
   * @default false
   */
  centered?: boolean;
  
  /**
   * Aria label for the spinner for accessibility
   * @default 'Loading'
   */
  ariaLabel?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  text,
  centered = false,
  ariaLabel = 'Loading',
  className,
  ...props
}: LoadingSpinnerProps) {
  const spinnerSize = sizeClasses[size];
  
  const spinner = (
    <Loader2
      className={cn('animate-spin', spinnerSize)}
      aria-label={ariaLabel}
    />
  );
  
  // If there's no text, just return the spinner
  if (!text) {
    return (
      <div
        className={cn(
          centered && 'flex justify-center items-center',
          className
        )}
        {...props}
      >
        {spinner}
      </div>
    );
  }
  
  // If there's text, return a container with spinner and text
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2',
        centered && 'justify-center',
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {spinner}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
} 