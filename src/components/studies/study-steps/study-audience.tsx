'use client';

import React, { useState } from 'react';
import { StudyFormData } from '../create-study-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';

interface StudyAudienceProps {
  formData: StudyFormData;
  updateFormData: (data: Partial<StudyFormData>) => void;
  userProjects: { id: string; title: string }[];
}

// Demographics data
const countries = [
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'kw', label: 'Kuwait' },
  { value: 'bh', label: 'Bahrain' },
  { value: 'qa', label: 'Qatar' },
  { value: 'om', label: 'Oman' },
];

const languages = [
  { value: 'ar', label: 'Arabic' },
  { value: 'en', label: 'English' },
];

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const ageRanges = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55-64', label: '55-64' },
  { value: '65+', label: '65+' },
];

const employmentStatuses = [
  { value: 'full-time', label: 'Full-time employed' },
  { value: 'part-time', label: 'Part-time employed' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
];

export function StudyAudience({ formData, updateFormData }: StudyAudienceProps) {
  const [newScreenerQuestion, setNewScreenerQuestion] = useState({
    question: '',
    answer_type: 'text' as const,
    options: [''],
  });

  const updateAudience = (audienceData: Partial<StudyFormData['audience']>) => {
    updateFormData({
      audience: {
        ...formData.audience,
        ...audienceData,
      },
    });
  };

  const updateDemographicFilter = (
    filterName: keyof StudyFormData['audience']['demographic_filters'],
    value: string[],
  ) => {
    updateFormData({
      audience: {
        ...formData.audience,
        demographic_filters: {
          ...formData.audience.demographic_filters,
          [filterName]: value,
        },
      },
    });
  };

  const addScreenerQuestion = () => {
    if (!newScreenerQuestion.question.trim()) return;

    const currentQuestions = formData.audience.screener_questions || [];
    const newQuestion = {
      ...newScreenerQuestion,
      id: Date.now().toString(),
    };

    updateFormData({
      audience: {
        ...formData.audience,
        screener_questions: [...currentQuestions, newQuestion],
      },
    });

    // Reset form
    setNewScreenerQuestion({
      question: '',
      answer_type: 'text',
      options: [''],
    });
  };

  const removeScreenerQuestion = (index: number) => {
    const currentQuestions = [...(formData.audience.screener_questions || [])];
    currentQuestions.splice(index, 1);

    updateFormData({
      audience: {
        ...formData.audience,
        screener_questions: currentQuestions,
      },
    });
  };

  const updateScreenerOption = (questionIndex: number, optionIndex: number, value: string) => {
    const currentQuestions = [...(formData.audience.screener_questions || [])];
    const question = { ...currentQuestions[questionIndex] };
    
    if (!question.options) {
      question.options = [];
    }
    
    const options = [...question.options];
    options[optionIndex] = value;
    question.options = options;
    
    currentQuestions[questionIndex] = question;
    
    updateFormData({
      audience: {
        ...formData.audience,
        screener_questions: currentQuestions,
      },
    });
  };

  const addScreenerOption = (questionIndex: number) => {
    const currentQuestions = [...(formData.audience.screener_questions || [])];
    const question = { ...currentQuestions[questionIndex] };
    
    if (!question.options) {
      question.options = [];
    }
    
    question.options = [...question.options, ''];
    currentQuestions[questionIndex] = question;
    
    updateFormData({
      audience: {
        ...formData.audience,
        screener_questions: currentQuestions,
      },
    });
  };

  const removeScreenerOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = [...(formData.audience.screener_questions || [])];
    const question = { ...currentQuestions[questionIndex] };
    
    if (!question.options) return;
    
    const options = [...question.options];
    options.splice(optionIndex, 1);
    question.options = options;
    
    currentQuestions[questionIndex] = question;
    
    updateFormData({
      audience: {
        ...formData.audience,
        screener_questions: currentQuestions,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Target Audience</h3>
        <p className="text-muted-foreground mb-6">
          Define who should participate in your {formData.study_type.replace('_', ' ')} study.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="participant-count">Number of Participants</Label>
            <Input
              id="participant-count"
              type="number"
              min={1}
              value={formData.audience.participant_count}
              onChange={(e) => updateAudience({ 
                participant_count: parseInt(e.target.value) || 1 
              })}
            />
            <p className="text-sm text-muted-foreground">
              Recommended: 5-10 participants for qualitative studies
            </p>
          </div>

          <div className="space-y-2">
            <Label>Device Types</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['desktop', 'mobile', 'tablet'].map((device) => (
                <div key={device} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`device-${device}`}
                    checked={formData.audience.devices.includes(device as any)}
                    onCheckedChange={(checked) => {
                      const currentDevices = [...formData.audience.devices];
                      if (checked) {
                        if (!currentDevices.includes(device as any)) {
                          updateAudience({ devices: [...currentDevices, device as any] });
                        }
                      } else {
                        updateAudience({ 
                          devices: currentDevices.filter(d => d !== device) 
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`device-${device}`} className="capitalize">
                    {device}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audience Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participants:</span>
                <span>{formData.audience.participant_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Devices:</span>
                <div className="flex gap-1">
                  {formData.audience.devices.map(device => (
                    <Badge key={device} variant="outline" className="capitalize">
                      {device}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Display demographic filters summary */}
              {Object.entries(formData.audience.demographic_filters || {}).map(([key, values]) => {
                if (!values || values.length === 0) return null;
                
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                      {values.map(value => (
                        <Badge key={value} variant="outline" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Display screener questions count */}
              {formData.audience.screener_questions && 
               formData.audience.screener_questions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Screener Questions:</span>
                  <span>{formData.audience.screener_questions.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full border rounded-lg">
        <AccordionItem value="demographic-filters">
          <AccordionTrigger className="px-4">Demographic Filters</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age Range Filter */}
              <div className="space-y-2">
                <Label>Age Ranges</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ageRanges.map((range) => (
                    <div key={range.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`age-${range.value}`}
                        checked={(formData.audience.demographic_filters?.age_range || [])
                          .includes(range.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = [...(formData.audience.demographic_filters?.age_range || [])];
                          if (checked) {
                            if (!currentValues.includes(range.value)) {
                              updateDemographicFilter('age_range', [...currentValues, range.value]);
                            }
                          } else {
                            updateDemographicFilter('age_range', 
                              currentValues.filter(v => v !== range.value)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`age-${range.value}`}>{range.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {genders.map((gender) => (
                    <div key={gender.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`gender-${gender.value}`}
                        checked={(formData.audience.demographic_filters?.gender || [])
                          .includes(gender.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = [...(formData.audience.demographic_filters?.gender || [])];
                          if (checked) {
                            if (!currentValues.includes(gender.value)) {
                              updateDemographicFilter('gender', [...currentValues, gender.value]);
                            }
                          } else {
                            updateDemographicFilter('gender', 
                              currentValues.filter(v => v !== gender.value)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`gender-${gender.value}`}>{gender.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countries Filter */}
              <div className="space-y-2">
                <Label>Countries</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {countries.map((country) => (
                    <div key={country.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`country-${country.value}`}
                        checked={(formData.audience.demographic_filters?.countries || [])
                          .includes(country.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = [...(formData.audience.demographic_filters?.countries || [])];
                          if (checked) {
                            if (!currentValues.includes(country.value)) {
                              updateDemographicFilter('countries', [...currentValues, country.value]);
                            }
                          } else {
                            updateDemographicFilter('countries', 
                              currentValues.filter(v => v !== country.value)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`country-${country.value}`}>{country.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages Filter */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {languages.map((language) => (
                    <div key={language.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`language-${language.value}`}
                        checked={(formData.audience.demographic_filters?.languages || [])
                          .includes(language.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = [...(formData.audience.demographic_filters?.languages || [])];
                          if (checked) {
                            if (!currentValues.includes(language.value)) {
                              updateDemographicFilter('languages', [...currentValues, language.value]);
                            }
                          } else {
                            updateDemographicFilter('languages', 
                              currentValues.filter(v => v !== language.value)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`language-${language.value}`}>{language.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employment Status Filter */}
              <div className="space-y-2">
                <Label>Employment Status</Label>
                <div className="flex flex-col gap-2 mt-1">
                  {employmentStatuses.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`employment-${status.value}`}
                        checked={(formData.audience.demographic_filters?.employment_status || [])
                          .includes(status.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = [...(formData.audience.demographic_filters?.employment_status || [])];
                          if (checked) {
                            if (!currentValues.includes(status.value)) {
                              updateDemographicFilter('employment_status', [...currentValues, status.value]);
                            }
                          } else {
                            updateDemographicFilter('employment_status', 
                              currentValues.filter(v => v !== status.value)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`employment-${status.value}`}>{status.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Screener Questions</h3>
          <p className="text-muted-foreground mb-4">
            Add questions to ensure participants meet your specific requirements
          </p>
        </div>

        {/* Existing screener questions */}
        {formData.audience.screener_questions && formData.audience.screener_questions.length > 0 && (
          <div className="space-y-4 mb-6">
            {formData.audience.screener_questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-destructive"
                  onClick={() => removeScreenerQuestion(questionIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-base">{question.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-muted-foreground">Answer type:</span>
                    <Badge variant="secondary">{question.answer_type.replace('_', ' ')}</Badge>
                  </div>

                  {question.answer_type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      <Label>Options:</Label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Input 
                            value={option}
                            onChange={(e) => updateScreenerOption(questionIndex, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeScreenerOption(questionIndex, optionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => addScreenerOption(questionIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New screener question form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Screener Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="question-text">Question</Label>
              <Input
                id="question-text"
                value={newScreenerQuestion.question}
                onChange={(e) => setNewScreenerQuestion({
                  ...newScreenerQuestion,
                  question: e.target.value,
                })}
                placeholder="e.g., Have you used our product before?"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="answer-type">Answer Type</Label>
              <Select
                value={newScreenerQuestion.answer_type}
                onValueChange={(value) => setNewScreenerQuestion({
                  ...newScreenerQuestion,
                  answer_type: value as any,
                  options: value === 'multiple_choice' ? [''] : [],
                })}
              >
                <SelectTrigger id="answer-type">
                  <SelectValue placeholder="Select answer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Answer</SelectItem>
                  <SelectItem value="yes_no">Yes/No</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newScreenerQuestion.answer_type === 'multiple_choice' && (
              <div className="space-y-2">
                <Label>Options</Label>
                {newScreenerQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newScreenerQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewScreenerQuestion({
                          ...newScreenerQuestion,
                          options: newOptions,
                        });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    {newScreenerQuestion.options.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          const newOptions = [...newScreenerQuestion.options];
                          newOptions.splice(index, 1);
                          setNewScreenerQuestion({
                            ...newScreenerQuestion,
                            options: newOptions,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setNewScreenerQuestion({
                      ...newScreenerQuestion,
                      options: [...newScreenerQuestion.options, ''],
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            <Button
              onClick={addScreenerQuestion}
              disabled={!newScreenerQuestion.question.trim()}
              className="w-full mt-2"
            >
              Add Screener Question
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 