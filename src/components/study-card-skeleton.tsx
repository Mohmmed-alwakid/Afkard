"use client"

import { Card } from "@/components/ui/card"

export function StudyCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="w-16 h-5 bg-muted rounded-full mb-2 animate-pulse" />
          <div className="w-32 h-5 bg-muted rounded mb-1 animate-pulse" />
          <div className="w-24 h-4 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="w-16 h-5 bg-muted rounded-full animate-pulse" />
      </div>
      <div className="flex items-center justify-between">
        <div className="w-24 h-4 bg-muted/50 rounded animate-pulse" />
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  )
} 