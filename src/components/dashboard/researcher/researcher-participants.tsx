'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { ParticipantListSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MoreHorizontal, 
  Mail, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ParticipantsProps {
  userId: string;
}

interface Participant {
  id: string;
  user_id: string;
  study_id: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  created_at: string;
  profile: {
    display_name: string;
    email: string;
    avatar_url: string | null;
  };
  study: {
    title: string;
  };
}

export function ResearcherParticipants({ userId }: ParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipants() {
      try {
        setIsLoading(true);
        
        // First get all studies by this researcher
        const { data: studies, error: studiesError } = await supabase
          .from('studies')
          .select('id')
          .eq('researcher_id', userId);
        
        if (studiesError) throw studiesError;
        
        if (!studies || studies.length === 0) {
          setParticipants([]);
          setIsLoading(false);
          return;
        }
        
        const studyIds = studies.map(s => s.id);
        
        // Then get all participants for these studies
        const { data, error } = await supabase
          .from('study_participants')
          .select(`
            id,
            user_id,
            study_id,
            status,
            created_at,
            profiles:user_id (
              display_name,
              email,
              avatar_url
            ),
            studies:study_id (
              title
            )
          `)
          .in('study_id', studyIds)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setParticipants(data || []);
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchParticipants();
  }, [userId]);

  const handleStatusChange = async (participantId: string, newStatus: Participant['status']) => {
    try {
      const { error } = await supabase
        .from('study_participants')
        .update({ status: newStatus })
        .eq('id', participantId);
      
      if (error) throw error;
      
      // Update local state
      setParticipants(participants.map(participant => 
        participant.id === participantId ? { ...participant, status: newStatus } : participant
      ));
    } catch (error) {
      console.error('Error updating participant status:', error);
    }
  };

  if (isLoading) {
    return <ParticipantListSkeleton />;
  }

  if (participants.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <h3 className="text-lg font-medium">No participants yet</h3>
          <p className="text-muted-foreground mt-2">
            Invite participants to your studies to see them here.
          </p>
          <Button className="mt-4">Invite Participants</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>
          Manage participants across all your studies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Study</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={participant.profile.avatar_url || ''} />
                    <AvatarFallback>
                      {participant.profile.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{participant.profile.display_name}</div>
                    <div className="text-sm text-muted-foreground">{participant.profile.email}</div>
                  </div>
                </TableCell>
                <TableCell>{participant.study.title}</TableCell>
                <TableCell>
                  <ParticipantStatusBadge status={participant.status} />
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(participant.created_at))} ago
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Contact</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {participant.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange(participant.id, 'accepted')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Accept</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(participant.id, 'rejected')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Reject</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {participant.status === 'accepted' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(participant.id, 'completed')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Mark as Completed</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ParticipantStatusBadge({ status }: { status: Participant['status'] }) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    accepted: {
      label: 'Accepted',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      icon: <XCircle className="mr-1 h-3 w-3" />,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`flex items-center ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
} 