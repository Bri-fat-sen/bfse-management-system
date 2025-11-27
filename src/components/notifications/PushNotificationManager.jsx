import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, AlertTriangle, Package, DollarSign, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const NOTIFICATION_SETTINGS_KEY = 'bfse_notification_settings';

export function usePushNotifications() {
  const [permission, setPermission] = useState('default');
  const [settings, setSettings] = useState({
    low_stock: true,
    overdue_payments: true,
    new_customers: true,
    critical_alerts: true
  });

  useEffect(() => {
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved settings
    const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error("Notifications not supported", { 
        description: "Your browser doesn't support push notifications" 
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      toast.success("Notifications enabled", { 
        description: "You'll receive alerts for important updates" 
      });
      return true;
    } else {
      toast.error("Notifications blocked", { 
        description: "Please enable notifications in your browser settings" 
      });
      return false;
    }
  };

  const updateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const showNotification = (title, options = {}) => {
    if (permission !== 'granted') return;

    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) options.onClick();
    };

    return notification;
  };

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showNotification,
    isSupported: 'Notification' in window
  };
}

// Alert Checker Component - polls for critical alerts
export function AlertChecker({ orgId, currentEmployee }) {
  const { permission, settings, showNotification } = usePushNotifications();
  const [lastCheck, setLastCheck] = useState(Date.now());

  useEffect(() => {
    if (permission !== 'granted' || !orgId) return;

    const checkAlerts = async () => {
      try {
        // Check for low stock alerts
        if (settings.low_stock) {
          const stockAlerts = await base44.entities.StockAlert.filter({
            organisation_id: orgId,
            status: 'active'
          }, '-created_date', 5);

          const newAlerts = stockAlerts.filter(a => 
            new Date(a.created_date).getTime() > lastCheck
          );

          newAlerts.forEach(alert => {
            showNotification(`⚠️ ${alert.alert_type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}`, {
              body: `${alert.product_name} at ${alert.warehouse_name}`,
              tag: `stock-${alert.id}`,
              data: { type: 'stock_alert', id: alert.id }
            });
          });
        }

        // Check for overdue payments
        if (settings.overdue_payments) {
          const pendingSales = await base44.entities.Sale.filter({
            organisation_id: orgId,
            payment_status: 'pending'
          }, '-created_date', 10);

          const overdue = pendingSales.filter(sale => {
            const saleDate = new Date(sale.created_date);
            const daysSince = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince > 7 && new Date(sale.created_date).getTime() > lastCheck - (24 * 60 * 60 * 1000);
          });

          if (overdue.length > 0) {
            showNotification(`💰 ${overdue.length} Overdue Payment${overdue.length > 1 ? 's' : ''}`, {
              body: `Total: Le ${overdue.reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString()}`,
              tag: 'overdue-payments'
            });
          }
        }

        // Check for new customers
        if (settings.new_customers) {
          const recentCustomers = await base44.entities.Customer.filter({
            organisation_id: orgId
          }, '-created_date', 5);

          const newCustomers = recentCustomers.filter(c => 
            new Date(c.created_date).getTime() > lastCheck
          );

          newCustomers.forEach(customer => {
            showNotification('👤 New Customer', {
              body: customer.name,
              tag: `customer-${customer.id}`
            });
          });
        }

        setLastCheck(Date.now());
      } catch (error) {
        console.error('Alert check error:', error);
      }
    };

    // Check every 2 minutes
    const interval = setInterval(checkAlerts, 2 * 60 * 1000);
    
    // Initial check after 10 seconds
    const timeout = setTimeout(checkAlerts, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [permission, settings, orgId, lastCheck]);

  return null; // This is a background component
}

// Settings Dialog for notification preferences
export function NotificationSettingsDialog({ open, onOpenChange }) {
  const { permission, settings, requestPermission, updateSettings, isSupported } = usePushNotifications();

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellOff className="w-5 h-5 text-gray-400" />
              Notifications Not Supported
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Your browser doesn't support push notifications. Try using a different browser or the mobile app.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1EB053]" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure which alerts you want to receive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Permission Status */}
          <div className={`p-4 rounded-xl ${
            permission === 'granted' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {permission === 'granted' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <span className={permission === 'granted' ? 'text-green-700' : 'text-amber-700'}>
                  {permission === 'granted' ? 'Notifications Enabled' : 'Notifications Disabled'}
                </span>
              </div>
              {permission !== 'granted' && (
                <Button size="sm" onClick={requestPermission} className="bg-[#1EB053]">
                  Enable
                </Button>
              )}
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-red-500" />
                <div>
                  <Label className="font-medium">Low Stock Alerts</Label>
                  <p className="text-xs text-gray-500">When products are running low</p>
                </div>
              </div>
              <Switch
                checked={settings.low_stock}
                onCheckedChange={(v) => updateSettings('low_stock', v)}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <div>
                  <Label className="font-medium">Overdue Payments</Label>
                  <p className="text-xs text-gray-500">Pending invoices past due date</p>
                </div>
              </div>
              <Switch
                checked={settings.overdue_payments}
                onCheckedChange={(v) => updateSettings('overdue_payments', v)}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <Label className="font-medium">New Customers</Label>
                  <p className="text-xs text-gray-500">When new customers are added</p>
                </div>
              </div>
              <Switch
                checked={settings.new_customers}
                onCheckedChange={(v) => updateSettings('new_customers', v)}
                disabled={permission !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <Label className="font-medium">Critical Alerts</Label>
                  <p className="text-xs text-gray-500">System and security alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.critical_alerts}
                onCheckedChange={(v) => updateSettings('critical_alerts', v)}
                disabled={permission !== 'granted'}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default { usePushNotifications, AlertChecker, NotificationSettingsDialog };