import { Suspense } from 'react';
import { Metadata } from 'next';
import ParticipantDashboardContent from '@/components/dashboard/participant/participant-dashboard';
import { DashboardSkeleton } from '@/components/ui/skeletons';

export const metadata: Metadata = {
  title: 'Participant Dashboard | AfkarD',
  description: 'View and participate in research studies.',
};

export default function ParticipantDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ParticipantDashboardContent />
    </Suspense>
  );
} 