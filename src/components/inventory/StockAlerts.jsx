import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertTriangle, 
  AlertCircle,
  Package,
  Check,
  Clock,
  X,
  Bell
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { format } from "date-fns";

const alertTypeConfig = {
  low_stock: { icon: AlertTriangle, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10', label: 'Low Stock' },
  out_of_stock: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Out of Stock' },
  overstock: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Overstock' },
  expiring_soon: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Expiring Soon' },
  expired: { icon: X, color: 'text-red-600', bg: 'bg-red-100', label: 'Expired' },
};

export default function StockAlerts({ 
  alerts = [], 
  products = [],
  orgId,
  currentEmployee 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (id) => base44.entities.StockAlert.update(id, {
      status: 'acknowledged',
      acknowledged_by: currentEmployee?.full_name,
      acknowledged_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      toast({ title: "Alert acknowledged" });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (id) => base44.entities.StockAlert.update(id, { status: 'resolved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      toast({ title: "Alert resolved" });
    },
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');

  // Auto-generate alerts for low/out of stock products
  const lowStockProducts = products.filter(p => 
    p.stock_quantity <= (p.low_stock_threshold || 10) && 
    p.stock_quantity > 0 &&
    !alerts.some(a => a.product_id === p.id && a.alert_type === 'low_stock' && a.status !== 'resolved')
  );

  const outOfStockProducts = products.filter(p => 
    p.stock_quantity === 0 &&
    !alerts.some(a => a.product_id === p.id && a.alert_type === 'out_of_stock' && a.status !== 'resolved')
  );

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Bell className="w-5 h-5" />
            Active Alerts ({activeAlerts.length + lowStockProducts.length + outOfStockProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 && lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-3 text-[#1EB053]" />
              <p className="font-medium text-[#1EB053]">All Clear!</p>
              <p className="text-sm">No active stock alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Out of Stock (Critical) */}
              {outOfStockProducts.map((product) => {
                const config = alertTypeConfig.out_of_stock;
                return (
                  <div key={`oos-${product.id}`} className={`flex items-center justify-between p-4 rounded-lg ${config.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{product.name}</p>
                          <Badge variant="destructive">{config.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Stock: <span className="font-bold text-red-500">0</span> | 
                          Threshold: {product.low_stock_threshold || 10}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      // Create alert record
                      base44.entities.StockAlert.create({
                        organisation_id: orgId,
                        product_id: product.id,
                        product_name: product.name,
                        alert_type: 'out_of_stock',
                        current_quantity: 0,
                        threshold_quantity: product.low_stock_threshold || 10,
                        status: 'acknowledged',
                        acknowledged_by: currentEmployee?.full_name,
                        acknowledged_date: new Date().toISOString()
                      }).then(() => queryClient.invalidateQueries({ queryKey: ['stockAlerts'] }));
                    }}>
                      <Check className="w-4 h-4 mr-1" />
                      Acknowledge
                    </Button>
                  </div>
                );
              })}

              {/* Low Stock */}
              {lowStockProducts.map((product) => {
                const config = alertTypeConfig.low_stock;
                return (
                  <div key={`low-${product.id}`} className={`flex items-center justify-between p-4 rounded-lg ${config.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center`}>
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{product.name}</p>
                          <Badge className="bg-[#D4AF37] text-white">{config.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Stock: <span className="font-bold text-[#D4AF37]">{product.stock_quantity}</span> | 
                          Threshold: {product.low_stock_threshold || 10}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      base44.entities.StockAlert.create({
                        organisation_id: orgId,
                        product_id: product.id,
                        product_name: product.name,
                        alert_type: 'low_stock',
                        current_quantity: product.stock_quantity,
                        threshold_quantity: product.low_stock_threshold || 10,
                        status: 'acknowledged',
                        acknowledged_by: currentEmployee?.full_name,
                        acknowledged_date: new Date().toISOString()
                      }).then(() => queryClient.invalidateQueries({ queryKey: ['stockAlerts'] }));
                    }}>
                      <Check className="w-4 h-4 mr-1" />
                      Acknowledge
                    </Button>
                  </div>
                );
              })}

              {/* Existing alerts */}
              {activeAlerts.map((alert) => {
                const config = alertTypeConfig[alert.alert_type] || alertTypeConfig.low_stock;
                return (
                  <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg ${config.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{alert.product_name}</p>
                          <Badge className={alert.alert_type === 'out_of_stock' ? '' : 'bg-[#D4AF37] text-white'} 
                                 variant={alert.alert_type === 'out_of_stock' ? 'destructive' : undefined}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Current: {alert.current_quantity} | Threshold: {alert.threshold_quantity}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => acknowledgeAlertMutation.mutate(alert.id)}>
                      <Check className="w-4 h-4 mr-1" />
                      Acknowledge
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              Acknowledged Alerts ({acknowledgedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {acknowledgedAlerts.map((alert) => {
                const config = alertTypeConfig[alert.alert_type] || alertTypeConfig.low_stock;
                return (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-75">
                    <div className="flex items-center gap-3">
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                      <div>
                        <p className="font-medium text-sm">{alert.product_name}</p>
                        <p className="text-xs text-gray-500">
                          Acknowledged by {alert.acknowledged_by} on {format(new Date(alert.acknowledged_date), 'PP')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => resolveAlertMutation.mutate(alert.id)}>
                      <Check className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}