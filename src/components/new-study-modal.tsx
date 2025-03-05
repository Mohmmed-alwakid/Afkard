"use client"

import { useState, useEffect } from 'react';
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
  FormDescription,
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
import { Button } from '@/components/ui/button';
import { useProjectStore, StudyType } from '@/store/project-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, BarChart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  type: z.enum(['test', 'interview', 'survey'] as const, {
    required_error: 'Please select a study type.',
  }),
  description: z.string().optional(),
  goal: z.string().optional(),
  targetParticipants: z.coerce.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewStudyModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudyCreate: (projectId: string, study: FormValues) => void;
  initialType?: StudyType;
}

// Study type configurations
const studyTypeConfig = {
  test: {
    icon: <Users className="h-4 w-4" />,
    label: 'Usability Test',
    description: 'Create a usability test to observe how users interact with your product or prototype.',
    goalPlaceholder: 'e.g., Identify usability issues in the checkout flow',
  },
  interview: {
    icon: <FileText className="h-4 w-4" />,
    label: 'User Interview',
    description: 'Conduct in-depth interviews to gather qualitative feedback and insights.',
    goalPlaceholder: 'e.g., Understand user pain points in the onboarding process',
  },
  survey: {
    icon: <BarChart className="h-4 w-4" />,
    label: 'Survey',
    description: 'Create surveys to collect quantitative data from a larger audience.',
    goalPlaceholder: 'e.g., Measure user satisfaction with the new features',
  },
};

export function NewStudyModal({
  projectId,
  open,
  onOpenChange,
  onStudyCreate,
  initialType = 'test',
}: NewStudyModalProps) {
  const [activeTab, setActiveTab] = useState<StudyType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addStudy } = useProjectStore();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: initialType,
      description: '',
      goal: '',
      targetParticipants: 5,
    },
  });
  
  // Update form when initialType changes
  useEffect(() => {
    if (initialType) {
      setActiveTab(initialType);
      form.setValue('type', initialType);
    }
  }, [initialType, form]);
  
  // Update form value when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as StudyType);
    form.setValue('type', value as StudyType);
  };
  
  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create the study in the store
      addStudy(projectId, {
        type: data.type,
        title: data.title,
        description: data.description,
        goal: data.goal,
        status: 'draft',
        targetParticipants: data.targetParticipants,
      });
      
      // Call the provided callback
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Study</DialogTitle>
          <DialogDescription>
            Add a new study to your research project
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
                    defaultValue={initialType} 
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      {Object.entries(studyTypeConfig).map(([type, config]) => (
                        <TabsTrigger 
                          key={type} 
                          value={type} 
                          className="flex items-center gap-2"
                        >
                          {config.icon}
                          <span>{config.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.entries(studyTypeConfig).map(([type, config]) => (
                      <TabsContent key={type} value={type} className="pt-4">
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </TabsContent>
                    ))}
                  </Tabs>
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
                    <Input 
                      placeholder={`Enter a title for your ${studyTypeConfig[activeTab].label.toLowerCase()}`} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A clear title will help you and participants understand what this study is about
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Study Goal */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Goal (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={studyTypeConfig[activeTab].goalPlaceholder} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    What do you want to learn from this research?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Target Participants */}
            <FormField
              control={form.control}
              name="targetParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Participants</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      placeholder="5" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    How many participants are you targeting for this study?
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the study objectives and methodology" 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Alert variant="info" className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                You'll be able to customize your {activeTab === 'test' ? 'test' : activeTab === 'interview' ? 'interview' : 'survey'} after creating it.
              </AlertDescription>
            </Alert>
            
            <DialogFooter className="flex gap-2 items-center justify-end pt-2">
              <Button
                type="button"
                variant="outline"
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