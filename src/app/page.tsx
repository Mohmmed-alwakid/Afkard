import { Metadata } from "next";
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

import HeroSection from "@/components/landing/hero-section";
import ServicesSection from "@/components/landing/services-section";
import SocialProofSection from "@/components/landing/social-proof-section";
import FeaturesSection from "@/components/landing/features-section";
import TestimonialSection from "@/components/landing/testimonial-section";
import MetricsSection from "@/components/landing/metrics-section";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Afkar - Research Platform for User Testing",
  description: "Afkar is a comprehensive platform for digital research, user testing, prototype management, and AI-powered analysis",
};

export default async function HomePage() {
  try {
    console.log('HomePage - Creating server client...')
    const supabase = await createServerClient()
    
    console.log('HomePage - Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      // If there's a session error, show the landing page
      return renderLandingPage()
    }
    
    console.log('Session exists:', !!session)
    
    // If authenticated, redirect to appropriate dashboard
    if (session?.user) {
      console.log('User authenticated, checking role...')
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        console.error('Error fetching user role:', error)
        return renderLandingPage()
      }
      
      console.log('User role:', userData?.role)
      
      // Only redirect if we successfully got the user role
      if (userData?.role) {
        if (userData.role === 'researcher') {
          console.log('Redirecting to researcher dashboard...')
          redirect('/researcher')
        } else {
          console.log('Redirecting to main dashboard...')
          redirect('/dashboard')
        }
      }
    }

    console.log('Rendering landing page...')
    return renderLandingPage()
  } catch (error) {
    console.error('Error in HomePage:', error)
    return renderLandingPage()
  }
}

// Helper function to render the landing page
function renderLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <SocialProofSection />
      <ServicesSection />
      <FeaturesSection />
      <TestimonialSection />
      <MetricsSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
