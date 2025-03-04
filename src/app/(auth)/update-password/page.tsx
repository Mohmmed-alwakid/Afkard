import React, { Suspense } from 'react';
import { Shell } from '@/components/shell';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';
import { Loader2 } from 'lucide-react';

export default function UpdatePasswordPage() {
  return (
    <Shell className="max-w-lg">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Update your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>
      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <UpdatePasswordForm />
      </Suspense>
    </Shell>
  );
} 