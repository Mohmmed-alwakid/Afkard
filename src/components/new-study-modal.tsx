"use client"

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
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
import { Button } from '@/components/ui/button';
import { StudyType } from '@/store/project-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, BarChart } from 'lucide-react';

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  type: z.enum(['test', 'interview', 'survey'] as const, {
    required_error: 'Please select a study type.',
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewStudyModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudyCreate: (projectId: string, study: FormValues) => void;
}

export function NewStudyModal({
  projectId,
  open,
  onOpenChange,
  onStudyCreate,
}: NewStudyModalProps) {
  const [activeTab, setActiveTab] = useState<StudyType>('test');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: activeTab,
      description: '',
    },
  });
  
  // Update form value when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as StudyType);
    form.setValue('type', value as StudyType);
  };
  
  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Call the provided callback to create the study
      onStudyCreate(projectId, data);
      
      // Reset form and close modal
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create study:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Study</DialogTitle>
          <DialogDescription>
            Add a new study to your research project.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Study Type Selection Tabs */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Type</FormLabel>
                  <Tabs 
                    defaultValue="test" 
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="test" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Usability Test</span>
                      </TabsTrigger>
                      <TabsTrigger value="interview" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Interview</span>
                      </TabsTrigger>
                      <TabsTrigger value="survey" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        <span>Survey</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="test" className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Create a usability test to observe how users interact with your product or prototype.
                      </p>
                    </TabsContent>
                    <TabsContent value="interview" className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Conduct in-depth interviews to gather qualitative feedback and insights.
                      </p>
                    </TabsContent>
                    <TabsContent value="survey" className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Create surveys to collect quantitative data from a larger audience.
                      </p>
                    </TabsContent>
                  </Tabs>
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
                    <Input placeholder="Enter a title for your study" {...field} />
                  </FormControl>
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the study" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Study'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 