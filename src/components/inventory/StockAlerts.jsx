import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  AlertCircle, 
  PackageX, 
  Clock, 
  CheckCircle,
  XCircle,
  Bell,
  BellOff 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const ALERT_ICONS = {
  low_stock: AlertTriangle,
  out_of_stock: PackageX,
  overstock: AlertCircle,
  expiring_soon: Clock,
  expired: XCircle
};

const ALERT_COLORS = {
  low_stock: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" },
  out_of_stock: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" },
  overstock: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-500" },
  expiring_soon: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "text-orange-500" },
  expired: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" }
};

const ALERT_LABELS = {
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  overstock: "Overstock",
  expiring_soon: "Expiring Soon",
  expired: "Expired"
};

export default function StockAlerts({
  open,
  onOpenChange,
  alerts = [],
  products = [],
  currentEmployee
}) {
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.StockAlert.update(id, {
      status,
      acknowledged_by: currentEmployee?.full_name,
      acknowledged_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      toast.success("Alert updated");
    },
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  const alertsByType = {
    out_of_stock: activeAlerts.filter(a => a.alert_type === 'out_of_stock'),
    low_stock: activeAlerts.filter(a => a.alert_type === 'low_stock'),
    expiring_soon: activeAlerts.filter(a => a.alert_type === 'expiring_soon'),
    expired: activeAlerts.filter(a => a.alert_type === 'expired'),
    overstock: activeAlerts.filter(a => a.alert_type === 'overstock'),
  };

  const renderAlert = (alert) => {
    const Icon = ALERT_ICONS[alert.alert_type] || AlertTriangle;
    const colors = ALERT_COLORS[alert.alert_type] || ALERT_COLORS.low_stock;

    return (
      <Card key={alert.id} className={`${colors.bg} ${colors.border} border`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div>
                <h4 className={`font-medium ${colors.text}`}>{alert.product_name}</h4>
                <p className="text-sm text-gray-600">
                  {alert.warehouse_name && `${alert.warehouse_name} • `}
                  Current: {alert.current_quantity} | Threshold: {alert.threshold_quantity}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(alert.created_date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {alert.status === 'active' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeMutation.mutate({ id: alert.id, status: 'acknowledged' })}
                  >
                    <BellOff className="w-3 h-3 mr-1" />
                    Acknowledge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() => acknowledgeMutation.mutate({ id: alert.id, status: 'resolved' })}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                </>
              )}
              {alert.status === 'acknowledged' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={() => acknowledgeMutation.mutate({ id: alert.id, status: 'resolved' })}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resolve
                </Button>
              )}
              {alert.status === 'resolved' && (
                <Badge variant="outline" className="text-green-600">Resolved</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Stock Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive">{activeAlerts.length} Active</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          {Object.entries(alertsByType).map(([type, typeAlerts]) => {
            const Icon = ALERT_ICONS[type];
            const colors = ALERT_COLORS[type];
            return (
              <div 
                key={type} 
                className={`p-3 rounded-lg ${colors.bg} ${colors.border} border text-center`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${colors.icon}`} />
                <p className={`text-lg font-bold ${colors.text}`}>{typeAlerts.length}</p>
                <p className="text-xs text-gray-600">{ALERT_LABELS[type]}</p>
              </div>
            );
          })}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
            <h3 className="text-lg font-medium text-green-600">All Clear!</h3>
            <p className="text-sm">No stock alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeAlerts.length > 0 && (
              <div>
                <h3 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Active Alerts ({activeAlerts.length})
                </h3>
                <div className="space-y-2">
                  {activeAlerts.map(renderAlert)}
                </div>
              </div>
            )}

            {acknowledgedAlerts.length > 0 && (
              <div>
                <h3 className="font-medium text-amber-600 mb-3 flex items-center gap-2">
                  <BellOff className="w-4 h-4" />
                  Acknowledged ({acknowledgedAlerts.length})
                </h3>
                <div className="space-y-2">
                  {acknowledgedAlerts.map(renderAlert)}
                </div>
              </div>
            )}

            {resolvedAlerts.length > 0 && (
              <div>
                <h3 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Recently Resolved ({resolvedAlerts.length})
                </h3>
                <div className="space-y-2 opacity-60">
                  {resolvedAlerts.slice(0, 5).map(renderAlert)}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}