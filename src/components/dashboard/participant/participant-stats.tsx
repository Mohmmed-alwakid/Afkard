'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  DollarSign
} from 'lucide-react';

interface StatsProps {
  userId: string;
}

interface Stats {
  totalStudies: number;
  completedStudies: number;
  pendingStudies: number;
  totalEarned: number;
}

export function ParticipantStats({ userId }: StatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalStudies: 0,
    completedStudies: 0,
    pendingStudies: 0,
    totalEarned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        
        // Fetch participant studies
        const { data, error } = await supabase
          .from('study_participants')
          .select(`
            id, 
            status,
            reward_amount,
            reward_status
          `)
          .eq('user_id', userId);
        
        if (error) throw error;
        
        const totalStudies = data?.length || 0;
        const completedStudies = data?.filter(p => p.status === 'completed').length || 0;
        const pendingStudies = data?.filter(p => p.status === 'pending' || p.status === 'accepted').length || 0;
        
        // Calculate total earned (only count paid rewards)
        const totalEarned = data?.reduce((sum, p) => {
          if (p.reward_status === 'paid' && p.reward_amount) {
            return sum + p.reward_amount;
          }
          return sum;
        }, 0) || 0;
        
        setStats({
          totalStudies,
          completedStudies,
          pendingStudies,
          totalEarned,
        });
      } catch (error) {
        console.error('Error fetching participant stats:', error);
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
        description="All studies joined"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatsCard
        title="Completed"
        value={stats.completedStudies.toString()}
        description="Studies completed"
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatsCard
        title="Pending"
        value={stats.pendingStudies.toString()}
        description="Studies in progress"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatsCard
        title="Total Earned"
        value={`$${stats.totalEarned.toFixed(2)}`}
        description="From completed studies"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
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