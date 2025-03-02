'use client';

import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const authPages = {
  '/login': {
    title: 'Welcome back',
    description: 'Enter your credentials to access your account',
  },
  '/signup': {
    title: 'Create an account',
    description: 'Enter your details to create your account',
  },
  '/forgot-password': {
    title: 'Forgot password?',
    description: 'Enter your email to reset your password',
  },
  '/reset-password': {
    title: 'Reset password',
    description: 'Enter your new password',
  },
  '/verify-email': {
    title: 'Verify your email',
    description: 'Check your email for a verification link',
  },
} as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageInfo = authPages[pathname as keyof typeof authPages];
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section - Auth Form */}
      <div className="flex flex-col items-center w-full lg:w-1/2">
        <div className="container flex h-full max-w-screen-xl flex-col">
          <header className="flex items-center justify-between px-6 py-6 lg:px-8">
            <div className="relative w-[168px] h-[35px]">
              <Image
                src="/logos/afkar-logo.svg"
                alt="Afkar Logo"
                fill
                priority
                sizes="168px"
                className="object-contain"
              />
            </div>
            <LanguageSwitcher />
          </header>

          <main className="flex flex-1 items-center justify-center px-6 pb-10 pt-4">
            <div className="w-full max-w-md space-y-8">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {pageInfo && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    {pageInfo.title}
                  </h1>
                  <p className="text-gray-600">{pageInfo.description}</p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {children}
              </motion.div>
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
              <a
                href="mailto:help@afkar.com"
                className="hover:text-gray-900 transition-colors"
              >
                help@afkar.com
              </a>
            </div>
          </footer>
        </div>
      </div>

      {/* Right Section - Gradient Background with Content */}
      <div className="hidden bg-gradient-to-br from-[#6A55FF] to-gray-600 lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-24 text-white">
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-20 h-20">
              <motion.div
                className="absolute top-0 left-0 w-6 h-6 bg-yellow-300 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-4 right-0 w-4 h-4 bg-yellow-300 rounded-full"
                animate={{
                  y: [0, 10, 0],
                  x: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </div>
          </motion.div>
          
          <motion.div
            className="text-center space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-5xl font-medium tracking-tight leading-tight">
              Start turning your ideas into reality.
            </h2>
            <p className="text-lg font-medium text-gray-200">
              Create a free account and get full access to all features for 30-days.
              No credit card needed. Get started in 2 minutes.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                  style={{ zIndex: 6 - i }}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                >
                  <div className={`absolute inset-0 bg-purple-${i}00`}></div>
                </motion.div>
              ))}
            </div>
            <span className="ml-4 text-gray-200 text-md">
              Join 4,000+ Researchers
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 