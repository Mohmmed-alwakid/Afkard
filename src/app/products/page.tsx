import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Products | Afkar',
  description: 'Explore our range of research and survey products to accelerate your research journey',
};

interface ProductCardProps {
  title: string;
  description: string;
  image: string;
  features: string[];
  popular?: boolean;
  price: string;
  href: string;
}

function ProductCard({ title, description, image, features, popular, price, href }: ProductCardProps) {
  return (
    <Card className={`flex flex-col ${popular ? 'border-primary ring-1 ring-primary' : ''} h-full transition-all hover:shadow-md`}>
      {popular && (
        <div className="absolute -top-3 right-6">
          <Badge variant="default" className="bg-primary">Most Popular</Badge>
        </div>
      )}
      <CardHeader className="p-6">
        <div className="mb-4 h-40 relative w-full">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-contain" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-2xl font-bold mb-6">{price}</p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={href}>Get Started</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ProductsPage() {
  const products = [
    {
      title: 'Basic Research Package',
      description: 'Essential tools for academic and small-scale research',
      image: '/images/products/basic-research.png',
      features: [
        'Up to 1,000 responses per survey',
        'Basic analysis and visualization',
        'Email support',
        '3 survey templates',
        'Export to CSV, Excel'
      ],
      price: '$49/month',
      href: '/products/basic',
      popular: false
    },
    {
      title: 'Professional Research Suite',
      description: 'Advanced tools for professional researchers and organizations',
      image: '/images/products/pro-research.png',
      features: [
        'Unlimited responses',
        'Advanced analysis with AI insights',
        'Priority support',
        '20+ survey templates',
        'Custom branding',
        'Multiple export formats',
        'Team collaboration'
      ],
      price: '$99/month',
      href: '/products/professional',
      popular: true
    },
    {
      title: 'Enterprise Solution',
      description: 'Complete research ecosystem for large organizations',
      image: '/images/products/enterprise.png',
      features: [
        'Unlimited everything',
        'Dedicated success manager',
        'Custom integrations',
        'Advanced security features',
        'On-premise deployment option',
        'SLA guarantees',
        'Advanced analytics dashboard'
      ],
      price: 'Contact for pricing',
      href: '/products/enterprise',
      popular: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Research Products Suite</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Powerful tools to design, distribute, and analyze research surveys with advanced insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>

      <div className="mt-24 bg-muted/50 rounded-lg p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Need a custom solution?</h2>
            <p className="text-lg mb-8">
              Our team of research experts can help you design a custom solution that fits your specific needs and budget.
            </p>
            <Button asChild>
              <Link href="/contact" className="inline-flex items-center">
                Contact our team <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative h-80">
            <Image 
              src="/images/products/custom-solution.png"
              alt="Custom Research Solutions" 
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 