import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Clock, 
  FolderOpen, 
  Plus, 
  Search, 
  CheckSquare,
  LayoutDashboard
} from "lucide-react";
import { useLocation } from "wouter";
import UploadModal from "./upload-modal";
import { useState } from "react";
import type { ActionItem, AnalyticsData } from "@shared/schema";

export default function Sidebar() {
  const [location] = useLocation();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: pendingActions = [] } = useQuery<ActionItem[]>({
    queryKey: ["/api/action-items/pending"],
  });

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === path;
  };

  const navItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/meetings",
      icon: Clock,
      label: "Recent Meetings",
    },
    {
      href: "/meetings",
      icon: FolderOpen,
      label: "All Meetings",
    },
    {
      href: "/action-items",
      icon: CheckSquare,
      label: "Action Items",
      badge: pendingActions.length,
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-6">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-6"
          onClick={() => setShowUploadModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Meeting Upload
        </Button>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge className="ml-auto bg-red-100 text-red-600 hover:bg-red-100">
                    {item.badge}
                  </Badge>
                )}
              </a>
            );
          })}
          
          <a href="/search" className="nav-link">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </a>
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">This Week</span>
              <span className="font-medium text-slate-900">
                {analytics?.weeklyMeetings || 0} meetings
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Hours</span>
              <span className="font-medium text-slate-900">
                {analytics?.totalHours || 0}h
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Action Items</span>
              <span className="font-medium text-emerald-600">
                {analytics?.productivityScore || 0}% complete
              </span>
            </div>
          </div>
        </div>
      </div>

      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </aside>
  );
}
