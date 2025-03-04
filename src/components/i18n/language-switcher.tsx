'use client';

import { useTranslations } from '@/lib/i18n/translations';
import { useRTL } from '@/hooks/use-rtl';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslations();
  const { getLanguage, setLanguage, supportedLanguages, isRTL } = useRTL();
  
  const currentLanguage = getLanguage();
  
  const languageNames: Record<string, string> = {
    'en': 'English',
    'ar': 'العربية',
    'fr': 'Français',
    'es': 'Español'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 h-9 px-3",
            isRTL && "flex-row-reverse",
            className
          )}
        >
          <Globe className="h-4 w-4" />
          <span>{languageNames[currentLanguage] || currentLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentLanguage === lang && "font-bold"
            )}
          >
            {languageNames[lang] || lang}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 