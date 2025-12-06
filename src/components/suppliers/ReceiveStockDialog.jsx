import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { Package, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function ReceiveStockDialog({ 
  open, 
  onOpenChange, 
  purchaseOrder,
  products = [],
  orgId,
  currentEmployee
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [receivedItems, setReceivedItems] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (purchaseOrder?.items) {
      setReceivedItems(purchaseOrder.items.map(item => ({
        ...item,
        receiving_quantity: item.quantity_ordered - (item.quantity_received || 0)
      })));
    }
  }, [purchaseOrder]);

  const receiveMutation = useMutation({
    mutationFn: async () => {
      const updates = [];
      
      for (const item of receivedItems) {
        if (item.receiving_quantity > 0) {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            const previousStock = product.stock_quantity || 0;
            const newStock = previousStock + item.receiving_quantity;
            
            // Update product stock
            await base44.entities.Product.update(item.product_id, {
              stock_quantity: newStock,
              cost_price: item.unit_cost // Update cost price from PO
            });

            // Update or create stock level at warehouse
            const existingStockLevel = await base44.entities.StockLevel.filter({
              organisation_id: orgId,
              product_id: item.product_id,
              warehouse_id: purchaseOrder.warehouse_id
            });

            if (existingStockLevel.length > 0) {
              const currentLocationStock = existingStockLevel[0].quantity || 0;
              await base44.entities.StockLevel.update(existingStockLevel[0].id, {
                quantity: currentLocationStock + item.receiving_quantity,
                available_quantity: currentLocationStock + item.receiving_quantity
              });
            } else {
              await base44.entities.StockLevel.create({
                organisation_id: orgId,
                product_id: item.product_id,
                product_name: item.product_name,
                warehouse_id: purchaseOrder.warehouse_id,
                warehouse_name: purchaseOrder.warehouse_name,
                location_type: 'warehouse',
                quantity: item.receiving_quantity,
                available_quantity: item.receiving_quantity,
                reorder_level: product.reorder_point || 10
              });
            }

            // Create stock movement
            await base44.entities.StockMovement.create({
              organisation_id: orgId,
              product_id: item.product_id,
              product_name: item.product_name,
              warehouse_id: purchaseOrder.warehouse_id,
              warehouse_name: purchaseOrder.warehouse_name,
              movement_type: 'in',
              quantity: item.receiving_quantity,
              previous_stock: previousStock,
              new_stock: newStock,
              reference_type: 'purchase',
              reference_id: purchaseOrder.po_number,
              recorded_by: currentEmployee?.id,
              recorded_by_name: currentEmployee?.full_name,
              notes: `Received from ${purchaseOrder.supplier_name} - PO: ${purchaseOrder.po_number}`
            });

            // Record price history if cost changed
            const supplierProducts = await base44.entities.SupplierProduct.filter({
              supplier_id: purchaseOrder.supplier_id,
              product_id: item.product_id
            });
            const supplierProduct = supplierProducts[0];
            
            if (supplierProduct && supplierProduct.unit_cost !== item.unit_cost) {
              await base44.entities.SupplierPriceHistory.create({
                organisation_id: orgId,
                supplier_id: purchaseOrder.supplier_id,
                supplier_name: purchaseOrder.supplier_name,
                product_id: item.product_id,
                product_name: item.product_name,
                old_price: supplierProduct.unit_cost,
                new_price: item.unit_cost,
                effective_date: format(new Date(), 'yyyy-MM-dd'),
                purchase_order_id: purchaseOrder.id,
                notes: `Updated via PO ${purchaseOrder.po_number}`
              });

              // Update supplier product cost
              await base44.entities.SupplierProduct.update(supplierProduct.id, {
                unit_cost: item.unit_cost
              });
            }

            // Resolve any active stock alerts for this product
            const activeAlerts = await base44.entities.StockAlert.filter({
              organisation_id: orgId,
              product_id: item.product_id,
              status: 'active'
            });
            for (const alert of activeAlerts) {
              if (newStock > (product.low_stock_threshold || 10)) {
                await base44.entities.StockAlert.update(alert.id, {
                  status: 'resolved',
                  notes: `Resolved by receiving stock from PO ${purchaseOrder.po_number}`
                });
              }
            }
          }
        }
      }

      // Update PO with received quantities
      const updatedItems = purchaseOrder.items.map(item => {
        const received = receivedItems.find(r => r.product_id === item.product_id);
        return {
          ...item,
          quantity_received: (item.quantity_received || 0) + (received?.receiving_quantity || 0)
        };
      });

      const allReceived = updatedItems.every(item => item.quantity_received >= item.quantity_ordered);
      const someReceived = updatedItems.some(item => item.quantity_received > 0);

      await base44.entities.PurchaseOrder.update(purchaseOrder.id, {
        items: updatedItems,
        actual_delivery_date: format(new Date(), 'yyyy-MM-dd'),
        status: allReceived ? 'received' : someReceived ? 'partial' : purchaseOrder.status,
        notes: notes ? `${purchaseOrder.notes || ''}\n${format(new Date(), 'yyyy-MM-dd')}: ${notes}`.trim() : purchaseOrder.notes
      });

      // Update supplier stats
      const supplier = await base44.entities.Supplier.filter({ id: purchaseOrder.supplier_id });
      if (supplier[0]) {
        await base44.entities.Supplier.update(supplier[0].id, {
          total_orders: (supplier[0].total_orders || 0) + 1,
          total_spent: (supplier[0].total_spent || 0) + purchaseOrder.total_amount
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplierPriceHistory'] });
      onOpenChange(false);
      toast.success("Stock received", "Inventory has been updated successfully");
    },
    onError: (error) => {
      console.error('Receive stock error:', error);
      toast.error("Failed to receive stock", error.message);
    }
  });

  const updateReceivingQty = (productId, qty) => {
    setReceivedItems(receivedItems.map(item => 
      item.product_id === productId 
        ? { ...item, receiving_quantity: Math.max(0, Math.min(qty, item.quantity_ordered - (item.quantity_received || 0))) }
        : item
    ));
  };

  const receiveAll = () => {
    setReceivedItems(receivedItems.map(item => ({
      ...item,
      receiving_quantity: item.quantity_ordered - (item.quantity_received || 0)
    })));
  };

  const totalReceiving = receivedItems.reduce((sum, item) => sum + (item.receiving_quantity || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Stock - {purchaseOrder?.po_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{purchaseOrder?.supplier_name}</p>
              <p className="text-sm text-gray-500">
                Ordered: {purchaseOrder?.order_date} • Expected: {purchaseOrder?.expected_delivery_date}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={receiveAll}>
              <Check className="w-4 h-4 mr-2" />
              Receive All
            </Button>
          </div>

          <div className="space-y-3">
            {receivedItems.map((item) => {
              const remaining = item.quantity_ordered - (item.quantity_received || 0);
              const isComplete = remaining === 0;
              
              return (
                <Card key={item.product_id} className={isComplete ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#0072C6]" />
                        </div>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Ordered: {item.quantity_ordered}</span>
                            <span>•</span>
                            <span>Received: {item.quantity_received || 0}</span>
                            <span>•</span>
                            <span className={remaining > 0 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                              {remaining > 0 ? `Pending: ${remaining}` : 'Complete'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Unit Cost</p>
                          <p className="font-medium">Le {item.unit_cost?.toLocaleString()}</p>
                        </div>
                        <div className="w-24">
                          <Label className="text-xs">Receiving</Label>
                          <Input
                            type="number"
                            min="0"
                            max={remaining}
                            value={item.receiving_quantity}
                            onChange={(e) => updateReceivingQty(item.product_id, parseInt(e.target.value) || 0)}
                            disabled={isComplete}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this delivery..."
              className="mt-1"
              rows={2}
            />
          </div>

          {totalReceiving === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Enter quantities to receive</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => receiveMutation.mutate()}
            className="bg-[#1EB053] hover:bg-[#178f43]"
            disabled={receiveMutation.isPending || totalReceiving === 0}
          >
            {receiveMutation.isPending ? 'Processing...' : `Receive ${totalReceiving} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}