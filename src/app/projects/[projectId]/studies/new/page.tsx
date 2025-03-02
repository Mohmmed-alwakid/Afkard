"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProgressIndicator } from "@/components/study-settings/progress-indicator"
import { TargetAudience } from "@/components/study-settings/target-audience"
import { TestPlan } from "@/components/study-settings/test-plan"
import { useProjectStore } from "@/store/project-store"
import { useTranslations } from "@/hooks/use-translations"
import { HelpCircle } from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"

const steps = [
  {
    id: "target-audience",
    title: "Target Audience",
    description: "Define your participants",
  },
  {
    id: "test-plan",
    title: "Test Plan",
    description: "Create tasks and instructions",
  },
  {
    id: "review",
    title: "Review",
    description: "Verify and launch",
  },
]

interface PageProps {
  params: {
    projectId: string
  }
}

type TargetAudienceData = {
  contributorsNeeded: number
  deviceTypes: ("computer" | "tablet" | "smartphone")[]
  webExpertise: ("beginner" | "intermediate" | "expert")[]
  ageRange: { min: number; max: number }
  gender: ("male" | "female" | "other")[]
  employmentStatus: ("employed" | "self-employed" | "unemployed" | "student")[]
  screenerQuestions?: {
    question: string
    type: "text" | "multiple_choice" | "yes_no"
    options?: string[]
  }[]
}

type TestPlanData = {
  introduction: string
  tasks: {
    title: string
    description: string
    timeLimit: number
    successCriteria?: string
  }[]
  conclusion: string
  attachments?: string[]
}

export default function NewStudyPage({ params }: PageProps) {
  const { t, isRTL } = useTranslations()
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const [studyData, setStudyData] = React.useState<{
    targetAudience: TargetAudienceData | null
    testPlan: TestPlanData | null
  }>({
    targetAudience: null,
    testPlan: null,
  })

  const handleTargetAudienceSave = (data: TargetAudienceData) => {
    setStudyData((prev) => ({ ...prev, targetAudience: data }))
    setCompletedSteps((prev) => [...prev, 0])
    setCurrentStep(1)
  }

  const handleTestPlanSave = (data: TestPlanData) => {
    setStudyData((prev) => ({ ...prev, testPlan: data }))
    setCompletedSteps((prev) => [...prev, 1])
    setCurrentStep(2)
  }

  const handleLaunchStudy = () => {
    // TODO: Implement study launch logic
    router.push(`/projects/${params.projectId}`)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            isRTL={isRTL}
          />
        </div>

        {/* Help Section */}
        <div className="mb-8">
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <HelpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium mb-1">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Check out our{" "}
                  <a href="/help" className="text-primary hover:underline">
                    help center
                  </a>{" "}
                  for guidance on creating effective studies.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Step */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <TargetAudience
              onSave={handleTargetAudienceSave}
              defaultValues={studyData.targetAudience || undefined}
            />
          )}

          {currentStep === 1 && (
            <TestPlan
              onSave={handleTestPlanSave}
              defaultValues={studyData.testPlan || undefined}
            />
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Review Your Study</h2>
                  
                  {/* Target Audience Summary */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Target Audience
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(studyData.targetAudience, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Test Plan Summary */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Test Plan
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(studyData.testPlan, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Launch Button */}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
                <Button onClick={handleLaunchStudy}>
                  Launch Study
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Button */}
      <div className="fixed bottom-4 right-4">
        <Tooltip content="Need help? Click for guidance">
          <Button variant="outline" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
} 