import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  Calendar,
  Package,
  Bell,
  Check,
  XCircle,
  Clock
} from "lucide-react";

export default function ExpiryAlerts({ orgId, currentEmployee }) {
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
      toast({ title: "Alert created" });
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StockAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InventoryBatch.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
    },
  });

  // Calculate expiring batches
  const today = new Date();
  const expiringBatches = batches
    .filter(batch => batch.expiry_date && batch.quantity > 0)
    .map(batch => {
      const daysUntilExpiry = differenceInDays(new Date(batch.expiry_date), today);
      return { ...batch, daysUntilExpiry };
    })
    .filter(batch => batch.daysUntilExpiry <= 90)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const expiredBatches = expiringBatches.filter(b => b.daysUntilExpiry < 0);
  const criticalBatches = expiringBatches.filter(b => b.daysUntilExpiry >= 0 && b.daysUntilExpiry <= 7);
  const warningBatches = expiringBatches.filter(b => b.daysUntilExpiry > 7 && b.daysUntilExpiry <= 30);
  const noticeBatches = expiringBatches.filter(b => b.daysUntilExpiry > 30 && b.daysUntilExpiry <= 90);

  // Existing expiry alerts
  const expiryAlerts = stockAlerts.filter(a => ['expiring_soon', 'expired'].includes(a.alert_type));

  const getStatusBadge = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return <Badge className="bg-red-500 text-white">Expired</Badge>;
    if (daysUntilExpiry <= 7) return <Badge className="bg-red-100 text-red-700">Critical: {daysUntilExpiry}d</Badge>;
    if (daysUntilExpiry <= 30) return <Badge className="bg-orange-100 text-orange-700">{daysUntilExpiry} days</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">{daysUntilExpiry} days</Badge>;
  };

  const handleMarkExpired = async (batch) => {
    await updateBatchMutation.mutateAsync({ id: batch.id, data: { status: 'expired' } });
    toast({ title: `Batch ${batch.batch_number} marked as expired` });
  };

  const handleCreateAlert = async (batch) => {
    const alertType = batch.daysUntilExpiry < 0 ? 'expired' : 'expiring_soon';
    await createAlertMutation.mutateAsync({
      organisation_id: orgId,
      product_id: batch.product_id,
      product_name: batch.product_name,
      alert_type: alertType,
      current_quantity: batch.quantity,
      status: 'active',
      notes: `Batch ${batch.batch_number} ${alertType === 'expired' ? 'has expired' : `expires on ${format(new Date(batch.expiry_date), 'PP')}`}`
    });
  };

  const renderBatchSection = (title, icon, batches, bgColor, iconColor) => {
    if (batches.length === 0) return null;
    
    return (
      <Card className={`border-l-4 ${bgColor}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            {React.createElement(icon, { className: `w-5 h-5 ${iconColor}` })}
            {title} ({batches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{batch.product_name}</p>
                    <p className="text-sm text-gray-500">
                      Batch: {batch.batch_number} • Qty: {batch.quantity}
                      {batch.warehouse_name && ` • ${batch.warehouse_name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="font-medium">{format(new Date(batch.expiry_date), 'dd MMM yyyy')}</p>
                  </div>
                  {getStatusBadge(batch.daysUntilExpiry)}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCreateAlert(batch)}
                      title="Create Alert"
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                    {batch.daysUntilExpiry < 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkExpired(batch)}
                        title="Mark as Expired"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{expiredBatches.length}</p>
            <p className="text-sm text-gray-500">Expired</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-400">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold">{criticalBatches.length}</p>
            <p className="text-sm text-gray-500">Critical (≤7d)</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-400">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold">{warningBatches.length}</p>
            <p className="text-sm text-gray-500">Warning (≤30d)</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-400">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold">{noticeBatches.length}</p>
            <p className="text-sm text-gray-500">Notice (≤90d)</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Sections */}
      {expiringBatches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium">No Expiring Stock</p>
            <p className="text-sm">All batches with expiry dates are more than 90 days away</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {renderBatchSection("Expired Stock", XCircle, expiredBatches, "border-l-red-500", "text-red-500")}
          {renderBatchSection("Critical - Expiring Within 7 Days", AlertTriangle, criticalBatches, "border-l-red-400", "text-red-400")}
          {renderBatchSection("Warning - Expiring Within 30 Days", Clock, warningBatches, "border-l-orange-400", "text-orange-400")}
          {renderBatchSection("Notice - Expiring Within 90 Days", Calendar, noticeBatches, "border-l-yellow-400", "text-yellow-400")}
        </>
      )}
    </div>
  );
}