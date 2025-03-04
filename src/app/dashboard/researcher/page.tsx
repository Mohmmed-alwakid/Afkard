import { Suspense } from 'react';
import { Metadata } from 'next';
import ResearcherDashboardContent from '@/components/dashboard/researcher/researcher-dashboard';
import { DashboardSkeleton } from '@/components/ui/skeletons';

export const metadata: Metadata = {
  title: 'Researcher Dashboard | AfkarD',
  description: 'Manage your research studies, analyze data, and track participants.',
};

export default function ResearcherDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ResearcherDashboardContent />
    </Suspense>
  );
} 