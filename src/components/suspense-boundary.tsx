"use client"

import * as React from "react"
import { Suspense } from "react"
import { LoadingState } from "@/components/ui/loading-state"
import { ErrorBoundary } from "@/components/error-boundary"

interface SuspenseBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onError?: (error: Error, info: React.ErrorInfo) => void
  onReset?: () => void
  resetKeys?: Array<any>
  loadingText?: string
  loadingVariant?: "default" | "card" | "fullscreen" | "inline" | "skeleton"
}

export function SuspenseBoundary({
  children,
  fallback,
  errorFallback,
  onError,
  onReset,
  resetKeys,
  loadingText = "Loading...",
  loadingVariant = "default",
}: SuspenseBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={errorFallback}
      onError={onError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      <Suspense
        fallback={
          fallback || (
            <LoadingState
              variant={loadingVariant}
              text={loadingText}
            />
          )
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Higher-order component for easy wrapping
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<SuspenseBoundaryProps, "children"> = {}
) {
  return function WithSuspenseComponent(props: P) {
    return (
      <SuspenseBoundary {...options}>
        <Component {...props} />
      </SuspenseBoundary>
    )
  }
}

// Async boundary for data fetching components
export function AsyncBoundary({
  children,
  loadingFallback,
  errorFallback,
  suspenseFallback,
  onError,
  onReset,
  resetKeys,
}: {
  children: React.ReactNode
  loadingFallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  suspenseFallback?: React.ReactNode
  onError?: (error: Error, info: React.ErrorInfo) => void
  onReset?: () => void
  resetKeys?: Array<any>
}) {
  return (
    <ErrorBoundary
      fallback={errorFallback}
      onError={onError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      <Suspense fallback={suspenseFallback || loadingFallback || <LoadingState />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Route boundary for page components
export function RouteBoundary({
  children,
  loadingText = "Loading page...",
}: {
  children: React.ReactNode
  loadingText?: string
}) {
  return (
    <AsyncBoundary
      loadingFallback={
        <LoadingState
          variant="fullscreen"
          text={loadingText}
          spinnerSize="lg"
        />
      }
    >
      {children}
    </AsyncBoundary>
  )
}

// Query boundary for data fetching
export function QueryBoundary({
  children,
  loadingText = "Loading data...",
}: {
  children: React.ReactNode
  loadingText?: string
}) {
  return (
    <AsyncBoundary
      loadingFallback={
        <LoadingState
          variant="card"
          text={loadingText}
        />
      }
    >
      {children}
    </AsyncBoundary>
  )
}

// Form boundary for async form submissions
export function FormBoundary({
  children,
  loadingText = "Submitting...",
}: {
  children: React.ReactNode
  loadingText?: string
}) {
  return (
    <AsyncBoundary
      loadingFallback={
        <LoadingState
          variant="inline"
          text={loadingText}
          spinnerSize="sm"
        />
      }
    >
      {children}
    </AsyncBoundary>
  )
} 