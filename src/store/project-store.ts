import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

// Define study types
export type StudyType = 'test' | 'interview' | 'survey'
export type StudyStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface Study {
  id: string
  type: StudyType
  title: string
  description?: string
  status: StudyStatus
  createdAt: string
  updatedAt: string
  participants?: number
  responses?: number
}

// Define project types
export type ProjectCategory = 'usability' | 'ux-research' | 'market-research' | 'feedback' | 'survey' | 'other'
export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  description?: string
  category: ProjectCategory | string
  goal?: string
  status?: ProjectStatus
  createdAt: string
  updatedAt: string
  studies: Study[]
}

// Define the store state
interface ProjectState {
  projects: Project[]
  
  // Project actions
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  // Study actions
  addStudy: (projectId: string, study: Omit<Study, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateStudy: (projectId: string, studyId: string, data: Partial<Study>) => void
  deleteStudy: (projectId: string, studyId: string) => void
  
  // Helper functions
  getProjectById: (id: string) => Project | undefined
  getStudyById: (projectId: string, studyId: string) => Study | undefined
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      
      // Project actions
      addProject: (project) => set((state) => ({
        projects: [...state.projects, {
          ...project,
          status: project.status || 'active',
          studies: project.studies || [],
        }],
      })),
      
      updateProject: (id, data) => set((state) => ({
        projects: state.projects.map((project) => 
          project.id === id 
            ? { 
                ...project, 
                ...data, 
                updatedAt: new Date().toISOString() 
              } 
            : project
        ),
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      })),
      
      // Study actions
      addStudy: (projectId, studyData) => set((state) => ({
        projects: state.projects.map((project) => 
          project.id === projectId 
            ? { 
                ...project, 
                updatedAt: new Date().toISOString(),
                studies: [
                  ...project.studies, 
                  {
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    participants: 0,
                    responses: 0,
                    ...studyData,
                  }
                ],
              } 
            : project
        ),
      })),
      
      updateStudy: (projectId, studyId, data) => set((state) => ({
        projects: state.projects.map((project) => 
          project.id === projectId 
            ? { 
                ...project, 
                updatedAt: new Date().toISOString(),
                studies: project.studies.map((study) => 
                  study.id === studyId 
                    ? { 
                        ...study, 
                        ...data, 
                        updatedAt: new Date().toISOString() 
                      } 
                    : study
                ),
              } 
            : project
        ),
      })),
      
      deleteStudy: (projectId, studyId) => set((state) => ({
        projects: state.projects.map((project) => 
          project.id === projectId 
            ? { 
                ...project, 
                updatedAt: new Date().toISOString(),
                studies: project.studies.filter((study) => study.id !== studyId),
              } 
            : project
        ),
      })),
      
      // Helper functions
      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id)
      },
      
      getStudyById: (projectId, studyId) => {
        const project = get().projects.find((project) => project.id === projectId)
        if (!project) return undefined
        return project.studies.find((study) => study.id === studyId)
      },
    }),
    {
      name: 'afkar-projects',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ projects: state.projects }),
    }
  )
) 