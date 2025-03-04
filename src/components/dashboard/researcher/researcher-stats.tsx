'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  BarChart, 
  Clock 
} from 'lucide-react';

interface StatsProps {
  userId: string;
}

interface Stats {
  totalStudies: number;
  activeStudies: number;
  totalParticipants: number;
  completionRate: number;
}

export function ResearcherStats({ userId }: StatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalStudies: 0,
    activeStudies: 0,
    totalParticipants: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        
        // Fetch total studies
        const { data: studies, error: studiesError } = await supabase
          .from('studies')
          .select('id, status')
          .eq('researcher_id', userId);
        
        if (studiesError) throw studiesError;
        
        const totalStudies = studies?.length || 0;
        const activeStudies = studies?.filter(s => s.status === 'active').length || 0;
        
        // Get study IDs for participant query
        const studyIds = studies?.map(s => s.id) || [];
        
        let totalParticipants = 0;
        let completedParticipants = 0;
        
        if (studyIds.length > 0) {
          // Fetch participants
          const { data: participants, error: participantsError } = await supabase
            .from('study_participants')
            .select('id, status')
            .in('study_id', studyIds);
          
          if (participantsError) throw participantsError;
          
          totalParticipants = participants?.length || 0;
          completedParticipants = participants?.filter(p => p.status === 'completed').length || 0;
        }
        
        // Calculate completion rate
        const completionRate = totalParticipants > 0 
          ? Math.round((completedParticipants / totalParticipants) * 100) 
          : 0;
        
        setStats({
          totalStudies,
          activeStudies,
          totalParticipants,
          completionRate,
        });
      } catch (error) {
        console.error('Error fetching researcher stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
  }, [userId]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Studies"
        value={stats.totalStudies.toString()}
        description="All studies created"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatsCard
        title="Active Studies"
        value={stats.activeStudies.toString()}
        description="Currently running"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatsCard
        title="Total Participants"
        value={stats.totalParticipants.toString()}
        description="Across all studies"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatsCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        description="Study completion"
        icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatsCard({ title, value, description, icon, isLoading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-7 w-16 animate-pulse rounded-md bg-muted"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 