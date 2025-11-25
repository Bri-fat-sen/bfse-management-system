import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Calendar, Bell, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ExpiryAlertsCard({ orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: stockAlerts = [] } = useQuery({
    queryKey: ['stockAlerts', orgId],
    queryFn: () => base44.entities.StockAlert.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.StockAlert.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      toast({ title: "Expiry alert created" });
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StockAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      toast({ title: "Alert acknowledged" });
    },
  });

  // Find batches expiring soon
  const expiringBatches = batches
    .filter(b => b.expiry_date && b.quantity > 0)
    .map(b => ({
      ...b,
      daysUntilExpiry: differenceInDays(new Date(b.expiry_date), new Date())
    }))
    .filter(b => b.daysUntilExpiry <= 30)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  // Get existing expiry alerts
  const expiryAlerts = stockAlerts.filter(a => 
    ['expiring_soon', 'expired'].includes(a.alert_type) && a.status === 'active'
  );

  const handleCreateAlert = (batch) => {
    const alertType = batch.daysUntilExpiry < 0 ? 'expired' : 'expiring_soon';
    createAlertMutation.mutate({
      organisation_id: orgId,
      product_id: batch.product_id,
      product_name: batch.product_name,
      warehouse_id: batch.warehouse_id,
      warehouse_name: batch.warehouse_name,
      alert_type: alertType,
      current_quantity: batch.quantity,
      status: 'active',
      notes: `Batch ${batch.batch_number} ${alertType === 'expired' ? 'has expired' : `expires on ${format(new Date(batch.expiry_date), 'dd MMM yyyy')}`}`
    });
  };

  const handleAcknowledge = (alert) => {
    acknowledgeAlertMutation.mutate({
      id: alert.id,
      data: {
        status: 'acknowledged',
        acknowledged_by: currentEmployee?.full_name,
        acknowledged_date: new Date().toISOString()
      }
    });
  };

  const getUrgencyColor = (days) => {
    if (days < 0) return "bg-red-500 text-white";
    if (days <= 7) return "bg-red-100 text-red-800";
    if (days <= 14) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getUrgencyIcon = (days) => {
    if (days < 0) return <AlertTriangle className="w-4 h-4" />;
    if (days <= 7) return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (expiringBatches.length === 0 && expiryAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-[#D4AF37]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-[#D4AF37]" />
          Expiry Alerts
          {expiringBatches.length > 0 && (
            <Badge className="bg-[#D4AF37] text-white">{expiringBatches.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Batches expiring soon */}
        {expiringBatches.map((batch) => {
          const hasAlert = expiryAlerts.some(a => 
            a.product_id === batch.product_id && a.notes?.includes(batch.batch_number)
          );
          
          return (
            <div 
              key={batch.id} 
              className={`flex items-center justify-between p-3 rounded-lg ${batch.daysUntilExpiry < 0 ? 'bg-red-50' : 'bg-yellow-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getUrgencyColor(batch.daysUntilExpiry)}`}>
                  {getUrgencyIcon(batch.daysUntilExpiry)}
                </div>
                <div>
                  <p className="font-medium">{batch.product_name}</p>
                  <p className="text-sm text-gray-500">
                    Batch: {batch.batch_number} • Qty: {batch.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    {batch.daysUntilExpiry < 0 
                      ? `Expired ${Math.abs(batch.daysUntilExpiry)} days ago`
                      : `Expires in ${batch.daysUntilExpiry} days`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getUrgencyColor(batch.daysUntilExpiry)}>
                  {batch.expiry_date && format(new Date(batch.expiry_date), 'dd MMM')}
                </Badge>
                {!hasAlert && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCreateAlert(batch)}
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    Alert
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Active expiry alerts */}
        {expiryAlerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">{alert.product_name}</p>
                <p className="text-sm text-gray-500">{alert.notes}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAcknowledge(alert)}
            >
              <Check className="w-3 h-3 mr-1" />
              Acknowledge
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}