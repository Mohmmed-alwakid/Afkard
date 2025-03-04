"use client"

import * as React from "react"
import { Suspense } from "react"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Icons } from "@/components/icons"
import { Logo } from "@/components/logo"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { 
  TypographyH1, 
  TypographyH2, 
  TypographyP 
} from "@/components/ui/typography"
import { FC } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase-browser"
import { useToast } from "@/components/ui/use-toast"

// Create an inner component that uses useSearchParams
function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to login
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Logo className="mx-auto" />
          <TypographyH1 className="text-2xl font-semibold tracking-tight">Reset password</TypographyH1>
          <TypographyP className="text-sm text-muted-foreground">
            Enter your new password below
          </TypographyP>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              {token ? (
                <UpdatePasswordForm token={token} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="text-destructive text-center">
                    <Icons.warning className="mx-auto mb-4 h-10 w-10" />
                    <TypographyP className="font-medium">Invalid or expired token</TypographyP>
                    <TypographyP className="text-sm text-muted-foreground mt-2">
                      Please request a new password reset link.
                    </TypographyP>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <TypographyP className="mt-2 text-xs text-center text-muted-foreground">
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </TypographyP>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Wrap with Suspense in the main component
export default function ResetPasswordContent() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = z.object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      // Get the hash from the URL
      const hash = window.location.hash.substring(1)
      
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })
      
      // Redirect to login
      window.location.href = "/login"
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </Suspense>
  )
} 