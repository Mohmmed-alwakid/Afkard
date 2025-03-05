'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface RTLContextType {
  isRTL: boolean;
  setRTL: (value: boolean) => void;
  toggleRTL: () => void;
  getTextDirection: () => 'rtl' | 'ltr';
  getLanguage: () => string;
  setLanguage: (language: string) => void;
  supportedLanguages: string[];
}

const RTLContext = createContext<RTLContextType>({
  isRTL: false,
  setRTL: () => {},
  toggleRTL: () => {},
  getTextDirection: () => 'ltr',
  getLanguage: () => 'en',
  setLanguage: () => {},
  supportedLanguages: ['en', 'ar'],
});

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const RTLProvider = ({ children }: { children: React.ReactNode }) => {
  const [isRTL, setIsRTL] = useState(false);
  const [language, setLanguageState] = useState('en');
  const router = useRouter();
  const pathname = usePathname();
  
  const supportedLanguages = ['en', 'ar', 'fr', 'es'];
  
  // Initialize RTL state based on local storage or URL
  useEffect(() => {
    // Try to get language from localStorage first
    const storedLanguage = localStorage.getItem('language');
    
    // If language is specified in URL (?lang=ar), use that
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get('lang');
    
    // Use URL language, then stored language, then default to 'en'
    const detectedLanguage = urlLanguage || storedLanguage || 'en';
    
    // Update language state
    setLanguageState(detectedLanguage);
    
    // Set RTL based on the detected language
    const shouldBeRTL = RTL_LANGUAGES.includes(detectedLanguage);
    setIsRTL(shouldBeRTL);
    
    // Set dir attribute on html element
    document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = detectedLanguage;
    
    // Store language preference
    localStorage.setItem('language', detectedLanguage);
    
  }, []);
  
  // Toggle RTL direction
  const toggleRTL = () => {
    setIsRTL((prev) => {
      const newValue = !prev;
      document.documentElement.dir = newValue ? 'rtl' : 'ltr';
      return newValue;
    });
  };
  
  // Set RTL explicitly
  const setRTL = (value: boolean) => {
    setIsRTL(value);
    document.documentElement.dir = value ? 'rtl' : 'ltr';
  };
  
  // Get current text direction
  const getTextDirection = (): 'rtl' | 'ltr' => {
    return isRTL ? 'rtl' : 'ltr';
  };
  
  // Get current language
  const getLanguage = (): string => {
    return language;
  };
  
  // Set language and update RTL accordingly
  const setLanguage = (newLanguage: string) => {
    if (!supportedLanguages.includes(newLanguage)) {
      console.warn(`Language '${newLanguage}' is not supported. Using default 'en' instead.`);
      newLanguage = 'en';
    }
    
    setLanguageState(newLanguage);
    const shouldBeRTL = RTL_LANGUAGES.includes(newLanguage);
    setIsRTL(shouldBeRTL);
    document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
    
    // Store language preference
    localStorage.setItem('language', newLanguage);
    
    // Update URL if needed
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', newLanguage);
    window.history.replaceState({}, '', currentUrl.toString());
    
    // Refresh the page to apply language changes (if needed)
    // router.refresh();
  };
  
  return (
    <RTLContext.Provider
      value={{
        isRTL,
        setRTL,
        toggleRTL,
        getTextDirection,
        getLanguage,
        setLanguage,
        supportedLanguages,
      }}
    >
      {children}
    </RTLContext.Provider>
  );
};

export const useRTL = () => {
  const context = useContext(RTLContext);
  
  if (context === undefined) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  
  return context;
};

// Helper component to conditionally flip elements for RTL
export const RTLFlip = ({ children }: { children: React.ReactNode }) => {
  const { isRTL } = useRTL();
  
  return (
    <div className={isRTL ? 'transform scale-x-[-1]' : ''}>
      {children}
    </div>
  );
};

// Utility to conditionally add RTL-specific classes
export const rtlClass = (ltrClass: string, rtlClass: string) => {
  const { isRTL } = useRTL();
  return isRTL ? rtlClass : ltrClass;
}; 