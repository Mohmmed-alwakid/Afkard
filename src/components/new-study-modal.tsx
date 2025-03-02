"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StudyType } from "@/store/study-store"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"

interface NewStudyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: StudyType
  projectId: string
}

const templates = [
  {
    id: "usability",
    title: "Usability Testing",
    description: "Test your product's usability with real users",
    image: "/templates/usability-testing.png",
  },
  {
    id: "features",
    title: "Feature Insights",
    description: "Gather feedback on specific features",
    image: "/templates/feature-insights.png",
  },
  {
    id: "product",
    title: "Product Testing",
    description: "Comprehensive product evaluation",
    image: "/templates/product-testing.png",
  },
]

export function NewStudyModal({ open, onOpenChange, type, projectId }: NewStudyModalProps) {
  const { t, isRTL } = useTranslations()
  const router = useRouter()

  const handleStartFromScratch = () => {
    router.push(`/projects/${projectId}/studies/new/create?type=${type}`)
    onOpenChange(false)
  }

  const handleUseTemplate = (templateId: string) => {
    router.push(`/projects/${projectId}/studies/new/create?type=${type}&template=${templateId}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create a new {type === "test" ? "Test" : "Interview"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Start from Scratch */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Start from scratch</h3>
            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={handleStartFromScratch}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary rounded" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Blank {type === "test" ? "Test" : "Interview"}</h4>
                  <p className="text-sm text-muted-foreground">
                    Start with an empty template and build your study from scratch
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Start from Template */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Start from a template</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card
                    className="cursor-pointer overflow-hidden hover:border-primary transition-colors"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={template.image}
                        alt={template.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium mb-1">{template.title}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 