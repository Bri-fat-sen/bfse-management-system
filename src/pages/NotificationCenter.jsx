import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/Toast";
import { 
  Bell, Mail, Check, Trash2, Archive, Filter, 
  DollarSign, Calendar, FileText, Package, AlertTriangle,
  MessageSquare, Clock, ExternalLink, CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const typeIcons = {
  payroll_updates: DollarSign,
  leave_requests: Calendar,
  document_expirations: FileText,
  expense_approvals: DollarSign,
  stock_alerts: Package,
  meeting_reminders: Calendar,
  system_errors: AlertTriangle,
  chat_messages: MessageSquare,
  chat: MessageSquare,
  meeting: Calendar,
  low_stock: Package,
  payroll: DollarSign,
  system: Bell,
  approval: CheckCheck,
  alert: AlertTriangle,
  hr: Calendar
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700"
};

export default function NotificationCenterPage() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

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

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['allNotifications', currentEmployee?.id],
    queryFn: () => base44.entities.Notification.filter({ 
      recipient_id: currentEmployee.id 
    }, '-created_date', 100),
    enabled: !!currentEmployee?.id,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allNotifications']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      for (const id of unreadIds) {
        await base44.entities.Notification.update(id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allNotifications']);
      queryClient.invalidateQueries(['notifications']);
      toast.success("All marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allNotifications']);
      queryClient.invalidateQueries(['notifications']);
      toast.success("Notification deleted");
    },
  });

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            variant="outline"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="payroll_updates">Payroll</TabsTrigger>
          <TabsTrigger value="leave_requests">Leave</TabsTrigger>
          <TabsTrigger value="expense_approvals">Expenses</TabsTrigger>
          <TabsTrigger value="stock_alerts">Stock</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No notifications</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification, idx) => {
                  const Icon = typeIcons[notification.type] || Bell;
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <Card className={`${!notification.is_read ? 'border-l-4 border-l-[#1EB053] bg-green-50/30' : ''} hover:shadow-lg transition-shadow`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              notification.priority === 'urgent' ? 'bg-red-100' :
                              notification.priority === 'high' ? 'bg-amber-100' :
                              'bg-blue-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                notification.priority === 'urgent' ? 'text-red-600' :
                                notification.priority === 'high' ? 'text-amber-600' :
                                'text-blue-600'
                              }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h3 className={`font-bold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {notification.priority !== 'normal' && (
                                    <Badge className={priorityColors[notification.priority]}>
                                      {notification.priority}
                                    </Badge>
                                  )}
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-[#1EB053] rounded-full animate-pulse" />
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-3 flex-wrap">
                                <span className="text-xs text-gray-500">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                                </span>

                                <div className="flex items-center gap-2 ml-auto">
                                  {notification.link && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (!notification.is_read) {
                                          markAsReadMutation.mutate(notification.id);
                                        }
                                        window.location.href = notification.link;
                                      }}
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                  )}
                                  {!notification.is_read && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markAsReadMutation.mutate(notification.id)}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteMutation.mutate(notification.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}