'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useProjectStore } from '@/store/project-store';
import { ArrowLeft, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Form schema with zod
const formSchema = z.object({
  name: z.string().min(3, { message: 'Project name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500, { message: 'Description must be less than 500 characters.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  goal: z.string().min(5, { message: 'Goal must be at least 5 characters.' }).max(200, { message: 'Goal must be less than 200 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addProject } = useProjectStore();
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      goal: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create new project
      const newProject = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        category: data.category,
        goal: data.goal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studies: [],
      };
      
      // Add project to store
      addProject(newProject);
      
      // Navigate to projects page
      router.push('/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-3xl py-8 px-4 md:px-6">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Project</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Provide information about your research project.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Website Usability Study" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your project a clear, descriptive name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose and scope of your project..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about what this project aims to research or discover.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="usability">Usability Testing</SelectItem>
                          <SelectItem value="ux-research">UX Research</SelectItem>
                          <SelectItem value="market-research">Market Research</SelectItem>
                          <SelectItem value="feedback">Product Feedback</SelectItem>
                          <SelectItem value="survey">Survey Research</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the research category for your project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Research Goal</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Identify usability issues" {...field} />
                      </FormControl>
                      <FormDescription>
                        What do you hope to achieve with this research?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Creating Project...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 