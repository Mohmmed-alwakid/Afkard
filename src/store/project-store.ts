import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StudyType } from '@/components/study-type-modal'

interface Study {
  id: string
  type: StudyType
  title: string
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'active' | 'completed'
}

interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  studies: Study[]
}

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  activeStudyId: string | null
  setActiveProject: (projectId: string | null) => void
  setActiveStudy: (studyId: string | null) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'studies'>) => void
  addStudy: (projectId: string, study: Omit<Study, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  updateStudy: (projectId: string, studyId: string, updates: Partial<Study>) => void
  deleteProject: (projectId: string) => void
  deleteStudy: (projectId: string, studyId: string) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,
      activeStudyId: null,
      
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
      setActiveStudy: (studyId) => set({ activeStudyId: studyId }),
      
      addProject: (project) => set((state) => ({
        projects: [
          ...state.projects,
          {
            ...project,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            studies: [],
          },
        ],
      })),
      
      addStudy: (projectId, study) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                updatedAt: new Date(),
                studies: [
                  ...project.studies,
                  {
                    ...study,
                    id: crypto.randomUUID(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                ],
              }
            : project
        ),
      })),
      
      updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        ),
      })),
      
      updateStudy: (projectId, studyId, updates) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                updatedAt: new Date(),
                studies: project.studies.map((study) =>
                  study.id === studyId
                    ? { ...study, ...updates, updatedAt: new Date() }
                    : study
                ),
              }
            : project
        ),
      })),
      
      deleteProject: (projectId) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== projectId),
        activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
      })),
      
      deleteStudy: (projectId, studyId) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                updatedAt: new Date(),
                studies: project.studies.filter((study) => study.id !== studyId),
              }
            : project
        ),
        activeStudyId: state.activeStudyId === studyId ? null : state.activeStudyId,
      })),
    }),
    {
      name: 'project-storage',
    }
  )
) 