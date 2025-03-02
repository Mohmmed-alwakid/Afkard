import { z } from 'zod';
import { type UserRole } from '@/store/auth-store';

/**
 * Utility function to create a Zod schema with error messages for forms
 * @returns A configured Zod schema with validation messages
 */
export function createFormSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema;
}

/**
 * Schema for user registration
 */
export const registerSchema = createFormSchema(
  z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    firstName: z
      .string()
      .min(1, { message: 'First name is required' })
      .max(50, { message: 'First name cannot exceed 50 characters' }),
    lastName: z
      .string()
      .min(1, { message: 'Last name is required' })
      .max(50, { message: 'Last name cannot exceed 50 characters' }),
    role: z.enum(['researcher', 'participant'] as const, {
      required_error: 'Please select a role',
    }),
    organization: z
      .string()
      .max(100, { message: 'Organization name cannot exceed 100 characters' })
      .optional(),
  })
);

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Schema for user login
 */
export const loginSchema = createFormSchema(
  z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' }),
    rememberMe: z
      .boolean()
      .optional()
      .default(false),
  })
);

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Schema for password reset
 */
export const resetPasswordSchema = createFormSchema(
  z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address' }),
  })
);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Schema for password update
 */
export const updatePasswordSchema = createFormSchema(
  z
    .object({
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Please confirm your password' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
);

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

/**
 * Schema for user profile update
 */
export const profileSchema = createFormSchema(
  z.object({
    firstName: z
      .string()
      .min(1, { message: 'First name is required' })
      .max(50, { message: 'First name cannot exceed 50 characters' }),
    lastName: z
      .string()
      .min(1, { message: 'Last name is required' })
      .max(50, { message: 'Last name cannot exceed 50 characters' }),
    organization: z
      .string()
      .max(100, { message: 'Organization name cannot exceed 100 characters' })
      .optional()
      .nullable(),
    title: z
      .string()
      .max(100, { message: 'Title cannot exceed 100 characters' })
      .optional()
      .nullable(),
    bio: z
      .string()
      .max(500, { message: 'Bio cannot exceed 500 characters' })
      .optional()
      .nullable(),
    phone: z
      .string()
      .max(20, { message: 'Phone number cannot exceed 20 characters' })
      .optional()
      .nullable(),
  })
);

export type ProfileFormValues = z.infer<typeof profileSchema>; 