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
import { ArrowRight, Warehouse, Truck, Package } from "lucide-react";
import { toast } from "sonner";

export default function StockTransferDialog({
  open,
  onOpenChange,
  products,
  warehouses,
  vehicles,
  stockLevels,
  orgId,
  currentEmployee
}) {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

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
        await base44.entities.StockLevel.update(sourceLevel.id, {
          quantity: sourceLevel.quantity - qty
        });
      }

      // Update or create destination stock level
      const destLevel = stockLevels.find(
        sl => sl.product_id === productId && sl.warehouse_id === toLocId
      );
      if (destLevel) {
        await base44.entities.StockLevel.update(destLevel.id, {
          quantity: destLevel.quantity + qty
        });
      } else {
        await base44.entities.StockLevel.create({
          organisation_id: orgId,
          product_id: productId,
          product_name: product.name,
          warehouse_id: toLocId,
          warehouse_name: toLoc.name,
          location_type: toLoc.type,
          quantity: qty
        });
      }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle>Transfer Stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select product" />
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

          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <div>
              <Label>From</Label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger className="mt-1">
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
            
            <ArrowRight className="w-5 h-5 text-gray-400 mb-2" />
            
            <div>
              <Label>To</Label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger className="mt-1">
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
            <p className="text-sm text-gray-500">
              Available at source: <span className="font-semibold text-[#1EB053]">{availableQty}</span> units
            </p>
          )}

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              max={availableQty}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for transfer..."
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={transferMutation.isPending}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {transferMutation.isPending ? "Transferring..." : "Transfer Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}