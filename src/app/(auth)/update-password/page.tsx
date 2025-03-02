import { Metadata } from 'next';
import { Shell } from '@/components/shell';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';

export const metadata: Metadata = {
  title: 'Update Password - Afkar',
  description: 'Update your password',
};

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
      <UpdatePasswordForm />
    </Shell>
  );
} 