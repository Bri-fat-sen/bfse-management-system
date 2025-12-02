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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Warehouse, 
  Truck, 
  Package, 
  AlertCircle, 
  Check, 
  Zap,
  Calendar,
  ArrowRight,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

export default function BatchStockAllocation({
  open,
  onOpenChange,
  batch,
  product,
  warehouses = [],
  vehicles = [],
  stockLevels = [],
  allBatches = [], // All batches for FIFO
  orgId,
  currentEmployee
}) {
  const queryClient = useQueryClient();
  const [allocations, setAllocations] = useState([]);
  const [allocationMode, setAllocationMode] = useState("manual"); // manual | fifo
  const [fifoQuantity, setFifoQuantity] = useState(0);
  const [fifoLocationId, setFifoLocationId] = useState("");

  // Combine warehouses and vehicles into locations
  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ];

  // Filter locations to only those linked to the product
  const availableLocations = product?.location_ids?.length > 0
    ? allLocations.filter(loc => product.location_ids.includes(loc.id))
    : allLocations;

  // Get available batches for this product sorted by FIFO (oldest first by received_date or manufacturing_date)
  const availableBatches = (allBatches || [])
    .filter(b => 
      b.product_id === product?.id && 
      b.status === 'active' && 
      (b.quantity - (b.allocated_quantity || 0)) > 0
    )
    .sort((a, b) => {
      const dateA = new Date(a.received_date || a.manufacturing_date || a.created_date);
      const dateB = new Date(b.received_date || b.manufacturing_date || b.created_date);
      return dateA - dateB; // Oldest first
    });

  // Calculate available quantity for current batch
  const batchAvailable = batch ? (batch.quantity - (batch.allocated_quantity || 0)) : 0;

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
      setFifoQuantity(0);
      setFifoLocationId(availableLocations[0]?.id || "");
    }
  }, [open, batch?.id]);

  const totalAllocated = allocations.reduce((sum, a) => sum + (a.allocate_qty || 0), 0);
  const remainingToAllocate = batchAvailable - totalAllocated;

  const updateAllocation = (locationId, qty) => {
    const numQty = Math.max(0, parseInt(qty) || 0);
    setAllocations(prev => prev.map(a => 
      a.location_id === locationId ? { ...a, allocate_qty: numQty } : a
    ));
  };

  // Quick allocate all remaining to a specific location
  const allocateAllTo = (locationId) => {
    setAllocations(prev => prev.map(a => ({
      ...a,
      allocate_qty: a.location_id === locationId ? batchAvailable : 0
    })));
  };

  // FIFO allocation mutation - allocates from oldest batches first
  const fifoAllocateMutation = useMutation({
    mutationFn: async () => {
      const targetLocation = availableLocations.find(l => l.id === fifoLocationId);
      if (!targetLocation) throw new Error("Please select a location");
      if (fifoQuantity <= 0) throw new Error("Please enter a quantity");

      let remainingToAllocate = fifoQuantity;
      const allocatedFromBatches = [];

      for (const b of availableBatches) {
        if (remainingToAllocate <= 0) break;

        const batchAvail = b.quantity - (b.allocated_quantity || 0);
        const allocateFromThis = Math.min(batchAvail, remainingToAllocate);

        if (allocateFromThis > 0) {
          // Find or create stock level
          const existingStock = stockLevels.find(
            sl => sl.product_id === b.product_id && sl.warehouse_id === fifoLocationId
          );

          if (existingStock) {
            await base44.entities.StockLevel.update(existingStock.id, {
              quantity: existingStock.quantity + allocateFromThis
            });
          } else {
            await base44.entities.StockLevel.create({
              organisation_id: orgId,
              product_id: b.product_id,
              product_name: b.product_name,
              warehouse_id: fifoLocationId,
              warehouse_name: targetLocation.name,
              location_type: targetLocation.type,
              quantity: allocateFromThis,
              reorder_level: 10
            });
          }

          // Create movement record
          await base44.entities.StockMovement.create({
            organisation_id: orgId,
            product_id: b.product_id,
            product_name: b.product_name,
            warehouse_id: fifoLocationId,
            movement_type: 'in',
            quantity: allocateFromThis,
            previous_stock: existingStock?.quantity || 0,
            new_stock: (existingStock?.quantity || 0) + allocateFromThis,
            reference_type: 'batch_allocation',
            reference_id: b.id,
            batch_number: b.batch_number,
            notes: `FIFO allocation from batch ${b.batch_number}`,
            performed_by: currentEmployee?.id,
            performed_by_name: currentEmployee?.full_name
          });

          // Update batch
          const newAllocatedQty = (b.allocated_quantity || 0) + allocateFromThis;
          await base44.entities.InventoryBatch.update(b.id, {
            allocated_quantity: newAllocatedQty,
            status: newAllocatedQty >= b.quantity ? 'depleted' : 'active'
          });

          allocatedFromBatches.push({ batch: b.batch_number, qty: allocateFromThis });
          remainingToAllocate -= allocateFromThis;
        }
      }

      // Update product total stock
      const totalAllocatedNow = fifoQuantity - remainingToAllocate;
      await base44.entities.Product.update(product.id, {
        stock_quantity: (product.stock_quantity || 0) + totalAllocatedNow
      });

      return { allocated: totalAllocatedNow, batches: allocatedFromBatches, remaining: remainingToAllocate };
    },
    onSuccess: ({ allocated, batches, remaining }) => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      
      if (remaining > 0) {
        toast.warning(`Allocated ${allocated} units. ${remaining} units could not be allocated (insufficient batch stock).`);
      } else {
        toast.success(`FIFO allocation complete: ${allocated} units from ${batches.length} batch(es)`);
      }
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("FIFO allocation failed: " + error.message);
    }
  });

  // Manual allocation mutation
  const allocateMutation = useMutation({
    mutationFn: async () => {
      const allocationsToProcess = allocations.filter(a => a.allocate_qty > 0);
      
      for (const alloc of allocationsToProcess) {
        const existingStock = stockLevels.find(
          sl => sl.product_id === batch.product_id && sl.warehouse_id === alloc.location_id
        );

        if (existingStock) {
          await base44.entities.StockLevel.update(existingStock.id, {
            quantity: existingStock.quantity + alloc.allocate_qty
          });
        } else {
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
          batch_number: batch.batch_number,
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
      await base44.entities.InventoryBatch.update(batch.id, {
        allocated_quantity: newAllocatedQty,
        status: newAllocatedQty >= batch.quantity ? 'depleted' : 'active'
      });

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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (totalAllocated === 0) {
      toast.error("Please allocate at least some stock");
      return;
    }
    if (totalAllocated > batchAvailable) {
      toast.error("Cannot allocate more than available batch quantity");
      return;
    }
    allocateMutation.mutate();
  };

  const handleFifoSubmit = (e) => {
    e.preventDefault();
    fifoAllocateMutation.mutate();
  };

  const getExpiryBadge = (expiryDate) => {
    if (!expiryDate) return null;
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return <Badge className="bg-red-500 text-white text-xs">Expired</Badge>;
    if (days <= 7) return <Badge className="bg-red-100 text-red-700 text-xs">{days}d left</Badge>;
    if (days <= 30) return <Badge className="bg-orange-100 text-orange-700 text-xs">{days}d left</Badge>;
    return null;
  };

  const totalFifoAvailable = availableBatches.reduce((sum, b) => sum + (b.quantity - (b.allocated_quantity || 0)), 0);

  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle>Allocate Stock to Locations</DialogTitle>
        </DialogHeader>

        <Tabs value={allocationMode} onValueChange={setAllocationMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manual (This Batch)
            </TabsTrigger>
            <TabsTrigger value="fifo" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              FIFO (Oldest First)
            </TabsTrigger>
          </TabsList>

          {/* Manual Allocation Tab */}
          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="space-y-4 mt-4">
              {/* Batch Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#0072C6]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{batch.product_name}</p>
                    <p className="text-sm text-gray-500">Batch: {batch.batch_number}</p>
                  </div>
                  {getExpiryBadge(batch.expiry_date)}
                </div>
                
                {/* Real-time availability bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Batch Allocation</span>
                    <span className="font-medium">
                      {(batch.allocated_quantity || 0) + totalAllocated} / {batch.quantity}
                    </span>
                  </div>
                  <Progress 
                    value={((batch.allocated_quantity || 0) + totalAllocated) / batch.quantity * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Previously: {batch.allocated_quantity || 0}</span>
                    <span>This session: +{totalAllocated}</span>
                    <span>Available: {Math.max(0, remainingToAllocate)}</span>
                  </div>
                </div>
              </div>

              {/* Allocation Summary */}
              <div className={`rounded-lg p-3 ${remainingToAllocate < 0 ? 'bg-red-50 border border-red-200' : remainingToAllocate === 0 && totalAllocated > 0 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {remainingToAllocate < 0 ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : remainingToAllocate === 0 && totalAllocated > 0 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Package className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">
                      {remainingToAllocate < 0 
                        ? 'Over-allocated!' 
                        : remainingToAllocate === 0 && totalAllocated > 0
                          ? 'Batch will be fully allocated' 
                          : `${remainingToAllocate} units available`}
                    </span>
                  </div>
                  <span className="font-semibold">{totalAllocated} / {batchAvailable}</span>
                </div>
              </div>

              {/* Location Allocations */}
              <div>
                <Label className="mb-2 block">Allocate to Locations</Label>
                {availableLocations.length === 0 ? (
                  <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    No locations linked to this product. Please link locations first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allocations.map((alloc) => (
                      <div 
                        key={alloc.location_id}
                        className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-[#1EB053]/50 transition-colors"
                      >
                        {alloc.location_type === 'warehouse' ? (
                          <Warehouse className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Truck className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{alloc.location_name}</p>
                          <p className="text-xs text-gray-500">
                            Current: {alloc.current_stock}
                            {alloc.allocate_qty > 0 && (
                              <span className="text-green-600 ml-1">
                                → {alloc.current_stock + alloc.allocate_qty}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[#1EB053] hover:bg-[#1EB053]/10"
                            onClick={() => allocateAllTo(alloc.location_id)}
                          >
                            All
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            max={batchAvailable}
                            value={alloc.allocate_qty}
                            onChange={(e) => updateAllocation(alloc.location_id, e.target.value)}
                            className="w-20 text-center"
                          />
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
                  disabled={allocateMutation.isPending || totalAllocated === 0 || remainingToAllocate < 0}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {allocateMutation.isPending ? "Allocating..." : "Allocate Stock"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* FIFO Allocation Tab */}
          <TabsContent value="fifo">
            <form onSubmit={handleFifoSubmit} className="space-y-4 mt-4">
              {/* FIFO Info */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">FIFO Allocation (First In, First Out)</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Automatically allocates from the oldest batches first, helping to minimize expiry waste.
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Batches Preview */}
              <div>
                <Label className="mb-2 block">Available Batches (Oldest First)</Label>
                {availableBatches.length === 0 ? (
                  <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    No active batches with available stock for this product.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBatches.map((b, idx) => {
                      const available = b.quantity - (b.allocated_quantity || 0);
                      return (
                        <div 
                          key={b.id}
                          className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{b.batch_number}</p>
                              {getExpiryBadge(b.expiry_date)}
                            </div>
                            <p className="text-xs text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {b.received_date ? format(new Date(b.received_date), 'dd MMM yyyy') : 
                               b.manufacturing_date ? format(new Date(b.manufacturing_date), 'dd MMM yyyy') : 'N/A'}
                            </p>
                          </div>
                          <Badge variant="outline">{available} available</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  Total available across all batches: <strong>{totalFifoAvailable}</strong> units
                </p>
              </div>

              {/* FIFO Allocation Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity to Allocate</Label>
                  <Input
                    type="number"
                    min="1"
                    max={totalFifoAvailable}
                    value={fifoQuantity}
                    onChange={(e) => setFifoQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Enter quantity"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Destination Location</Label>
                  <select
                    value={fifoLocationId}
                    onChange={(e) => setFifoLocationId(e.target.value)}
                    className="w-full mt-1 h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                  >
                    {availableLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.type === 'vehicle' ? '🚚' : '🏭'} {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {fifoQuantity > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Will allocate <strong>{Math.min(fifoQuantity, totalFifoAvailable)}</strong> units 
                      from oldest batches to <strong>{availableLocations.find(l => l.id === fifoLocationId)?.name}</strong>
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={fifoAllocateMutation.isPending || fifoQuantity <= 0 || !fifoLocationId || availableBatches.length === 0}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {fifoAllocateMutation.isPending ? "Allocating..." : "FIFO Allocate"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}