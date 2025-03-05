'use client';

import { Suspense, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Separator } from "@/components/ui/separator";
import { SignInForm } from "@/components/auth/signin-form";
import { Social } from "@/components/auth/social";
import { Logo } from "@/components/logo";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

// Create a wrapper component that uses useSearchParams
function LoginContent() {
  const { isAuthenticated, user, isLoading, login } = useAuthStore();
  const router = useRouter();
  const [loginInProgress, setLoginInProgress] = useState(false);
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "";
  // Ref to track if a redirect has been initiated to prevent multiple redirects
  const redirectInitiated = useRef(false);

  // Development mock login function
  const handleDevLogin = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('Using dev login...');
    setLoginInProgress(true);
    
    try {
      // Access the setMockUser function from the store
      const mockUser = {
        id: 'mock-user-id',
        email: 'demo@afkar.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'user',
        organization: 'Afkar',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // @ts-ignore - We're directly manipulating the store for dev purposes only
      useAuthStore.setState({ 
        user: mockUser,
        isAuthenticated: true, 
        isLoading: false,
        isInitialized: true,
        lastActive: Date.now()
      });
      
      // Redirect after mock login
      if (returnUrl && returnUrl.startsWith('/')) {
        router.push(returnUrl);
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.error("Dev login error:", error);
    } finally {
      setLoginInProgress(false);
    }
  };

  // Check if already authenticated and redirect
  useEffect(() => {
    // Prevent executing this effect during SSR
    if (typeof window === 'undefined') return;

    // Skip if we're still loading or a redirect is already in progress
    if (isLoading || redirectInitiated.current) return;
    
    // Debug logging
    console.log("Auth state check:", { 
      isAuthenticated, 
      hasUser: !!user, 
      email: user?.email,
      isLoading
    });

    // Only redirect if authenticated with a user
    if (isAuthenticated && user) {
      console.log("🔄 Login page: User authenticated, preparing redirect");
      
      // Prevent multiple redirects
      redirectInitiated.current = true;
      
      // If there's a return URL, validate and redirect
      if (returnUrl && returnUrl.startsWith('/')) {
        console.log("🚀 Redirecting to return URL:", returnUrl);
        
        // Use Next.js router for client navigation
        router.push(returnUrl);
      } else {
        // Redirect to home instead of dashboard
        console.log("🚀 Redirecting to home page");
        router.push("/home");
      }
    }
  }, [isAuthenticated, user, isLoading, returnUrl, router]);

  const onSubmit = async (data: { email: string; password: string }) => {
    console.log(`Attempting login for ${data.email}...`);
    try {
      setLoginInProgress(true);
      
      // Log the result for debugging
      const result = await login(data.email, data.password);
      console.log("Login result:", { 
        success: result.success, 
        user: result.user?.email,
        role: result.user?.role,
        error: result.error
      });
      
      if (!result.success || !result.user) {
        throw new Error(result.error || "Login failed");
      }
      
      // If there's a return URL and it's valid, redirect there
      if (returnUrl && returnUrl.startsWith('/')) {
        console.log("🚀 Login successful, redirecting to return URL:", returnUrl);
        router.push(returnUrl);
        return;
      }
      
      // CRITICAL FIX: Always redirect to home page after login
      console.log("🚀 Login successful, redirecting to home page");
      router.push("/home");
      
    } catch (error) {
      console.error("Login error:", error);
      // Error handling is done in the signin-form component
    } finally {
      setLoginInProgress(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section - Brand & Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-foreground">
        <div className="flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-8">
            <Image 
              src="/logos/afkar-logo-white.svg" 
              alt="Afkar" 
              width={180} 
              height={60}
              className="w-auto h-12"
            />
          </div>
          
          <div className="max-w-md text-center">
            <h2 className="text-4xl font-bold mb-6">Welcome to Afkar</h2>
            <p className="text-lg mb-12">
              The platform connecting researchers and participants for meaningful studies and valuable insights.
            </p>
            
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg">
              <blockquote className="italic text-white/90">
                "Afkar has transformed our research process, making participant recruitment and data collection seamless and efficient."
              </blockquote>
              <div className="mt-4 font-medium">Dr. Ahmed Al-Farsi</div>
              <div className="text-sm text-white/70">Lead Researcher, Innovation Institute</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section - Login Form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="block lg:hidden mb-8">
              <Image 
                src="/logos/afkar-logo.svg" 
                alt="Afkar" 
                width={150} 
                height={40}
                className="w-auto h-10"
              />
            </Link>
            
            <h1 className="text-2xl font-bold tracking-tight">
              Sign in to your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          
          {loginInProgress ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Signing you in...
              </p>
            </div>
          ) : (
            <>
              <SignInForm onSubmit={onSubmit} returnUrl={returnUrl} />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Social returnUrl={returnUrl} />
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDevLogin}
                    className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold py-1 px-2 rounded-sm mr-2">DEV</span>
                    Quick Login (Development Only)
                  </button>
                </div>
              )}
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
              
              <p className="mt-6 px-8 text-center text-xs text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense in the main export component
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 