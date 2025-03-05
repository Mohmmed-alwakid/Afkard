import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ProjectCategory, Study, StudyType } from './project-store';

export interface TemplateStudy {
  id: string;
  type: StudyType;
  title: string;
  description?: string;
  questions?: { id: string; text: string; type: string }[];
  settings?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: ProjectCategory | string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  studies: TemplateStudy[];
}

interface TemplateState {
  templates: Template[];
  
  // Template actions
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, data: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  
  // Template study actions
  addTemplateStudy: (templateId: string, study: Omit<TemplateStudy, 'id'>) => void;
  updateTemplateStudy: (templateId: string, studyId: string, data: Partial<TemplateStudy>) => void;
  deleteTemplateStudy: (templateId: string, studyId: string) => void;
  
  // Helper functions
  getTemplateById: (id: string) => Template | undefined;
  getTemplateStudyById: (templateId: string, studyId: string) => TemplateStudy | undefined;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [
        // Default templates
        {
          id: 'template-usability-test',
          name: 'Usability Testing',
          description: 'A standard usability testing template with five users',
          category: 'usability',
          thumbnail: '/illustrations/usability-testing.svg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: true,
          studies: [
            {
              id: uuidv4(),
              type: 'test',
              title: 'User Testing Session',
              description: 'A session for observing users interacting with your product',
            }
          ]
        },
        {
          id: 'template-feedback-survey',
          name: 'Feedback Survey',
          description: 'A template for collecting user feedback on your product',
          category: 'feedback',
          thumbnail: '/illustrations/feedback-survey.svg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: true,
          studies: [
            {
              id: uuidv4(),
              type: 'survey',
              title: 'User Satisfaction Survey',
              description: 'A survey to measure user satisfaction and gather feedback',
            }
          ]
        },
        {
          id: 'template-user-interviews',
          name: 'User Interviews',
          description: 'A template for conducting in-depth user interviews',
          category: 'ux-research',
          thumbnail: '/illustrations/user-interviews.svg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: true,
          studies: [
            {
              id: uuidv4(),
              type: 'interview',
              title: 'User Interview Session',
              description: 'An interview session to understand user needs and behaviors',
            }
          ]
        },
      ],
      
      // Template actions
      addTemplate: (templateData) => set((state) => ({
        templates: [
          ...state.templates,
          {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...templateData,
          }
        ],
      })),
      
      updateTemplate: (id, data) => set((state) => ({
        templates: state.templates.map((template) => 
          template.id === id 
            ? { 
                ...template, 
                ...data, 
                updatedAt: new Date().toISOString() 
              } 
            : template
        ),
      })),
      
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
      })),
      
      // Template study actions
      addTemplateStudy: (templateId, studyData) => set((state) => ({
        templates: state.templates.map((template) => 
          template.id === templateId 
            ? { 
                ...template, 
                updatedAt: new Date().toISOString(),
                studies: [
                  ...template.studies, 
                  {
                    id: uuidv4(),
                    ...studyData,
                  }
                ],
              } 
            : template
        ),
      })),
      
      updateTemplateStudy: (templateId, studyId, data) => set((state) => ({
        templates: state.templates.map((template) => 
          template.id === templateId 
            ? { 
                ...template, 
                updatedAt: new Date().toISOString(),
                studies: template.studies.map((study) => 
                  study.id === studyId 
                    ? { 
                        ...study, 
                        ...data,
                      } 
                    : study
                ),
              } 
            : template
        ),
      })),
      
      deleteTemplateStudy: (templateId, studyId) => set((state) => ({
        templates: state.templates.map((template) => 
          template.id === templateId 
            ? { 
                ...template, 
                updatedAt: new Date().toISOString(),
                studies: template.studies.filter((study) => study.id !== studyId),
              } 
            : template
        ),
      })),
      
      // Helper functions
      getTemplateById: (id) => {
        return get().templates.find((template) => template.id === id);
      },
      
      getTemplateStudyById: (templateId, studyId) => {
        const template = get().templates.find((template) => template.id === templateId);
        if (!template) return undefined;
        return template.studies.find((study) => study.id === studyId);
      },
    }),
    {
      name: 'afkar-templates',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ templates: state.templates }),
    }
  )
); 