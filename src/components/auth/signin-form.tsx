'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { useAuthStore } from '@/store/auth-store';
import { getStoredSession } from '@/lib/session';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, Suspense, useCallback, useState } from 'react';
import Link from 'next/link';

// Improved form validation schema
const signInSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' })
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(1, { message: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters.' }),
  rememberMe: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

export interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
  error?: string | null;
}

interface SignInFormProps {
  onSubmit?: (values: SignInValues) => Promise<void>;
  returnUrl?: string;
}

// Create a component that safely uses useSearchParams
function SignInFormContent({ onSubmit: customOnSubmit, returnUrl = '/dashboard' }: SignInFormProps) {
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const handleLoginError = (err: any) => {
    console.error('Login error:', err);
    if (err instanceof Error) {
      if (err.message.toLowerCase().includes('credentials') || 
          err.message.toLowerCase().includes('password') || 
          err.message.toLowerCase().includes('invalid')) {
        toast({
          title: 'Authentication Failed',
          description: 'The email or password you entered is incorrect.',
          variant: 'destructive',
        });
        form.setFocus('password');
      } else if (err.message.toLowerCase().includes('verified')) {
        toast({
          title: 'Email Not Verified',
          description: 'Please check your email to verify your account before signing in.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Error',
          description: err.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const defaultOnSubmit = useCallback(
    async (data: SignInValues) => {
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      setError(null);
      
      try {
        console.log(`Attempting login for ${data.email}...`);
        
        const response = await login(data.email, data.password);
        
        if (!response.success) {
          console.error('Login failed:', response.error);
          throw new Error(response.error || 'Login failed');
        }
        
        console.log('Login successful', { 
          user: response.data?.user?.email,
          role: response.data?.user?.role
        });
        
        // CRITICAL FIX: Handle return URL properly
        if (returnUrl && returnUrl.startsWith('/')) {
          console.log('Redirecting to return URL:', returnUrl);
          router.push(returnUrl);
          return;
        }
        
        // Always redirect to the unified dashboard
        const dashboardPath = "/dashboard";
        console.log("Redirecting user to dashboard:", dashboardPath);
        router.push(dashboardPath); // Use Next.js router for better navigation
      } catch (err) {
        console.error("Login error:", err);
        handleLoginError(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, returnUrl, handleLoginError, router]
  );

  const handleSubmit = async (data: SignInValues) => {
    // Use custom handler if provided, otherwise use default
    if (customOnSubmit) {
      await customOnSubmit(data);
    } else {
      await defaultOnSubmit(data);
    }
  };

  // Move debug session check to useEffect to prevent render-time errors
  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      try {
        // Debug your session management
        const storedSession = getStoredSession();
        console.log('Stored session:', storedSession);
      } catch (e) {
        console.error('Storage access error:', e);
      }
    }
  }, []);

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  Remember me
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Don't have an account?{' '}
          </span>
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}

// Wrapper component with Suspense
export function SignInForm(props: SignInFormProps) {
  return (
    <Suspense fallback={<div className="py-8 text-center">
      <Icons.spinner className="mx-auto h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">Loading sign-in form...</p>
    </div>}>
      <SignInFormContent {...props} />
    </Suspense>
  );
} 