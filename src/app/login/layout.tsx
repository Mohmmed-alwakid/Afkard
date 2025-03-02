import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login | Afkar",
  description: "Login to your Afkar account",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 