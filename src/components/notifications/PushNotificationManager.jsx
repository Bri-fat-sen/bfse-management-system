import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell, BellRing, X, AlertTriangle, DollarSign, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Check for critical alerts and show notifications
export function usePushNotifications(orgId, currentEmployee) {
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [lastChecked, setLastChecked] = useState(Date.now());

  // Request permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't auto-request, wait for user action
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  // Check for low stock alerts
  const { data: stockAlerts = [] } = useQuery({
    queryKey: ['stockAlerts', orgId],
    queryFn: () => base44.entities.StockAlert.filter({ 
      organisation_id: orgId, 
      status: 'active' 
    }),
    enabled: !!orgId,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  // Check for pending sales (overdue payments)
  const { data: pendingSales = [] } = useQuery({
    queryKey: ['pendingSales', orgId],
    queryFn: () => base44.entities.Sale.filter({ 
      organisation_id: orgId, 
      payment_status: 'pending' 
    }),
    enabled: !!orgId,
    refetchInterval: 10 * 60 * 1000,
  });

  // Check for new customers (inquiries)
  const { data: recentCustomers = [] } = useQuery({
    queryKey: ['recentCustomers', orgId],
    queryFn: () => base44.entities.Customer.filter({ 
      organisation_id: orgId,
      segment: 'new'
    }, '-created_date', 10),
    enabled: !!orgId,
    refetchInterval: 10 * 60 * 1000,
  });

  // Show browser notification
  const showNotification = (title, body, icon = '🔔') => {
    if (permission === 'granted' && document.hidden) {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: title,
        renotify: true
      });
    }
    
    // Also show in-app toast
    toast(title, { description: body });
  };

  // Monitor alerts and trigger notifications
  useEffect(() => {
    if (!orgId) return;

    const criticalStockAlerts = stockAlerts.filter(a => 
      a.alert_type === 'out_of_stock' || 
      (a.alert_type === 'low_stock' && a.current_quantity <= 5)
    );

    if (criticalStockAlerts.length > 0) {
      showNotification(
        '⚠️ Stock Alert',
        `${criticalStockAlerts.length} product(s) need immediate attention`
      );
    }

    if (pendingSales.length > 5) {
      showNotification(
        '💰 Overdue Payments',
        `${pendingSales.length} pending payments require follow-up`
      );
    }
  }, [stockAlerts.length, pendingSales.length, orgId]);

  return {
    permission,
    requestPermission,
    stockAlerts,
    pendingSales,
    recentCustomers
  };
}

export default function PushNotificationManager({ orgId, currentEmployee }) {
  const { 
    permission, 
    requestPermission, 
    stockAlerts, 
    pendingSales, 
    recentCustomers 
  } = usePushNotifications(orgId, currentEmployee);

  const [showPanel, setShowPanel] = useState(false);

  const criticalAlerts = [
    ...stockAlerts.filter(a => a.alert_type === 'out_of_stock').map(a => ({
      type: 'stock',
      icon: Package,
      color: 'text-red-500 bg-red-50',
      title: 'Out of Stock',
      message: a.product_name,
      urgent: true
    })),
    ...stockAlerts.filter(a => a.alert_type === 'low_stock').map(a => ({
      type: 'stock',
      icon: AlertTriangle,
      color: 'text-amber-500 bg-amber-50',
      title: 'Low Stock',
      message: `${a.product_name}: ${a.current_quantity} left`,
      urgent: a.current_quantity <= 5
    })),
    ...pendingSales.slice(0, 5).map(s => ({
      type: 'payment',
      icon: DollarSign,
      color: 'text-orange-500 bg-orange-50',
      title: 'Pending Payment',
      message: `${s.sale_number}: Le ${s.total_amount?.toLocaleString()}`,
      urgent: false
    })),
    ...recentCustomers.slice(0, 3).map(c => ({
      type: 'customer',
      icon: Users,
      color: 'text-blue-500 bg-blue-50',
      title: 'New Customer',
      message: c.name,
      urgent: false
    }))
  ];

  const urgentCount = criticalAlerts.filter(a => a.urgent).length;

  if (criticalAlerts.length === 0) return null;

  return (
    <>
      {/* Mobile Alert Badge */}
      <button
        onClick={() => setShowPanel(true)}
        className="lg:hidden fixed top-20 right-4 z-40 p-3 bg-white rounded-full shadow-lg border"
      >
        <div className="relative">
          {urgentCount > 0 ? (
            <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 text-gray-600" />
          )}
          {criticalAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {criticalAlerts.length > 9 ? '9+' : criticalAlerts.length}
            </span>
          )}
        </div>
      </button>

      {/* Alert Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#1EB053]" />
                Alerts ({criticalAlerts.length})
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPanel(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {permission !== 'granted' && (
              <div className="m-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">Enable push notifications for real-time alerts</p>
                <Button size="sm" onClick={requestPermission} className="bg-blue-600">
                  Enable Notifications
                </Button>
              </div>
            )}

            <div className="p-4 space-y-3">
              {criticalAlerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <div 
                    key={index} 
                    className={`p-3 rounded-xl border ${alert.urgent ? 'border-red-200' : 'border-gray-100'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${alert.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-gray-500 truncate">{alert.message}</p>
                      </div>
                      {alert.urgent && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                          URGENT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}