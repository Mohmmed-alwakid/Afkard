import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Researcher Dashboard - Afkar',
  description: 'Manage your research projects and templates',
};

import { ResearcherDashboard } from '@/components/researcher/dashboard'

export default function ResearcherPage() {
  return <ResearcherDashboard />
} 