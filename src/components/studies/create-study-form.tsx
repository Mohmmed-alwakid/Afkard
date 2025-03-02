'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Define the form validation schema using Zod
const studyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
  type: z.enum(['test', 'interview'], { 
    required_error: 'Please select a study type'
  }),
  project_id: z.string().uuid({ message: 'Please select a project' }),
  target_participants: z.coerce.number().min(1, { message: 'At least 1 participant required' }),
  reward_amount: z.coerce.number().min(0),
  estimated_duration: z.coerce.number().min(5, { message: 'Duration must be at least 5 minutes' }),
  auto_approve: z.boolean().default(false),
});

type StudyFormValues = z.infer<typeof studyFormSchema>;

// Default form values
const defaultValues: Partial<StudyFormValues> = {
  title: '',
  description: '',
  type: 'test',
  target_participants: 10,
  reward_amount: 0,
  estimated_duration: 15,
  auto_approve: false,
};

interface Project {
  id: string;
  name: string;
}

interface CreateStudyFormProps {
  userId: string;
  projects: Project[];
}

export function CreateStudyForm({ userId, projects }: CreateStudyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Create form with validation
  const form = useForm<StudyFormValues>({
    resolver: zodResolver(studyFormSchema),
    defaultValues,
  });

  // Submit handler
  async function onSubmit(data: StudyFormValues) {
    if (projects.length === 0) {
      toast({
        title: 'No projects available',
        description: 'Please create a project first before creating a study.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format data for the database
      const studyData = {
        project_id: data.project_id,
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'draft',
        target_audience: {
          criteria: {}
        },
        settings: {
          max_participants: data.target_participants,
          reward_amount: data.reward_amount,
          estimated_duration: data.estimated_duration,
          auto_approve: data.auto_approve
        }
      };

      // Insert into Supabase
      const { data: study, error } = await supabase
        .from('studies')
        .insert(studyData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Success notification
      toast({
        title: 'Study created!',
        description: 'Your study has been created successfully.',
      });

      // Redirect to the study details page
      router.push(`/studies/${study.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating study:', error);
      toast({
        title: 'Error creating study',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle project creation if no projects exist
  const handleCreateProject = () => {
    router.push('/projects/new');
  };

  if (projects.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-2">Create a project first</h3>
        <p className="text-[#666675] text-base">
          Let&apos;s design your research study together.
        </p>
        <p className="text-[#666675] text-base">
          We&apos;ll help you create an effective study.
        </p>
        <Button onClick={handleCreateProject}>
          Create Your First Project
        </Button>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Selection */}
        <FormField
          control={form.control}
          name="project_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Study Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Website Usability Testing" {...field} />
              </FormControl>
              <FormDescription>
                Give your study a clear, descriptive title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Study Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what participants will be doing in this study"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about the study and what you&apos;re looking to learn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Study Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a study type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="test">Usability Test</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The type of research you&apos;ll be conducting
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Participants */}
          <FormField
            control={form.control}
            name="target_participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Participants</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormDescription>
                  Number of participants needed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reward Amount */}
          <FormField
            control={form.control}
            name="reward_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward (USD)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} {...field} />
                </FormControl>
                <FormDescription>
                  Compensation per participant
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estimated Duration */}
          <FormField
            control={form.control}
            name="estimated_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={5} {...field} />
                </FormControl>
                <FormDescription>
                  Estimated time commitment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Auto Approve */}
        <FormField
          control={form.control}
          name="auto_approve"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Auto-approve participants</FormLabel>
                <FormDescription>
                  Automatically approve participants who sign up for this study
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Study
          </Button>
        </div>
      </form>
    </Form>
  );
} 