"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to prevent static build errors with auth
export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            objective: formData.objective,
            researcher_id: user?.id,
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your project has been created.",
      });

      router.push(`/researcher/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "There was a problem creating your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#14142B]">
            Create New Project
          </h1>
          <p className="text-[#666675] mt-2">
            Fill in the details below to create your new research project.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="title" 
                className="block text-sm font-medium text-[#14142B]"
              >
                Project Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter project title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="objective" 
                className="block text-sm font-medium text-[#14142B]"
              >
                Research Objective
              </label>
              <Textarea
                id="objective"
                name="objective"
                placeholder="What do you want to learn from this research?"
                value={formData.objective}
                onChange={handleChange}
                required
                className="w-full min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-[#14142B]"
              >
                Project Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a detailed description of your research project"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full min-h-[150px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#212280] hover:bg-[#1a1c6b] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 