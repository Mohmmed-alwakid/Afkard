'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Search, BookOpen, FileText, PlayCircle, MessageSquare } from 'lucide-react';

// FAQ data
const faqItems = [
  {
    question: 'How do I create my first research project?',
    answer: 'To create your first research project, navigate to the Projects page and click on the "New Project" button. Fill in the required details such as project name, description, and category, then click "Create Project". Once created, you can add studies to your project.'
  },
  {
    question: 'What types of studies can I create?',
    answer: 'Afkar supports three main types of studies: Usability Tests for observing how users interact with your product, Interviews for gathering in-depth qualitative feedback, and Surveys for collecting quantitative data from a larger audience.'
  },
  {
    question: 'How do I invite participants to my study?',
    answer: 'After creating a study, go to the study details page and click on the "Participants" tab. From there, you can add participants manually by entering their email addresses, or generate a shareable link that you can distribute to potential participants.'
  },
  {
    question: 'Can I customize the appearance of my studies?',
    answer: 'Yes, you can customize various aspects of your studies including colors, logos, and welcome/thank you messages. These customization options are available in the study settings page under the "Appearance" tab.'
  },
  {
    question: 'How do I analyze the results of my study?',
    answer: 'Once your study has collected responses, you can view and analyze the results in the "Results" tab of your study. Afkar provides various visualization options including charts, heatmaps, and raw data exports depending on the type of study.'
  },
  {
    question: 'Is there a limit to how many participants I can have?',
    answer: 'The number of participants you can have depends on your subscription plan. Free plans typically have a limit, while paid plans offer higher or unlimited participant counts. You can view your current limits in your account settings.'
  },
];

// Resource cards data
const resourceCards = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of Afkar and set up your first research project',
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    link: '/docs/getting-started'
  },
  {
    title: 'User Guides',
    description: 'Detailed documentation on all features and functionalities',
    icon: <FileText className="h-8 w-8 text-primary" />,
    link: '/docs/user-guides'
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides for using Afkar effectively',
    icon: <PlayCircle className="h-8 w-8 text-primary" />,
    link: '/tutorials'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other researchers and share best practices',
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    link: '/community'
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-12">
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Browse our guides, tutorials and knowledge base to get the most out of Afkar
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              className="pl-10 py-6 rounded-lg w-full bg-white text-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="mx-auto mb-8 flex justify-center">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="support">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="space-y-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Helpful Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resourceCards.map((card, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="mb-2">{card.icon}</div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="ghost" className="w-full justify-start pl-0 text-primary">
                      <Link href={card.link}>
                        Learn more
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <h3 className="text-xl font-semibold mb-4">Need more resources?</h3>
              <p className="text-gray-600 mb-6">
                Check out our comprehensive documentation for detailed information on all features.
              </p>
              <Button asChild>
                <Link href="/docs">
                  Browse Documentation
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Contact Our Support Team</h2>
                <p className="text-gray-600">
                  Can't find what you're looking for? Our support team is here to help you.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input id="email" type="email" placeholder="your.email@example.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <textarea
                        id="message"
                        placeholder="Describe your issue in detail..."
                        className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Typical response time: Within 24 hours
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 