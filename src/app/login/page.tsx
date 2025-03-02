'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/auth-store";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PostLoginHelp } from "@/components/auth/post-login-help";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    
    try {
      console.log('Starting login process...');
      const result = await login(data.email, data.password, data.rememberMe);
      
      if (result?.user) {
        console.log('Login successful, user details:', {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          isVerified: result.user.email_confirmed_at !== null
        });
        
        // First redirect to test page
        console.log('Redirecting to test success page...');
        router.push("/auth/test-success");
      } else {
        console.error('Login succeeded but no user data returned');
        setErrorMessage('Unable to fetch user data. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show user-friendly error messages
      if (error.message?.includes("Invalid login credentials")) {
        setErrorMessage("Incorrect email or password. Please try again.");
      } else if (error.message?.includes("Email not confirmed")) {
        setErrorMessage("Please verify your email before logging in.");
      } else if (error.message?.includes("Rate limit")) {
        setErrorMessage("Too many login attempts. Please try again later.");
      } else if (error.message?.includes("network")) {
        setErrorMessage("Network error. Please check your connection and try again.");
      } else {
        setErrorMessage(error.message || "An unexpected error occurred during login");
      }
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Show the help component if user is authenticated */}
      {isAuthenticated && <PostLoginHelp />}
      
      {/* Left Section - Login Form */}
      <div className="flex flex-col items-center w-full lg:w-1/2">
        <div className="container flex h-full max-w-screen-xl flex-col">
          <header className="flex items-center justify-between px-6 py-6 lg:px-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logos/afkar-logo.svg"
                alt="Afkar Logo"
                width={168}
                height={35}
                priority
              />
            </Link>
            <LanguageSwitcher />
          </header>

          <main className="flex flex-1 items-center justify-center px-6 pb-10 pt-4">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                  Welcome back
                </h1>
                <p className="text-gray-600">
                  Enter your credentials to access your account
                </p>
              </div>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {errorMessage && (
                  <Alert variant="destructive" className="mb-4 animate-in fade-in duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email*
                    </label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      {...form.register("email")}
                      className="w-full"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password*
                    </label>
                    <Input
                      id="password"
                      placeholder="Create a password"
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...form.register("password")}
                      className="w-full"
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                    )}
                    <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rememberMe" 
                      {...form.register("rememberMe")}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm leading-none text-gray-600"
                    >
                      Remember for 30 days
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-[#6A55FF] hover:underline"
                  >
                    Forgot password
                  </Link>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-[#6A55FF] hover:bg-[#5444cc]"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      or sign in with
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-[#6A55FF] font-semibold hover:underline">
                    Sign up
                  </Link>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Are you a participant?{" "}
                  <Link href="/signup/participant" className="text-[#6A55FF] font-semibold hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </main>

          <footer className="py-8 text-center text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-500"
              >
                <path
                  d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>help@afkar.com</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Right Section - Gradient Background with Content */}
      <div className="hidden bg-gradient-to-br from-[#6A55FF] to-gray-600 lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-24 text-white">
          <div className="mb-8">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-6 h-6 bg-yellow-300 rounded-full"></div>
              <div className="absolute top-4 right-0 w-4 h-4 bg-yellow-300 rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-medium tracking-tight leading-tight">
              Start turning your ideas into reality.
            </h2>
            <p className="text-lg font-medium text-gray-200">
              Create a free account and get full access to all features for 30-days. No credit card needed. Get started in 2 minutes.
            </p>
          </div>

          <div className="mt-8 flex items-center">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                  style={{ zIndex: 6 - i }}
                >
                  <div className={`absolute inset-0 bg-purple-${i}00`}></div>
                </div>
              ))}
            </div>
            <span className="ml-4 text-gray-200 text-md">
              Join 4,000+ Researchers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 