import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BookOpen, Video, FileText, Download, CalendarDays, ArrowRight, Search } from 'lucide-react';

export const metadata = {
  title: 'Resources | Afkar',
  description: 'Research guides, articles, webinars, and resources to enhance your research capabilities'
};

interface Resource {
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  author?: string;
  duration?: string;
  type: 'guide' | 'webinar' | 'article' | 'template' | 'event';
  href: string;
}

const resources: Resource[] = [
  {
    title: 'Creating Effective Survey Questions',
    description: 'Learn how to design unbiased, clear questions that yield valuable insights.',
    image: '/images/resources/survey-questions.jpg',
    category: 'Methodology',
    date: 'Jan 15, 2024',
    author: 'Dr. Sarah Chen',
    type: 'guide',
    href: '/resources/guides/effective-survey-questions'
  },
  {
    title: 'Statistical Analysis for Beginners',
    description: 'A comprehensive introduction to statistical concepts for research analysis.',
    image: '/images/resources/statistical-analysis.jpg',
    category: 'Analytics',
    date: 'Feb 3, 2024',
    author: 'Prof. Michael Torres',
    type: 'guide',
    href: '/resources/guides/statistical-analysis-beginners'
  },
  {
    title: 'Research Ethics in the Digital Age',
    description: 'Navigating ethical considerations when conducting online research studies.',
    image: '/images/resources/research-ethics.jpg',
    category: 'Ethics',
    date: 'Mar 12, 2024', 
    duration: '45 minutes',
    type: 'webinar',
    href: '/resources/webinars/research-ethics-digital-age'
  },
  {
    title: 'Data Visualization Techniques',
    description: 'Best practices for presenting research data in clear, compelling visualizations.',
    image: '/images/resources/data-visualization.jpg',
    category: 'Visualization',
    date: 'Feb 28, 2024',
    duration: '60 minutes',
    type: 'webinar',
    href: '/resources/webinars/data-visualization-techniques'
  },
  {
    title: 'The Future of AI in Academic Research',
    description: 'How artificial intelligence is transforming research methodologies.',
    image: '/images/resources/ai-research.jpg',
    category: 'Technology',
    date: 'Mar 5, 2024',
    author: 'Elena Rodriguez, PhD',
    type: 'article',
    href: '/resources/articles/ai-academic-research'
  },
  {
    title: 'Longitudinal Studies: Design and Analysis',
    description: 'Strategies for designing and analyzing long-term research studies.',
    image: '/images/resources/longitudinal-studies.jpg',
    category: 'Methodology',
    date: 'Jan 29, 2024',
    author: 'Dr. James Wilson',
    type: 'article',
    href: '/resources/articles/longitudinal-studies'
  },
  {
    title: 'Academic Research Survey Template',
    description: 'Pre-built survey template designed for academic research projects.',
    image: '/images/resources/survey-template.jpg',
    category: 'Templates',
    date: 'Dec 12, 2023',
    type: 'template',
    href: '/resources/templates/academic-research-survey'
  },
  {
    title: 'Customer Satisfaction Questionnaire',
    description: 'Validated template for measuring customer satisfaction and experience.',
    image: '/images/resources/customer-satisfaction.jpg',
    category: 'Templates',
    date: 'Feb 15, 2024',
    type: 'template',
    href: '/resources/templates/customer-satisfaction'
  },
  {
    title: 'Annual Research Symposium 2024',
    description: 'Join leading researchers for presentations on cutting-edge methodologies.',
    image: '/images/resources/symposium.jpg',
    category: 'Conference',
    date: 'May 18-20, 2024',
    type: 'event',
    href: '/resources/events/symposium-2024'
  },
  {
    title: 'Research Methods Workshop Series',
    description: 'Hands-on workshops covering qualitative and quantitative research methods.',
    image: '/images/resources/workshop.jpg',
    category: 'Workshop',
    date: 'Every Tuesday, April 2024',
    type: 'event',
    href: '/resources/events/methods-workshop'
  }
];

function ResourceCard({ resource }: { resource: Resource }) {
  const getIcon = () => {
    switch (resource.type) {
      case 'guide':
        return <BookOpen className="h-5 w-5" />;
      case 'webinar':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'template':
        return <Download className="h-5 w-5" />;
      case 'event':
        return <CalendarDays className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-md transition-all duration-200">
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={resource.image} 
          alt={resource.title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-medium text-primary">
          {resource.category}
        </div>
      </div>
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <div className="flex items-center mr-3">
            {getIcon()}
            <span className="ml-1 capitalize">{resource.type}</span>
          </div>
          <span>{resource.date}</span>
        </div>
        <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-grow">
        <CardDescription className="line-clamp-3 mb-2">
          {resource.description}
        </CardDescription>
        {resource.author && <p className="text-sm text-muted-foreground">By {resource.author}</p>}
        {resource.duration && <p className="text-sm text-muted-foreground">Duration: {resource.duration}</p>}
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button asChild variant="ghost" className="p-0 h-auto font-medium">
          <Link href={resource.href} className="flex items-center text-primary">
            Read more <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ResourcesPage() {
  const resourceTypes = ['all', 'guides', 'webinars', 'articles', 'templates', 'events'];
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Research Resources</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Guides, articles, webinars, and resources to enhance your research capabilities
        </p>
        
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search resources..." 
            className="pl-10 h-12"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex justify-center mb-12 w-fit mx-auto">
          {resourceTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="capitalize">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {resourceTypes.map((tabType) => (
          <TabsContent key={tabType} value={tabType}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources
                .filter(resource => 
                  tabType === 'all' || resource.type === tabType.slice(0, -1) // Remove plural 's'
                )
                .map((resource, index) => (
                  <ResourceCard key={index} resource={resource} />
                ))
              }
            </div>
            
            {/* Show this message if no resources match the selected filter */}
            {resources.filter(r => 
              tabType === 'all' || r.type === tabType.slice(0, -1)
            ).length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No resources available in this category yet.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-24 bg-muted/30 rounded-lg p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-lg mb-6">
              Get the latest research tips, methodologies, and resources delivered straight to your inbox.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="your@email.com" 
                className="max-w-xs"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
          <div className="relative h-64 hidden md:block">
            <Image 
              src="/images/resources/newsletter.png" 
              alt="Research Newsletter" 
              fill
              className="object-contain"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 