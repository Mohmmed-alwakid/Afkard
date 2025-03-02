"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "",
        error: "text-destructive",
        success: "text-green-500",
        warning: "text-yellow-500",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
      isRTL: {
        true: "[direction:rtl]",
        false: "[direction:ltr]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isRTL: false,
    },
  }
)

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  isRTL?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, isRTL, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, size, isRTL, className }))}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label } 