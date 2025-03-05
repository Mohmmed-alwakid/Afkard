'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Calendar 
} from 'lucide-react';

const items = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: <FolderKanban className="h-4 w-4 mr-2" />,
  },
  {
    title: 'Tasks',
    href: '/dashboard/tasks',
    icon: <CheckSquare className="h-4 w-4 mr-2" />,
  },
  {
    title: 'Teams',
    href: '/dashboard/teams',
    icon: <Users className="h-4 w-4 mr-2" />,
  },
  {
    title: 'Calendar',
    href: '/dashboard/calendar',
    icon: <Calendar className="h-4 w-4 mr-2" />,
  },
];

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary flex items-center',
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
} 