import React from "react"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ParticipantSignupContent } from "./participant-signup-content"

export const metadata: Metadata = {
  title: "Participant Signup - Afkar",
  description: "Create a participant account on Afkar",
}

export default function ParticipantSignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Section - Gradient Background */}
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
              Join as a participant
            </h2>
            <p className="text-lg font-medium text-gray-200">
              Help shape products and services by sharing your valuable feedback
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
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
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Create a participant account
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Join our platform to participate in research studies and provide valuable feedback
              </p>
            </div>

            <ParticipantSignupContent />

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary underline underline-offset-4 hover:text-primary/90"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 