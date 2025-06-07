import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Users, Handshake, ChevronRight, Calendar, Clock } from "lucide-react";
import type { MeetingWithActionItems } from "@shared/schema";
import { format } from "date-fns";

interface MeetingCardProps {
  meeting: MeetingWithActionItems;
  onClick?: () => void;
}

export default function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const getMeetingIcon = (type: string) => {
    switch (type) {
      case "Client Call":
        return <Users className="text-purple-600" />;
      case "Project Review":
        return <Handshake className="text-emerald-600" />;
      default:
        return <Mic className="text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "transcribed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Transcribed</Badge>;
      case "processing":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Processing</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Uploaded</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const meetingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (meetingDate.getTime() === today.getTime()) {
      return `Today, ${format(d, 'h:mm a')}`;
    } else if (meetingDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${format(d, 'h:mm a')}`;
    } else {
      return format(d, 'MMM dd, h:mm a');
    }
  };

  return (
    <Card 
      className="meeting-card cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {getMeetingIcon(meeting.meetingType || "")}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 truncate">{meeting.title}</h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(meeting.date)}
              </div>
              {meeting.duration && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {meeting.duration} min
                </div>
              )}
              <span className="text-emerald-600 font-medium">
                {meeting.actionItemsCount} action items
              </span>
            </div>
            
            {meeting.participants && meeting.participants.length > 0 && (
              <div className="flex items-center mt-1">
                <Users className="w-3 h-3 mr-1 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {meeting.participants.slice(0, 2).join(", ")}
                  {meeting.participants.length > 2 && ` +${meeting.participants.length - 2} more`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {getStatusBadge(meeting.status)}
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {meeting.transcription && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 line-clamp-2">
              {meeting.transcription.substring(0, 150)}...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
