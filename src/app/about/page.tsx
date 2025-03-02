import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Us | Afkar',
  description: 'Learn about Afkar\'s mission to empower researchers and our team of experts'
};

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Dr. Ahmed Al-Farsi',
    role: 'Founder & CEO',
    bio: 'Former professor with 15+ years of research experience. Founded Afkar to make research tools more accessible to academics worldwide.',
    image: '/images/team/ahmed.jpg',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  },
  {
    name: 'Sarah Johnson, PhD',
    role: 'Chief Research Officer',
    bio: 'Expert in research methodologies with a background in psychology and statistics. Leads our research innovation team.',
    image: '/images/team/sarah.jpg',
    linkedin: 'https://linkedin.com'
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    bio: 'Previously led engineering at several successful startups. Expert in AI and building scalable research platforms.',
    image: '/images/team/michael.jpg',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  },
  {
    name: 'Leila Patel',
    role: 'Head of Customer Success',
    bio: 'Dedicated to ensuring researchers get the most from our platform. Background in educational technology and customer experience.',
    image: '/images/team/leila.jpg',
    linkedin: 'https://linkedin.com'
  },
  {
    name: 'Dr. Carlos Mendoza',
    role: 'Lead Data Scientist',
    bio: 'Specializes in statistical analysis and machine learning techniques for research data. PhD in Applied Mathematics.',
    image: '/images/team/carlos.jpg',
    twitter: 'https://twitter.com'
  },
  {
    name: 'Emma Thompson',
    role: 'Director of Marketing',
    bio: 'Passionate about communicating the value of research and making complex tools approachable for all users.',
    image: '/images/team/emma.jpg',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  }
];

const coreValues = [
  {
    title: 'Research Integrity',
    description: 'We believe in upholding the highest standards of research ethics and integrity in everything we build.'
  },
  {
    title: 'Accessibility',
    description: 'Our mission is to make sophisticated research tools accessible to researchers of all backgrounds and resource levels.'
  },
  {
    title: 'Innovation',
    description: 'We continuously innovate to provide cutting-edge tools that advance the capabilities of researchers globally.'
  },
  {
    title: 'User-Centered Design',
    description: "We design all our products with researchers&apos; workflows and needs at the center of our process."
  },
  {
    title: 'Data Privacy',
    description: 'We maintain the strictest standards of data security and privacy to protect sensitive research information.'
  },
  {
    title: 'Global Collaboration',
    description: 'We facilitate worldwide research collaboration through accessible, connected tools and platforms.'
  }
];

const timeline = [
  {
    year: '2018',
    title: 'Foundation',
    description: 'Afkar was founded with a mission to democratize research tools for academics worldwide.'
  },
  {
    year: '2019',
    title: 'First Platform Launch',
    description: 'Launched our first beta version of the survey research platform with 100 early-access researchers.'
  },
  {
    year: '2020',
    title: 'Research Grant Program',
    description: 'Established our research grant program to support early-career researchers in developing countries.'
  },
  {
    year: '2021',
    title: 'AI Analytics Integration',
    description: 'Integrated advanced AI analytics capabilities to help researchers derive deeper insights from their data.'
  },
  {
    year: '2022',
    title: 'Global Expansion',
    description: 'Expanded operations to support researchers in over 50 countries with localization in 10 languages.'
  },
  {
    year: '2023',
    title: 'Enterprise Solutions',
    description: 'Launched enterprise solutions for research institutions and large organizations conducting extensive studies.'
  }
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-muted-foreground">
            Empowering researchers to gather insights that drive positive change in the world through accessible, powerful research tools.
          </p>
        </div>
      </section>
      
      {/* About Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Afkar</h2>
              <p className="mb-4 text-lg">
                Founded in 2018, Afkar is dedicated to transforming how research is conducted by making advanced tools accessible to researchers worldwide.
              </p>
              <p className="mb-4 text-lg">
                Our platform combines ease-of-use with powerful analytical capabilities, helping researchers from all disciplines design studies, collect data, and derive meaningful insights.
              </p>
              <p className="mb-6 text-lg">
                What began as a small project to help academic researchers now serves thousands of researchers, from individual scholars to large research institutions and organizations in over 50 countries.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 rounded-full p-2 mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">50+ Countries</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary/10 rounded-full p-2 mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">10,000+ Researchers</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary/10 rounded-full p-2 mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">1M+ Survey Responses</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
              <Image 
                src="/images/about/team-working.jpg" 
                alt="Afkar team working together" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our work and shape our company culture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-background p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Our Journey Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Milestones that have shaped our growth
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>
            
            {timeline.map((item, index) => (
              <div key={index} className={`relative mb-12 flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="md:w-1/2"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div className={`md:w-1/2 bg-background rounded-lg shadow-sm p-6 ${index % 2 === 0 ? 'md:ml-10' : 'md:mr-10'}`}>
                  <div className="font-bold text-primary mb-1">{item.year}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate experts dedicated to advancing research capabilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-background rounded-lg overflow-hidden shadow-sm">
                <div className="relative h-72 w-full">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex gap-2">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.059 10.059 0 01-3.126 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.549l-.047-.02z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Join Our Team CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-primary/10 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              We&apos;re always looking for talented individuals passionate about advancing research technologies. Explore our open positions and be part of our mission.
            </p>
            <Button asChild size="lg">
              <Link href="/careers" className="inline-flex items-center">
                View Open Positions <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 