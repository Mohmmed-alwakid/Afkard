"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"

const deviceTypes = [
  { value: "computer", label: "Computer" },
  { value: "tablet", label: "Tablet" },
  { value: "smartphone", label: "Smartphone" },
] as const

const webExpertise = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const

const employmentStatus = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
] as const

const audienceSchema = z.object({
  contributorsNeeded: z.number().min(1, "At least 1 contributor is required").max(100),
  deviceTypes: z.array(z.enum(["computer", "tablet", "smartphone"])).min(1, "Select at least one device type"),
  webExpertise: z.array(z.enum(["beginner", "intermediate", "expert"])),
  ageRange: z.object({
    min: z.number().min(18).max(100),
    max: z.number().min(18).max(100),
  }),
  gender: z.array(z.enum(["male", "female", "other"])),
  employmentStatus: z.array(z.enum(["employed", "self-employed", "unemployed", "student"])),
  screenerQuestions: z.array(z.object({
    question: z.string(),
    type: z.enum(["text", "multiple_choice", "yes_no"]),
    options: z.array(z.string()).optional(),
  })).optional(),
})

type AudienceFormValues = z.infer<typeof audienceSchema>

interface TargetAudienceProps {
  onSave: (data: AudienceFormValues) => void
  defaultValues?: Partial<AudienceFormValues>
}

export function TargetAudience({ onSave, defaultValues }: TargetAudienceProps) {
  const { t, isRTL } = useTranslations()
  const [showPreview, setShowPreview] = React.useState(false)

  const form = useForm<AudienceFormValues>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      contributorsNeeded: 5,
      deviceTypes: ["computer"],
      webExpertise: ["intermediate"],
      ageRange: { min: 18, max: 65 },
      gender: ["male", "female"],
      employmentStatus: ["employed"],
      screenerQuestions: [],
      ...defaultValues,
    },
  })

  const onSubmit = (data: AudienceFormValues) => {
    onSave(data)
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Define the basic requirements for your study participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="contributorsNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Contributors</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={100}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Choose between 1-100 participants
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deviceTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Required Devices</FormLabel>
                    <div className="grid gap-4 pt-2">
                      {deviceTypes.map((device) => (
                        <div key={device.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={device.value}
                            checked={form.watch("deviceTypes").includes(device.value)}
                            onCheckedChange={(checked) => {
                              const current = form.watch("deviceTypes")
                              const updated = checked
                                ? [...current, device.value]
                                : current.filter((value) => value !== device.value)
                              form.setValue("deviceTypes", updated)
                            }}
                          />
                          <label
                            htmlFor={device.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {device.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Demographic Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Demographic Filters</CardTitle>
              <CardDescription>
                Define the demographic criteria for your target audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Age Range */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ageRange.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={18} 
                          max={100}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageRange.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={18} 
                          max={100}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Employment Status */}
              <FormField
                control={form.control}
                name="employmentStatus"
                render={() => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <div className="grid gap-4 pt-2">
                      {employmentStatus.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={status.value}
                            checked={form.watch("employmentStatus").includes(status.value)}
                            onCheckedChange={(checked) => {
                              const current = form.watch("employmentStatus")
                              const updated = checked
                                ? [...current, status.value]
                                : current.filter((value) => value !== status.value)
                              form.setValue("employmentStatus", updated)
                            }}
                          />
                          <label
                            htmlFor={status.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              Preview Screener
            </Button>
            <Button type="submit">
              Save & Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 