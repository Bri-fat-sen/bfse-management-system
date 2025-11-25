import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Package,
  AlertTriangle,
  DollarSign,
  Truck,
  MessageSquare,
  X,
  Check,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const notificationIcons = {
  low_stock: { icon: Package, color: "text-amber-500 bg-amber-100" },
  chat: { icon: MessageSquare, color: "text-blue-500 bg-blue-100" },
  meeting: { icon: Bell, color: "text-purple-500 bg-purple-100" },
  payroll: { icon: DollarSign, color: "text-green-500 bg-green-100" },
  transport: { icon: Truck, color: "text-indigo-500 bg-indigo-100" },
  alert: { icon: AlertTriangle, color: "text-red-500 bg-red-100" },
  system: { icon: Bell, color: "text-gray-500 bg-gray-100" },
};

export default function NotificationCenter({ orgId, employeeId, onClose }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['allNotifications', employeeId],
    queryFn: () => base44.entities.Notification.filter(
      { recipient_id: employeeId },
      '-created_date',
      50
    ),
    enabled: !!employeeId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.update(notifId, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allNotifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        base44.entities.Notification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allNotifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-blue-500 bg-white';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#1EB053]" />
          <CardTitle className="text-lg">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-red-500">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => {
              const iconConfig = notificationIcons[notif.type] || notificationIcons.system;
              const Icon = iconConfig.icon;
              
              return (
                <div
                  key={notif.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notif.priority)} ${
                    !notif.is_read ? 'bg-blue-50/50' : ''
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${iconConfig.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-sm ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <button
                            onClick={() => markReadMutation.mutate(notif.id)}
                            className="text-gray-400 hover:text-green-500 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {format(new Date(notif.created_date), 'MMM d, h:mm a')}
                        </span>
                        {notif.link && (
                          <Link
                            to={createPageUrl(notif.link)}
                            className="text-xs text-[#0072C6] flex items-center gap-1 hover:underline"
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
      </CardContent>
    </Card>
  );
}