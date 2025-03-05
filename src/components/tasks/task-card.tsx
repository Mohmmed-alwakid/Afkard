'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useTasksStore } from '@/store/tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Calendar, 
  User, 
  Tag, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const updateTaskStatus = useTasksStore(state => state.updateTaskStatus);
  
  // Format due date if exists
  const formattedDueDate = task.due_date 
    ? format(new Date(task.due_date), 'MMM dd, yyyy')
    : null;
  
  // Determine if task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== TaskStatus.DONE;
  
  // Get status icon and color
  const getStatusDetails = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-slate-200 text-slate-700' };
      case TaskStatus.IN_PROGRESS:
        return { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-blue-200 text-blue-700' };
      case TaskStatus.REVIEW:
        return { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-yellow-200 text-yellow-700' };
      case TaskStatus.DONE:
        return { icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-200 text-green-700' };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-slate-200 text-slate-700' };
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-slate-100 text-slate-600';
      case TaskPriority.MEDIUM:
        return 'bg-blue-100 text-blue-600';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-600';
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };
  
  const handleStatusChange = async (status: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, status);
    } else {
      await updateTaskStatus(task.id, status);
    }
  };
  
  const statusDetails = getStatusDetails(task.status);
  const priorityColor = getPriorityColor(task.priority);
  
  return (
    <Card className={`w-full transition-all duration-200 ${isOverdue ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={statusDetails.color}>
              <span className="flex items-center gap-1">
                {statusDetails.icon}
                {task.status.replace('_', ' ')}
              </span>
            </Badge>
            <Badge className={priorityColor}>
              {task.priority}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="ml-auto">
                Overdue
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold line-clamp-2">{task.title}</h3>
        </div>
        
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit && onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete && onDelete(task.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleStatusChange(TaskStatus.TODO)}>
              <Clock className="mr-2 h-4 w-4" />
              To Do
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}>
              <AlertCircle className="mr-2 h-4 w-4" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(TaskStatus.REVIEW)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(TaskStatus.DONE)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Done
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="pb-2">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-col gap-2 text-xs">
          {formattedDueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                {formattedDueDate}
              </span>
            </div>
          )}
          
          {task.assigned_to && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Assigned to: {task.assigned_to}</span>
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex items-center gap-2">
          {task.assigned_to && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://avatar.vercel.sh/${task.assigned_to}`} />
                    <AvatarFallback>
                      {task.assigned_to.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assigned to: {task.assigned_to}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Created: {format(new Date(task.created_at), 'MMM dd, yyyy')}
        </div>
      </CardFooter>
    </Card>
  );
} 