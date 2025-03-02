"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onReset?: () => void
  onError?: (error: Error, info: React.ErrorInfo) => void
  resetKeys?: Array<unknown>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

const DefaultErrorFallback = ({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) => {
  const router = useRouter()

  const handleReset = () => {
    resetErrorBoundary()
  }

  const handleGoHome = () => {
    router.push("/")
    resetErrorBoundary()
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-destructive/10 text-destructive rounded-full">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Something went wrong</h3>
              <p className="text-sm text-muted-foreground max-w-[340px]">
                {error.message || "An unexpected error occurred. Please try again."}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 max-w-[340px] overflow-x-auto text-xs text-muted-foreground bg-muted p-2 rounded-md">
                  {error.stack}
                </pre>
              )}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleGoHome}>
                Go Home
              </Button>
              <Button onClick={handleReset}>Try Again</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error("Error caught by error boundary:", error, errorInfo)

    // Update state with error info
    this.setState({
      errorInfo,
    })

    // Notify user
    toast({
      title: "An error occurred",
      description: error.message,
      variant: "destructive",
    })

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add your error reporting service here
      // Example: Sentry.captureException(error)
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError) {
      const compareKeys = (
        prevKeys: Array<unknown> = [],
        currentKeys: Array<unknown> = []
      ) =>
        prevKeys.length === currentKeys.length &&
        prevKeys.every((key, index) => {
          return Object.is(key, currentKeys[index])
        })

      if (
        this.props.resetKeys &&
        !compareKeys(prevProps.resetKeys, this.props.resetKeys)
      ) {
        this.resetErrorBoundary()
      }
    }
  }

  public resetErrorBoundary = () => {
    this.props.onReset?.()
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  public render() {
    const { hasError, error } = this.state
    const { fallback: FallbackComponent = DefaultErrorFallback } = this.props

    if (hasError && error) {
      return (
        <AnimatePresence mode="wait">
          <FallbackComponent
            error={error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        </AnimatePresence>
      )
    }

    return this.props.children
  }
} 