'use client';

import React from 'react';
import { StudyFormData } from '../create-study-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

interface StudyBasicInfoProps {
  formData: StudyFormData;
  updateFormData: (data: Partial<StudyFormData>) => void;
  userProjects: { id: string; title: string }[];
}

export function StudyBasicInfo({ formData, updateFormData, userProjects }: StudyBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <p className="text-muted-foreground mb-6">
          Provide essential details about your {formData.study_type.replace('_', ' ')} study.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Study Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Enter a descriptive title for your study"
          />
          <p className="text-sm text-muted-foreground">
            Keep it concise and descriptive
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Describe what this study aims to achieve"
            className="min-h-32"
          />
          <p className="text-sm text-muted-foreground">
            Provide context about your study objectives and what participants can expect
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="project">Assign to Project</Label>
          <Select
            value={formData.project_id}
            onValueChange={(value) => updateFormData({ project_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-projects" disabled>
                  No projects available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Group related studies together in a project
          </p>
        </div>

        {/* Additional fields based on study type */}
        {formData.study_type === 'interview' && (
          <div className="grid gap-2">
            <Label htmlFor="interview-method">Interview Method</Label>
            <Select
              value={formData.interview_method || "video"}
              onValueChange={(value) => updateFormData({ interview_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="audio">Audio Only</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How will you conduct the interviews?
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 