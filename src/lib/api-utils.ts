import { toast } from '@/store/toast-store';
import { createBrowserClient } from '@/lib/supabase/client';

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions<TBody = unknown> {
  method?: FetchMethod;
  body?: TBody;
  headers?: Record<string, string>;
  suppressErrors?: boolean;
  suppressToasts?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public status: number = 0,
    public data?: unknown
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export const supabase = createBrowserClient();

/**
 * Creates a type-safe API client for the specified endpoint
 * @param baseUrl - The base URL for the API endpoint
 */
export function createApiClient(baseUrl: string = '/api') {
  async function fetchApi<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    options: FetchOptions<TBody> = {}
  ): Promise<ApiResponse<TResponse>> {
    const {
      method = 'GET',
      body,
      headers = {},
      suppressErrors = false,
      suppressToasts = false,
    } = options;

    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        // Ignore, not all responses have JSON body
      }

      if (!response.ok) {
        const error = data?.error || data?.message || response.statusText || 'Unknown error';
        
        if (!suppressToasts) {
          toast.error(
            'Error',
            typeof error === 'string' ? error : 'An unexpected error occurred'
          );
        }
        
        if (!suppressErrors) {
          throw new NetworkError(
            typeof error === 'string' ? error : 'An unexpected error occurred',
            response.status,
            data
          );
        }
        
        return {
          data: null,
          error: typeof error === 'string' ? error : 'An unexpected error occurred',
          status: response.status,
        };
      }

      return {
        data: data as TResponse,
        error: null,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (!suppressToasts) {
        toast.error('Error', message);
      }
      
      if (!suppressErrors) {
        throw new NetworkError(message);
      }
      
      return {
        data: null,
        error: message,
        status: 0,
      };
    }
  }

  return {
    get: <TResponse = unknown>(
      endpoint: string,
      options: Omit<FetchOptions, 'method' | 'body'> = {}
    ) => fetchApi<TResponse>(endpoint, { ...options, method: 'GET' }),
    
    post: <TResponse = unknown, TBody = unknown>(
      endpoint: string,
      body: TBody,
      options: Omit<FetchOptions<TBody>, 'method' | 'body'> = {}
    ) => fetchApi<TResponse, TBody>(endpoint, { ...options, method: 'POST', body }),
    
    put: <TResponse = unknown, TBody = unknown>(
      endpoint: string,
      body: TBody,
      options: Omit<FetchOptions<TBody>, 'method' | 'body'> = {}
    ) => fetchApi<TResponse, TBody>(endpoint, { ...options, method: 'PUT', body }),
    
    patch: <TResponse = unknown, TBody = unknown>(
      endpoint: string,
      body: TBody,
      options: Omit<FetchOptions<TBody>, 'method' | 'body'> = {}
    ) => fetchApi<TResponse, TBody>(endpoint, { ...options, method: 'PATCH', body }),
    
    delete: <TResponse = unknown>(
      endpoint: string,
      options: Omit<FetchOptions, 'method' | 'body'> = {}
    ) => fetchApi<TResponse>(endpoint, { ...options, method: 'DELETE' }),
  };
}

// Create default API client for app-wide use
export const api = createApiClient(); 