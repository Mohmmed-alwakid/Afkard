import { Metadata } from 'next';
import { Shell } from '@/components/shell';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Verify Email - Afkar',
  description: 'Verify your email address to continue',
};

export default function VerifyEmailPage() {
  return (
    <Shell className="max-w-lg">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Icons.mail className="h-12 w-12 text-muted-foreground" />
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent you a verification link. Please check your email and
            click the link to verify your account.
          </p>
        </div>
      </div>
    </Shell>
  );
} 