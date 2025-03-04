'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { StudyCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Users, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface StudiesProps {
  userId: string;
}

interface Study {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  participant_count: number;
}

export function ResearcherStudies({ userId }: StudiesProps) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudies() {
      try {
        setIsLoading(true);
        
        // Fetch studies
        const { data, error } = await supabase
          .from('studies')
          .select(`
            id, 
            title, 
            description, 
            status, 
            created_at
          `)
          .eq('researcher_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data) {
          setStudies([]);
          return;
        }
        
        // Fetch participant counts for each study
        const studiesWithParticipants = await Promise.all(
          data.map(async (study) => {
            const { count, error: countError } = await supabase
              .from('study_participants')
              .select('id', { count: 'exact', head: true })
              .eq('study_id', study.id);
            
            if (countError) {
              console.error('Error fetching participant count:', countError);
              return { ...study, participant_count: 0 };
            }
            
            return { ...study, participant_count: count || 0 };
          })
        );
        
        setStudies(studiesWithParticipants);
      } catch (error) {
        console.error('Error fetching studies:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStudies();
  }, [userId]);

  const handleStatusChange = async (studyId: string, newStatus: Study['status']) => {
    try {
      const { error } = await supabase
        .from('studies')
        .update({ status: newStatus })
        .eq('id', studyId);
      
      if (error) throw error;
      
      // Update local state
      setStudies(studies.map(study => 
        study.id === studyId ? { ...study, status: newStatus } : study
      ));
    } catch (error) {
      console.error('Error updating study status:', error);
    }
  };

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
          <h3 className="text-lg font-medium">No studies yet</h3>
          <p className="text-muted-foreground mt-2">
            Create your first study to get started with research.
          </p>
          <Button className="mt-4">Create Study</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {studies.map((study) => (
        <StudyCard 
          key={study.id} 
          study={study} 
          onStatusChange={handleStatusChange} 
        />
      ))}
    </div>
  );
}

interface StudyCardProps {
  study: Study;
  onStatusChange: (studyId: string, status: Study['status']) => Promise<void>;
}

function StudyCard({ study, onStatusChange }: StudyCardProps) {
  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={statusColors[study.status]}>
            {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/studies/${study.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/studies/${study.id}/edit`}>
                  Edit Study
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {study.status === 'draft' && (
                <DropdownMenuItem onClick={() => onStatusChange(study.id, 'active')}>
                  Activate Study
                </DropdownMenuItem>
              )}
              {study.status === 'active' && (
                <DropdownMenuItem onClick={() => onStatusChange(study.id, 'completed')}>
                  Mark as Completed
                </DropdownMenuItem>
              )}
              {(study.status === 'draft' || study.status === 'active') && (
                <DropdownMenuItem onClick={() => onStatusChange(study.id, 'archived')}>
                  Archive Study
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-xl">{study.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {study.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>{study.participant_count} participants</span>
          <span className="mx-2">•</span>
          <Calendar className="mr-1 h-4 w-4" />
          <span>Created {formatDistanceToNow(new Date(study.created_at))} ago</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/dashboard/studies/${study.id}`}>
            <span>View Study</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 