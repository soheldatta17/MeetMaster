import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import type { ActionItem as ActionItemType } from "@shared/schema";
import { format, isAfter } from "date-fns";

interface ActionItemProps {
  actionItem: ActionItemType;
  showMeeting?: boolean;
  onStatusChange?: (id: number, completed: boolean) => void;
  isOverdue?: boolean;
}

export default function ActionItem({ 
  actionItem, 
  showMeeting = false, 
  onStatusChange,
  isOverdue = false 
}: ActionItemProps) {
  const isCompleted = actionItem.status === 'completed';
  const isDue = actionItem.dueDate && isAfter(new Date(actionItem.dueDate), new Date());
  
  const formatDueDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (itemDate.getTime() === today.getTime()) {
      return "Due today";
    } else if (itemDate.getTime() === tomorrow.getTime()) {
      return "Due tomorrow";
    } else if (itemDate < today) {
      return "Overdue";
    } else {
      return `Due ${format(d, 'MMM dd')}`;
    }
  };

  const getDueDateColor = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (d < today) {
      return "text-red-600";
    } else if (d.getTime() === today.getTime()) {
      return "text-red-600";
    } else if (d.getTime() === new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime()) {
      return "text-amber-600";
    } else {
      return "text-slate-600";
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
      isCompleted 
        ? 'bg-slate-50 border-slate-200' 
        : isOverdue 
          ? 'bg-red-50 border-red-200' 
          : 'bg-white border-slate-200 hover:bg-slate-50'
    }`}>
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) => onStatusChange?.(actionItem.id, !!checked)}
        className="mt-1"
      />
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
        }`}>
          {actionItem.title}
        </p>
        
        {actionItem.description && (
          <p className={`text-sm mt-1 ${
            isCompleted ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {actionItem.description}
          </p>
        )}
        
        <div className="flex items-center space-x-4 mt-2">
          {showMeeting && actionItem.meetingId && (
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="w-3 h-3 mr-1" />
              Meeting #{actionItem.meetingId}
            </div>
          )}
          
          {actionItem.assignee && (
            <div className="flex items-center text-xs text-slate-500">
              <User className="w-3 h-3 mr-1" />
              {actionItem.assignee}
            </div>
          )}
          
          {actionItem.dueDate && (
            <div className={`flex items-center text-xs font-medium ${
              getDueDateColor(actionItem.dueDate)
            }`}>
              <Clock className="w-3 h-3 mr-1" />
              {formatDueDate(actionItem.dueDate)}
            </div>
          )}
          
          <Badge 
            variant={isCompleted ? "secondary" : isOverdue ? "destructive" : "default"}
            className="text-xs"
          >
            {isCompleted ? "Completed" : isOverdue ? "Overdue" : "Pending"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
