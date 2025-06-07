import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, TrendingUp, Plus, Mic, Users, Handshake } from "lucide-react";
import MeetingCard from "@/components/meeting-card";
import ActionItem from "@/components/action-item";
import UploadModal from "@/components/upload-modal";
import { useState } from "react";
import type { MeetingWithActionItems, ActionItem as ActionItemType, AnalyticsData } from "@shared/schema";

export default function Dashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery<MeetingWithActionItems[]>({
    queryKey: ["/api/meetings"],
  });

  const { data: pendingActions = [], isLoading: actionsLoading } = useQuery<ActionItemType[]>({
    queryKey: ["/api/action-items/pending"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const recentMeetings = meetings.slice(0, 3);

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

  if (meetingsLoading || actionsLoading || analyticsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Track your meeting productivity and action items</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600 text-xl" />
              </div>
              <span className="text-sm text-emerald-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{analytics?.totalMeetings || 0}</h3>
            <p className="text-slate-600 text-sm">Total Meetings</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600 text-xl" />
              </div>
              <span className="text-sm text-emerald-600 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{analytics?.completedActions || 0}</h3>
            <p className="text-slate-600 text-sm">Completed Actions</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600 text-xl" />
              </div>
              <span className="text-sm text-red-500 font-medium">-5%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{analytics?.avgDuration || 0} min</h3>
            <p className="text-slate-600 text-sm">Avg Duration</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 text-xl" />
              </div>
              <span className="text-sm text-emerald-600 font-medium">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{analytics?.productivityScore || 0}%</h3>
            <p className="text-slate-600 text-sm">Productivity Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Meetings</CardTitle>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMeetings.length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No meetings yet</p>
                    <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload First Meeting
                    </Button>
                  </div>
                ) : (
                  recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="meeting-card">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getMeetingIcon(meeting.meetingType || "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{meeting.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-slate-500">
                            {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {meeting.duration && (
                            <span className="text-sm text-slate-500">{meeting.duration} min</span>
                          )}
                          <span className="text-sm text-emerald-600 font-medium">
                            {meeting.actionItemsCount} action items
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(meeting.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Upload and Action Items */}
        <div className="space-y-6">
          {/* Quick Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => setShowUploadModal(true)}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-blue-600 text-xl" />
                </div>
                <p className="text-slate-900 font-medium mb-1">Drop your audio file here</p>
                <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                <p className="text-xs text-slate-400">Supports MP3, WAV, M4A up to 500MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Action Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pending Actions</CardTitle>
                <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
                  {pendingActions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingActions.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No pending action items</p>
                  </div>
                ) : (
                  pendingActions.slice(0, 3).map((action) => (
                    <ActionItem key={action.id} actionItem={action} showMeeting />
                  ))
                )}
                {pendingActions.length > 3 && (
                  <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm py-2">
                    View All Action Items
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Analytics Overview</CardTitle>
            <select className="text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Meeting Frequency Chart Placeholder */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Meeting Frequency</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                <div className="text-center">
                  <TrendingUp className="text-slate-400 text-4xl mb-2 mx-auto" />
                  <p className="text-slate-500">Meeting frequency chart</p>
                  <p className="text-xs text-slate-400">Chart visualization coming soon</p>
                </div>
              </div>
            </div>

            {/* Action Item Completion Rate */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Action Item Completion</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                <div className="text-center">
                  <CheckCircle className="text-slate-400 text-4xl mb-2 mx-auto" />
                  <p className="text-slate-500">Completion rate chart</p>
                  <p className="text-xs text-slate-400">{analytics?.productivityScore || 0}% completion rate this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{analytics?.avgDuration || 0} min</div>
              <div className="text-sm text-slate-600">Average Meeting Length</div>
              <div className="text-xs text-emerald-600 mt-1">↓ 8% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{analytics?.meetingsPerWeek || 0}</div>
              <div className="text-sm text-slate-600">Meetings Per Week</div>
              <div className="text-xs text-blue-600 mt-1">↑ 15% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{analytics?.actionItemsPerMeeting || 0}</div>
              <div className="text-sm text-slate-600">Action Items Per Meeting</div>
              <div className="text-xs text-slate-600 mt-1">→ Same as last month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}
