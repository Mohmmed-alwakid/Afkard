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
import { redirect } from 'next/navigation';
import { UserPreferencesMenu } from "@/components/user-preferences-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create a Supabase client for server component
  const supabase = createServerClient();
  
  // Get the current user session
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  // Handle session error or no session
  if (sessionError) {
    console.error('Error fetching session:', sessionError);
    redirect('/login');
  }

  // If no session, redirect to login
  if (!session) {
    console.log('No active session found in dashboard layout, redirecting to login');
    redirect('/login');
  }

  // Get user profile with role information
  const { data: user, error: userError } = await supabase
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
    <div className="flex h-screen bg-[#F7F7FC]">
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
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-[#E4E4E9] bg-white px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="text-lg font-semibold text-[#14142B]">
            {/* Page title would go here, but leaving it empty for flexibility */}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button 
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-[#F7F7FC] text-[#73738C]"
              aria-label="Notifications"
            >
              <BellRing className="h-5 w-5" />
            </button>
            
            {/* User button */}
            <UserButton 
              user={{
                name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'User',
                email: session.user.email || '',
                image: user?.avatar_url || '',
              }}
            />
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 