'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { StudyCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ArrowUpRight, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface StudiesProps {
  userId: string;
  status: 'active' | 'completed';
}

interface Study {
  id: string;
  study_id: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  created_at: string;
  study: {
    title: string;
    description: string | null;
    type: 'test' | 'interview';
    researcher_id: string;
    project_id: string;
    researcher: {
      display_name: string;
    };
  };
  progress: number;
}

export function ParticipantStudies({ userId, status }: StudiesProps) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudies() {
      try {
        setIsLoading(true);
        
        // Determine which statuses to fetch based on the active/completed prop
        const statusesToFetch = status === 'active' 
          ? ['pending', 'accepted'] 
          : ['completed', 'rejected'];
        
        // Fetch studies
        const { data, error } = await supabase
          .from('study_participants')
          .select(`
            id,
            study_id,
            status,
            created_at,
            progress,
            studies:study_id (
              title,
              description,
              type,
              researcher_id,
              project_id,
              profiles:researcher_id (
                display_name
              )
            )
          `)
          .eq('user_id', userId)
          .in('status', statusesToFetch)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match our Study interface
        const transformedData = data?.map(item => ({
          id: item.id,
          study_id: item.study_id,
          status: item.status,
          created_at: item.created_at,
          progress: item.progress || 0,
          study: {
            title: item.studies.title,
            description: item.studies.description,
            type: item.studies.type,
            researcher_id: item.studies.researcher_id,
            project_id: item.studies.project_id,
            researcher: {
              display_name: item.studies.profiles?.display_name || 'Researcher',
            },
          },
        })) || [];
        
        setStudies(transformedData);
      } catch (error) {
        console.error('Error fetching studies:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStudies();
  }, [userId, status]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <StudyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (studies.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <h3 className="text-lg font-medium">
            {status === 'active' ? 'No active studies' : 'No completed studies'}
          </h3>
          <p className="text-muted-foreground mt-2">
            {status === 'active' 
              ? 'Join studies to participate in research.' 
              : 'Complete studies to see them here.'}
          </p>
          {status === 'active' && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/studies/browse">Browse Studies</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {studies.map((study) => (
          <StudyCard key={study.id} study={study} isCompleted={status === 'completed'} />
        ))}
      </div>
    </TooltipProvider>
  );
}

interface StudyCardProps {
  study: Study;
  isCompleted: boolean;
}

function StudyCard({ study, isCompleted }: StudyCardProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    accepted: {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      icon: <AlertCircle className="mr-1 h-3 w-3" />,
    },
  };

  const config = statusConfig[study.status];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={config.className}>
            <span className="flex items-center">
              {config.icon}
              {config.label}
            </span>
          </Badge>
          <Badge variant="outline">
            {study.study.type === 'test' ? 'Test' : 'Interview'}
          </Badge>
        </div>
        <CardTitle className="text-xl">{study.study.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {study.study.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Joined {formatDistanceToNow(new Date(study.created_at))} ago</span>
          </div>
          
          {!isCompleted && study.status === 'accepted' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{study.progress}%</span>
              </div>
              <Progress value={study.progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/projects/${study.study.project_id}/studies/${study.study_id}`}>
            <span>{isCompleted ? 'View Results' : 'Continue Study'}</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 