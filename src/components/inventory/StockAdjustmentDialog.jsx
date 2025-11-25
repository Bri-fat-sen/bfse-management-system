import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Package, Plus, Minus, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StockAdjustmentDialog({ 
  open, 
  onOpenChange, 
  products = [], 
  warehouses = [],
  orgId,
  currentEmployee 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adjustmentType, setAdjustmentType] = useState("in");
  const [selectedProduct, setSelectedProduct] = useState("");

  const createMovementMutation = useMutation({
    mutationFn: async (data) => {
      // Create stock movement record
      await base44.entities.StockMovement.create(data.movement);
      // Update product stock
      await base44.entities.Product.update(data.productId, { 
        stock_quantity: data.newStock 
      });
      
      // Create or update batch if batch number provided
      if (data.batchNumber && data.movement.movement_type === 'in') {
        const existingBatches = await base44.entities.InventoryBatch.filter({
          organisation_id: orgId,
          product_id: data.productId,
          batch_number: data.batchNumber
        });
        
        if (existingBatches.length > 0) {
          // Update existing batch
          await base44.entities.InventoryBatch.update(existingBatches[0].id, {
            quantity: (existingBatches[0].quantity || 0) + data.movement.quantity
          });
        } else {
          // Create new batch
          await base44.entities.InventoryBatch.create({
            organisation_id: orgId,
            product_id: data.productId,
            product_name: data.product?.name,
            batch_number: data.batchNumber,
            warehouse_id: data.warehouseId,
            warehouse_name: data.warehouseName,
            quantity: data.movement.quantity,
            expiry_date: data.expiryDate,
            status: 'active'
          });
        }
      } else if (data.batchNumber && data.movement.movement_type === 'out') {
        // Reduce batch quantity
        const existingBatches = await base44.entities.InventoryBatch.filter({
          organisation_id: orgId,
          product_id: data.productId,
          batch_number: data.batchNumber
        });
        
        if (existingBatches.length > 0) {
          const newQty = Math.max(0, (existingBatches[0].quantity || 0) - data.movement.quantity);
          await base44.entities.InventoryBatch.update(existingBatches[0].id, {
            quantity: newQty,
            status: newQty === 0 ? 'depleted' : existingBatches[0].status
          });
        }
      }
      
      // Create stock alert if needed
      const threshold = data.product?.low_stock_threshold || 10;
      if (data.newStock <= threshold) {
        const existingAlerts = await base44.entities.StockAlert.filter({
          organisation_id: orgId,
          product_id: data.productId,
          status: 'active'
        });
        
        if (existingAlerts.length === 0) {
          await base44.entities.StockAlert.create({
            organisation_id: orgId,
            product_id: data.productId,
            product_name: data.product?.name,
            warehouse_id: data.movement.warehouse_id,
            alert_type: data.newStock === 0 ? 'out_of_stock' : 'low_stock',
            current_quantity: data.newStock,
            threshold_quantity: threshold,
            status: 'active'
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      onOpenChange(false);
      setSelectedProduct("");
      toast({ title: "Stock adjusted successfully" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productId = formData.get('product_id');
    const quantity = parseInt(formData.get('quantity')) || 0;
    const product = products.find(p => p.id === productId);
    const warehouse = warehouses.find(w => w.id === formData.get('warehouse_id'));
    
    if (!product) return;

    const previousStock = product.stock_quantity || 0;
    let newStock = previousStock;
    
    if (adjustmentType === "in") {
      newStock = previousStock + quantity;
    } else if (adjustmentType === "out") {
      newStock = Math.max(0, previousStock - quantity);
    } else {
      newStock = quantity; // Direct adjustment
    }

    const movementData = {
      organisation_id: orgId,
      product_id: productId,
      product_name: product.name,
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name || 'Main',
      movement_type: adjustmentType === "adjustment" ? "adjustment" : adjustmentType,
      quantity: quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reference_type: "manual",
      recorded_by: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      notes: formData.get('notes'),
    };

    const batchNumber = formData.get('batch_number');
    const expiryDate = formData.get('expiry_date');

    createMovementMutation.mutate({
      movement: movementData,
      productId: productId,
      newStock: newStock,
      product: product,
      batchNumber: batchNumber,
      expiryDate: expiryDate,
      warehouseId: formData.get('warehouse_id'),
      warehouseName: warehouse?.name || 'Main'
    });
  };

  // Check if this would trigger a low stock alert
  const getStockWarning = (productId, quantity) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return null;
    
    let newStock = prod.stock_quantity || 0;
    if (adjustmentType === "in") newStock += quantity;
    else if (adjustmentType === "out") newStock = Math.max(0, newStock - quantity);
    else newStock = quantity;
    
    const threshold = prod.low_stock_threshold || 10;
    if (newStock === 0) return { type: "out_of_stock", message: "This will result in OUT OF STOCK" };
    if (newStock <= threshold) return { type: "low_stock", message: `This will result in LOW STOCK (below ${threshold})` };
    return null;
  };

  const product = products.find(p => p.id === selectedProduct);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Adjustment Type */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: "in", icon: Plus, label: "Stock In", color: "green" },
              { type: "out", icon: Minus, label: "Stock Out", color: "red" },
              { type: "adjustment", icon: ArrowLeftRight, label: "Adjust", color: "blue" },
            ].map((item) => (
              <Button
                key={item.type}
                type="button"
                variant={adjustmentType === item.type ? "default" : "outline"}
                className={adjustmentType === item.type ? 
                  (item.color === "green" ? "bg-[#1EB053]" : 
                   item.color === "red" ? "bg-red-500" : "bg-[#0072C6]") 
                  : ""
                }
                onClick={() => setAdjustmentType(item.type)}
              >
                <item.icon className="w-4 h-4 mr-1" />
                {item.label}
              </Button>
            ))}
          </div>

          <div>
            <Label>Product</Label>
            <Select 
              name="product_id" 
              required
              value={selectedProduct}
              onValueChange={setSelectedProduct}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (Current: {p.stock_quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {product && (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#0072C6]" />
              </div>
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Current Stock: {product.stock_quantity} {product.unit}</p>
              </div>
            </div>
          )}

          <div>
            <Label>
              {adjustmentType === "adjustment" ? "New Stock Quantity" : "Quantity"}
            </Label>
            <Input 
              name="quantity" 
              type="number" 
              min="0" 
              required 
              className="mt-1" 
              id="adjustment-quantity"
              onChange={(e) => {
                // Trigger re-render for warning
                const form = e.target.closest('form');
                if (form) {
                  const qty = parseInt(e.target.value) || 0;
                  const warning = getStockWarning(selectedProduct, qty);
                  const warningEl = document.getElementById('stock-warning');
                  if (warningEl && warning) {
                    warningEl.classList.remove('hidden');
                    warningEl.textContent = warning.message;
                  } else if (warningEl) {
                    warningEl.classList.add('hidden');
                  }
                }
              }}
            />
            <p id="stock-warning" className="hidden text-sm text-amber-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
            </p>
          </div>

          {warehouses.length > 0 && (
            <div>
              <Label>Warehouse</Label>
              <Select name="warehouse_id">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">Batch Information (Optional)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Batch Number</Label>
                <Input name="batch_number" className="mt-1" placeholder="e.g., BTH-001" />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input name="expiry_date" type="date" className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <Label>Reason / Notes</Label>
            <Textarea 
              name="notes" 
              className="mt-1" 
              placeholder="Enter reason for adjustment..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={
                adjustmentType === "in" ? "bg-[#1EB053]" : 
                adjustmentType === "out" ? "bg-red-500" : "bg-[#0072C6]"
              }
              disabled={createMovementMutation.isPending}
            >
              {createMovementMutation.isPending ? "Processing..." : "Apply Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}