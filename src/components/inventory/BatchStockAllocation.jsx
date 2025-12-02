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
import { Badge } from "@/components/ui/badge";
import { Warehouse, Truck, Package, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

export default function BatchStockAllocation({
  open,
  onOpenChange,
  batch,
  product,
  warehouses = [],
  vehicles = [],
  stockLevels = [],
  orgId,
  currentEmployee
}) {
  const queryClient = useQueryClient();
  const [allocations, setAllocations] = useState([]);

  // Combine warehouses and vehicles into locations
  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ];

  // Filter locations to only those linked to the product
  const availableLocations = product?.location_ids?.length > 0
    ? allLocations.filter(loc => product.location_ids.includes(loc.id))
    : allLocations;

  // Initialize allocations when dialog opens
  useEffect(() => {
    if (open && batch && availableLocations.length > 0) {
      const initialAllocations = availableLocations.map(loc => {
        const existingStock = stockLevels.find(
          sl => sl.product_id === batch.product_id && sl.warehouse_id === loc.id
        );
        return {
          location_id: loc.id,
          location_name: loc.name,
          location_type: loc.type,
          current_stock: existingStock?.quantity || 0,
          allocate_qty: 0
        };
      });
      setAllocations(initialAllocations);
    }
  }, [open, batch?.id]);

  const totalAllocated = allocations.reduce((sum, a) => sum + (a.allocate_qty || 0), 0);
  const alreadyAllocated = batch?.allocated_quantity || 0;
  const remainingToAllocate = (batch?.quantity || 0) - alreadyAllocated - totalAllocated;

  const updateAllocation = (locationId, qty) => {
    const numQty = parseInt(qty) || 0;
    setAllocations(prev => prev.map(a => 
      a.location_id === locationId ? { ...a, allocate_qty: numQty } : a
    ));
  };

  const allocateMutation = useMutation({
    mutationFn: async () => {
      const allocationsToProcess = allocations.filter(a => a.allocate_qty > 0);
      
      for (const alloc of allocationsToProcess) {
        // Find or create stock level for this location
        const existingStock = stockLevels.find(
          sl => sl.product_id === batch.product_id && sl.warehouse_id === alloc.location_id
        );

        if (existingStock) {
          // Update existing stock level
          await base44.entities.StockLevel.update(existingStock.id, {
            quantity: existingStock.quantity + alloc.allocate_qty
          });
        } else {
          // Create new stock level
          await base44.entities.StockLevel.create({
            organisation_id: orgId,
            product_id: batch.product_id,
            product_name: batch.product_name,
            warehouse_id: alloc.location_id,
            warehouse_name: alloc.location_name,
            location_type: alloc.location_type,
            quantity: alloc.allocate_qty,
            reorder_level: 10
          });
        }

        // Create stock movement record
        await base44.entities.StockMovement.create({
          organisation_id: orgId,
          product_id: batch.product_id,
          product_name: batch.product_name,
          warehouse_id: alloc.location_id,
          movement_type: 'in',
          quantity: alloc.allocate_qty,
          previous_stock: existingStock?.quantity || 0,
          new_stock: (existingStock?.quantity || 0) + alloc.allocate_qty,
          reference_type: 'batch_allocation',
          reference_id: batch.id,
          notes: `Allocated from batch ${batch.batch_number}`,
          performed_by: currentEmployee?.id,
          performed_by_name: currentEmployee?.full_name
        });
      }

      // Update product total stock
      const newTotalStock = (product?.stock_quantity || 0) + totalAllocated;
      await base44.entities.Product.update(batch.product_id, {
        stock_quantity: newTotalStock
      });

      // Update batch allocated_quantity and status
      const newAllocatedQty = (batch.allocated_quantity || 0) + totalAllocated;
      const batchUpdate = {
        allocated_quantity: newAllocatedQty,
        notes: `${batch.notes || ''} | ${totalAllocated} units allocated on ${new Date().toLocaleDateString()}`
      };
      
      // Mark as depleted if fully allocated
      if (newAllocatedQty >= batch.quantity) {
        batchUpdate.status = 'depleted';
      }
      
      await base44.entities.InventoryBatch.update(batch.id, batchUpdate);

      return { allocated: totalAllocated };
    },
    onSuccess: ({ allocated }) => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      toast.success(`Successfully allocated ${allocated} units to ${allocations.filter(a => a.allocate_qty > 0).length} location(s)`);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Allocation failed: " + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalAllocated === 0) {
      toast.error("Please allocate at least some stock");
      return;
    }
    const availableToAllocate = batch.quantity - (batch.allocated_quantity || 0);
    if (totalAllocated > availableToAllocate) {
      toast.error("Cannot allocate more than available batch quantity");
      return;
    }
    allocateMutation.mutate();
  };

  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle>Allocate Batch Stock to Locations</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Batch Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#0072C6]" />
              </div>
              <div>
                <p className="font-semibold">{batch.product_name}</p>
                <p className="text-sm text-gray-500">Batch: {batch.batch_number}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Total Batch Quantity:</span>
              <Badge variant="secondary" className="text-lg">{batch.quantity}</Badge>
            </div>
            {alreadyAllocated > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Already Allocated:</span>
                <Badge variant="outline" className="text-sm">{alreadyAllocated}</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available to Allocate:</span>
              <Badge className="text-sm bg-[#1EB053]">{batch.quantity - alreadyAllocated}</Badge>
            </div>
          </div>

          {/* Allocation Summary */}
          <div className={`rounded-lg p-3 ${remainingToAllocate < 0 ? 'bg-red-50 border border-red-200' : remainingToAllocate === 0 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {remainingToAllocate < 0 ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : remainingToAllocate === 0 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Package className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">
                  {remainingToAllocate < 0 
                    ? 'Over-allocated!' 
                    : remainingToAllocate === 0 
                      ? 'Fully allocated' 
                      : `${remainingToAllocate} units remaining`}
                </span>
              </div>
              <span className="font-semibold">{totalAllocated} / {batch.quantity - alreadyAllocated}</span>
            </div>
          </div>

          {/* Location Allocations */}
          <div>
            <Label className="mb-2 block">Allocate to Locations</Label>
            {availableLocations.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                No locations linked to this product. Please link locations to the product first.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allocations.map((alloc) => (
                  <div 
                    key={alloc.location_id}
                    className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                  >
                    {alloc.location_type === 'warehouse' ? (
                      <Warehouse className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <Truck className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{alloc.location_name}</p>
                      <p className="text-xs text-gray-500">
                        Current stock: {alloc.current_stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={batch.quantity}
                        value={alloc.allocate_qty}
                        onChange={(e) => updateAllocation(alloc.location_id, e.target.value)}
                        className="w-20 text-center"
                      />
                      {alloc.allocate_qty > 0 && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          → {alloc.current_stock + alloc.allocate_qty}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={allocateMutation.isPending || totalAllocated === 0 || totalAllocated > (batch.quantity - alreadyAllocated)}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {allocateMutation.isPending ? "Allocating..." : "Allocate Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}