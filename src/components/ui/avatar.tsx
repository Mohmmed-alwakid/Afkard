"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16"
      },
      status: {
        online: "after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:border-2 after:border-background after:bg-green-500",
        offline: "after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:border-2 after:border-background after:bg-gray-500",
        busy: "after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:border-2 after:border-background after:bg-red-500",
        away: "after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:border-2 after:border-background after:bg-yellow-500",
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const fallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  status?: "online" | "offline" | "busy" | "away"
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  limit?: number
  total?: number
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, limit = 3, total, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const visibleAvatars = childrenArray.slice(0, limit)
    const remainingCount = total || childrenArray.length - limit

    return (
      <div
        ref={ref}
        className={cn("flex -space-x-2", className)}
        {...props}
      >
        {visibleAvatars}
        {remainingCount > 0 && (
          <div className={cn(
            avatarVariants({ size: "default" }),
            "bg-muted flex items-center justify-center border-2 border-background"
          )}>
            <span className="text-xs font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup } 