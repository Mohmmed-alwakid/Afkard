'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/stores/user';
import { ResearcherStats } from './researcher-stats';
import { ResearcherStudies } from './researcher-studies';
import { ResearcherParticipants } from './researcher-participants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { CreateStudyDialog } from './create-study-dialog';

export default function ResearcherDashboardContent() {
  const { user, profile, isLoading } = useUser();
  const [isCreateStudyOpen, setIsCreateStudyOpen] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user || !profile) {
    return <div className="text-center py-10">
      <h3 className="text-lg font-medium">Session expired</h3>
      <p className="text-muted-foreground mt-2">Please log in again to access your dashboard.</p>
      <Button asChild className="mt-4">
        <Link href="/login">Login</Link>
      </Button>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {profile.display_name || user.email}
          </p>
        </div>
        <Button onClick={() => setIsCreateStudyOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Study
        </Button>
      </div>

      <ResearcherStats userId={user.id} />

      <Tabs defaultValue="studies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="studies">My Studies</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
        </TabsList>
        <TabsContent value="studies" className="space-y-4">
          <ResearcherStudies userId={user.id} />
        </TabsContent>
        <TabsContent value="participants" className="space-y-4">
          <ResearcherParticipants userId={user.id} />
        </TabsContent>
      </Tabs>

      <CreateStudyDialog 
        open={isCreateStudyOpen} 
        onOpenChange={setIsCreateStudyOpen} 
        userId={user.id}
      />
    </div>
  );
} 