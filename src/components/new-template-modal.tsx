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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { useTranslations } from "@/lib/i18n/translations"
import { useTemplateStore } from "@/store/template-store"
import { cn } from "@/lib/utils"
import { ProjectCategory } from "@/store/project-store"

const templateSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string(),
  thumbnail: z.string(),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface NewTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_OPTIONS = [
  { value: 'usability', label: 'Usability Testing' },
  { value: 'ux-research', label: 'UX Research' },
  { value: 'market-research', label: 'Market Research' },
  { value: 'feedback', label: 'User Feedback' },
  { value: 'survey', label: 'Survey' },
  { value: 'other', label: 'Other' },
]

const THUMBNAIL_OPTIONS = [
  { value: '/illustrations/usability-testing.svg', label: 'Usability Testing' },
  { value: '/illustrations/user-interviews.svg', label: 'User Interviews' },
  { value: '/illustrations/feedback-survey.svg', label: 'Feedback Survey' },
  { value: '/illustrations/empty-state.svg', label: 'Default' },
]

export function NewTemplateModal({ open, onOpenChange }: NewTemplateModalProps) {
  const { t, isRTL } = useTranslations()
  const { addTemplate } = useTemplateStore()
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "usability",
      thumbnail: "/illustrations/usability-testing.svg",
    },
  })

  // Update thumbnail when category changes for better UX
  React.useEffect(() => {
    const currentCategory = form.watch("category");
    const matchingThumbnail = THUMBNAIL_OPTIONS.find(
      thumbnail => thumbnail.label.toLowerCase().includes(currentCategory)
    );
    
    if (matchingThumbnail) {
      form.setValue("thumbnail", matchingThumbnail.value);
    }
  }, [form.watch("category")])

  const onSubmit = (data: TemplateFormValues) => {
    addTemplate({
      ...data,
      studies: [],
    })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t('Create New Template')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Template Name')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('Enter template name')} 
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
                  <FormLabel>{t('Description')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('Enter template description')} 
                      {...field} 
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('This helps users understand what this template is for')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Category')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select a category')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                {t('Create Template')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 