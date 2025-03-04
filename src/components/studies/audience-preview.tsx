'use client';

import React, { useMemo } from 'react';
import { UsersRound, Filter, User, Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  TargetAudience,
  getActiveFiltersCount,
  calculateEstimatedReachPercentage,
  getAudienceSizeCategory
} from '@/utils/audience-utils';

interface AudiencePreviewProps {
  criteria: TargetAudience;
  className?: string;
}

export function AudiencePreview({ criteria, className }: AudiencePreviewProps) {
  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return getActiveFiltersCount(criteria);
  }, [criteria]);

  // Calculate estimated audience reach as a percentage
  const estimatedReachPercentage = useMemo(() => {
    return calculateEstimatedReachPercentage(criteria);
  }, [criteria]);

  // Determine audience size category
  const audienceSizeCategory = useMemo(() => {
    return getAudienceSizeCategory(estimatedReachPercentage);
  }, [estimatedReachPercentage]);

  // Icon and color based on audience size
  const { icon: AudienceIcon, color } = useMemo(() => {
    switch (audienceSizeCategory) {
      case 'Very Large':
        return { icon: UsersRound, color: 'text-green-600' };
      case 'Large':
        return { icon: Users, color: 'text-green-500' };
      case 'Medium':
        return { icon: UsersRound, color: 'text-amber-500' };
      case 'Small':
        return { icon: User, color: 'text-orange-500' };
      case 'Very Small':
        return { icon: UserPlus, color: 'text-red-500' };
      default:
        return { icon: Users, color: 'text-blue-500' };
    }
  }, [audienceSizeCategory]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AudienceIcon className={cn("h-5 w-5", color)} />
          <span>Audience Targeting</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Estimated audience reach based on your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-slate-600">
                  Estimated Reach
                </span>
              </div>
              <div className="text-right">
                <span 
                  className={cn(
                    "text-xs font-semibold inline-block",
                    color
                  )}
                >
                  {estimatedReachPercentage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-slate-200 mt-1">
              <div
                style={{ width: `${estimatedReachPercentage}%` }}
                className={cn(
                  "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500",
                  estimatedReachPercentage >= 75 ? "bg-green-600" :
                  estimatedReachPercentage >= 40 ? "bg-green-500" :
                  estimatedReachPercentage >= 15 ? "bg-amber-500" :
                  estimatedReachPercentage >= 5 ? "bg-orange-500" :
                  "bg-red-500"
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AudienceIcon className={cn("h-5 w-5 mr-2", color)} />
              <span className="text-sm font-medium">{audienceSizeCategory} Audience</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Filter className="h-4 w-4 text-slate-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-80">
                  <p className="text-sm">
                    This is an estimated audience size based on your targeting criteria. 
                    More specific targeting means a smaller but more relevant audience.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 py-3 text-xs text-slate-500 border-t">
        {activeFiltersCount === 0 ? (
          <p>Add targeting criteria to narrow down your audience</p>
        ) : (
          <p>
            {audienceSizeCategory === 'Very Small' 
              ? 'Consider broadening your criteria to reach more participants' 
              : audienceSizeCategory === 'Very Large'
                ? 'Consider adding more criteria for a more targeted audience'
                : 'Your targeting criteria look balanced'}
          </p>
        )}
      </CardFooter>
    </Card>
  );
} 