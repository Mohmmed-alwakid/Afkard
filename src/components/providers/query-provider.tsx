'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { toast } from '@/store/toast-store';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // 5 minutes for general queries
          staleTime: 5 * 60 * 1000,
          // 10 minutes cache time
          gcTime: 10 * 60 * 1000,
          // Retry failed queries 3 times
          retry: 3,
          // Exponential backoff for retries
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          // Show toast on errors
          onError: (error) => {
            if (error instanceof Error) {
              toast.error(
                'Data Fetch Error',
                error.message === 'Failed to fetch' ? 
                  'Network error. Please check your connection and try again.' : 
                  error.message
              );
            }
          },
        },
        mutations: {
          // Show toast on errors
          onError: (error) => {
            if (error instanceof Error) {
              toast.error('Operation Failed', error.message);
            }
          },
          // Show toast on success
          onSuccess: () => {
            toast.success('Success', 'Operation completed successfully');
          },
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 