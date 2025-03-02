import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StudyType = "test" | "interview"
export type StudyStatus = "draft" | "active" | "completed"

export interface Study {
  id: string
  type: StudyType
  title: string
  description?: string
  projectId: string
  targetAudience: {
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
  testPlan?: {
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
  status: StudyStatus
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  responses: number
  insights?: {
    summary: string
    recommendations: string[]
    metrics: {
      completionRate: number
      averageTime: number
      satisfactionScore: number
    }
  }
}

interface StudyState {
  studies: Study[]
  activeStudyId: string | null
  isLoading: boolean
  error: string | null
  setActiveStudy: (studyId: string | null) => void
  addStudy: (study: Omit<Study, "id" | "createdAt" | "updatedAt" | "responses">) => void
  updateStudy: (studyId: string, updates: Partial<Study>) => void
  deleteStudy: (studyId: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      studies: [],
      activeStudyId: null,
      isLoading: false,
      error: null,

      setActiveStudy: (studyId) => set({ activeStudyId: studyId }),

      addStudy: (study) => set((state) => ({
        studies: [
          ...state.studies,
          {
            ...study,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            responses: 0,
          },
        ],
      })),

      updateStudy: (studyId, updates) => set((state) => ({
        studies: state.studies.map((study) =>
          study.id === studyId
            ? { ...study, ...updates, updatedAt: new Date() }
            : study
        ),
      })),

      deleteStudy: (studyId) => set((state) => ({
        studies: state.studies.filter((study) => study.id !== studyId),
        activeStudyId: state.activeStudyId === studyId ? null : state.activeStudyId,
      })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'study-storage',
    }
  )
) 