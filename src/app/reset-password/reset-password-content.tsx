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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  )
} 