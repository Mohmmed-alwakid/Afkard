'use client';

import { useState } from 'react';
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
} from 'lucide-react';
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
    language: getLanguage(),
    theme: 'light',
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
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }
  
  if (!user) {
    // If no user is found, redirect to login
    router.push('/login');
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
    
    return 'U';
  };
  
  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold mb-2">{t('common.profile')}</h1>
      <p className="text-gray-500 mb-8">{t('profile.manageSettings')}</p>
      
      {showSuccessMessage && (
        <div className={cn(
          "mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700",
          isRTL && "flex-row-reverse"
        )}>
          <Check className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          {t('profile.saveSuccess')}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="profile" className={cn(
            "flex items-center gap-2",
            isRTL ? "justify-end md:justify-center flex-row-reverse" : "justify-start md:justify-center"
          )}>
            <User className="h-4 w-4" />
            <span>{t('common.profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className={cn(
            "flex items-center gap-2",
            isRTL ? "justify-end md:justify-center flex-row-reverse" : "justify-start md:justify-center"
          )}>
            <Lock className="h-4 w-4" />
            <span>{t('profile.security')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className={cn(
            "flex items-center gap-2",
            isRTL ? "justify-end md:justify-center flex-row-reverse" : "justify-start md:justify-center"
          )}>
            <Bell className="h-4 w-4" />
            <span>{t('common.notifications')}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className={cn(
            "flex items-center gap-2",
            isRTL ? "justify-end md:justify-center flex-row-reverse" : "justify-start md:justify-center"
          )}>
            <Globe className="h-4 w-4" />
            <span>{t('profile.preferences')}</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('profile.personalInfo')}</CardTitle>
                <CardDescription>
                  {t('profile.personalInfoDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">{t('common.firstName')}</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder={t('profile.firstNamePlaceholder')}
                      isRTL={isRTL}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">{t('common.lastName')}</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder={t('profile.lastNamePlaceholder')}
                      isRTL={isRTL}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('profile.emailPlaceholder')}
                    isRTL={isRTL}
                  />
                  <p className="text-xs text-gray-500">
                    {t('profile.emailDesc')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder={t('profile.bioPlaceholder')}
                    rows={4}
                    isRTL={isRTL}
                  />
                </div>
              </CardContent>
              <CardFooter className={cn(
                "flex justify-end pt-4",
                isRTL && "flex-row-reverse"
              )}>
                <Button onClick={handleSaveProfile} disabled={isPending}>
                  {isPending ? (
                    <>
                      <LoadingSpinner className="mr-2" size="sm" />
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('common.save')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Avatar & Account Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.profilePhoto')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    {formData.avatar_url ? (
                      <AvatarImage src={formData.avatar_url} alt={`${formData.first_name} ${formData.last_name}`} />
                    ) : (
                      <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                    )}
                  </Avatar>
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('profile.uploadPhoto')}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">{t('profile.dangerZone')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                        {t('profile.deleteAccount')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('profile.confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('profile.deleteWarning')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className={cn(isRTL && "flex-row-reverse")}>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive">
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full text-destructive border-destructive/25 hover:bg-destructive/10"
                  >
                    <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('common.logout')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.preferences')}</CardTitle>
              <CardDescription>
                {t('profile.preferencesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">{t('profile.language')}</Label>
                <Select
                  value={formData.language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder={t('profile.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    <SelectItem value="fr">Français (French)</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">{t('profile.theme')}</Label>
                <Select
                  value={formData.theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder={t('profile.selectTheme')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('profile.themeLight')}</SelectItem>
                    <SelectItem value="dark">{t('profile.themeDark')}</SelectItem>
                    <SelectItem value="system">{t('profile.themeSystem')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className={cn(
              "flex justify-end pt-4",
              isRTL && "flex-row-reverse"
            )}>
              <Button onClick={handleSaveProfile} disabled={isPending}>
                {isPending ? (
                  <>
                    <LoadingSpinner className="mr-2" size="sm" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('common.save')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Other tabs - implement similarly */}
      </Tabs>
    </div>
  );
}
