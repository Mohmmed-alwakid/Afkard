"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  UseFormReturn,
  useForm,
  DefaultValues,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ZodSchema } from "zod"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    error?: boolean
    loading?: boolean
  }
>(({ className, error, loading, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div 
        ref={ref} 
        className={cn(
          "space-y-2 relative",
          error && "animate-shake",
          loading && "opacity-70 pointer-events-none",
          className
        )} 
        {...props} 
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {props.children}
      </div>
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    optional?: boolean
  }
>(({ className, optional, children, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {optional && (
        <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
      )}
    </Label>
  )
})
FormLabel.displayName = LabelPrimitive.Root.displayName

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ asChild = false, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    const Comp = asChild ? Slot : "div"

    return (
      <Comp
        ref={ref}
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
    )
  }
)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-sm font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1",
        className
      )}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

interface UseZodForm<T extends FieldValues> {
  schema: ZodSchema
  defaultValues?: DefaultValues<T>
  mode?: "onSubmit" | "onChange" | "onBlur" | "all"
}

function useZodForm<T extends FieldValues>({
  schema,
  defaultValues,
  mode = "onSubmit",
}: UseZodForm<T>): UseFormReturn<T> {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  })

  return form
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useZodForm,
} 