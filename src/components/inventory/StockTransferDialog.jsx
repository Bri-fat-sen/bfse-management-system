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
import { ArrowRight, Package, Warehouse, Truck } from "lucide-react";

export default function StockTransferDialog({ 
  open, 
  onOpenChange, 
  products = [], 
  warehouses = [],
  stockLevels = [],
  orgId,
  currentEmployee 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");

  const transferMutation = useMutation({
    mutationFn: async (data) => {
      // Create movement out from source
      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: data.product_id,
        product_name: data.product_name,
        warehouse_id: data.from_warehouse_id,
        warehouse_name: data.from_warehouse_name,
        movement_type: 'transfer',
        quantity: data.quantity,
        previous_stock: data.from_previous,
        new_stock: data.from_new,
        reference_type: 'transfer',
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name,
        notes: `Transfer to ${data.to_warehouse_name}: ${data.notes || ''}`
      });

      // Create movement in at destination
      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: data.product_id,
        product_name: data.product_name,
        warehouse_id: data.to_warehouse_id,
        warehouse_name: data.to_warehouse_name,
        movement_type: 'transfer',
        quantity: data.quantity,
        previous_stock: data.to_previous,
        new_stock: data.to_new,
        reference_type: 'transfer',
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name,
        notes: `Transfer from ${data.from_warehouse_name}: ${data.notes || ''}`
      });

      // Update or create stock levels
      const fromLevel = stockLevels.find(sl => sl.product_id === data.product_id && sl.warehouse_id === data.from_warehouse_id);
      const toLevel = stockLevels.find(sl => sl.product_id === data.product_id && sl.warehouse_id === data.to_warehouse_id);

      if (fromLevel) {
        await base44.entities.StockLevel.update(fromLevel.id, { quantity: data.from_new });
      }

      if (toLevel) {
        await base44.entities.StockLevel.update(toLevel.id, { quantity: data.to_new });
      } else {
        await base44.entities.StockLevel.create({
          organisation_id: orgId,
          product_id: data.product_id,
          product_name: data.product_name,
          warehouse_id: data.to_warehouse_id,
          warehouse_name: data.to_warehouse_name,
          quantity: data.to_new
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      onOpenChange(false);
      setSelectedProduct("");
      setFromWarehouse("");
      setToWarehouse("");
      toast({ title: "Stock transferred successfully" });
    },
  });

  const product = products.find(p => p.id === selectedProduct);
  const fromWarehouseData = warehouses.find(w => w.id === fromWarehouse);
  const toWarehouseData = warehouses.find(w => w.id === toWarehouse);
  
  // Get available stock at source warehouse
  const fromStockLevel = stockLevels.find(sl => sl.product_id === selectedProduct && sl.warehouse_id === fromWarehouse);
  const fromStock = fromStockLevel?.quantity ?? product?.stock_quantity ?? 0;
  
  const toStockLevel = stockLevels.find(sl => sl.product_id === selectedProduct && sl.warehouse_id === toWarehouse);
  const toStock = toStockLevel?.quantity ?? 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const quantity = parseInt(formData.get('quantity')) || 0;

    if (quantity > fromStock) {
      toast({ 
        title: "Insufficient Stock", 
        description: `Only ${fromStock} units available at source`,
        variant: "destructive" 
      });
      return;
    }

    if (fromWarehouse === toWarehouse) {
      toast({ 
        title: "Invalid Transfer", 
        description: "Source and destination must be different",
        variant: "destructive" 
      });
      return;
    }

    transferMutation.mutate({
      product_id: selectedProduct,
      product_name: product?.name,
      from_warehouse_id: fromWarehouse,
      from_warehouse_name: fromWarehouseData?.name,
      to_warehouse_id: toWarehouse,
      to_warehouse_name: toWarehouseData?.name,
      quantity,
      from_previous: fromStock,
      from_new: fromStock - quantity,
      to_previous: toStock,
      to_new: toStock + quantity,
      notes: formData.get('notes')
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0072C6]" />
            Stock Transfer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {product && (
            <div className="p-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg flex items-center gap-3">
              <Package className="w-8 h-8 text-[#1EB053]" />
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Total Stock: {product.stock_quantity} {product.unit}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2 items-end">
            <div className="col-span-2">
              <Label>From Warehouse</Label>
              <Select value={fromWarehouse} onValueChange={setFromWarehouse} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromWarehouse && (
                <p className="text-xs text-gray-500 mt-1">Available: {fromStock}</p>
              )}
            </div>

            <div className="flex justify-center pb-2">
              <ArrowRight className="w-6 h-6 text-[#0072C6]" />
            </div>

            <div className="col-span-2">
              <Label>To Warehouse</Label>
              <Select value={toWarehouse} onValueChange={setToWarehouse} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.filter(w => w.id !== fromWarehouse).map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {toWarehouse && (
                <p className="text-xs text-gray-500 mt-1">Current: {toStock}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Quantity to Transfer</Label>
            <Input 
              name="quantity" 
              type="number" 
              min="1" 
              max={fromStock}
              required 
              className="mt-1" 
              placeholder={`Max: ${fromStock}`}
            />
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea name="notes" className="mt-1" placeholder="Reason for transfer..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#0072C6]"
              disabled={transferMutation.isPending || !selectedProduct || !fromWarehouse || !toWarehouse}
            >
              {transferMutation.isPending ? "Transferring..." : "Transfer Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}