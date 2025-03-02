'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Moon, Sun, Languages, LogOut, User as UserIcon, Bell, BellOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  compactMode: boolean;
};

const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: true,
  compactMode: false,
};

export function UserPreferencesMenu() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  
  useEffect(() => {
    // Load preferences from local storage
    const savedPrefs = localStorage.getItem('user-preferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences(prev => ({ ...prev, ...parsedPrefs }));
        
        // Apply theme from preferences
        if (parsedPrefs.theme) {
          setTheme(parsedPrefs.theme);
        }
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }
  }, [setTheme]);
  
  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: value };
      localStorage.setItem('user-preferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
    
    // Apply theme change immediately
    if (key === 'theme') {
      setTheme(value as string);
    }
    
    // Apply compact mode immediately
    if (key === 'compactMode') {
      document.documentElement.classList.toggle('compact-mode', value as boolean);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const handleProfileClick = () => {
    router.push('/profile');
  };
  
  const getInitials = () => {
    if (!user?.first_name) return 'U';
    return `${user.first_name.charAt(0)}${user.last_name ? user.last_name.charAt(0) : ''}`;
  };
  
  if (!isAuthenticated) return null;
  
  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar_url || ''} alt={user?.first_name || 'User'} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>User preferences</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleProfileClick}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-56">
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => updatePreference('theme', 'light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {preferences.theme === 'light' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => updatePreference('theme', 'dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {preferences.theme === 'dark' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => updatePreference('theme', 'system')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System</span>
                    {preferences.theme === 'system' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Display</DropdownMenuLabel>
                  
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex items-center space-x-2">
                      <span>Compact Mode</span>
                    </div>
                    <Switch
                      checked={preferences.compactMode}
                      onCheckedChange={(checked) => updatePreference('compactMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex items-center space-x-2">
                      {preferences.notifications ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                      <span>Notifications</span>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => updatePreference('notifications', checked)}
                    />
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <div className="p-2">
                    <LanguageSwitcher />
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
} 