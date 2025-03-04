'use client';

import React, { useState } from 'react';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { AudiencePreview } from './audience-preview';
import { 
  targetAudienceSchema, 
  getActiveFiltersCount, 
  formatAudienceCriteriaForStorage,
  SAUDI_REGIONS,
  OCCUPATION_SECTORS
} from '@/utils/audience-utils';
import { apiService } from '@/lib/api-services';
import { StudyTypeSelection } from './study-steps/study-type-selection';
import { StudyBasicInfo } from './study-steps/study-basic-info';
import { StudyAudience } from './study-steps/study-audience';
import { StudyTestPlan } from './study-steps/study-test-plan';
import { StudyPreview } from './study-steps/study-preview';

// Define the schema for study creation
export const studySchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  project_id: z.string().min(1, { message: 'Please select a project' }),
  owner_id: z.string(),
  status: z.enum(['draft', 'active', 'completed']).default('draft'),
  study_type: z.enum(['survey', 'usability_test', 'interview']),
  use_template: z.boolean().default(false),
  template_id: z.string().optional(),
  audience: z.object({
    participant_count: z.number().min(1),
    devices: z.array(z.enum(['desktop', 'mobile', 'tablet'])),
    demographic_filters: z.object({
      age_range: z.array(z.string()).optional(),
      gender: z.array(z.string()).optional(),
      countries: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      employment_status: z.array(z.string()).optional(),
      job_level: z.array(z.string()).optional(),
    }).optional(),
    screener_questions: z.array(
      z.object({
        question: z.string(),
        answer_type: z.enum(['text', 'multiple_choice', 'yes_no']),
        options: z.array(z.string()).optional(),
        required_answer: z.string().optional(),
      })
    ).optional(),
  }),
  test_plan: z.object({
    blocks: z.array(
      z.object({
        id: z.string(),
        type: z.enum([
          'welcome', 
          'open_question', 
          'simple_input', 
          'opinion_scale', 
          'multiple_choice', 
          'yes_no', 
          'five_second_test'
        ]),
        title: z.string(),
        content: z.any(), // This will be different for each block type
      })
    ),
  }),
});

export type StudyFormData = z.infer<typeof studySchema>;

interface CreateStudyFormProps {
  userId: string;
  userProjects: { id: string; title: string }[];
}

export function CreateStudyForm({ userId, userProjects }: CreateStudyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Initialize form with default values
  const [formData, setFormData] = useState<StudyFormData>({
    title: '',
    description: '',
    project_id: '',
    owner_id: userId,
    status: 'draft',
    study_type: 'survey',
    use_template: false,
    audience: {
      participant_count: 10,
      devices: ['desktop'],
      demographic_filters: {
        age_range: [],
        gender: [],
        countries: [],
        languages: [],
        employment_status: [],
        job_level: [],
      },
      screener_questions: [],
    },
    test_plan: {
      blocks: [],
    },
  });

  const steps = [
    { name: 'Type', component: StudyTypeSelection },
    { name: 'Basic Info', component: StudyBasicInfo },
    { name: 'Audience', component: StudyAudience },
    { name: 'Test Plan', component: StudyTestPlan },
    { name: 'Preview', component: StudyPreview },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (newData: Partial<StudyFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Create study in the database
      const result = await apiService.createStudy({
        title: formData.title,
        description: formData.description,
        project_id: formData.project_id,
        owner_id: formData.owner_id,
        status: 'draft',
        // Add additional fields as needed
        // These would be added to your Study type in the database
        type: formData.study_type,
        // The audience and test plan data would need to be stored in related tables
        // or as JSON in the study record
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }

      // Navigate to the study detail page
      router.push(`/studies/${result.data?.id}`);
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error creating study:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Study</CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Progress indicator */}
          <div className="mb-8">
            <Tabs value={steps[currentStep].name.toLowerCase()} className="w-full">
              <TabsList className="w-full grid grid-cols-5">
                {steps.map((step, index) => (
                  <TabsTrigger
                    key={index}
                    value={step.name.toLowerCase()}
                    disabled={index !== currentStep}
                    className={index <= currentStep ? 'text-primary' : 'text-muted-foreground'}
                  >
                    {index + 1}. {step.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={steps[currentStep].name.toLowerCase()} className="mt-6">
                <CurrentStepComponent 
                  formData={formData} 
                  updateFormData={updateFormData} 
                  userProjects={userProjects}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {formError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
              {formError}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 0 || isSubmitting}
          >
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-primary text-white"
            >
              {isSubmitting ? 'Creating Study...' : 'Create Study'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={isSubmitting}
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 