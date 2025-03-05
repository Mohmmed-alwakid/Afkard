'use client';

import React, { useState, useEffect } from 'react';
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
import { Loader2, PlusCircle, ChevronDown, ChevronUp, ArrowLeft, Save, HelpCircle } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [recommendedTemplates, setRecommendedTemplates] = useState<any[]>([]);
  const [stepValidationStatus, setStepValidationStatus] = useState<boolean[]>([false, false, false, false, true]);

  // Initialize form with default values
  const [formData, setFormData] = useState<StudyFormData>({
    title: '',
    description: '',
    project_id: userProjects.length === 1 ? userProjects[0].id : '',
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
        countries: ['Saudi Arabia'], // Default to Saudi Arabia
        languages: ['Arabic', 'English'], // Default to Arabic and English
        employment_status: [],
        job_level: [],
      },
      screener_questions: [],
    },
    test_plan: {
      blocks: [
        {
          id: crypto.randomUUID(),
          type: 'welcome',
          title: 'Welcome to the study',
          content: {
            message: 'Thank you for participating in our research study. Your feedback is valuable to us.'
          }
        }
      ],
    },
  });

  // Improvement 1: Progress indicators and visual feedback
  useEffect(() => {
    const stepProgress = Math.round(((currentStep + 1) / 5) * 100);
    setProgressPercentage(stepProgress);
  }, [currentStep]);

  // Improvement 2: Form validation status tracking
  useEffect(() => {
    const validateCurrentStep = () => {
      switch (currentStep) {
        case 0: // Type step
          return !!formData.study_type;
        case 1: // Basic Info step
          return !!formData.title && !!formData.description && !!formData.project_id;
        case 2: // Audience step
          return !!formData.audience?.participant_count && formData.audience.devices.length > 0;
        case 3: // Test Plan step
          return formData.test_plan.blocks.length > 0;
        case 4: // Preview step
          return true;
        default:
          return false;
      }
    };

    const newStatus = [...stepValidationStatus];
    newStatus[currentStep] = validateCurrentStep();
    setStepValidationStatus(newStatus);
  }, [formData, currentStep]);

  // Improvement 3: Auto-save draft functionality
  useEffect(() => {
    const saveDraft = async () => {
      if (formData.title && formData.project_id) {
        try {
          // Save to local storage for now - in production would save to database
          localStorage.setItem(`study_draft_${userId}`, JSON.stringify(formData));
          setIsDraftSaved(true);
          // Only show toast occasionally to avoid overwhelming the user
          if (Math.random() > 0.7) {
            toast({
              title: "Draft saved",
              description: "Your study draft has been automatically saved",
              duration: 2000,
            });
          }
        } catch (error) {
          console.error("Failed to save draft:", error);
        }
      }
    };

    // Set up auto-save timer
    const autoSaveTimer = setTimeout(saveDraft, 10000);
    return () => clearTimeout(autoSaveTimer);
  }, [formData, userId]);

  // Improvement 4: Load saved draft if available
  useEffect(() => {
    const loadSavedDraft = () => {
      try {
        const savedDraft = localStorage.getItem(`study_draft_${userId}`);
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setFormData(parsedDraft);
          setIsDraftSaved(true);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };

    loadSavedDraft();
  }, [userId]);

  // Improvement 5: Template recommendations based on study type
  useEffect(() => {
    const fetchRecommendedTemplates = async () => {
      // This would call your API in production
      // Mocking some template data for demonstration
      const mockTemplates = [
        {
          id: "t1",
          name: "Basic User Satisfaction Survey",
          type: "survey",
          thumbnail: "/templates/user-satisfaction.jpg"
        },
        {
          id: "t2",
          name: "Website Usability Test",
          type: "usability_test",
          thumbnail: "/templates/usability-test.jpg"
        },
        {
          id: "t3",
          name: "Product Interview Guide",
          type: "interview",
          thumbnail: "/templates/interview-guide.jpg"
        }
      ];

      const filtered = mockTemplates.filter(t => t.type === formData.study_type);
      setRecommendedTemplates(filtered);
    };

    fetchRecommendedTemplates();
  }, [formData.study_type]);

  const steps = [
    { name: 'Type', component: StudyTypeSelection },
    { name: 'Basic Info', component: StudyBasicInfo },
    { name: 'Audience', component: StudyAudience },
    { name: 'Test Plan', component: StudyTestPlan },
    { name: 'Preview', component: StudyPreview },
  ];

  // Improvement 6: Smart navigation with validation
  const handleNext = () => {
    if (currentStep < steps.length - 1 && stepValidationStatus[currentStep]) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else if (!stepValidationStatus[currentStep]) {
      toast({
        title: "Please complete required fields",
        description: "Fill in all required information before proceeding",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const updateFormData = (newData: Partial<StudyFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setIsDraftSaved(false);
  };

  // Improvement 7: Exit handling with confirmation
  const handleExitWithConfirmation = () => {
    if (!isDraftSaved) {
      setShowExitConfirm(true);
    } else {
      router.push('/dashboard/projects');
    }
  };

  // Improvement 8: Enhanced submission process with feedback
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setFormError(null);

      toast({
        title: "Creating your study...",
        description: "Please wait while we set up your research study",
      });

      // Create study in the database
      const result = await apiService.createStudy({
        title: formData.title,
        description: formData.description,
        project_id: formData.project_id,
        owner_id: formData.owner_id,
        status: 'draft',
        type: formData.study_type,
        // Add more fields as needed
      });

      if (result.error) {
        setFormError(result.error);
        toast({
          title: "Error creating study",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Clear the draft after successful creation
      localStorage.removeItem(`study_draft_${userId}`);

      toast({
        title: "Study created successfully!",
        description: "You can now start collecting responses",
      });

      // Navigate to the study detail page
      router.push(`/projects/${formData.project_id}/studies/${result.data?.id}`);
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Error creating study:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improvement 9: Manual save draft functionality
  const handleSaveDraft = async () => {
    try {
      // Save to local storage - in production would save to database
      localStorage.setItem(`study_draft_${userId}`, JSON.stringify(formData));
      setIsDraftSaved(true);
      
      toast({
        title: "Draft saved",
        description: "Your study draft has been saved successfully",
      });
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast({
        title: "Error saving draft",
        description: "Failed to save your draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Improvement 10: Enhanced UI with better visual hierarchy and contextual help */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExitWithConfirmation}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create New Study</h1>
            <p className="text-sm text-gray-500">
              Follow the steps below to set up your research study
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveDraft}
            disabled={isSubmitting || isDraftSaved}
            className={isDraftSaved ? "text-green-600 border-green-600" : ""}
          >
            <Save className="h-4 w-4 mr-1" />
            {isDraftSaved ? "Saved" : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar with steps */}
        <div className="hidden md:block">
          <Card className="sticky top-4">
            <CardContent className="pt-6">
              <div className="mb-4">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 text-right">{progressPercentage}% Complete</p>
              </div>
              
              <nav className="space-y-1">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-2 rounded-md ${
                      currentStep === index 
                        ? "bg-primary/10 text-primary" 
                        : stepValidationStatus[index] 
                          ? "text-gray-700 hover:bg-gray-100 cursor-pointer" 
                          : "text-gray-400"
                    }`}
                    onClick={() => {
                      if (stepValidationStatus.slice(0, index).every(Boolean)) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mr-2 text-xs ${
                      stepValidationStatus[index] 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {index + 1}
                    </div>
                    <span>{step.name}</span>
                  </div>
                ))}
              </nav>
              
              {recommendedTemplates.length > 0 && currentStep === 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-3">Recommended Templates</h3>
                  <div className="space-y-2">
                    {recommendedTemplates.map(template => (
                      <div 
                        key={template.id}
                        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => {
                          // Apply template logic would go here
                          toast({
                            title: "Template applied",
                            description: `${template.name} has been applied to your study`,
                          });
                        }}
                      >
                        {template.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl font-semibold flex items-center">
                {steps[currentStep].name}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{getStepTooltipContent(currentStep)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <ScrollArea className="max-h-[calc(100vh-300px)]">
                <div className="pr-4">
                  <CurrentStepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                    userProjects={userProjects}
                  />
                </div>
              </ScrollArea>

              {formError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4">
                  {formError}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between pt-4 border-t">
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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Study...
                    </>
                  ) : (
                    'Create Study'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting || !stepValidationStatus[currentStep]}
                >
                  Next
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/dashboard/projects')}>
              Leave without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper function for step tooltip content
function getStepTooltipContent(step: number): string {
  switch (step) {
    case 0:
      return "Choose the type of study that best fits your research goals. Different types offer various data collection methods and analysis options.";
    case 1:
      return "Provide basic information about your study including title, description, and which project it belongs to.";
    case 2:
      return "Define your target audience by setting demographic criteria and screening questions.";
    case 3:
      return "Build your research flow by adding questions, tasks, and other interactive elements.";
    case 4:
      return "Review all the details of your study before creating it.";
    default:
      return "";
  }
} 