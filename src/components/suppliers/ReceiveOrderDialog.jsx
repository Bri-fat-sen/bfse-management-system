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
import { useToast } from "@/components/ui/use-toast";
import { Truck, Package, Check, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function ReceiveOrderDialog({
  open,
  onOpenChange,
  purchaseOrder,
  orgId,
  currentEmployee
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (purchaseOrder?.items) {
      const initial = {};
      purchaseOrder.items.forEach((item, index) => {
        const remaining = (item.quantity_ordered || 0) - (item.quantity_received || 0);
        initial[index] = remaining;
      });
      setReceivedQuantities(initial);
    }
  }, [purchaseOrder]);

  const receiveMutation = useMutation({
    mutationFn: async (data) => {
      // Update PO with received quantities
      await base44.entities.PurchaseOrder.update(purchaseOrder.id, data.poUpdate);
      
      // Create stock movements and update product quantities
      for (const movement of data.movements) {
        await base44.entities.StockMovement.create(movement);
        
        // Update product stock
        const products = await base44.entities.Product.filter({
          organisation_id: orgId,
          id: movement.product_id
        });
        
        if (products.length > 0) {
          const product = products[0];
          await base44.entities.Product.update(product.id, {
            stock_quantity: (product.stock_quantity || 0) + movement.quantity
          });

          // Update pricing history if cost changed
          if (movement.unit_cost) {
            const supplierProducts = await base44.entities.SupplierProduct.filter({
              organisation_id: orgId,
              supplier_id: purchaseOrder.supplier_id,
              product_id: movement.product_id
            });
            
            if (supplierProducts.length > 0) {
              const sp = supplierProducts[0];
              if (sp.unit_cost !== movement.unit_cost) {
                await base44.entities.PricingHistory.create({
                  organisation_id: orgId,
                  supplier_id: purchaseOrder.supplier_id,
                  supplier_name: purchaseOrder.supplier_name,
                  product_id: movement.product_id,
                  product_name: movement.product_name,
                  old_price: sp.unit_cost,
                  new_price: movement.unit_cost,
                  change_percentage: sp.unit_cost ? ((movement.unit_cost - sp.unit_cost) / sp.unit_cost * 100) : 0,
                  effective_date: format(new Date(), 'yyyy-MM-dd'),
                  source: 'purchase_order',
                  reference_id: purchaseOrder.po_number
                });
                
                // Update supplier product cost
                await base44.entities.SupplierProduct.update(sp.id, {
                  unit_cost: movement.unit_cost
                });
              }
            }
          }

          // Resolve any active stock alerts for this product
          const alerts = await base44.entities.StockAlert.filter({
            organisation_id: orgId,
            product_id: movement.product_id,
            status: 'active'
          });
          
          for (const alert of alerts) {
            const newStock = (product.stock_quantity || 0) + movement.quantity;
            if (newStock > (alert.threshold_quantity || 10)) {
              await base44.entities.StockAlert.update(alert.id, {
                status: 'resolved',
                notes: `Resolved by PO ${purchaseOrder.po_number}`
              });
            }
          }
        }
      }
      
      // Update supplier stats
      const suppliers = await base44.entities.Supplier.filter({
        organisation_id: orgId,
        id: purchaseOrder.supplier_id
      });
      
      if (suppliers.length > 0) {
        const supplier = suppliers[0];
        await base44.entities.Supplier.update(supplier.id, {
          total_orders: (supplier.total_orders || 0) + 1,
          total_spent: (supplier.total_spent || 0) + (purchaseOrder.total_amount || 0)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onOpenChange(false);
      toast({ title: "Items received and inventory updated" });
    },
  });

  const handleReceive = () => {
    const updatedItems = purchaseOrder.items.map((item, index) => ({
      ...item,
      quantity_received: (item.quantity_received || 0) + (receivedQuantities[index] || 0)
    }));

    const totalOrdered = updatedItems.reduce((sum, item) => sum + (item.quantity_ordered || 0), 0);
    const totalReceived = updatedItems.reduce((sum, item) => sum + (item.quantity_received || 0), 0);
    
    let newStatus = purchaseOrder.status;
    if (totalReceived >= totalOrdered) {
      newStatus = 'received';
    } else if (totalReceived > 0) {
      newStatus = 'partial';
    }

    const movements = purchaseOrder.items.map((item, index) => ({
      organisation_id: orgId,
      product_id: item.product_id,
      product_name: item.product_name,
      warehouse_id: purchaseOrder.warehouse_id,
      warehouse_name: purchaseOrder.warehouse_name,
      movement_type: 'in',
      quantity: receivedQuantities[index] || 0,
      previous_stock: 0, // Will be calculated in mutation
      new_stock: 0,
      reference_type: 'purchase',
      reference_id: purchaseOrder.po_number,
      recorded_by: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      notes: notes || `Received from PO ${purchaseOrder.po_number}`,
      unit_cost: item.unit_cost
    })).filter(m => m.quantity > 0);

    receiveMutation.mutate({
      poUpdate: {
        items: updatedItems,
        status: newStatus,
        received_date: newStatus === 'received' ? format(new Date(), 'yyyy-MM-dd') : purchaseOrder.received_date
      },
      movements
    });
  };

  if (!purchaseOrder) return null;

  const totalReceiving = Object.values(receivedQuantities).reduce((sum, qty) => sum + (qty || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Receive Items - {purchaseOrder.po_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{purchaseOrder.supplier_name}</p>
                <p className="text-sm text-gray-500">
                  Order Date: {purchaseOrder.order_date ? format(new Date(purchaseOrder.order_date), 'dd MMM yyyy') : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <Badge>{purchaseOrder.status}</Badge>
                {purchaseOrder.warehouse_name && (
                  <p className="text-sm text-gray-500 mt-1">{purchaseOrder.warehouse_name}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Items to Receive</Label>
            <div className="space-y-2 mt-2">
              {purchaseOrder.items?.map((item, index) => {
                const remaining = (item.quantity_ordered || 0) - (item.quantity_received || 0);
                const isFullyReceived = remaining === 0;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${isFullyReceived ? 'bg-green-50' : 'bg-gray-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFullyReceived ? 'bg-green-100' : 'bg-[#0072C6]/10'}`}>
                      {isFullyReceived ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Package className="w-5 h-5 text-[#0072C6]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Ordered: {item.quantity_ordered} • Received: {item.quantity_received || 0} • Remaining: {remaining}
                      </p>
                    </div>
                    <div className="w-28">
                      {isFullyReceived ? (
                        <Badge className="bg-green-100 text-green-800">Complete</Badge>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max={remaining}
                          value={receivedQuantities[index] || 0}
                          onChange={(e) => setReceivedQuantities({
                            ...receivedQuantities,
                            [index]: Math.min(parseInt(e.target.value) || 0, remaining)
                          })}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalReceiving > 0 && (
            <div className="bg-[#1EB053]/10 p-4 rounded-lg flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#1EB053]" />
              <div>
                <p className="font-medium text-[#1EB053]">Ready to receive {totalReceiving} items</p>
                <p className="text-sm text-gray-600">Stock will be updated automatically</p>
              </div>
            </div>
          )}

          <div>
            <Label>Receipt Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this delivery..."
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#1EB053] hover:bg-[#178f43]"
            onClick={handleReceive}
            disabled={totalReceiving === 0 || receiveMutation.isPending}
          >
            {receiveMutation.isPending ? "Processing..." : `Receive ${totalReceiving} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}