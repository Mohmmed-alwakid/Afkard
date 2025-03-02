"use client"

import { useLanguageStore } from "@/store/language-store"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { isRTL } = useLanguageStore()

  return (
    <div 
      lang={isRTL ? "ar" : "en"} 
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen"
    >
      {children}
    </div>
  )
} 