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
import { siteConfig } from "@/config/site";
import AfkarLogo from "@/components/common/afkar-logo";
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
        // Redirect to dashboard
        console.log("🚀 Redirecting to dashboard");
        router.push("/dashboard");
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
      
      // CRITICAL FIX: Always redirect to the unified dashboard
      console.log("🚀 Login successful, redirecting to dashboard");
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Login error:", error);
      // Error handling is done in the signin-form component
    } finally {
      setLoginInProgress(false);
    }
  };

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Image section */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-white">
              "Afkar has completely transformed how we conduct research studies. The platform's intuitive interface and powerful analytics have significantly improved our efficiency and participant engagement."
            </p>
            <footer className="text-sm">Dr. Ibrahim Al-Mansour</footer>
          </blockquote>
        </div>
      </div>
      
      {/* Login form section */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in to your account
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
              
              <div className="relative">
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
              
              <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </a>
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
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
        <LoginContent />
      </Suspense>
    </div>
  );
} 