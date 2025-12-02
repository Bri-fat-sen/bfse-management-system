import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Truck, 
  Calendar,
  X,
  Check,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const notificationIcons = {
  low_stock: { icon: Package, color: "text-amber-500", bg: "bg-amber-100" },
  meeting: { icon: Calendar, color: "text-blue-500", bg: "bg-blue-100" },
  payroll: { icon: DollarSign, color: "text-green-500", bg: "bg-green-100" },
  transport: { icon: Truck, color: "text-purple-500", bg: "bg-purple-100" },
  alert: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100" },
  system: { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" },
};

export default function NotificationCenter({ orgId, currentEmployee }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Fetch notifications - try by employee ID first, fall back to email
  const { data: notificationsByEmployee = [] } = useQuery({
    queryKey: ['notifications', 'employee', currentEmployee?.id],
    queryFn: () => base44.entities.Notification.filter({ 
      recipient_id: currentEmployee?.id 
    }, '-created_date', 50),
    enabled: !!currentEmployee?.id,
    refetchInterval: 30000,
  });

  const { data: notificationsByEmail = [] } = useQuery({
    queryKey: ['notifications', 'email', currentEmployee?.user_email],
    queryFn: () => base44.entities.Notification.filter({ 
      recipient_email: currentEmployee?.user_email 
    }, '-created_date', 50),
    enabled: !!currentEmployee?.user_email,
    refetchInterval: 30000,
  });

  // Combine and deduplicate notifications
  const notifications = React.useMemo(() => {
    const allNotifications = [...notificationsByEmployee, ...notificationsByEmail];
    const uniqueIds = new Set();
    return allNotifications
      .filter(n => {
        if (uniqueIds.has(n.id)) return false;
        uniqueIds.add(n.id);
        return true;
      })
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 50);
  }, [notificationsByEmployee, notificationsByEmail]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        base44.entities.Notification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("All notifications marked as read");
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notification for new unread items
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const recentUnread = notifications.filter(n => {
        if (n.is_read) return false;
        const created = new Date(n.created_date);
        const now = new Date();
        return (now - created) < 60000; // Within last minute
      });

      recentUnread.forEach(n => {
        try {
          new Notification(n.title, {
            body: n.message,
            icon: '/favicon.ico',
            tag: n.id
          });
        } catch (e) {
          // Ignore notification errors
        }
      });
    }
  }, [notifications]);

  const getNotificationStyle = (type) => {
    return notificationIcons[type] || notificationIcons.system;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-white text-[#1EB053]">{unreadCount} new</Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
                onClick={() => markAllReadMutation.mutate()}
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mb-3 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const IconComponent = style.icon;
                
                return (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-5 h-5 ${style.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-medium text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              title="Delete"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                          </span>
                          {notification.link && (
                            <Link 
                              to={notification.link}
                              className="text-xs text-[#0072C6] hover:underline flex items-center gap-1"
                              onClick={() => {
                                markAsReadMutation.mutate(notification.id);
                                setOpen(false);
                              }}
                            >
                              View <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}