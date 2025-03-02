"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  image?: string
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  image = "/illustrations/empty-projects.svg",
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("p-8", className)}>
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        <Image
          src={image}
          alt={title}
          width={200}
          height={200}
          className="mb-6 dark:invert"
        />
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  )
} 