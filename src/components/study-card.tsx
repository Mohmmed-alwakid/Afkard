"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { Study } from "@/store/study-store"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StudyCardProps {
  study: Study & { projectName: string }
  className?: string
}

export function StudyCard({ study, className }: StudyCardProps) {
  const router = useRouter()

  const statusVariant = 
    study.status === "draft"
      ? "secondary"
      : study.status === "active"
      ? "success"
      : "default"

  const typeVariant = study.type === "test" ? "default" : "secondary"

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className={cn("p-6 hover:border-primary transition-colors", className)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge variant={typeVariant} className="mb-2">
              {study.type === "test" ? "Test" : "Interview"}
            </Badge>
            <h3 className="font-medium">{study.title}</h3>
            <p className="text-sm text-muted-foreground">
              {study.projectName}
            </p>
          </div>
          <Tooltip content={`Status: ${study.status}`}>
            <Badge variant={statusVariant}>
              {study.status}
            </Badge>
          </Tooltip>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {new Date(study.updatedAt).toLocaleDateString()}
            </div>
            {study.responses > 0 && (
              <Badge variant="outline">
                {study.responses} responses
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/projects/${study.projectId}/studies/${study.id}`)}
          >
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  )
} 