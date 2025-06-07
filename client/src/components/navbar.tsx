import { Bell, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import type { ActionItem } from "@shared/schema";

export default function Navbar() {
  const { data: pendingActions = [] } = useQuery<ActionItem[]>({
    queryKey: ["/api/action-items/pending"],
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mic className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-slate-800">MeetingFlow</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
              Dashboard
            </a>
            <a href="/meetings" className="text-slate-600 hover:text-slate-900 transition-colors">
              Meetings
            </a>
            <a href="/action-items" className="text-slate-600 hover:text-slate-900 transition-colors">
              Action Items
            </a>
            <a href="/analytics" className="text-slate-600 hover:text-slate-900 transition-colors">
              Analytics
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-slate-400" />
              {pendingActions.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-500 text-xs">
                  {pendingActions.length > 9 ? '9+' : pendingActions.length}
                </Badge>
              )}
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                Sarah Johnson
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
