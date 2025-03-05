'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Header } from '@/components/layout/header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@/components/ui/user-button';
import { cn } from '@/lib/utils';
import { NavigationMenu } from '@/components/ui/navigation-menu';
import { 
  LayoutGrid, 
  FileText, 
  Users, 
  Settings, 
  BellRing,
  HelpCircle
} from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import { redirect, headers } from 'next/navigation';
import { UserPreferencesMenu } from "@/components/user-preferences-menu";
import { supabase } from '@/lib/supabase';

// Mark this component as dynamically rendered to avoid static build issues
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Skip auth check during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Skip if still loading auth state
    if (isLoading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LoadingSpinner size="xl" className="text-primary" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  // If not authenticated, don't render anything (prevent flash of content)
  if (!isAuthenticated && !isLoading) {
    return <div className="min-h-screen"></div>;
  }

  try {
    // Check for potential redirect loops - don't redirect if we just came from login
    const referer = headers().get('referer') || '';
    const isFromLogin = referer.includes('/login');
    
    // Get user session with error handling
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // If error or no session, handle based on referer
    if (error || !session) {
      console.log("No valid session for dashboard, handling auth");
      
      // If coming from login, show a message instead of redirecting to prevent loops
      if (isFromLogin) {
        // Return the layout with a basic authentication message
        return (
          <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="flex items-center justify-center flex-1">
              <div className="p-8 text-center">
                <h1 className="text-2xl font-semibold mb-4">Authentication Required</h1>
                <p>Please log in with valid credentials to access this area.</p>
              </div>
            </div>
          </div>
        );
      }
      
      // Not from login, safe to redirect
      redirect('/login?returnUrl=/dashboard');
    }

    // Create a Supabase client for server component
    const supabaseServer = createServerClient();
  
    // Get user profile with role information
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
  
    // Handle user data error
    if (userError) {
      console.error('Error fetching user data:', userError);
      // We have a session but no user data, still allow access with default role
    }

    const userRole = user?.role || 'participant';
  
    // Define navigation links based on user role
    const navLinks = [
      {
        href: '/home',
        label: 'Home',
        icon: <LayoutGrid className="h-4 w-4" />,
        roles: ['researcher', 'participant'],
      },
      {
        href: '/projects',
        label: 'Projects',
        icon: <FileText className="h-4 w-4" />,
        roles: ['researcher'],
      },
      {
        href: '/studies',
        label: 'Studies',
        icon: <Users className="h-4 w-4" />,
        roles: ['researcher', 'participant'],
      },
      {
        href: '/settings',
        label: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        roles: ['researcher', 'participant'],
      },
    ];

    // Filter links based on user role
    const filteredNavLinks = navLinks.filter(link => 
      link.roles.includes(userRole)
    );

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {/* Sidebar */}
          <aside className="w-64 border-r border-[#E4E4E9] bg-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-[#E4E4E9]">
              <Link href="/home">
                <Image 
                  src="/logo.svg" 
                  alt="Afkar Logo" 
                  width={100} 
                  height={40} 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all group hover:bg-[#F7F7FC]",
                    "text-[#73738C]"
                  )}
                >
                  <span className="group-hover:text-[#212280]">{link.icon}</span>
                  <span className="group-hover:text-[#212280]">{link.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Help Center */}
            <div className="p-4 m-4 rounded-lg bg-[#F0F0F7]">
              <div className="flex items-center gap-3 text-[#27273C]">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Help Center</span>
              </div>
              <p className="mt-2 text-xs text-[#73738C]">
                Need help or have questions? Visit our help center.
              </p>
              <Link 
                href="/help"
                className="mt-3 text-xs font-semibold text-[#212280] block"
              >
                Go to Help Center
              </Link>
            </div>
          </aside>
          
          {/* Page Content */}
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    // If we encounter an error during build or rendering,
    // redirect to login or show an error
    console.error("Error in dashboard layout:", error);
    redirect('/login?returnUrl=/dashboard');
  }
} 