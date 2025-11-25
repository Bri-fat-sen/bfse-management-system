import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  Activity,
  Search,
  Filter,
  Download,
  Clock,
  User,
  LogIn,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  MessageSquare,
  Phone,
  Truck,
  Settings,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

const ACTION_ICONS = {
  login: LogIn,
  logout: LogIn,
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
  other: Activity
};

const ACTION_COLORS = {
  login: "bg-green-100 text-green-800",
  logout: "bg-gray-100 text-gray-800",
  clock_in: "bg-blue-100 text-blue-800",
  clock_out: "bg-blue-100 text-blue-800",
  sale: "bg-emerald-100 text-emerald-800",
  inventory: "bg-purple-100 text-purple-800",
  hr_action: "bg-indigo-100 text-indigo-800",
  payroll: "bg-yellow-100 text-yellow-800",
  chat: "bg-pink-100 text-pink-800",
  call: "bg-cyan-100 text-cyan-800",
  meeting: "bg-orange-100 text-orange-800",
  trip: "bg-teal-100 text-teal-800",
  expense: "bg-red-100 text-red-800",
  settings: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800"
};

export default function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

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

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchQuery || 
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.employee_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || activity.action_type === actionFilter;
    const matchesModule = moduleFilter === "all" || activity.module === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  // Stats
  const todayActivities = activities.filter(a => 
    a.created_date && format(new Date(a.created_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const loginCount = activities.filter(a => a.action_type === 'login').length;
  const salesCount = activities.filter(a => a.action_type === 'sale').length;
  const errorCount = activities.filter(a => a.action_type === 'error').length;

  // Get unique modules
  const modules = [...new Set(activities.map(a => a.module).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activity Log" 
        subtitle="Never forgotten - complete system audit trail"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Activities"
          value={todayActivities.length}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Total Logins"
          value={loginCount}
          icon={LogIn}
          color="green"
        />
        <StatCard
          title="Sales Recorded"
          value={salesCount}
          icon={ShoppingCart}
          color="gold"
        />
        <StatCard
          title="Errors"
          value={errorCount}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="clock_in">Clock In</SelectItem>
                <SelectItem value="clock_out">Clock Out</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="hr_action">HR Action</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="trip">Trip</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(mod => (
                  <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => {
                const Icon = ACTION_ICONS[activity.action_type] || Activity;
                return (
                  <TableRow key={activity.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {activity.created_date && format(new Date(activity.created_date), 'HH:mm:ss')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.created_date && format(new Date(activity.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={ACTION_COLORS[activity.action_type]}>
                        <Icon className="w-3 h-3 mr-1" />
                        {activity.action_type?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center text-white text-xs font-bold">
                          {activity.employee_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        <span className="font-medium">{activity.employee_name || 'System'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{activity.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.module || "-"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500">
                        {activity.ip_address && <p>IP: {activity.ip_address}</p>}
                        {activity.device_info && <p className="truncate max-w-32">{activity.device_info}</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activities found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}