"use client"

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { 
  TypographyH2, 
  TypographyP 
} from '@/components/ui/typography';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackRender?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
}

function DefaultFallbackComponent({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  // Report the error to an error reporting service
  React.useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
    }
    
    // In production, you would send this to your error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 rounded-lg bg-background border border-muted">
      <div className="bg-amber-100 text-amber-800 p-3 rounded-full mb-4">
        <AlertTriangle size={24} />
      </div>
      <TypographyH2 className="text-lg font-semibold mb-2">Something went wrong</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-md">
        We're sorry, but there was an error loading this section. You can try refreshing the page or contact support if the problem persists.
      </TypographyP>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 p-4 rounded mb-6 w-full max-w-xl overflow-auto">
          <TypographyP className="font-mono text-sm text-red-600 whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </TypographyP>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
        <Button 
          onClick={resetErrorBoundary}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ 
  children, 
  fallbackRender 
}: ErrorBoundaryProps) {
  const FallbackComponent = fallbackRender || DefaultFallbackComponent;
  
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <FallbackComponent error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={(details) => {
        // Optional: log when the error boundary is reset
        if (process.env.NODE_ENV === 'development') {
          console.log('Error boundary reset', details);
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackRender?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
} 