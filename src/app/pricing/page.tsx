import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const metadata = {
  title: 'Pricing | Afkar',
  description: 'Simple, transparent pricing plans for research of all sizes'
};

interface PricingFeature {
  name: string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
  tooltip?: string;
}

interface PlanProps {
  name: string;
  description: string;
  price: {
    monthly: string;
    yearly: string;
  };
  features: Array<boolean | string>;
  popular?: boolean;
  cta: {
    text: string;
    href: string;
  };
}

const pricingFeatures: PricingFeature[] = [
  {
    name: 'Survey responses per month',
    basic: '1,000',
    pro: '10,000',
    enterprise: 'Unlimited',
  },
  {
    name: 'Number of surveys',
    basic: '3',
    pro: '20',
    enterprise: 'Unlimited',
  },
  {
    name: 'Questions per survey',
    basic: '25',
    pro: '100',
    enterprise: 'Unlimited',
  },
  {
    name: 'Survey templates',
    basic: '5',
    pro: '20+',
    enterprise: 'All + Custom',
  },
  {
    name: 'Team members',
    basic: '1',
    pro: '5',
    enterprise: 'Unlimited',
    tooltip: 'Number of user accounts that can access and manage surveys'
  },
  {
    name: 'Data export formats',
    basic: 'CSV, Excel',
    pro: 'CSV, Excel, SPSS',
    enterprise: 'All formats',
  },
  {
    name: 'Basic analytics',
    basic: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Advanced analytics',
    basic: false,
    pro: true,
    enterprise: true,
    tooltip: 'Includes regression analysis, sentiment analysis, and advanced visualization'
  },
  {
    name: 'AI insights',
    basic: false,
    pro: true,
    enterprise: true,
    tooltip: 'AI-powered analysis that provides deeper insights from your data'
  },
  {
    name: 'White-label surveys',
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Custom branding',
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'API access',
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Priority support',
    basic: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Dedicated success manager',
    basic: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'SSO authentication',
    basic: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'Custom integrations',
    basic: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'On-premise deployment',
    basic: false,
    pro: false,
    enterprise: true,
  },
];

function PlanCard({ plan, features, billingCycle }: { plan: PlanProps; features: PricingFeature[]; billingCycle: 'monthly' | 'yearly' }) {
  return (
    <Card className={`flex flex-col ${plan.popular ? 'border-primary ring-1 ring-primary relative' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader className={`${plan.popular ? 'pt-8' : 'pt-6'} pb-6`}>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="mt-2">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <p className="text-4xl font-bold">{plan.price[billingCycle]}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {billingCycle === 'yearly' ? 'per year' : 'per month'}
          </p>
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, i) => {
            const value = plan.name === 'Basic' 
              ? feature.basic 
              : plan.name === 'Professional' 
                ? feature.pro 
                : feature.enterprise;
            
            return (
              <li key={i} className="flex items-start">
                {typeof value === 'boolean' ? (
                  value ? (
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0 mt-0.5" />
                  )
                ) : (
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">
                  {feature.name}
                  {feature.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 inline-block ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {typeof value === 'string' && `: ${value}`}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter className="pt-6 pb-8">
        <Button 
          asChild 
          variant={plan.popular ? 'default' : 'outline'} 
          className="w-full"
        >
          <Link href={plan.cta.href}>
            {plan.cta.text}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PricingPage() {
  const plans: PlanProps[] = [
    {
      name: 'Basic',
      description: 'Essential tools for small research projects',
      price: {
        monthly: '$49',
        yearly: '$490',
      },
      features: pricingFeatures.map(f => f.basic),
      cta: {
        text: 'Get Started',
        href: '/signup?plan=basic'
      }
    },
    {
      name: 'Professional',
      description: 'Advanced tools for research teams',
      price: {
        monthly: '$99',
        yearly: '$990',
      },
      features: pricingFeatures.map(f => f.pro),
      popular: true,
      cta: {
        text: 'Get Started',
        href: '/signup?plan=pro'
      }
    },
    {
      name: 'Enterprise',
      description: 'Complete solution for large organizations',
      price: {
        monthly: 'Contact us',
        yearly: 'Contact us',
      },
      features: pricingFeatures.map(f => f.enterprise),
      cta: {
        text: 'Contact Sales',
        href: '/contact'
      }
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that&apos;s right for your research needs. All plans include our core research platform.
        </p>
      </div>
      
      <Tabs defaultValue="monthly" className="w-full mb-12">
        <TabsList className="grid w-[400px] grid-cols-2 mx-auto">
          <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
          <TabsTrigger value="yearly">
            Yearly Billing
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PlanCard 
                key={index} 
                plan={plan} 
                features={pricingFeatures} 
                billingCycle="monthly" 
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="yearly" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PlanCard 
                key={index} 
                plan={plan} 
                features={pricingFeatures} 
                billingCycle="yearly" 
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
          <div className="text-left p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Can I change my plan later?</h3>
            <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.</p>
          </div>
          <div className="text-left p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Is there a free trial?</h3>
            <p className="text-muted-foreground">We offer a 14-day free trial on all plans. No credit card required to start your trial.</p>
          </div>
          <div className="text-left p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">What happens if I exceed my plan limits?</h3>
            <p className="text-muted-foreground">We&apos;ll notify you when you reach 80% of your plan limits. You can upgrade your plan or purchase additional responses.</p>
          </div>
          <div className="text-left p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Do you offer discounts for academic institutions?</h3>
            <p className="text-muted-foreground">Yes, we offer special pricing for educational and non-profit organizations. Contact our sales team for details.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-16 bg-primary/5 rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          We understand that research needs vary. Our team can work with you to create a custom solution that fits your specific requirements.
        </p>
        <Button asChild size="lg">
          <Link href="/contact">Contact Our Team</Link>
        </Button>
      </div>
      
      <p className="text-[#666675] text-base">
        Don&apos;t see what you&apos;re looking for? Let&apos;s discuss your needs.
      </p>
    </div>
  );
} 