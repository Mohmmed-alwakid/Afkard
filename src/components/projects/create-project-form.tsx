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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Define the form validation schema using Zod
const projectFormSchema = z.object({
  name: z.string().min(3, { message: 'Project name must be at least 3 characters' }),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived', 'deleted'], {
    required_error: 'Please select a project status',
  }),
  privacy: z.enum(['public', 'private'], {
    required_error: 'Please select privacy setting',
  }),
  allow_comments: z.boolean().default(true),
  require_approval: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Default form values
const defaultValues: Partial<ProjectFormValues> = {
  name: '',
  description: '',
  status: 'draft',
  privacy: 'private',
  allow_comments: true,
  require_approval: false,
};

interface CreateProjectFormProps {
  userId: string;
}

export function CreateProjectForm({ userId }: CreateProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Create form with validation
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  // Submit handler
  async function onSubmit(data: ProjectFormValues) {
    setIsSubmitting(true);

    try {
      // Format data for the database
      const projectData = {
        name: data.name,
        description: data.description || '',
        owner_id: userId,
        team_ids: [userId], // Owner is part of the team by default
        status: data.status,
        settings: {
          privacy: data.privacy,
          allow_comments: data.allow_comments,
          require_approval: data.require_approval,
        },
      };

      // Insert into Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Success notification
      toast({
        title: 'Project created!',
        description: 'Your project has been created successfully.',
      });

      // Redirect to the project details page
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error creating project',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Website Redesign Research" {...field} />
              </FormControl>
              <FormDescription>
                Choose a descriptive name for your research project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose of this project..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide context about the project for your team members
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Set the current status of this project
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Privacy Setting */}
          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Privacy Setting</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="private">Private (Team Only)</SelectItem>
                    <SelectItem value="public">Public (All Users)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Control who can see this project
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allow Comments */}
          <FormField
            control={form.control}
            name="allow_comments"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Allow Comments</FormLabel>
                  <FormDescription>
                    Enable commenting on studies within this project
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Require Approval */}
          <FormField
            control={form.control}
            name="require_approval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Require Approval</FormLabel>
                  <FormDescription>
                    Require admin approval for participants joining studies
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

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
            Create Project
          </Button>
        </div>
      </form>
    </Form>
  );
} 