'use client';

import { useToastStore } from '@/store/toast-store';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end p-4 space-y-4 max-h-screen overflow-hidden md:p-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            layout
            className={`
              w-full max-w-sm overflow-hidden rounded-lg shadow-lg 
              flex items-start p-4 backdrop-blur-sm
              ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-900/90 dark:text-emerald-50'
                  : toast.type === 'error'
                  ? 'bg-red-50 text-red-900 dark:bg-red-900/90 dark:text-red-50'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/90 dark:text-amber-50'
                  : 'bg-blue-50 text-blue-900 dark:bg-blue-900/90 dark:text-blue-50'
              }
            `}
          >
            <div className="shrink-0 pt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              )}
            </div>
            
            <div className="ml-3 w-0 flex-1">
              <p className="font-medium text-sm">
                {toast.title}
              </p>
              
              {toast.description && (
                <p className="mt-1 text-sm opacity-90">
                  {toast.description}
                </p>
              )}
              
              {toast.action && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={toast.action.onClick}
                    className={`
                      inline-flex items-center px-3 py-1.5 border border-transparent text-xs 
                      font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 
                      focus:ring-offset-2 ${
                        toast.type === 'success'
                          ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                          : toast.type === 'error'
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : toast.type === 'warning'
                          ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      }
                    `}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => removeToast(toast.id)}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 