"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/store/auth-store"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  className?: string
  onSuccess?: () => void
}

export function LoginForm({ className, onSuccess }: LoginFormProps) {
  const { t, isRTL } = useTranslations()
  const router = useRouter()
  const { login, isLoading, error } = useAuthStore()
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null)
    
    try {
      const result = await login(data.email, data.password, data.rememberMe)
      if (result?.user) {
        console.log("Login successful")
        onSuccess?.()
        router.push("/home")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Show user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        setErrorMessage("Incorrect email or password. Please try again.")
      } else if (error.message.includes("Email not confirmed")) {
        setErrorMessage("Please verify your email before logging in.")
      } else {
        setErrorMessage(error.message || "An error occurred during login")
      }
    }
  }

  return (
    <div className={cn("grid gap-6", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4 animate-in fade-in duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.email}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.emailPlaceholder}
                    type="email"
                    autoComplete="email"
                    isRTL={isRTL}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.password}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.passwordPlaceholder}
                    type="password"
                    autoComplete="current-password"
                    isRTL={isRTL}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t.rememberMe}
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#6A55FF] hover:underline"
            >
              {t.forgotPassword}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.signingIn}
              </>
            ) : (
              t.signIn
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t.orContinueWith}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <Button variant="outline" type="button" disabled={isLoading}>
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          {t.continueWithGoogle}
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t.dontHaveAccount} </span>
        <Link href="/register" className="text-primary hover:underline">
          {t.signUp}
        </Link>
      </div>
    </div>
  )
} 