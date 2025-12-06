import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, Warehouse, Truck, Package, X, Check, Loader2,
  ArrowRightLeft
} from "lucide-react";
import { toast } from "sonner";

export default function StockTransferDialog({
  open,
  onOpenChange,
  products,
  warehouses,
  vehicles,
  stockLevels,
  orgId,
  currentEmployee,
  organisation
}) {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  // Combine warehouses and vehicles into locations
  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ];

  // Get stock at selected source location
  const sourceStock = stockLevels.find(
    sl => sl.product_id === selectedProduct && sl.warehouse_id === fromLocation
  );

  const availableQty = sourceStock?.quantity || 0;

  const transferMutation = useMutation({
    mutationFn: async (data) => {
      const { productId, fromLocId, toLocId, qty, notes } = data;
      const product = products.find(p => p.id === productId);
      const fromLoc = allLocations.find(l => l.id === fromLocId);
      const toLoc = allLocations.find(l => l.id === toLocId);

      // Update source stock level
      const sourceLevel = stockLevels.find(
        sl => sl.product_id === productId && sl.warehouse_id === fromLocId
      );
      if (sourceLevel) {
        const newSourceQty = Math.max(0, (sourceLevel.quantity || 0) - qty);
        await base44.entities.StockLevel.update(sourceLevel.id, {
          quantity: newSourceQty,
          available_quantity: newSourceQty
        });
      }

      // Update or create destination stock level
      const destLevel = stockLevels.find(
        sl => sl.product_id === productId && sl.warehouse_id === toLocId
      );
      if (destLevel) {
        const newDestQty = (destLevel.quantity || 0) + qty;
        await base44.entities.StockLevel.update(destLevel.id, {
          quantity: newDestQty,
          available_quantity: newDestQty
        });
      } else {
        await base44.entities.StockLevel.create({
          organisation_id: orgId,
          product_id: productId,
          product_name: product.name,
          warehouse_id: toLocId,
          warehouse_name: toLoc.name,
          location_type: toLoc.type,
          quantity: qty,
          available_quantity: qty,
          reorder_level: product.reorder_point || 10
        });
      }

      // Product total stock remains the same (just moving between locations)
      // No need to update Product.stock_quantity for transfers

      // Create stock movement records
      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: productId,
        product_name: product.name,
        warehouse_id: fromLocId,
        movement_type: 'out',
        quantity: qty,
        previous_stock: sourceLevel?.quantity || 0,
        new_stock: (sourceLevel?.quantity || 0) - qty,
        reference_type: 'transfer',
        notes: `Transfer to ${toLoc.name}${notes ? ': ' + notes : ''}`,
        performed_by: currentEmployee?.id,
        performed_by_name: currentEmployee?.full_name
      });

      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: productId,
        product_name: product.name,
        warehouse_id: toLocId,
        movement_type: 'in',
        quantity: qty,
        previous_stock: destLevel?.quantity || 0,
        new_stock: (destLevel?.quantity || 0) + qty,
        reference_type: 'transfer',
        notes: `Transfer from ${fromLoc.name}${notes ? ': ' + notes : ''}`,
        performed_by: currentEmployee?.id,
        performed_by_name: currentEmployee?.full_name
      });

      return { product, fromLoc, toLoc, qty };
    },
    onSuccess: ({ product, fromLoc, toLoc, qty }) => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast.success(`Transferred ${qty} ${product.name} from ${fromLoc.name} to ${toLoc.name}`);
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Transfer failed: " + error.message);
    }
  });

  const resetForm = () => {
    setSelectedProduct("");
    setFromLocation("");
    setToLocation("");
    setQuantity("");
    setNotes("");
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    
    if (!selectedProduct || !fromLocation || !toLocation || !qty) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (fromLocation === toLocation) {
      toast.error("Source and destination must be different");
      return;
    }
    
    if (qty > availableQty) {
      toast.error(`Only ${availableQty} units available at source`);
      return;
    }

    transferMutation.mutate({
      productId: selectedProduct,
      fromLocId: fromLocation,
      toLocId: toLocation,
      qty,
      notes
    });
  };

  const LocationIcon = ({ type }) => 
    type === 'warehouse' ? <Warehouse className="w-4 h-4" /> : <Truck className="w-4 h-4" />;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Transfer Stock</h2>
                <p className="text-white/80 text-sm">Move inventory between locations</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                <Package className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-semibold text-gray-900">Select Product</h3>
            </div>

            <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
              <Label className="text-[#1EB053] font-medium">Product *</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="mt-2 border-[#1EB053]/30 bg-white">
                  <SelectValue placeholder="Select product to transfer" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <Label className="text-gray-700 font-medium">From *</Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger className="mt-2 border-gray-200 bg-white">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLocations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id} disabled={loc.id === toLocation}>
                        <div className="flex items-center gap-2">
                          <LocationIcon type={loc.type} />
                          {loc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="p-4 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                <Label className="text-[#0072C6] font-medium">To *</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger className="mt-2 border-[#0072C6]/30 bg-white">
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLocations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id} disabled={loc.id === fromLocation}>
                        <div className="flex items-center gap-2">
                          <LocationIcon type={loc.type} />
                          {loc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fromLocation && selectedProduct && (
              <div className="p-3 rounded-lg bg-[#1EB053]/10 border border-[#1EB053]/20 flex items-center justify-between">
                <span className="text-sm text-gray-600">Available at source:</span>
                <span className="font-bold text-[#1EB053] text-lg">{availableQty} units</span>
              </div>
            )}

            <div>
              <Label className="text-gray-700 font-medium">Quantity *</Label>
              <Input
                type="number"
                min="1"
                max={availableQty}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity to transfer"
                className="mt-1.5 border-gray-200"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for transfer..."
                className="mt-1.5 border-gray-200"
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={transferMutation.isPending}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {transferMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Transferring...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Transfer Stock</>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}