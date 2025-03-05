import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { SonnerProvider } from '@/components/ui/sonner-provider';
import AuthProvider from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Afkar - User Experience Research Platform',
  description: 'A comprehensive UX research platform for designers and researchers',
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn('h-full', inter.className)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <SonnerProvider />
      </body>
    </html>
  );
}
