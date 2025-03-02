"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  isRTL?: boolean
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  completedSteps,
  isRTL = false,
}: ProgressIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mx-auto max-w-4xl">
      <ol
        role="list"
        className={cn(
          "flex items-center",
          isRTL && "flex-row-reverse"
        )}
      >
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = currentStep === index
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex-1",
                !isLast && (isRTL ? "ml-6" : "mr-6")
              )}
            >
              {!isLast && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center",
                    isRTL ? "-ml-6" : "-mr-6"
                  )}
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}
              <div className="relative flex items-center group">
                <span className="flex h-8 items-center" aria-hidden="true">
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                      isCompleted
                        ? "bg-primary border-primary"
                        : isCurrent
                        ? "border-primary"
                        : "border-muted bg-muted/20",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          isCurrent ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}
                  </span>
                </span>
                <div
                  className={cn(
                    "absolute flex flex-col min-w-max",
                    isRTL ? "right-10" : "left-10"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      (isCompleted || isCurrent) ? "text-muted-foreground" : "text-muted-foreground/60"
                    )}
                  >
                    {step.description}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
} 