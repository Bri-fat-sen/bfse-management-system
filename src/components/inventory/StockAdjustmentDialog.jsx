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
import { Package, Plus, Minus, ArrowLeftRight } from "lucide-react";

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
  const [trackBatch, setTrackBatch] = useState(false);

  const createMovementMutation = useMutation({
    mutationFn: async (data) => {
      // Create stock movement record
      await base44.entities.StockMovement.create(data.movement);
      // Update product stock
      await base44.entities.Product.update(data.productId, { 
        stock_quantity: data.newStock 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      onOpenChange(false);
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

    createMovementMutation.mutate({
      movement: movementData,
      productId: productId,
      newStock: newStock
    });
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
            <Input name="quantity" type="number" min="0" required className="mt-1" />
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