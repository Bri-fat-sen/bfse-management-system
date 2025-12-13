import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  Truck,
  MessageSquare,
  LogIn,
  LogOut,
  Settings,
  AlertTriangle,
  Clock,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const ACTION_CONFIG = {
  login: { icon: LogIn, color: "text-green-600", bg: "bg-green-100", label: "Login" },
  logout: { icon: LogOut, color: "text-gray-600", bg: "bg-gray-100", label: "Logout" },
  clock_in: { icon: Clock, color: "text-blue-600", bg: "bg-blue-100", label: "Clocked In" },
  clock_out: { icon: Clock, color: "text-purple-600", bg: "bg-purple-100", label: "Clocked Out" },
  sale: { icon: ShoppingCart, color: "text-green-600", bg: "bg-green-100", label: "Sale" },
  inventory: { icon: Package, color: "text-amber-600", bg: "bg-amber-100", label: "Inventory" },
  hr_action: { icon: Users, color: "text-purple-600", bg: "bg-purple-100", label: "HR" },
  payroll: { icon: DollarSign, color: "text-green-600", bg: "bg-green-100", label: "Payroll" },
  chat: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100", label: "Chat" },
  meeting: { icon: Users, color: "text-indigo-600", bg: "bg-indigo-100", label: "Meeting" },
  trip: { icon: Truck, color: "text-orange-600", bg: "bg-orange-100", label: "Trip" },
  expense: { icon: DollarSign, color: "text-red-600", bg: "bg-red-100", label: "Expense" },
  settings: { icon: Settings, color: "text-gray-600", bg: "bg-gray-100", label: "Settings" },
  error: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", label: "Error" },
  other: { icon: Activity, color: "text-gray-600", bg: "bg-gray-100", label: "Activity" }
};

export default function ActivityFeed({ orgId, maxHeight = "500px", showHeader = true, limit = 20, autoRefresh = true }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['activityFeed', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', limit),
    staleTime: 30 * 1000,
    refetchInterval: autoRefresh ? 30000 : false,
    refetchOnWindowFocus: true,
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1EB053]" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 items-start">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1EB053]" />
              Live Activity Feed
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
          {autoRefresh && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Auto-refreshes every 30 seconds
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? "" : "p-0"}>
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-3 pr-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => {
                const config = ACTION_CONFIG[activity.action_type] || ACTION_CONFIG.other;
                const Icon = config.icon;
                
                return (
                  <div key={activity.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {activity.employee_name && (
                              <span className="text-xs text-gray-600">{activity.employee_name}</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            {activity.module && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {activity.module}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      {activity.location && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">📍 {activity.location}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}