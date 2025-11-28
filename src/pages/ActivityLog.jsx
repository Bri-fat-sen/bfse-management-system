import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  MessageSquare,
  Phone,
  Truck,
  Settings,
  AlertTriangle,
  Calendar,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const actionIcons = {
  login: User,
  logout: User,
  clock_in: Clock,
  clock_out: Clock,
  sale: ShoppingCart,
  inventory: Package,
  hr_action: Users,
  payroll: DollarSign,
  chat: MessageSquare,
  call: Phone,
  meeting: Users,
  trip: Truck,
  expense: DollarSign,
  settings: Settings,
  error: AlertTriangle,
  other: Activity,
};

const actionColors = {
  login: "bg-green-100 text-green-600",
  logout: "bg-gray-100 text-gray-600",
  clock_in: "bg-blue-100 text-blue-600",
  clock_out: "bg-orange-100 text-orange-600",
  sale: "bg-emerald-100 text-emerald-600",
  inventory: "bg-purple-100 text-purple-600",
  hr_action: "bg-pink-100 text-pink-600",
  payroll: "bg-amber-100 text-amber-600",
  chat: "bg-cyan-100 text-cyan-600",
  call: "bg-indigo-100 text-indigo-600",
  meeting: "bg-violet-100 text-violet-600",
  trip: "bg-teal-100 text-teal-600",
  expense: "bg-red-100 text-red-600",
  settings: "bg-slate-100 text-slate-600",
  error: "bg-red-100 text-red-600",
  other: "bg-gray-100 text-gray-600",
};

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', 200),
    enabled: !!orgId,
  });

  if (!orgId || isLoading) {
    return <LoadingSpinner message="Loading Activity Log..." subtitle="Fetching system activities" fullScreen={true} />;
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.module?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || activity.action_type === typeFilter;
    
    const matchesDate = !dateFilter || activity.created_date?.startsWith(dateFilter);
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = activity.created_date?.split('T')[0] || 'Unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  const actionTypes = [...new Set(activities.map(a => a.action_type))].filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        subtitle="Never Forgotten — Complete audit trail of all system activities"
      >
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activities.length}</p>
                <p className="text-sm text-gray-500">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.created_date?.startsWith(format(new Date(), 'yyyy-MM-dd'))).length}
                </p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.action_type === 'sale').length}
                </p>
                <p className="text-sm text-gray-500">Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.action_type === 'error').length}
                </p>
                <p className="text-sm text-gray-500">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {actionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No Activities Found"
              description="System activities will be logged automatically"
            />
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full sl-gradient flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(new Date(date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">{dayActivities.length} activities</p>
                    </div>
                  </div>
                  
                  <div className="ml-5 border-l-2 border-gray-200 pl-6 space-y-4">
                    {dayActivities.map((activity) => {
                      const Icon = actionIcons[activity.action_type] || Activity;
                      const colorClass = actionColors[activity.action_type] || actionColors.other;
                      
                      return (
                        <div key={activity.id} className="relative">
                          <div className={`absolute -left-[34px] w-4 h-4 rounded-full ${colorClass.split(' ')[0]} border-2 border-white`} />
                          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
                                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base">{activity.description}</p>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                                    <span>{activity.employee_name || 'System'}</span>
                                    <span>•</span>
                                    <span>{activity.module || activity.action_type}</span>
                                    {activity.entity_type && (
                                      <>
                                        <span className="hidden sm:inline">•</span>
                                        <Badge variant="outline" className="text-xs">{activity.entity_type}</Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                                <p className="text-xs sm:text-sm text-gray-500">
                                  {format(new Date(activity.created_date), 'HH:mm')}
                                </p>
                                <Badge variant="secondary" className="text-xs sm:mt-1">
                                  {activity.action_type?.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}