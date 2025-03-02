import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  [
    // Base styles
    "flex min-h-[80px] w-full rounded-md border bg-background text-sm",
    "transition-all duration-200 ease-in-out",
    "placeholder:text-muted-foreground/60",
    "font-sans leading-relaxed",
    
    // Focus styles
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus:shadow-sm",
    
    // Disabled and read-only styles
    "disabled:cursor-not-allowed disabled:opacity-50",
    "read-only:bg-muted/50 read-only:cursor-default",
    
    // Custom scrollbar for webkit browsers
    "scrollbar-thin scrollbar-thumb-rounded-md scrollbar-track-transparent",
    "scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30",
    
    // Improved text selection
    "selection:bg-primary/20 selection:text-primary",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-input",
          "focus-visible:ring-ring",
          "hover:border-muted-foreground/30",
          "aria-[invalid=true]:border-destructive/50",
          "aria-[invalid=true]:text-destructive",
        ].join(" "),
        error: [
          "border-destructive/50 text-destructive",
          "dark:border-destructive",
          "focus-visible:ring-destructive",
          "placeholder:text-destructive/60",
          "animate-shake",
        ].join(" "),
        success: [
          "border-green-500/50 text-green-600",
          "dark:border-green-500",
          "focus-visible:ring-green-500",
          "placeholder:text-green-600/60",
          "animate-success",
        ].join(" "),
        warning: [
          "border-yellow-500/50 text-yellow-600",
          "dark:border-yellow-500",
          "focus-visible:ring-yellow-500",
          "placeholder:text-yellow-600/60",
          "animate-pulse",
        ].join(" "),
        afkar: [
          "border-afkar-purple/50 text-afkar-purple",
          "dark:border-afkar-purple",
          "focus-visible:ring-afkar-purple",
          "placeholder:text-afkar-purple/60",
          "hover:bg-afkar-purple/5",
        ].join(" "),
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
        smart: "resize-none transition-height",
      },
      size: {
        sm: "text-xs px-2 py-1 min-h-[60px] max-h-[120px]",
        default: "text-sm px-3 py-2 min-h-[80px] max-h-[300px]",
        lg: "text-base px-4 py-3 min-h-[100px] max-h-[500px]",
      },
      isRTL: {
        true: "[direction:rtl]",
        false: "[direction:ltr]",
      },
    },
    defaultVariants: {
      variant: "default",
      resize: "vertical",
      size: "default",
      isRTL: false,
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  success?: boolean
  warning?: boolean
  isRTL?: boolean
  maxLength?: number
  showCount?: boolean
  autoResize?: boolean
  onHeightChange?: (height: number) => void
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    resize, 
    size,
    error, 
    success, 
    warning, 
    isRTL,
    maxLength,
    showCount = false,
    autoResize = false,
    onHeightChange,
    onChange,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0)
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const combinedRef = useCombinedRefs(ref, textareaRef)

    // Determine variant based on state props
    const computedVariant = error
      ? "error"
      : success
      ? "success"
      : warning
      ? "warning"
      : variant

    // Auto-resize functionality
    const handleResize = React.useCallback(() => {
      if (!textareaRef.current || !autoResize) return
      
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${scrollHeight}px`
      
      onHeightChange?.(scrollHeight)
    }, [autoResize, onHeightChange])

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setCharCount(value.length)
      handleResize()
      onChange?.(e)
    }

    // Initialize auto-resize
    React.useEffect(() => {
      if (autoResize) {
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      }
    }, [autoResize, handleResize])

    return (
      <div className="relative">
        <textarea
          className={cn(
            textareaVariants({ 
              variant: computedVariant, 
              resize: autoResize ? "smart" : resize, 
              size,
              isRTL 
            }), 
            className
          )}
          ref={combinedRef}
          onChange={handleChange}
          maxLength={maxLength}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {showCount && (
          <div 
            className={cn(
              "absolute bottom-1.5 right-2 text-xs text-muted-foreground/60",
              isRTL && "left-2 right-auto"
            )}
          >
            {maxLength ? `${charCount}/${maxLength}` : charCount}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

// Helper function to combine refs
function useCombinedRefs<T>(...refs: Array<React.Ref<T>>): React.RefCallback<T> {
  return React.useCallback((element: T) => {
    refs.forEach((ref) => {
      if (!ref) return

      if (typeof ref === 'function') {
        ref(element)
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T>).current = element
      }
    })
  }, [refs])
}

export { Textarea } 