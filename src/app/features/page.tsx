import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Features | Afkar',
  description: 'Explore the powerful features of Afkar\'s research platform that help you create, distribute, and analyze research'
};

const featureCategories = [
  {
    id: 'surveys',
    name: 'Survey Tools',
    description: 'Create powerful, flexible surveys with our intuitive builder',
    features: [
      {
        title: 'Intuitive Survey Builder',
        description: 'Drag-and-drop interface for creating surveys with 20+ question types, logic jumps, and custom styling.',
        image: '/images/features/survey-builder.png',
        highlights: [
          'Advanced question types, including matrix, slider, and ranking questions',
          'Conditional logic to show or hide questions based on previous answers',
          'Custom branding and styling to match your organization',
          'Mobile-responsive design for all devices'
        ]
      },
      {
        title: 'Multilingual Support',
        description: 'Create surveys in multiple languages and allow respondents to switch between them.',
        image: '/images/features/multilingual.png',
        highlights: [
          'Support for 50+ languages',
          'Automatic translation of common questions',
          'RTL language support for Arabic, Hebrew, and more',
          'Language detection for automatic preference'
        ]
      },
      {
        title: 'Templates Library',
        description: 'Start with pre-built templates designed by research experts for various use cases.',
        image: '/images/features/templates.png',
        highlights: [
          'Academic research templates',
          'Market research templates',
          'Customer satisfaction surveys',
          'Employee engagement surveys'
        ]
      }
    ]
  },
  {
    id: 'distribution',
    name: 'Distribution',
    description: 'Reach your target audience through multiple channels',
    features: [
      {
        title: 'Multi-Channel Distribution',
        description: 'Share your surveys through email, social media, QR codes, or embed them on your website.',
        image: '/images/features/distribution.png',
        highlights: [
          'Email campaign integration',
          'Social media sharing tools',
          'QR code generation',
          'Website embedding options'
        ]
      },
      {
        title: 'Participant Management',
        description: 'Manage your respondents and track their participation in your studies.',
        image: '/images/features/participant-management.png',
        highlights: [
          'Contact list management',
          'Participant tracking',
          'Automated reminders',
          'Response validation'
        ]
      },
      {
        title: 'Anonymous Surveys',
        description: 'Collect sensitive data anonymously while still maintaining data integrity.',
        image: '/images/features/anonymous.png',
        highlights: [
          'Anonymous response collection',
          'IP address masking',
          'Privacy compliance tools',
          'Confidentiality guarantees'
        ]
      }
    ]
  },
  {
    id: 'analysis',
    name: 'Analysis',
    description: 'Powerful tools to analyze and visualize your research data',
    features: [
      {
        title: 'Real-time Analytics',
        description: 'Monitor survey responses and analyze data as it comes in with real-time dashboards.',
        image: '/images/features/analytics.png',
        highlights: [
          'Live response tracking',
          'Interactive dashboards',
          'Custom data filters',
          'Automatic data visualization'
        ]
      },
      {
        title: 'Advanced Statistical Analysis',
        description: 'Perform complex statistical analyses to derive meaningful insights from your data.',
        image: '/images/features/statistics.png',
        highlights: [
          'Correlation analysis',
          'Regression models',
          'Significance testing',
          'Factor analysis'
        ]
      },
      {
        title: 'AI-Powered Insights',
        description: 'Let our AI analyze your qualitative data and identify patterns and insights.',
        image: '/images/features/ai-insights.png',
        highlights: [
          'Sentiment analysis',
          'Theme detection in open-ended responses',
          'Automated report generation',
          'Predictive analytics'
        ]
      }
    ]
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Work together with your team on research projects',
    features: [
      {
        title: 'Team Workspaces',
        description: 'Collaborate with your team in shared workspaces with customizable permissions.',
        image: '/images/features/collaboration.png',
        highlights: [
          'Role-based access control',
          'Shared survey libraries',
          'Collaborative editing',
          'Activity tracking'
        ]
      },
      {
        title: 'Commenting & Feedback',
        description: 'Leave comments and feedback on surveys for team members to review.',
        image: '/images/features/comments.png',
        highlights: [
          'Contextual comments',
          'Threaded discussions',
          'Feedback resolution tracking',
          'Email notifications'
        ]
      },
      {
        title: 'Version Control',
        description: 'Track changes to your surveys and revert to previous versions if needed.',
        image: '/images/features/version-control.png',
        highlights: [
          'Automatic versioning',
          'Change history',
          'Version comparison',
          'Rollback capabilities'
        ]
      }
    ]
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    description: 'Enterprise-grade security and compliance features',
    features: [
      {
        title: 'Data Security',
        description: 'Keep your research data safe with our enterprise-grade security measures.',
        image: '/images/features/security.png',
        highlights: [
          'End-to-end encryption',
          'SOC 2 compliance',
          'Regular security audits',
          'Data backup and recovery'
        ]
      },
      {
        title: 'GDPR & Privacy Compliance',
        description: 'Tools to help you comply with GDPR and other privacy regulations.',
        image: '/images/features/compliance.png',
        highlights: [
          'Data processing agreements',
          'Right to be forgotten tools',
          'Data export capabilities',
          'Consent management'
        ]
      },
      {
        title: 'Custom Security Policies',
        description: 'Set up custom security policies for your organization\'s specific needs.',
        image: '/images/features/custom-security.png',
        highlights: [
          'IP restrictions',
          'Two-factor authentication',
          'Single sign-on integration',
          'Custom data retention policies'
        ]
      }
    ]
  }
];

function FeatureSection({ feature }: { feature: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12">
      <div className={`order-2 md:order-1`}>
        <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
        <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
        <ul className="space-y-2 mb-6">
          {feature.highlights.map((highlight: string, i: number) => (
            <li key={i} className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-1" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative h-80 md:h-96 rounded-lg overflow-hidden order-1 md:order-2 shadow-md">
        <Image 
          src={feature.image} 
          alt={feature.title} 
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Research Features</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-muted-foreground mb-8">
            Explore the comprehensive toolkit that makes Afkar the leading platform for researchers worldwide
          </p>
          <Button asChild size="lg">
            <Link href="/signup">Start for Free</Link>
          </Button>
        </div>
      </section>
      
      {/* Features Tabs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={featureCategories[0].id} className="w-full">
            <TabsList className="flex justify-center mb-12 w-fit mx-auto">
              {featureCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {featureCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="focus-visible:outline-none focus-visible:ring-0">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">{category.name}</h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {category.description}
                  </p>
                </div>
                
                <div className="space-y-20">
                  {category.features.map((feature, index) => (
                    <FeatureSection key={index} feature={feature} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
      
      {/* Integration Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Integrations</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect Afkar with your favorite tools and platforms
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {['Google', 'Microsoft', 'Slack', 'Zoom', 'Salesforce', 'HubSpot', 'Mailchimp', 'Zapier', 'SPSS', 'Tableau', 'R', 'Python'].map((integration, index) => (
              <div key={index} className="bg-background rounded-lg p-6 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Image 
                  src={`/images/integrations/${integration.toLowerCase()}.svg`} 
                  alt={`${integration} integration`} 
                  width={80} 
                  height={40}
                  className="object-contain h-10"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-primary/5 rounded-lg p-8 md:p-12 text-center">
            <div className="mb-6">
              <Image 
                src="/images/testimonials/university-logo.svg" 
                alt="University Logo" 
                width={120} 
                height={60}
                className="mx-auto"
              />
            </div>
            <p className="text-[#666675] text-base">
              &ldquo;Afkar&apos;s research platform has transformed how we conduct user studies. The automated participant management and real-time analytics have saved us countless hours.&rdquo;
            </p>
            <div>
              <p className="font-semibold">Dr. Elizabeth Chen</p>
              <p className="text-muted-foreground">Research Director, Pacific University</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Research?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Join thousands of researchers worldwide who trust Afkar for their research needs. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo" className="flex items-center">
                Request Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 