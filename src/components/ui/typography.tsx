import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface TypographyProps extends HTMLAttributes<HTMLHeadingElement> {}

export const TypographyH1 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
)
TypographyH1.displayName = "TypographyH1"

export const TypographyH2 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
)
TypographyH2.displayName = "TypographyH2"

export const TypographyH3 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
)
TypographyH3.displayName = "TypographyH3"

export const TypographyH4 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn("text-base font-semibold tracking-tight", className)}
      {...props}
    />
  )
)
TypographyH4.displayName = "TypographyH4"

export const TypographyP = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("leading-7", className)}
      {...props}
    />
  )
)
TypographyP.displayName = "TypographyP"

export const TypographyBlockquote = forwardRef<HTMLQuoteElement, HTMLAttributes<HTMLQuoteElement>>(
  ({ className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  )
)
TypographyBlockquote.displayName = "TypographyBlockquote"

export const TypographyList = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("my-6 ml-6 list-disc", className)}
      {...props}
    />
  )
)
TypographyList.displayName = "TypographyList"

export const TypographyInlineCode = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  )
)
TypographyInlineCode.displayName = "TypographyInlineCode" 