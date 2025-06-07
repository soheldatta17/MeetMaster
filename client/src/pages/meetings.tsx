import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Filter, Download } from "lucide-react";
import MeetingCard from "@/components/meeting-card";
import UploadModal from "@/components/upload-modal";
import { useState } from "react";
import type { MeetingWithActionItems } from "@shared/schema";

export default function Meetings() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: meetings = [], isLoading } = useQuery<MeetingWithActionItems[]>({
    queryKey: ["/api/meetings"],
  });

  const { data: searchResults = [], refetch: searchMeetings } = useQuery<MeetingWithActionItems[]>({
    queryKey: ["/api/meetings/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const displayMeetings = searchQuery.length > 2 ? searchResults : meetings;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      searchMeetings();
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
              <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">All Meetings</h1>
          <p className="text-slate-600">Manage and search through your meeting recordings</p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Meeting Upload
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search across all meetings and transcripts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {searchQuery && (
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                {searchResults.length} results for "{searchQuery}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery ? "Search Results" : "Recent Meetings"} ({displayMeetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery ? "No meetings found" : "No meetings yet"}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery 
                  ? `No meetings match your search for "${searchQuery}"`
                  : "Upload your first meeting recording to get started"
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Meeting
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
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
