"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children: React.ReactNode
  showHero?: boolean
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
}

export function AuthLayout({
  children,
  showHero = true,
  heroTitle,
  heroSubtitle,
  heroImage,
}: AuthLayoutProps) {
  const { t, isRTL } = useTranslations()

  return (
    <div className={cn(
      "flex min-h-screen",
      isRTL && "rtl"
    )}>
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-afkar-purple-light to-afkar-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-xl">Afkar</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          {children}
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>© Afkar 2024</span>
            <Link href="mailto:help@afkar.com" className="hover:text-foreground">
              help@afkar.com
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section - Hero Image */}
      {showHero && (
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-afkar-purple to-afkar-purple-dark p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <div className="mb-8">
              <div className="inline-block p-3 bg-white/10 rounded-lg mb-6">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              {heroTitle || t.authHeroTitle}
            </h2>
            <p className="text-lg mb-8 text-white/80">
              {heroSubtitle || t.authHeroSubtitle}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10"
                  />
                ))}
              </div>
              <span className="text-sm text-white/80">{t.joinResearchers}</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 