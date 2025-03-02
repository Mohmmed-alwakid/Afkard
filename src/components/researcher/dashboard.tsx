'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';

export function ResearcherDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewProject = () => {
    setIsLoading(true);
    router.push('/researcher/projects/new');
  };

  const handleCreateTemplate = () => {
    setIsLoading(true);
    router.push('/researcher/templates/new');
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Welcome Message */}
      <div className="text-center py-6">
        <h1 className="text-2xl md:text-3xl font-medium text-[#14142B]">
          Welcome to Afkar Platform, {user?.first_name || 'Researcher'} 🎉
        </h1>
      </div>

      {/* Empty Projects Section */}
      <div className="bg-white rounded-3xl p-8 md:p-12">
        <div className="flex flex-col items-center justify-center py-16 max-w-2xl mx-auto text-center">
          {/* Illustration */}
          <div className="w-64 h-64 mb-8 relative">
            <Image
              src="/illustrations/researcher.svg"
              alt="Get started illustration"
              width={250}
              height={250}
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 250px"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-[#27273C] mb-4">
            Get started by creating a project
          </h2>
          
          <p className="text-[#666675] mb-2">
            Currently you don&apos;t have any projects synced on your dashboard
          </p>
          
          <p className="text-[#666675] mb-10">
            Let&apos;s create your first research project
          </p>
          
          <Button 
            className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full py-4 px-7 h-14 flex items-center gap-3"
            onClick={handleNewProject}
            disabled={isLoading}
          >
            <PlusIcon className="h-5 w-5" />
            <span className="font-semibold">New Project</span>
          </Button>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-3xl p-8">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-[#14142B]">
                Create Afkar Template
              </h2>
              <p className="text-sm text-[#9595A0]">
                Choose from our pre-built afkar templates or create your own from scratch
              </p>
            </div>
            
            <Button 
              className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full py-4 px-7"
              onClick={handleCreateTemplate}
              disabled={isLoading}
            >
              Create Template
            </Button>
          </div>
          
          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Usability Testing",
                image: "/templates/usability.webp",
                href: "/researcher/templates/usability"
              },
              {
                title: "User Interview",
                image: "/templates/interview.webp",
                href: "/researcher/templates/interview"
              },
              {
                title: "Survey Research",
                image: "/templates/survey.webp",
                href: "/researcher/templates/survey"
              },
              {
                title: "A/B Testing",
                image: "/templates/ab-testing.webp",
                href: "/researcher/templates/ab-testing"
              }
            ].map((template) => (
              <Link 
                key={template.title}
                href={template.href}
                className="bg-[#F7F7FC] rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-36 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src={template.image}
                    alt={template.title}
                    width={200}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-medium text-[#303044] text-center">
                  {template.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Section */}
      <div className="pt-8">
        <h2 className="text-lg font-semibold text-[#27273C] mb-2">
          Explore Afkar
        </h2>
        <p className="text-[#535364]">
          Elevate your research by learning the basics, and access advanced tips and resources
        </p>
        
        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link href="/help/getting-started" className="block">
            <div className="bg-white p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F2F2F7] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#14142B] font-bold">?</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#344054]">Getting Started with Afkar</h3>
                    <p className="text-sm text-[#475467]">
                      Learn the basics of creating research projects and using templates
                    </p>
                  </div>
                  
                  <span className="text-sm font-semibold text-[#14142B] underline">
                    View getting started guide
                  </span>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/help/advanced-techniques" className="block">
            <div className="bg-white p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F2F2F7] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#14142B] font-bold">📊</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#344054]">Advanced Research Techniques</h3>
                    <p className="text-sm text-[#475467]">
                      Discover advanced methods for gathering and analyzing user feedback
                    </p>
                  </div>
                  
                  <span className="text-sm font-semibold text-[#14142B] underline">
                    Explore advanced techniques
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 