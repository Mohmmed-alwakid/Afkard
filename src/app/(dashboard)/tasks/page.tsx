import { Suspense } from 'react';
import { TaskList } from '@/components/tasks/task-list';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Tasks | AfkarD',
  description: 'Manage your research tasks',
};

// Force dynamic rendering to prevent build-time auth errors
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const { user } = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div className="container py-6">
      <Suspense fallback={<TasksPageSkeleton />}>
        <TaskList userId={user.id} />
      </Suspense>
    </div>
  );
}

function TasksPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-[150px] mb-2" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>
      
      <Skeleton className="h-16 w-full" />
      
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[150px] w-full" />
        ))}
      </div>
    </div>
  );
} 