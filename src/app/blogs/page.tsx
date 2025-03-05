'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';

// Blog post data
const blogPosts = [
  {
    id: 1,
    title: 'How to Design Effective Usability Tests',
    excerpt: 'Learn the key principles for designing usability tests that provide actionable insights for your product development.',
    category: 'usability',
    image: '/blog/usability-test.jpg',
    author: 'Sarah Johnson',
    date: '2023-10-15',
    readTime: '8 min read',
  },
  {
    id: 2,
    title: 'The Art of User Interviews: Best Practices',
    excerpt: 'Discover techniques for conducting user interviews that reveal deep insights about your users\' needs and behaviors.',
    category: 'interviews',
    image: '/blog/user-interview.jpg',
    author: 'Michael Chen',
    date: '2023-09-28',
    readTime: '12 min read',
  },
  {
    id: 3,
    title: 'Analyzing Qualitative Research Data',
    excerpt: 'A comprehensive guide to analyzing qualitative data from user research to identify patterns and insights.',
    category: 'research',
    image: '/blog/data-analysis.jpg',
    author: 'Emily Rodriguez',
    date: '2023-09-10',
    readTime: '10 min read',
  },
  {
    id: 4,
    title: 'Creating Surveys That Get Meaningful Responses',
    excerpt: 'Tips and strategies for designing surveys that yield high response rates and valuable data.',
    category: 'surveys',
    image: '/blog/survey-design.jpg',
    author: 'David Kim',
    date: '2023-08-22',
    readTime: '7 min read',
  },
  {
    id: 5,
    title: 'Remote User Testing: Tools and Techniques',
    excerpt: 'How to effectively conduct remote user testing sessions and overcome common challenges.',
    category: 'usability',
    image: '/blog/remote-testing.jpg',
    author: 'Olivia Martinez',
    date: '2023-08-05',
    readTime: '9 min read',
  },
  {
    id: 6,
    title: 'Integrating UX Research into Agile Development',
    excerpt: 'Strategies for incorporating user research into fast-paced agile development cycles.',
    category: 'research',
    image: '/blog/agile-ux.jpg',
    author: 'James Wilson',
    date: '2023-07-19',
    readTime: '11 min read',
  },
];

// Featured post
const featuredPost = {
  id: 7,
  title: 'The Future of UX Research: Trends to Watch in 2024',
  excerpt: 'Explore emerging trends in user experience research and how they will shape product development in the coming year.',
  category: 'trends',
  image: '/blog/future-ux.jpg',
  author: 'Dr. Amanda Lee',
  date: '2023-10-20',
  readTime: '15 min read',
};

// Categories
const categories = [
  { name: 'All', value: 'all' },
  { name: 'Usability Testing', value: 'usability' },
  { name: 'User Interviews', value: 'interviews' },
  { name: 'Research Methods', value: 'research' },
  { name: 'Surveys', value: 'surveys' },
  { name: 'Trends', value: 'trends' },
];

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Filter posts based on search query and active category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-12">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Afkar Blog</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Insights, tips, and best practices for UX research and product development
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10 py-6 rounded-lg w-full bg-white text-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Featured Article */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="lg:col-span-2 h-64 lg:h-auto relative">
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              {/* Placeholder for image - in production, use actual image */}
              {/* <Image 
                src={featuredPost.image} 
                alt={featuredPost.title}
                fill
                className="object-cover"
              /> */}
            </div>
            <div className="lg:col-span-3 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {featuredPost.category.charAt(0).toUpperCase() + featuredPost.category.slice(1)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">By {featuredPost.author}</div>
                  <Button asChild variant="ghost" className="text-primary">
                    <Link href={`/blogs/${featuredPost.id}`}>
                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories and Articles */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Latest Articles</h2>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList>
                {categories.map(category => (
                  <TabsTrigger key={category.value} value={category.value}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card key={post.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="h-48 relative">
                    <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    {/* Placeholder for image - in production, use actual image */}
                    {/* <Image 
                      src={post.image} 
                      alt={post.title}
                      fill
                      className="object-cover"
                    /> */}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-xs font-medium">By {post.author}</div>
                    <Button asChild variant="ghost" size="sm" className="text-primary">
                      <Link href={`/blogs/${post.id}`}>
                        Read More
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or category filters to find what you're looking for.
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Newsletter Signup */}
        <div className="mt-16 bg-primary/5 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Subscribe to Our Newsletter</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get the latest articles, research insights, and UX tips delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 