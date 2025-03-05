"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "@/hooks/use-translations"
import { useProjectStore, ProjectCategory } from "@/store/project-store"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid'

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string({
    required_error: "Please select a project category",
  }),
  goal: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const projectCategories = [
  { value: "usability", label: "Usability Testing" },
  { value: "ux-research", label: "UX Research" },
  { value: "market-research", label: "Market Research" },
  { value: "feedback", label: "Product Feedback" },
  { value: "survey", label: "Survey" },
  { value: "other", label: "Other" },
]

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const { t, isRTL } = useTranslations()
  const { addProject } = useProjectStore()
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      goal: "",
    },
  })

  const onSubmit = (data: ProjectFormValues) => {
    // Create a new project with all the needed fields
    const newProject = {
      id: uuidv4(),
      name: data.name,
      description: data.description || "",
      category: data.category as ProjectCategory,
      goal: data.goal || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studies: [],
    }
    
    addProject(newProject)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create new project folder
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create your research project
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project name" 
                      isRTL={isRTL}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Goal (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="What do you want to achieve with this project?" 
                      isRTL={isRTL}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of your project"
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 