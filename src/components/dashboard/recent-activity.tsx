'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { ActivityLog } from '@/types/database';
import { Icons } from '@/components/icons';

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchActivities() {
      const { data } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setActivities(data);
      }
      setIsLoading(false);
    }

    fetchActivities();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.metadata.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(activity.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 