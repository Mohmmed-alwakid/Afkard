'use client';

import React, { useState } from 'react';
import { StudyFormData } from '../create-study-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  CheckIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TabletIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface StudyPreviewProps {
  formData: StudyFormData;
  updateFormData: (data: Partial<StudyFormData>) => void;
  userProjects: { id: string; title: string }[];
}

export function StudyPreview({ formData }: StudyPreviewProps) {
  const [currentPreviewBlockIndex, setCurrentPreviewBlockIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [showingSummary, setShowingSummary] = useState(false);

  // Helper to get device class for preview container
  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'max-w-[1024px]';
    }
  };

  // Navigation for preview
  const goToNextBlock = () => {
    if (currentPreviewBlockIndex < formData.test_plan.blocks.length - 1) {
      setCurrentPreviewBlockIndex(currentPreviewBlockIndex + 1);
    } else {
      setShowingSummary(true);
    }
  };

  const goToPreviousBlock = () => {
    if (showingSummary) {
      setShowingSummary(false);
    } else if (currentPreviewBlockIndex > 0) {
      setCurrentPreviewBlockIndex(currentPreviewBlockIndex - 1);
    }
  };

  const resetPreview = () => {
    setCurrentPreviewBlockIndex(0);
    setShowingSummary(false);
  };

  // Render preview of block based on type
  const renderBlockPreview = (block: any) => {
    switch (block.type) {
      case 'welcome':
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">
              {block.content.heading || 'Welcome to our study'}
            </h2>
            <p className="text-muted-foreground">
              {block.content.message || 'Thank you for participating in this study.'}
            </p>
            {block.content.showTimer && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-1">
                  This screen will advance in {block.content.timerDuration} seconds
                </p>
                <Progress value={100} className="h-1" />
              </div>
            )}
          </div>
        );
      
      case 'open_question':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {block.content.question || 'Please share your thoughts'}
            </h3>
            {block.content.description && (
              <p className="text-muted-foreground">
                {block.content.description}
              </p>
            )}
            <Textarea 
              placeholder={block.content.placeholder || 'Type your answer here...'}
              className="min-h-32"
              disabled
            />
            {block.content.required && (
              <p className="text-sm text-muted-foreground">
                * This question requires an answer
              </p>
            )}
          </div>
        );

      case 'simple_input':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {block.content.question || 'Please enter your response'}
            </h3>
            {block.content.description && (
              <p className="text-muted-foreground">
                {block.content.description}
              </p>
            )}
            <Input 
              placeholder={block.content.placeholder || 'Your answer'}
              disabled
            />
            {block.content.required && (
              <p className="text-sm text-muted-foreground">
                * This question requires an answer
              </p>
            )}
          </div>
        );

      case 'opinion_scale':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              {block.content.question || 'Rate your experience'}
            </h3>
            {block.content.description && (
              <p className="text-muted-foreground">
                {block.content.description}
              </p>
            )}
            <div className="pt-6 pb-2">
              <Slider 
                defaultValue={[Math.ceil((block.content.max - block.content.min) / 2) + block.content.min]} 
                min={block.content.min || 1} 
                max={block.content.max || 5}
                step={block.content.step || 1}
                disabled
              />
              <div className="flex justify-between mt-2 text-sm">
                <span>{block.content.minLabel || 'Poor'}</span>
                <span>{block.content.maxLabel || 'Excellent'}</span>
              </div>
            </div>
            {block.content.required && (
              <p className="text-sm text-muted-foreground">
                * This question requires an answer
              </p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {block.content.question || 'Select an option'}
            </h3>
            {block.content.description && (
              <p className="text-muted-foreground mb-4">
                {block.content.description}
              </p>
            )}
            {block.content.allowMultiple ? (
              <div className="space-y-3">
                {(block.content.options || ['Option 1', 'Option 2', 'Option 3']).map((option: string, i: number) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox id={`option-${i}`} disabled />
                    <Label htmlFor={`option-${i}`}>{option}</Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup defaultValue="" className="space-y-3">
                {(block.content.options || ['Option 1', 'Option 2', 'Option 3']).map((option: string, i: number) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={`option-${i}`} id={`option-${i}`} disabled />
                    <Label htmlFor={`option-${i}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {block.content.required && (
              <p className="text-sm text-muted-foreground">
                * This question requires an answer
              </p>
            )}
          </div>
        );

      case 'yes_no':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {block.content.question || 'Would you recommend our product?'}
            </h3>
            {block.content.description && (
              <p className="text-muted-foreground mb-4">
                {block.content.description}
              </p>
            )}
            <RadioGroup defaultValue="" className="flex justify-center gap-10 pt-6">
              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="yes" id="yes" className="h-8 w-8" disabled />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <RadioGroupItem value="no" id="no" className="h-8 w-8" disabled />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
            {block.content.required && (
              <p className="text-sm text-muted-foreground text-center pt-4">
                * This question requires an answer
              </p>
            )}
          </div>
        );

      case 'five_second_test':
        return (
          <div className="space-y-6 text-center">
            <h3 className="text-xl font-semibold">
              {block.content.heading || '5-Second Test'}
            </h3>
            <p className="text-muted-foreground">
              {block.content.description || 'You will be shown an image for 5 seconds. Please focus on the screen.'}
            </p>
            <div className="border-2 border-dashed rounded-md h-48 flex items-center justify-center bg-muted/50">
              {block.content.imageUrl ? (
                <div className="text-muted-foreground">Image will display here</div>
              ) : (
                <div className="text-muted-foreground">No image uploaded</div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                After {block.content.timerDuration || 5} seconds, you will be asked:
              </p>
              <p className="font-medium mt-1">
                {block.content.followUpQuestion || 'What do you remember seeing?'}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              Preview for {block.type.replace('_', ' ')} is coming soon
            </p>
          </div>
        );
    }
  };

  // Render study summary
  const renderSummary = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Study Summary</h2>
          <p className="text-muted-foreground mt-2">Here's an overview of your study</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Study Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{formData.title || "Untitled Study"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{formData.study_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Participants</p>
                <p className="font-medium">{formData.audience.participant_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Test Blocks</p>
                <p className="font-medium">{formData.test_plan.blocks.length}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Audience</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Devices</p>
                <div className="flex gap-1 mt-1">
                  {formData.audience.devices.map(device => (
                    <Badge key={device} variant="outline" className="capitalize">
                      {device}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Demographics</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(formData.audience.demographic_filters || {}).some(
                    ([_, values]) => values && values.length > 0
                  ) ? (
                    <Badge variant="outline">
                      {Object.entries(formData.audience.demographic_filters || {}).filter(
                        ([_, values]) => values && values.length > 0
                      ).length} filters
                    </Badge>
                  ) : (
                    <p className="text-sm">No filters</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Screener Questions</p>
                <p className="font-medium">
                  {formData.audience.screener_questions?.length || 0} questions
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Test Flow</h3>
            <div className="space-y-2">
              {formData.test_plan.blocks.map((block, index) => (
                <div key={index} className="flex items-center py-2 border-b last:border-b-0">
                  <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-foreground text-primary-foreground mr-3">
                    <span className="text-primary text-xs font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{block.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {block.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasValidationIssues = () => {
    if (!formData.title) return true;
    if (!formData.description) return true;
    if (!formData.project_id) return true;
    if (formData.test_plan.blocks.length === 0) return true;
    return false;
  };

  const getValidationIssues = () => {
    const issues = [];
    if (!formData.title) issues.push('Study title is required');
    if (!formData.description) issues.push('Study description is required');
    if (!formData.project_id) issues.push('Please select a project');
    if (formData.test_plan.blocks.length === 0) issues.push('Add at least one block to your study');
    return issues;
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Study Preview</h3>
        <p className="text-muted-foreground mb-6">
          Review your study and make any final adjustments before creating it
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={resetPreview}
                title="Restart preview"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <Badge variant={currentPreviewBlockIndex === 0 && !showingSummary ? 'default' : 'outline'}>
                  Start
                </Badge>
                {formData.test_plan.blocks.map((_, index) => (
                  <Badge 
                    key={index} 
                    variant={currentPreviewBlockIndex === index && !showingSummary ? 'default' : 'outline'}
                    className="w-6 h-6 rounded-full flex items-center justify-center p-0"
                  >
                    {index + 1}
                  </Badge>
                ))}
                <Badge variant={showingSummary ? 'default' : 'outline'}>
                  End
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPreviewDevice('mobile')}
                className={previewDevice === 'mobile' ? 'bg-accent text-accent-foreground' : ''}
                title="Mobile preview"
              >
                <DevicePhoneMobileIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPreviewDevice('tablet')}
                className={previewDevice === 'tablet' ? 'bg-accent text-accent-foreground' : ''}
                title="Tablet preview"
              >
                <TabletIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPreviewDevice('desktop')}
                className={previewDevice === 'desktop' ? 'bg-accent text-accent-foreground' : ''}
                title="Desktop preview"
              >
                <ComputerDesktopIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className={`mx-auto ${getDeviceClass()}`}>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">
                  {formData.title || "Untitled Study"}
                </CardTitle>
                <div className="flex gap-1">
                  <Badge variant="outline" className="capitalize">
                    {formData.study_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[500px] overflow-y-auto">
              {showingSummary ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mx-auto">
                      <CheckIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Thank you!</h3>
                    <p className="text-muted-foreground">
                      Your responses have been submitted successfully.
                    </p>
                  </div>
                </div>
              ) : formData.test_plan.blocks.length > 0 ? (
                renderBlockPreview(formData.test_plan.blocks[currentPreviewBlockIndex])
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Add blocks to your study to see a preview.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-4 justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousBlock}
                disabled={currentPreviewBlockIndex === 0 && !showingSummary}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {!showingSummary ? 
                  `${currentPreviewBlockIndex + 1} of ${formData.test_plan.blocks.length}` : 
                  'Completed'}
              </div>
              <Button 
                onClick={goToNextBlock}
                disabled={formData.test_plan.blocks.length === 0 || showingSummary}
              >
                {currentPreviewBlockIndex === formData.test_plan.blocks.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="summary">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Study Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{formData.title || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="line-clamp-2">{formData.description || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="capitalize">
                      {formData.study_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p>
                      {formData.project_id ? (
                        "Selected project"
                      ) : (
                        <span className="text-amber-600">Not assigned</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Test Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Number of blocks</p>
                    <p className="font-medium">
                      {formData.test_plan.blocks.length}
                    </p>
                  </div>
                  {formData.test_plan.blocks.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Block types</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(formData.test_plan.blocks.map(b => b.type))).map(type => (
                          <Badge key={type} variant="outline" className="capitalize">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="audience" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Target Audience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Number of participants</p>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{formData.audience.participant_count}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Devices</p>
                    <div className="flex gap-1">
                      {formData.audience.devices.map(device => (
                        <Badge key={device} variant="outline" className="capitalize">
                          {device}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Demographics</p>
                    <div>
                      {Object.entries(formData.audience.demographic_filters || {}).some(
                        ([_, values]) => values && values.length > 0
                      ) ? (
                        <div className="space-y-2">
                          {Object.entries(formData.audience.demographic_filters || {})
                            .filter(([_, values]) => values && values.length > 0)
                            .map(([key, values]) => (
                              <div key={key}>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {key.replace('_', ' ')}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {values && values.map((value: string) => (
                                    <Badge key={value} variant="outline" className="text-xs">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm">No demographic filters set</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Screener Questions</p>
                    {formData.audience.screener_questions && 
                     formData.audience.screener_questions.length > 0 ? (
                      <div>
                        <Badge>{formData.audience.screener_questions.length} questions</Badge>
                      </div>
                    ) : (
                      <p className="text-sm">No screener questions</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="issues" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Validation Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasValidationIssues() ? (
                    <div className="space-y-2">
                      {getValidationIssues().map((issue, i) => (
                        <div key={i} className="flex items-start space-x-2 text-amber-600">
                          <span className="text-lg">⚠️</span>
                          <p>{issue}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckIcon className="h-5 w-5" />
                      <p>Your study looks good to go!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 