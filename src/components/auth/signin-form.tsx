'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/icons';
import { useAuthStore } from '@/store/auth-store';
import { getStoredSession } from '@/lib/session';
import { Checkbox } from '@/components/ui/checkbox';

const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  rememberMe: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const { login, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(data: SignInValues) {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Call login from auth store
      const result = await login(data.email, data.password, data.rememberMe);
      
      // Success toast
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
        variant: 'default',
      });
      
      // Redirect based on role or return URL
      const userRole = result?.user?.role || 'participant';
      
      if (returnUrl !== '/dashboard') {
        // If there's a specific return URL, use it
        router.push(returnUrl);
      } else {
        // Otherwise redirect based on role
        if (userRole === 'researcher') {
          router.push('/researcher');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          toast({
            title: 'Invalid credentials',
            description: 'The email or password you entered is incorrect.',
            variant: 'destructive',
          });
        } else if (error.message.includes('verified')) {
          toast({
            title: 'Email not verified',
            description: 'Please check your email to verify your account before signing in.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Debug your session management
  const storedSession = getStoredSession();
  console.log('Stored session:', storedSession);

  // Check if localStorage/sessionStorage is working
  try {
    localStorage.setItem('test', 'test');
    console.log('localStorage is working');
  } catch (e) {
    console.error('localStorage error:', e);
  }

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
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
                <FormLabel>
                  Remember me
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isLoading || isSubmitting} 
          className="w-full"
        >
          {(isLoading || isSubmitting) && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign In
        </Button>
      </form>
    </Form>
  );
} 