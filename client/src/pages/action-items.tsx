import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, Clock, Filter, Download } from "lucide-react";
import ActionItem from "@/components/action-item";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ActionItem as ActionItemType } from "@shared/schema";

export default function ActionItems() {
  const { toast } = useToast();

  const { data: allActionItems = [], isLoading } = useQuery<ActionItemType[]>({
    queryKey: ["/api/action-items"],
  });

  const { data: pendingActionItems = [] } = useQuery<ActionItemType[]>({
    queryKey: ["/api/action-items/pending"],
  });

  const completedItems = allActionItems.filter(item => item.status === 'completed');
  const overdueItems = pendingActionItems.filter(item => 
    item.dueDate && new Date(item.dueDate) < new Date()
  );

  const updateActionItemMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/action-items/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/action-items/pending"] });
      toast({
        title: "Action item updated",
        description: "The action item status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update action item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, completed: boolean) => {
    updateActionItemMutation.mutate({
      id,
      status: completed ? 'completed' : 'pending',
    });
  };

  const exportActionItems = async () => {
    try {
      const response = await fetch('/api/export/action-items');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'action-items.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Action items have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export action items. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Action Items</h1>
          <p className="text-slate-600">Track and manage action items from your meetings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={exportActionItems}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Items</p>
                <p className="text-2xl font-bold text-slate-900">{allActionItems.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-900">{pendingActionItems.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{completedItems.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-slate-900">{overdueItems.length}</p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({pendingActionItems.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueItems.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedItems.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({allActionItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {pendingActionItems.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No pending action items</p>
                  </div>
                ) : (
                  pendingActionItems.map((item) => (
                    <ActionItem
                      key={item.id}
                      actionItem={item}
                      showMeeting
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="overdue" className="mt-6">
              <div className="space-y-4">
                {overdueItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No overdue action items</p>
                  </div>
                ) : (
                  overdueItems.map((item) => (
                    <ActionItem
                      key={item.id}
                      actionItem={item}
                      showMeeting
                      onStatusChange={handleStatusChange}
                      isOverdue
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="space-y-4">
                {completedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No completed action items yet</p>
                  </div>
                ) : (
                  completedItems.map((item) => (
                    <ActionItem
                      key={item.id}
                      actionItem={item}
                      showMeeting
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {allActionItems.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No action items yet</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Action items will appear here when meetings are processed
                    </p>
                  </div>
                ) : (
                  allActionItems.map((item) => (
                    <ActionItem
                      key={item.id}
                      actionItem={item}
                      showMeeting
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
