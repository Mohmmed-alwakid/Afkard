import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = uuidv4();
    const newToast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default duration is 5 seconds
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Helper functions for creating different types of toasts
export const toast = {
  info: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'info',
      duration,
    });
  },
  
  success: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'success',
      duration,
    });
  },
  
  warning: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'warning',
      duration,
    });
  },
  
  error: (title: string, description?: string, duration?: number) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'error',
      duration,
    });
  },
  
  custom: (toast: Omit<Toast, 'id'>) => {
    useToastStore.getState().addToast(toast);
  },
}; 