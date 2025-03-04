'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BellIcon, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/home' },
  { name: 'Projects', href: '/projects' },
  { name: 'Participant', href: '/participant' },
  { name: 'Help&Support', href: '/help' },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle scroll events to change header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Get user initials for avatar
  const getInitials = (): string => {
    if (!user) return 'U';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };
  
  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200 border-b',
        isScrolled 
          ? 'bg-white border-gray-200 shadow-sm' 
          : 'bg-[#14121F] border-gray-800'
      )}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link href="/home" className="flex items-center gap-2">
            <Image 
              src={isScrolled ? "/logos/afkar-logo.svg" : "/logos/afkar-logo-white.svg"}
              alt="Afkar"
              width={90}
              height={28}
              priority
              className="w-auto h-7"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? isScrolled ? 'text-primary' : 'text-white'
                    : isScrolled ? 'text-gray-600' : 'text-gray-300'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center gap-3">
          {/* Upgrade button */}
          <Button 
            size="sm" 
            variant={isScrolled ? "default" : "secondary"}
            className="hidden sm:flex items-center gap-1 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 3L19 9L13 15"></path>
              <path d="M19 9H5C3.89543 9 3 9.89543 3 11V15C3 17.2091 4.79086 19 7 19H15"></path>
            </svg>
            Upgrade now
          </Button>
          
          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className={isScrolled ? 'text-gray-700' : 'text-gray-300'}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className={isScrolled ? 'text-gray-700' : 'text-gray-300'}
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5" />
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-8 w-8 rounded-full overflow-hidden"
              >
                <div className={cn(
                  "flex items-center justify-center h-full w-full text-sm font-medium text-white",
                  isScrolled ? "bg-indigo-700" : "bg-indigo-600"
                )}>
                  {getInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? 'text-gray-700' : 'text-gray-300'} />
            ) : (
              <Menu className={isScrolled ? 'text-gray-700' : 'text-gray-300'} />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col p-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md',
                  pathname === item.href
                    ? 'bg-gray-100 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button size="sm" className="mt-2 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M13 3L19 9L13 15"></path>
                <path d="M19 9H5C3.89543 9 3 9.89543 3 11V15C3 17.2091 4.79086 19 7 19H15"></path>
              </svg>
              Upgrade now
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
} 