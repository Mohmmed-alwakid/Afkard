'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TypographyH1, TypographyP } from '@/components/ui/typography';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
    
    // In production, you would want to send this to your error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-3 bg-red-100 text-red-800 rounded-full">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              <div className="space-y-3">
                <TypographyH1 className="text-xl font-semibold">Application Error</TypographyH1>
                <TypographyP className="text-gray-600">
                  We're sorry, but something went wrong. Our team has been notified of this issue.
                </TypographyP>
              </div>

              <div className="pt-4">
                <Button
                  onClick={reset}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>

              <TypographyP className="text-xs text-gray-500">
                If this problem persists, please contact support with error reference: {error.digest}
              </TypographyP>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 