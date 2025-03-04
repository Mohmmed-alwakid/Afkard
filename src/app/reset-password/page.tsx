'use client';

import React, { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Loader2 } from "lucide-react"
import { ResetPasswordContent } from "./reset-password-content"

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen w-full">
      {/* Left Section - Form */}
      <div className="flex flex-col items-center w-full lg:w-1/2">
        <div className="container flex h-full max-w-screen-xl flex-col">
          <header className="flex items-center justify-between px-6 py-6 lg:px-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logos/afkar-logo.svg"
                alt="Afkar Logo"
                width={168}
                height={35}
                priority
              />
            </Link>
            <LanguageSwitcher />
          </header>

          <main className="flex flex-1 items-center justify-center px-6 pb-10 pt-4">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                  Reset your password
                </h1>
                <p className="text-gray-600">
                  Enter your new password below
                </p>
              </div>

              <Suspense 
                fallback={
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
              >
                <ResetPasswordContent />
              </Suspense>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <Link href="/login" className="text-[#6A55FF] font-semibold hover:underline inline-flex items-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1"
                    >
                      <path
                        d="M19 12H5M5 12L12 19M5 12L12 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back to login
                  </Link>
                </p>
              </div>
            </div>
          </main>

          <footer className="py-8 text-center text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-500"
              >
                <path
                  d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>help@afkar.com</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Right Section - Gradient Background with Content */}
      <div className="hidden bg-gradient-to-br from-[#6A55FF] to-gray-600 lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-24 text-white">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-medium tracking-tight leading-tight">
              Secure your account with a strong password.
            </h2>
            <p className="text-lg font-medium text-gray-200">
              Choose a password that's hard for others to guess but easy for you to remember.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 