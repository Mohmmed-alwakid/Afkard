"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import ResetPasswordContent from "./reset-password-content";

export default function ResetPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <TypographyH1>Reset your password</TypographyH1>
          <TypographyP>Enter a new password for your account</TypographyP>
        </div>
        <ResetPasswordContent />
      </div>
    </div>
  );
} 