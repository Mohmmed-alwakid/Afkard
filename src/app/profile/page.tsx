'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Shield,
  Upload,
  LogOut,
  Trash,
  Save,
  AlertTriangle,
  Check,
  ClipboardList,
  HelpCircle,
  Settings,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/translations';
import { useRTL } from '@/hooks/use-rtl';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isPending, setIsPending] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { t } = useTranslations();
  const { isRTL, getLanguage, setLanguage } = useRTL();
  
  // Check if we're in the browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Use useEffect to handle navigation to avoid SSR issues
  useEffect(() => {
    if (!user && !isLoading && isBrowser) {
      router.push('/login');
    }
  }, [user, isLoading, router, isBrowser]);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    notifications: {
      email: true,
      mobile: false,
      marketing: true,
    },
    language: isBrowser ? getLanguage() : 'en',
    theme: 'light',
    timezone: '(GMT+03:00) Riyadh'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleNotificationChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }));
  };
  
  const handleLanguageChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      language: value,
    }));
    
    // Update the application language
    setLanguage(value);
  };
  
  const handleThemeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      theme: value,
    }));
  };
  
  const handleSaveProfile = async () => {
    setIsPending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsPending(false);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1000);
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  // Return loading state instead of redirecting during SSR
  if (!user) {
    if (!isBrowser) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      );
    }
    return null;
  }
  
  // Get user's initials for avatar
  const getInitials = (): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'AD';
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6FA]">
      {/* Header */}
      <header className="bg-[#14142B] w-full">
        <div className="container mx-auto px-4 h-[107px] flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-10">
              <div className="w-[142px] h-[52px] relative">
                {/* Afkar Logo */}
                <div className="w-[123.72px] h-[44px] absolute">
                  <Image 
                    src="/logo-white.svg" 
                    alt="Afkar" 
                    width={123.72} 
                    height={44} 
                    className="object-contain" 
                  />
                </div>
              </div>
            </Link>
            <div className="h-[35px] w-[1px] bg-[#37374B] mx-6"></div>
            {/* Navigation */}
            <nav className="flex gap-2">
              <Link 
                href="/home" 
                className="h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold"
              >
                Home
              </Link>
              <Link 
                href="/projects" 
                className="h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold"
              >
                Projects
              </Link>
              <Link 
                href="/participants" 
                className="h-10 px-3 py-2 flex items-center text-white rounded-md text-sm font-semibold"
              >
                Participants
              </Link>
              <Link 
                href="/help" 
                className="h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold"
              >
                Help&Support
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <Button 
              variant="outline" 
              className="bg-[#303044] border-[#303044] text-white rounded-lg"
            >
              <span className="mr-2">Upgrade Plan</span>
            </Button>
            
            {/* Action Icons */}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10">
                <Settings className="h-5 w-5 text-white" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10">
                <Bell className="h-5 w-5 text-white" />
              </Button>
            </div>
            
            {/* User Avatar */}
            <div className="w-11 h-11 rounded-full bg-[#212280] flex items-center justify-center text-white font-semibold">
              {getInitials()}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col mb-6">
            <h1 className="text-[30px] font-semibold text-[#101828]">Profile</h1>
            <Tabs defaultValue="profile" className="mt-6 border-b border-[#EAECF0]">
              <TabsList className="flex gap-4 mb-0 bg-transparent">
                <TabsTrigger 
                  value="profile" 
                  className={`px-1 pb-[11px] text-[14px] font-semibold ${activeTab === 'profile' ? 'text-[#212280] border-b-2 border-[#212280]' : 'text-[#666675]'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className={`px-1 pb-[11px] text-[14px] font-semibold ${activeTab === 'billing' ? 'text-[#212280] border-b-2 border-[#212280]' : 'text-[#666675]'}`}
                  onClick={() => setActiveTab('billing')}
                >
                  Billing
                </TabsTrigger>
                <TabsTrigger 
                  value="help" 
                  className={`px-1 pb-[11px] text-[14px] font-semibold ${activeTab === 'help' ? 'text-[#212280] border-b-2 border-[#212280]' : 'text-[#666675]'}`}
                  onClick={() => setActiveTab('help')}
                >
                  Help
                </TabsTrigger>
                <TabsTrigger 
                  value="logout" 
                  className={`px-1 pb-[11px] text-[14px] font-semibold ${activeTab === 'logout' ? 'text-[#212280] border-b-2 border-[#212280]' : 'text-[#666675]'}`}
                  onClick={() => setActiveTab('logout')}
                >
                  Logout
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="pt-8">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
                  <p className="text-sm text-[#475467]">Update your personal details here.</p>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <Button variant="outline" className="px-4 py-2 text-[#344054] font-semibold">
                    Cancel
                  </Button>
                  <Button 
                    className="px-4 py-2 bg-[#7F56D9] text-white font-semibold"
                    onClick={handleSaveProfile}
                    disabled={isPending}
                  >
                    {isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                
                <Separator className="my-6 bg-[#EAECF0]" />
                
                {/* Form Content */}
                <div className="space-y-8">
                  {/* Name Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                      <h3 className="text-sm font-medium text-[#344054]">Name</h3>
                    </div>
                    <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        placeholder="First name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-[14px] py-[10px] border border-[#D0D5DD] rounded-lg shadow-sm"
                      />
                      <Input
                        placeholder="Last name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-[14px] py-[10px] border border-[#D0D5DD] rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-[#EAECF0]" />
                  
                  {/* Email Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                      <h3 className="text-sm font-medium text-[#344054]">Email address</h3>
                    </div>
                    <div className="md:col-span-9">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-[#667085]" />
                        <Input
                          placeholder="Email address"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-[14px] py-[10px] border border-[#D0D5DD] rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#EAECF0]" />
                  
                  {/* Profile Photo */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                      <h3 className="text-sm font-medium text-[#344054]">Profile photo</h3>
                      <p className="text-sm text-[#475467] mt-1">This will be displayed on your profile.</p>
                    </div>
                    <div className="md:col-span-9 flex items-start gap-5">
                      <Avatar className="w-16 h-16 bg-[#212280]">
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="border border-[#EAECF0] rounded-xl p-6 text-center flex flex-col items-center justify-center">
                          <div className="w-10 h-10 bg-white border-[6px] border-[#F9FAFB] rounded-full flex items-center justify-center mb-3">
                            <Upload className="w-5 h-5 text-[#475467]" />
                          </div>
                          <div className="flex items-center justify-center mb-1">
                            <Button variant="link" className="text-[#212280] font-semibold text-sm">
                              Click to upload
                            </Button>
                            <span className="text-sm text-[#475467]">or drag and drop</span>
                          </div>
                          <p className="text-xs text-[#475467]">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#EAECF0]" />
                  
                  {/* Bio Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                      <h3 className="text-sm font-medium text-[#344054]">Bio</h3>
                      <p className="text-sm text-[#475467] mt-1">Write a short introduction.</p>
                    </div>
                    <div className="md:col-span-9">
                      <div className="space-y-2">
                        <div className="bg-white border border-[#D0D5DD] rounded-lg px-3 py-2">
                          <div className="flex space-x-3 mb-3">
                            <Select defaultValue="paragraph">
                              <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paragraph">Normal Text</SelectItem>
                                <SelectItem value="heading1">Heading 1</SelectItem>
                                <SelectItem value="heading2">Heading 2</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7 8H17M7 12H13M7 16H17" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7 5H17M12 5V19M12 19H7M12 19H17" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 7H4.01M4 12H4.01M4 17H4.01M8 7H20M8 12H20M8 17H20" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7 10.5V16.5M7 16.5H13M7 16.5L13 10.5M17 13.5V7.5M17 7.5H11M17 7.5L11 13.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </Button>
                            </div>
                          </div>
                          
                          <Textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Write a short bio..."
                            className="min-h-[130px] border-0 focus-visible:ring-0 p-0 placeholder:text-[#101828]"
                          />
                        </div>
                        
                        <p className="text-sm text-[#475467]">275 characters left</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#EAECF0]" />
                  
                  {/* Country and Timezone */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                      <h3 className="text-sm font-medium text-[#344054]">Country</h3>
                    </div>
                    <div className="md:col-span-9">
                      <Select defaultValue="au">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a country">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-[#0052B4] rounded-full flex-shrink-0" />
                              <span>Australia</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="au">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-[#0052B4] rounded-full flex-shrink-0" />
                              <span>Australia</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="us">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-[#BD3124] rounded-full flex-shrink-0" />
                              <span>United States</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="sa">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-[#006C35] rounded-full flex-shrink-0" />
                              <span>Saudi Arabia</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#EAECF0]" />
                  
                  {/* Timezone */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                      <h3 className="text-sm font-medium text-[#344054]">Timezone</h3>
                    </div>
                    <div className="md:col-span-9">
                      <Select defaultValue="gmt3">
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-[#667085]" />
                              <span className="font-medium">Riyadh</span>
                              <span className="text-[#475467]">(GMT+03:00)</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gmt3">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-[#667085]" />
                              <span className="font-medium">Riyadh</span>
                              <span className="text-[#475467]">(GMT+03:00)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="gmt0">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-[#667085]" />
                              <span className="font-medium">London</span>
                              <span className="text-[#475467]">(GMT+00:00)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#EAECF0]" />
                  
                  {/* Form Footer */}
                  <div className="flex justify-end gap-3 pt-3">
                    <Button variant="outline" className="px-4 py-2 text-[#344054] font-semibold">
                      Cancel
                    </Button>
                    <Button 
                      className="px-4 py-2 bg-[#7F56D9] text-white font-semibold"
                      onClick={handleSaveProfile}
                      disabled={isPending}
                    >
                      {isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="billing" className="pt-8">
                <div className="flex items-center gap-4 mb-8">
                  <ClipboardList className="w-8 h-8 text-[#37374B]" />
                  <div>
                    <h2 className="font-medium text-[#37374B]">Billing</h2>
                    <p className="text-sm text-[#666675]">Manage your billing information and payment methods</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#37374B] ml-auto" />
                </div>
              </TabsContent>
              
              <TabsContent value="help" className="pt-8">
                <div className="flex items-center gap-4 mb-8">
                  <HelpCircle className="w-8 h-8 text-[#37374B]" />
                  <div>
                    <h2 className="font-medium text-[#37374B]">Help</h2>
                    <p className="text-sm text-[#666675]">Get help with using Afkar platform</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#37374B] ml-auto" />
                </div>
              </TabsContent>
              
              <TabsContent value="logout" className="pt-8">
                <div className="flex items-center gap-4 mb-8 bg-[#DEDEEC] p-4 rounded-xl">
                  <LogOut className="w-8 h-8 text-[#5C5C5C]" />
                  <div>
                    <h2 className="font-medium text-[#67686A]">Log out</h2>
                    <p className="text-sm text-[#67686A]">Sign out from your account</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#67686A] ml-auto" />
                </div>
                
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="mt-4"
                >
                  Sign Out
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
