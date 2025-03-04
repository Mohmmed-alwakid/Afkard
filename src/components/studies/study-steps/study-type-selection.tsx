'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { StudyFormData } from '../create-study-form';

interface StudyTypeSelectionProps {
  formData: StudyFormData;
  updateFormData: (data: Partial<StudyFormData>) => void;
  userProjects: { id: string; title: string }[];
}

export function StudyTypeSelection({ formData, updateFormData }: StudyTypeSelectionProps) {
  const handleTypeChange = (value: 'survey' | 'usability_test' | 'interview') => {
    updateFormData({ study_type: value });
  };

  const handleTemplateChange = (useTemplate: boolean) => {
    updateFormData({ use_template: useTemplate });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Select Study Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer hover:border-primary transition-colors ${
              formData.study_type === 'survey' ? 'border-2 border-primary' : ''
            }`}
            onClick={() => handleTypeChange('survey')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Survey</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create surveys to collect feedback, opinions, and data from participants.
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:border-primary transition-colors ${
              formData.study_type === 'usability_test' ? 'border-2 border-primary' : ''
            }`}
            onClick={() => handleTypeChange('usability_test')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Usability Test</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Test prototypes or live websites to gather usability feedback from users.
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:border-primary transition-colors ${
              formData.study_type === 'interview' ? 'border-2 border-primary' : ''
            }`}
            onClick={() => handleTypeChange('interview')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Schedule interviews, transcribe recordings, analyze sessions, and share insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Start From</h3>
        <RadioGroup 
          defaultValue={formData.use_template ? "template" : "scratch"}
          onValueChange={(value) => handleTemplateChange(value === "template")}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="scratch" id="scratch" />
            <Label htmlFor="scratch">Start from scratch</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="template" id="template" />
            <Label htmlFor="template">Use a template</Label>
          </div>
        </RadioGroup>

        {formData.use_template && (
          <div className="mt-4">
            <Tabs defaultValue="popular" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="all">All Templates</TabsTrigger>
              </TabsList>
              <TabsContent value="popular" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Customer Satisfaction', 'Product Feedback', 'Website Evaluation'].map((template, index) => (
                    <div 
                      key={index}
                      className="flex items-start space-x-2 p-4 border rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() => updateFormData({ template_id: `template-${index}` })}
                    >
                      <Checkbox 
                        checked={formData.template_id === `template-${index}`}
                        onCheckedChange={() => updateFormData({ template_id: `template-${index}` })}
                      />
                      <div>
                        <p className="font-medium">{template}</p>
                        <p className="text-sm text-muted-foreground">
                          Pre-built template for {formData.study_type} studies
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                <p className="text-muted-foreground text-center py-8">No recent templates found.</p>
              </TabsContent>
              <TabsContent value="all" className="mt-4">
                <p className="text-muted-foreground text-center py-8">Browse all templates coming soon.</p>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
} 