"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

const loadingStateVariants = cva(
  "w-full flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "min-h-[200px]",
        card: "min-h-[300px]",
        fullscreen: "min-h-screen",
        inline: "min-h-[40px]",
        skeleton: "animate-pulse",
      },
      size: {
        default: "gap-4",
        sm: "gap-2",
        lg: "gap-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingStateVariants> {
  text?: string
  showSpinner?: boolean
  spinnerSize?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
  fullScreen?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
} as const

export function LoadingState({
  variant,
  size = 'md',
  text,
  showSpinner = true,
  spinnerSize = 'md',
  className,
  children,
  fullScreen = false,
  ariaLabel,
  ...props
}: LoadingStateProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center space-y-4',
    {
      'min-h-screen': fullScreen,
      'p-8': !fullScreen,
    },
    className
  )

  if (variant === "skeleton") {
    return (
      <div
        role="status"
        aria-label={ariaLabel || 'Loading content'}
        className={cn(loadingStateVariants({ variant, size, className }))}
        {...props}
      >
        {children || (
          <Card className="w-full h-full min-h-[200px] bg-muted">
            <div className="p-4 space-y-3">
              <motion.div
                className="h-4 bg-muted-foreground/15 rounded w-3/4"
                animate={{ opacity: [0.5, 0.7, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="space-y-2">
                <motion.div
                  className="h-3 bg-muted-foreground/15 rounded"
                  animate={{ opacity: [0.5, 0.7, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="h-3 bg-muted-foreground/15 rounded w-5/6"
                  animate={{ opacity: [0.5, 0.7, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.4,
                  }}
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel || text || 'Loading'}
      className={containerClasses}
      {...props}
    >
      {showSpinner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <Loader2
            className={cn('animate-spin text-gray-600', spinnerSizes[spinnerSize])}
            aria-hidden="true"
          />
        </motion.div>
      )}
      {text && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.1,
          }}
        >
          {text}
        </motion.p>
      )}
      {children}
    </div>
  )
}

export function FullScreenLoading({
  text = 'Loading...',
  className,
  ariaLabel,
}: Omit<LoadingStateProps, 'fullScreen'>) {
  return (
    <div
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || 'Loading overlay'}
    >
      <LoadingState
        text={text}
        fullScreen
        size="lg"
        className={className}
        ariaLabel={ariaLabel}
      />
    </div>
  )
}

export function ButtonLoading({
  className,
  size = 'sm',
}: Pick<LoadingStateProps, 'className' | 'size'>) {
  return (
    <Loader2
      className={cn('animate-spin', spinnerSizes[size], className)}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <Card className="w-full" role="status" aria-label="Loading card">
      <div className="p-4 space-y-3">
        <motion.div
          className="h-4 bg-muted-foreground/15 rounded w-3/4"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="space-y-2">
          <motion.div
            className="h-3 bg-muted-foreground/15 rounded"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-3 bg-muted-foreground/15 rounded w-5/6"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.4,
            }}
          />
        </div>
      </div>
    </Card>
  )
}

export function SkeletonButton() {
  return (
    <motion.div
      className="h-10 w-full bg-muted-foreground/15 rounded"
      animate={{ opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      role="status"
      aria-label="Loading button"
    />
  )
}

export function SkeletonAvatar() {
  return (
    <motion.div
      className="h-10 w-10 rounded-full bg-muted-foreground/15"
      animate={{ opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      role="status"
      aria-label="Loading avatar"
    />
  )
}

export function SkeletonInput() {
  return (
    <motion.div
      className="h-10 w-full bg-muted-foreground/15 rounded-md"
      animate={{ opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      role="status"
      aria-label="Loading input"
    />
  )
}

export function SkeletonText({ width = '100%' }: { width?: string }) {
  return (
    <motion.div
      className="h-4 bg-muted-foreground/15 rounded"
      style={{ width }}
      animate={{ opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      role="status"
      aria-label="Loading text"
    />
  )
} 