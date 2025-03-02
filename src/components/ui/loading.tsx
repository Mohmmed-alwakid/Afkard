import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  size?: "sm" | "default" | "lg"
  centered?: boolean
}

export function Loading({ 
  text = "Loading...", 
  size = "default", 
  centered = false,
  className,
  ...props 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2",
        centered && "justify-center",
        className
      )}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && (
        <span className={cn(
          "text-muted-foreground",
          size === "sm" && "text-sm",
          size === "lg" && "text-lg"
        )}>
          {text}
        </span>
      )}
    </div>
  )
} 