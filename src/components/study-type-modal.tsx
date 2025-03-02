"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { NewStudyModal } from "@/components/new-study-modal"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"

export type StudyType = "test" | "interview"

interface StudyTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

const studyTypes = [
  {
    id: "test" as const,
    title: "Run Tests",
    description: "Create surveys and usability tests for prototypes and live websites",
    icon: "/icons/testing.svg",
  },
  {
    id: "interview" as const,
    title: "Conduct Interviews",
    description: "Schedule interviews, transcribe recordings, analyze sessions and share insights",
    icon: "/icons/consultation.svg",
  },
]

export function StudyTypeModal({ open, onOpenChange, projectId }: StudyTypeModalProps) {
  const { t, isRTL } = useTranslations()
  const [selectedType, setSelectedType] = React.useState<StudyType | null>(null)
  const [showNewStudyModal, setShowNewStudyModal] = React.useState(false)

  const handleTypeSelect = (type: StudyType) => {
    setSelectedType(type)
    onOpenChange(false)
    setShowNewStudyModal(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              Choose Study Type
            </DialogTitle>
          </DialogHeader>
          <div className={cn(
            "grid gap-4",
            isRTL && "rtl"
          )}>
            {studyTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  variant="interactive"
                  className="p-6 cursor-pointer"
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Image
                        src={type.icon}
                        alt={type.title}
                        width={32}
                        height={32}
                        className="dark:invert"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedType && (
        <NewStudyModal
          open={showNewStudyModal}
          onOpenChange={setShowNewStudyModal}
          type={selectedType}
          projectId={projectId}
        />
      )}
    </>
  )
} 