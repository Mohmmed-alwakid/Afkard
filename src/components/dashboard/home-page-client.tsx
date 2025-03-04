'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon } from 'lucide-react';
import { 
  TypographyH1, 
  TypographyH2, 
  TypographyH3, 
  TypographyP 
} from '@/components/ui/typography';

interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface HomePageClientProps {
  userProfile: UserProfile;
  userRole: 'researcher' | 'participant' | 'admin';
  firstName: string;
  hasProjects: boolean;
}

interface StatsCardProps {
  title: string;
  value: string | number;
}

const StatsCard = ({ title, value }: StatsCardProps) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export function HomePageClient({ userProfile, userRole, firstName, hasProjects }: HomePageClientProps) {
  return (
    <div className="flex flex-col space-y-8">
      {/* Welcome Message */}
      <div className="text-center py-6">
        <TypographyH1 className="text-2xl md:text-3xl font-medium text-[#14142B]">
          Welcome to Afkar Platform, {firstName} 🎉
        </TypographyH1>
      </div>

      {userRole === 'researcher' ? (
        // Researcher View
        <>
          {/* Projects Section - Empty State or Projects Grid */}
          <div className="bg-white rounded-3xl p-8 md:p-12">
            {!hasProjects ? (
              <div className="flex flex-col items-center justify-center py-16 max-w-2xl mx-auto text-center">
                {/* Illustration */}
                <div className="w-64 h-64 mb-8 relative">
                  <Image
                    src="/illustrations/researcher.svg"
                    alt="Get started illustration"
                    width={250}
                    height={250}
                    className="object-contain"
                  />
                </div>
                
                <TypographyH2 className="text-2xl font-semibold text-[#27273C] mb-4">
                  Get started by creating a project
                </TypographyH2>
                
                <TypographyP className="text-[#666675] mb-2">
                  Currently you don&apos;t have any projects synced on your dashboard
                </TypographyP>
                
                <TypographyP className="text-[#666675] mb-10">
                  Let&apos;s add some data and create a new project
                </TypographyP>
                
                <Button 
                  asChild
                  className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full py-4 px-7 h-14 flex items-center gap-3"
                >
                  <Link href="/projects/new">
                    <PlusIcon className="h-5 w-5" />
                    <span className="font-semibold">New Project</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <TypographyH2 className="text-xl font-semibold text-[#14142B]">
                    Your Projects
                  </TypographyH2>
                  <Button 
                    asChild
                    className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full py-4 px-7"
                  >
                    <Link href="/projects/new">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      New Project
                    </Link>
                  </Button>
                </div>
                
                {/* Project cards would go here */}
                <TypographyP className="text-[#666675]">
                  View your <Link href="/projects" className="text-[#212280] underline">project dashboard</Link> to manage all your projects.
                </TypographyP>
              </div>
            )}
          </div>

          {/* Studies Section - Shows when user has projects */}
          {hasProjects && (
            <div className="bg-white rounded-3xl p-8 md:p-12">
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <TypographyH2 className="text-xl font-semibold text-[#14142B]">
                    Your Studies
                  </TypographyH2>
                  <Button 
                    asChild
                    className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full py-4 px-7"
                  >
                    <Link href="/studies/new">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      New Study
                    </Link>
                  </Button>
                </div>
                
                {/* No studies yet message */}
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <TypographyP className="text-[#666675] mb-6">
                    You haven&apos;t created any studies yet. Create a study to start collecting insights.
                  </TypographyP>
                  <Button 
                    asChild
                    className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full"
                  >
                    <Link href="/studies/new">
                      Create Your First Study
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Templates Section */}
          <div className="bg-white rounded-3xl p-8 md:p-12">
            <div className="flex flex-col space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <TypographyH2 className="text-base font-semibold text-[#14142B]">
                    Create Afkar Template
                  </TypographyH2>
                  <TypographyP className="text-sm text-[#9595A0]">
                    Choose from our pre-built afkar templates or create your own maze from the ground up.
                  </TypographyP>
                </div>
                
                <Button 
                  asChild
                  className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full py-4 px-7"
                >
                  <Link href="/templates/new">
                    Create Template
                  </Link>
                </Button>
              </div>
              
              {/* Template Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div 
                    key={item} 
                    className="bg-[#F7F7FC] rounded-xl p-4 flex flex-col items-center"
                  >
                    <div className="w-full h-36 bg-gray-200 rounded-lg mb-4"></div>
                    <TypographyP className="font-medium text-[#303044] text-center">
                      Usability testing a new product
                    </TypographyP>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Participant View
        <>
          {/* Active Studies */}
          <div className="bg-white rounded-3xl p-8 md:p-12">
            <div className="flex flex-col space-y-6">
              <TypographyH2 className="text-xl font-semibold text-[#14142B]">
                Active Studies
              </TypographyH2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Empty state for no studies */}
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-64 h-64 mb-8 relative">
                    <Image
                      src="/illustrations/participant.svg"
                      alt="No active studies"
                      width={250}
                      height={250}
                      className="object-contain"
                    />
                  </div>
                  
                  <TypographyH3 className="text-xl font-semibold text-[#27273C] mb-4">
                    No active studies yet
                  </TypographyH3>
                  
                  <TypographyP className="text-[#666675] mb-8 max-w-md">
                    You don&apos;t have any active studies at the moment. Check back later or explore available studies.
                  </TypographyP>
                  
                  <Button 
                    asChild
                    className="bg-[#212280] hover:bg-[#1a1c6b] text-white rounded-full py-4 px-7"
                  >
                    <Link href="/studies/explore">
                      Explore Available Studies
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats & Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <StatsCard title="Completed Studies" value="0" />
                <StatsCard title="Total Rewards" value="$0" />
                <StatsCard title="Feedback Given" value="0" />
                <StatsCard title="Response Rate" value="0%" />
              </CardContent>
            </Card>
            
            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TypographyP className="text-muted-foreground">No recent activity</TypographyP>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Explore Section - Common for both roles */}
      <div className="mt-10">
        <TypographyH2 className="text-lg font-semibold text-[#27273C] mb-2">Explore Afkar</TypographyH2>
        <TypographyP className="text-[#535364]">Elevate your research by learning the basics, and access advanced tips and resources</TypographyP>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Help Center</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP className="text-muted-foreground mb-6">Find answers to commonly asked questions and learn how to use Afkar effectively.</TypographyP>
              <Link href="/help" className="text-sm font-semibold underline text-[#14142B]">
                Visit Help Center
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Research Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP className="text-muted-foreground mb-6">Access research methodologies, templates, and best practices to improve your studies.</TypographyP>
              <Link href="/resources" className="text-sm font-semibold underline text-[#14142B]">
                Explore Resources
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 