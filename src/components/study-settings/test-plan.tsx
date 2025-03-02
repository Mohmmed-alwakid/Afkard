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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Upload } from "lucide-react"

const taskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().min(10, "Task description must be at least 10 characters"),
  timeLimit: z.number().min(1, "Time limit must be at least 1 minute").max(60),
  successCriteria: z.string().optional(),
})

const testPlanSchema = z.object({
  introduction: z.string().min(10, "Introduction must be at least 10 characters"),
  tasks: z.array(taskSchema).min(1, "At least one task is required"),
  conclusion: z.string().min(10, "Conclusion must be at least 10 characters"),
  attachments: z.array(z.string()).optional(),
})

type TestPlanFormValues = z.infer<typeof testPlanSchema>

interface TestPlanProps {
  onSave: (data: TestPlanFormValues) => void
  defaultValues?: Partial<TestPlanFormValues>
}

export function TestPlan({ onSave, defaultValues }: TestPlanProps) {
  const { t, isRTL } = useTranslations()

  const form = useForm<TestPlanFormValues>({
    resolver: zodResolver(testPlanSchema),
    defaultValues: {
      introduction: "",
      tasks: [{ title: "", description: "", timeLimit: 5 }],
      conclusion: "",
      attachments: [],
      ...defaultValues,
    },
  })

  const onSubmit = (data: TestPlanFormValues) => {
    onSave(data)
  }

  const addTask = () => {
    const tasks = form.getValues("tasks")
    form.setValue("tasks", [
      ...tasks,
      { title: "", description: "", timeLimit: 5 },
    ])
  }

  const removeTask = (index: number) => {
    const tasks = form.getValues("tasks")
    form.setValue("tasks", tasks.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Session Instructions</CardTitle>
              <CardDescription>
                Provide an introduction for your test participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="introduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Introduction</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Welcome to this study..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain the purpose of the study and what participants should expect
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Define the tasks that participants need to complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {form.watch("tasks").map((task, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Task {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTask(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`tasks.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tasks.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what the participant needs to do..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tasks.${index}.timeLimit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min={1}
                            max={60}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addTask}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card>
            <CardHeader>
              <CardTitle>Conclusion</CardTitle>
              <CardDescription>
                Wrap up the session with final instructions or questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="conclusion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conclusion</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Thank you for participating..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>
                Upload any files, images, or videos needed for the test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button type="submit">
              Save & Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 