import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Language = "en" | "ar"

export interface Translations {
  // Auth
  sign_in: string
  sign_up: string
  sign_out: string
  email: string
  password: string
  forgot_password: string
  reset_password: string
  verify_email: string
  
  // Navigation
  home: string
  projects: string
  studies: string
  participants: string
  analytics: string
  settings: string
  profile: string
  
  // Theme
  toggle_theme: string
  light: string
  dark: string
  system: string
  
  // Language
  change_language: string
}

const en: Translations = {
  // Auth
  sign_in: "Sign in",
  sign_up: "Sign up", 
  sign_out: "Sign out",
  email: "Email",
  password: "Password",
  forgot_password: "Forgot password?",
  reset_password: "Reset password",
  verify_email: "Verify email",

  // Navigation  
  home: "Home",
  projects: "Projects",
  studies: "Studies", 
  participants: "Participants",
  analytics: "Analytics",
  settings: "Settings",
  profile: "Profile",

  // Theme
  toggle_theme: "Toggle theme",
  light: "Light",
  dark: "Dark", 
  system: "System",

  // Language
  change_language: "Change language"
}

const ar: Translations = {
  // Auth
  sign_in: "تسجيل الدخول",
  sign_up: "إنشاء حساب",
  sign_out: "تسجيل الخروج",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  forgot_password: "نسيت كلمة المرور؟",
  reset_password: "إعادة تعيين كلمة المرور",
  verify_email: "تأكيد البريد الإلكتروني",

  // Navigation
  home: "الرئيسية",
  projects: "المشاريع",
  studies: "الدراسات",
  participants: "المشاركين",
  analytics: "التحليلات",
  settings: "الإعدادات",
  profile: "الملف الشخصي",

  // Theme
  toggle_theme: "تبديل السمة",
  light: "فاتح",
  dark: "داكن",
  system: "النظام",

  // Language
  change_language: "تغيير اللغة"
}

interface TranslationsState {
  language: Language
  t: Translations
  isRTL: boolean
  setLanguage: (language: Language) => void
}

export const useTranslations = create<TranslationsState>()(
  persist(
    (set) => ({
      language: "en",
      t: en,
      isRTL: false,
      setLanguage: (language) =>
        set({
          language,
          t: language === "en" ? en : ar,
          isRTL: language === "ar",
        }),
    }),
    {
      name: "language",
    }
  )
) 