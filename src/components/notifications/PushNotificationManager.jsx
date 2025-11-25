import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  Package,
  DollarSign,
  Truck,
  Bell
} from "lucide-react";

// This component manages in-app notifications and creates notification records
export default function PushNotificationManager({ orgId, currentEmployee }) {
  const { toast } = useToast();
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Fetch data for alert checks
  const { data: products = [] } = useQuery({
    queryKey: ['products-alerts', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    refetchInterval: 60000, // Check every minute
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches-alerts', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    refetchInterval: 60000,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls-alerts', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId, status: 'pending_approval' }),
    enabled: !!orgId && ['org_admin', 'payroll_admin', 'super_admin'].includes(currentEmployee?.role),
    refetchInterval: 60000,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips-alerts', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      organisation_id: orgId, 
      driver_id: currentEmployee?.id,
      status: 'scheduled',
      date: format(new Date(), 'yyyy-MM-dd')
    }),
    enabled: !!orgId && currentEmployee?.role === 'driver',
    refetchInterval: 60000,
  });

  // Check for critical alerts and create notifications
  useEffect(() => {
    if (!orgId || !currentEmployee) return;

    const checkAlerts = async () => {
      const today = new Date();
      const notifications = [];

      // Low stock alerts (for warehouse managers and admins)
      if (['warehouse_manager', 'org_admin', 'super_admin'].includes(currentEmployee.role)) {
        const lowStock = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
        if (lowStock.length > 0) {
          notifications.push({
            organisation_id: orgId,
            recipient_id: currentEmployee.id,
            recipient_email: currentEmployee.email,
            type: 'low_stock',
            title: `${lowStock.length} Products Low on Stock`,
            message: lowStock.slice(0, 3).map(p => p.name).join(', ') + (lowStock.length > 3 ? '...' : ''),
            link: 'Inventory',
            priority: lowStock.some(p => p.stock_quantity === 0) ? 'urgent' : 'high',
          });
        }
      }

      // Expiring batches (for warehouse managers)
      if (['warehouse_manager', 'org_admin', 'super_admin'].includes(currentEmployee.role)) {
        const expiringSoon = batches.filter(b => {
          if (!b.expiry_date) return false;
          const daysLeft = differenceInDays(new Date(b.expiry_date), today);
          return daysLeft <= 7 && daysLeft >= 0;
        });
        
        if (expiringSoon.length > 0) {
          notifications.push({
            organisation_id: orgId,
            recipient_id: currentEmployee.id,
            recipient_email: currentEmployee.email,
            type: 'alert',
            title: `${expiringSoon.length} Batches Expiring Soon`,
            message: 'Some inventory batches will expire within 7 days',
            link: 'Inventory',
            priority: 'urgent',
          });
        }
      }

      // Pending payroll approvals
      if (['org_admin', 'payroll_admin', 'super_admin'].includes(currentEmployee.role) && payrolls.length > 0) {
        notifications.push({
          organisation_id: orgId,
          recipient_id: currentEmployee.id,
          recipient_email: currentEmployee.email,
          type: 'payroll',
          title: `${payrolls.length} Payroll${payrolls.length > 1 ? 's' : ''} Pending Approval`,
          message: 'Review and approve pending payroll requests',
          link: 'HR',
          priority: 'high',
        });
      }

      // Trip assignments for drivers
      if (currentEmployee.role === 'driver' && trips.length > 0) {
        notifications.push({
          organisation_id: orgId,
          recipient_id: currentEmployee.id,
          recipient_email: currentEmployee.email,
          type: 'transport',
          title: `${trips.length} Trip${trips.length > 1 ? 's' : ''} Scheduled Today`,
          message: trips.map(t => t.route_name).join(', '),
          link: 'Transport',
          priority: 'normal',
        });
      }

      // Show toast for urgent notifications
      notifications.filter(n => n.priority === 'urgent').forEach(notif => {
        toast({
          title: notif.title,
          description: notif.message,
          variant: "destructive",
        });
      });
    };

    checkAlerts();
  }, [products, batches, payrolls, trips, orgId, currentEmployee, lastCheck]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(Date.now());
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return null; // This is a background manager component
}