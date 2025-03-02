import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Solutions | Afkar',
  description: 'Industry-specific research solutions tailored to your sector'
};

interface SolutionProps {
  title: string;
  description: string;
  image: string;
  benefits: string[];
  cta: {
    text: string;
    href: string;
  };
}

const solutions: Record<string, SolutionProps[]> = {
  academic: [
    {
      title: 'Academic Research Platform',
      description: 'Comprehensive tools for academic researchers to conduct studies with precision and integrity.',
      image: '/images/solutions/academic-research.png',
      benefits: [
        'IRB compliance tools and templates',
        'Participant recruitment and management',
        'Data collection across multiple methods',
        'Advanced statistical analysis',
        'Journal-ready visualization and reporting'
      ],
      cta: {
        text: 'Explore Academic Solutions',
        href: '/solutions/academic'
      }
    },
    {
      title: 'Student Research Toolkit',
      description: 'Simplified research tools designed specifically for student researchers and class projects.',
      image: '/images/solutions/student-research.png',
      benefits: [
        'Easy-to-use survey creation',
        'Guided methodology templates',
        'Basic statistical analysis',
        'Affordable pricing for students',
        'Collaboration tools for group projects'
      ],
      cta: {
        text: 'View Student Options',
        href: '/solutions/students'
      }
    }
  ],
  healthcare: [
    {
      title: 'Clinical Research Suite',
      description: 'HIPAA-compliant tools for healthcare providers and researchers to gather patient insights securely.',
      image: '/images/solutions/healthcare-research.png',
      benefits: [
        'End-to-end HIPAA compliance',
        'Patient-friendly survey interfaces',
        'Integration with EMR systems',
        'Streamlined consent management',
        'Clinical outcome measurements'
      ],
      cta: {
        text: 'Learn About Clinical Solutions',
        href: '/solutions/healthcare'
      }
    },
    {
      title: 'Patient Experience Measurement',
      description: 'Tools to capture, analyze and improve patient satisfaction and experience.',
      image: '/images/solutions/patient-experience.png',
      benefits: [
        'Custom HCAHPS-aligned surveys',
        'Real-time satisfaction monitoring',
        'Benchmark comparison data',
        'Actionable improvement insights',
        'Department-specific analysis'
      ],
      cta: {
        text: 'Improve Patient Experience',
        href: '/solutions/patient-experience'
      }
    }
  ],
  corporate: [
    {
      title: 'Market Research Platform',
      description: 'Powerful tools for consumer insights and market analysis to drive business decisions.',
      image: '/images/solutions/market-research.png',
      benefits: [
        'Advanced conjoint and MaxDiff analysis',
        'Custom panel management',
        'Competitive benchmarking',
        'Sentiment analysis and trend detection',
        'Executive-ready reporting'
      ],
      cta: {
        text: 'Explore Market Research Tools',
        href: '/solutions/market-research'
      }
    },
    {
      title: 'Employee Insights Suite',
      description: 'Comprehensive solution for measuring and improving employee experience and engagement.',
      image: '/images/solutions/employee-insights.png',
      benefits: [
        'Engagement survey templates',
        'Pulse survey automation',
        'Anonymous feedback channels',
        'Organizational benchmarking',
        'Action planning tools'
      ],
      cta: {
        text: 'Enhance Employee Experience',
        href: '/solutions/employee-insights'
      }
    }
  ],
  government: [
    {
      title: 'Public Sector Research Platform',
      description: 'Secure, accessible tools for government agencies to gather citizen feedback and conduct research.',
      image: '/images/solutions/government-research.png',
      benefits: [
        'ADA-compliant survey interfaces',
        'Multi-language support',
        'Secure data handling and sovereignty',
        'Policy impact assessment tools',
        'FISMA compliance options'
      ],
      cta: {
        text: 'Discover Government Solutions',
        href: '/solutions/government'
      }
    },
    {
      title: 'Community Engagement Tools',
      description: 'Solutions to involve citizens in decision-making processes and community planning.',
      image: '/images/solutions/community-engagement.png',
      benefits: [
        'Public consultation frameworks',
        'Participatory budgeting tools',
        'Geographic information integration',
        'Demographic representation analysis',
        'Multi-channel feedback collection'
      ],
      cta: {
        text: 'Enhance Community Engagement',
        href: '/solutions/community'
      }
    }
  ]
};

function SolutionCard({ solution }: { solution: SolutionProps }) {
  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="p-6">
        <div className="mb-4 h-48 relative w-full">
          <Image 
            src={solution.image} 
            alt={solution.title} 
            fill 
            className="object-cover rounded-md" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardTitle className="text-xl">{solution.title}</CardTitle>
        <CardDescription className="mt-2">{solution.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <h4 className="font-semibold mb-2">Key Benefits</h4>
        <ul className="list-disc pl-5 space-y-1">
          {solution.benefits.map((benefit, index) => (
            <li key={index} className="text-sm">{benefit}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={solution.cta.href} className="inline-flex items-center justify-center">
            {solution.cta.text}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SolutionsPage() {
  const industries = Object.keys(solutions);
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Industry-Specific Research Solutions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tailored research tools and methodologies designed for the unique challenges of your industry
        </p>
      </div>
      
      <Tabs defaultValue={industries[0]} className="w-full">
        <TabsList className="flex justify-center mb-12 grid-cols-4 w-fit mx-auto">
          {industries.map((industry) => (
            <TabsTrigger key={industry} value={industry} className="capitalize">
              {industry}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {industries.map((industry) => (
          <TabsContent key={industry} value={industry}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {solutions[industry].map((solution, index) => (
                <SolutionCard key={index} solution={solution} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Looking for a Custom Solution?</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Our team of research experts can work with you to create a tailored solution for your specific industry challenges.
        </p>
        <Button asChild size="lg">
          <Link href="/contact">Schedule a Consultation</Link>
        </Button>
      </div>
    </div>
  );
} 