import React from "react"
import Link from "next/link"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Metadata } from "next"
import { ForgotPasswordContent } from "./forgot-password-content"

export const metadata: Metadata = {
  title: "Forgot Password | Afkar",
  description: "Reset your Afkar account password",
}

export default function ForgotPasswordPage() {
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
                  Forgot password?
                </h1>
                <p className="text-gray-600">
                  No worries, we&apos;ll send you reset instructions
                </p>
              </div>
              
              <ForgotPasswordContent />
              
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
          <div className="mb-8">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-6 h-6 bg-yellow-300 rounded-full"></div>
              <div className="absolute top-4 right-0 w-4 h-4 bg-yellow-300 rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-medium tracking-tight leading-tight">
              Research simplified for everyone
            </h2>
            <p className="text-lg font-medium text-gray-200">
              Connect with participants and conduct research seamlessly
            </p>
          </div>

          <div className="mt-8 flex items-center">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                  style={{ zIndex: 6 - i }}
                >
                  <div className={`absolute inset-0 bg-purple-${i}00`}></div>
                </div>
              ))}
            </div>
            <span className="ml-4 text-gray-200 text-md">
              Join thousands of researchers
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 