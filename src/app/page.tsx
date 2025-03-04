import { Metadata } from "next";
import Link from 'next/link';

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

// Simplified HomePage without any redirects or auth checks
export default function HomePage() {
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
  );
}
