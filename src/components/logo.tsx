'use client';

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export function Logo({ size = 'md', hideText = false }: LogoProps) {
  const dimensions = {
    sm: { width: 24, height: 24, className: 'text-lg' },
    md: { width: 32, height: 32, className: 'text-xl' },
    lg: { width: 48, height: 48, className: 'text-2xl' },
  };
  
  const { width, height, className } = dimensions[size];
  
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <Image
          src="/logo.svg"
          alt="Afkar Logo"
          width={width}
          height={height}
          priority
        />
      </div>
      {!hideText && (
        <span className={`font-bold ${className}`}>Afkar</span>
      )}
    </Link>
  );
} 