import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, CheckCircle, Clock, BarChart3 } from "lucide-react";
import type { AnalyticsData } from "@shared/schema";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-600">Detailed insights into your meeting productivity</p>
        </div>
        <Select defaultValue="30">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
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

        <Card>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600 text-xl" />
              </div>
              <span className="text-sm text-red-500 font-medium">-5%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{analytics?.totalHours || 0}h</h3>
            <p className="text-slate-600 text-sm">Total Hours</p>
          </CardContent>
        </Card>

        <Card>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Meeting Frequency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
              <div className="text-center">
                <BarChart3 className="text-slate-400 text-4xl mb-2 mx-auto" />
                <p className="text-slate-500">Meeting frequency visualization</p>
                <p className="text-xs text-slate-400">Chart.js integration coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Item Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Action Item Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-200"></div>
                  <div 
                    className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-emerald-500 border-t-transparent transform -rotate-90"
                    style={{
                      strokeDasharray: `${(analytics?.productivityScore || 0) * 2.51} 251`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">
                      {analytics?.productivityScore || 0}%
                    </span>
                  </div>
                </div>
                <p className="text-slate-500">Completion rate this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {analytics?.avgDuration || 0} min
              </div>
              <div className="text-sm text-slate-600">Average Meeting Length</div>
              <div className="text-xs text-emerald-600 mt-1">↓ 8% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {analytics?.meetingsPerWeek || 0}
              </div>
              <div className="text-sm text-slate-600">Meetings Per Week</div>
              <div className="text-xs text-blue-600 mt-1">↑ 15% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {analytics?.actionItemsPerMeeting || 0}
              </div>
              <div className="text-sm text-slate-600">Action Items Per Meeting</div>
              <div className="text-xs text-slate-600 mt-1">→ Same as last month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Most productive time</span>
                <span className="font-medium text-slate-900">10:00 AM - 12:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Average participants</span>
                <span className="font-medium text-slate-900">4.2 people</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Most common meeting type</span>
                <span className="font-medium text-slate-900">Team Meeting</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Transcription accuracy</span>
                <span className="font-medium text-emerald-600">96.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Item Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Average completion time</span>
                <span className="font-medium text-slate-900">3.2 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Most assigned person</span>
                <span className="font-medium text-slate-900">Sarah Johnson</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Overdue items</span>
                <span className="font-medium text-red-600">2 items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">This week completion</span>
                <span className="font-medium text-emerald-600">12 completed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
