"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NewStudyModal } from "@/components/new-study-modal"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export type StudyType = "test" | "interview" | "survey"

interface StudyTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (type: StudyType) => void
  projectId?: string
}

const studyTypes = [
  {
    id: "test" as const,
    title: "Usability Test",
    description: "Create surveys and usability tests for prototypes and live websites",
    icon: "/illustrations/usability-testing.svg",
    benefits: [
      "Observe how users interact with your product",
      "Identify friction points and usability issues",
      "Get actionable feedback on user experience",
    ],
  },
  {
    id: "interview" as const,
    title: "User Interview",
    description: "Schedule interviews, transcribe recordings, analyze sessions and share insights",
    icon: "/illustrations/user-interviews.svg",
    benefits: [
      "Gain in-depth qualitative insights",
      "Understand user needs and pain points",
      "Discover opportunities for improvement",
    ],
  },
  {
    id: "survey" as const,
    title: "Survey",
    description: "Collect quantitative data at scale with customizable surveys",
    icon: "/illustrations/feedback-survey.svg",
    benefits: [
      "Gather feedback from large user groups",
      "Collect quantitative data for analysis",
      "Validate hypotheses and measure satisfaction",
    ],
  },
]

export function StudyTypeModal({ open, onOpenChange, onSelect, projectId }: StudyTypeModalProps) {
  const { t, isRTL } = useTranslations()
  const [hoveredType, setHoveredType] = React.useState<StudyType | null>(null)
  const [showNewStudyModal, setShowNewStudyModal] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<StudyType | null>(null)
  const router = useRouter()

  const handleSelectType = (type: StudyType) => {
    setSelectedType(type)
    if (projectId) {
      // If we have a projectId, show the new study modal
      setShowNewStudyModal(true)
    } else {
      // Otherwise, just pass the selection back
      onSelect(type)
      onOpenChange(false)
    }
  }

  const handleStudyCreated = () => {
    setShowNewStudyModal(false)
    onOpenChange(false)
    if (projectId) {
      // Navigate to the project detail page
      router.push(`/projects/${projectId}`)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[720px] p-6 overflow-hidden">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">
              Select a Study Type
            </DialogTitle>
            <DialogDescription>
              Choose the type of study that best fits your research needs
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6">
            {studyTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
                className="w-full"
              >
                <Card
                  className={cn(
                    "relative p-0 cursor-pointer overflow-hidden h-auto bg-white rounded-[24px] border shadow-sm transition-all duration-200",
                    hoveredType === type.id ? "ring-2 ring-primary shadow-md" : ""
                  )}
                  onClick={() => handleSelectType(type.id)}
                >
                  {/* Illustration */}
                  <div className="w-full p-6 bg-primary/5 flex justify-center">
                    <div className="w-[110px] h-[110px] relative">
                      <Image
                        src={type.icon}
                        alt={type.title}
                        width={110}
                        height={110}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 pt-4">
                    {/* Title */}
                    <h3 className="font-semibold text-[20px] mb-2 text-black font-['Poppins']">
                      {type.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-[15px] mb-4 text-[#666675] font-['Poppins'] font-normal">
                      {type.description}
                    </p>
                    
                    {/* Benefits */}
                    <ul className="text-[14px] space-y-1 mb-4">
                      {type.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Button */}
                    <Button 
                      className="w-full mt-2 rounded-[32px]"
                      variant={hoveredType === type.id ? "default" : "outline"}
                    >
                      Select {type.title}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {projectId && selectedType && (
        <NewStudyModal
          projectId={projectId}
          open={showNewStudyModal} 
          onOpenChange={setShowNewStudyModal}
          onStudyCreate={(projectId, study) => {
            onSelect(selectedType);
            handleStudyCreated();
          }}
          initialType={selectedType}
        />
      )}
    </>
  )
} 