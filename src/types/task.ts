import { z } from 'zod';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  project_id?: string;
  study_id?: string;
  parent_id?: string;
  tags?: string[];
  is_completed: boolean;
}

export type TaskCreate = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;

export const taskSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  due_date: z.string().datetime().optional(),
  created_by: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  study_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  is_completed: z.boolean().default(false),
});

export type TaskFormValues = z.infer<typeof taskSchema>; 