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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Warehouse, MapPin, Package, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StockLocations({
  open,
  onOpenChange,
  products = [],
  warehouses = [],
  stockLevels = [],
  orgId,
  currentEmployee
}) {
  const queryClient = useQueryClient();
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    product_id: "",
    from_warehouse: "",
    to_warehouse: "",
    quantity: 0
  });

  const transferMutation = useMutation({
    mutationFn: async (data) => {
      // Create stock out from source
      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: data.product_id,
        product_name: products.find(p => p.id === data.product_id)?.name,
        warehouse_id: data.from_warehouse,
        warehouse_name: warehouses.find(w => w.id === data.from_warehouse)?.name,
        movement_type: "transfer",
        quantity: -data.quantity,
        reference_type: "transfer",
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name,
        notes: `Transfer to ${warehouses.find(w => w.id === data.to_warehouse)?.name}`
      });
      
      // Create stock in to destination
      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: data.product_id,
        product_name: products.find(p => p.id === data.product_id)?.name,
        warehouse_id: data.to_warehouse,
        warehouse_name: warehouses.find(w => w.id === data.to_warehouse)?.name,
        movement_type: "transfer",
        quantity: data.quantity,
        reference_type: "transfer",
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name,
        notes: `Transfer from ${warehouses.find(w => w.id === data.from_warehouse)?.name}`
      });

      // Update stock levels
      const sourceLevel = stockLevels.find(s => s.product_id === data.product_id && s.warehouse_id === data.from_warehouse);
      const destLevel = stockLevels.find(s => s.product_id === data.product_id && s.warehouse_id === data.to_warehouse);
      
      if (sourceLevel) {
        await base44.entities.StockLevel.update(sourceLevel.id, {
          quantity: sourceLevel.quantity - data.quantity,
          available_quantity: (sourceLevel.available_quantity || sourceLevel.quantity) - data.quantity
        });
      }
      
      if (destLevel) {
        await base44.entities.StockLevel.update(destLevel.id, {
          quantity: destLevel.quantity + data.quantity,
          available_quantity: (destLevel.available_quantity || destLevel.quantity) + data.quantity
        });
      } else {
        await base44.entities.StockLevel.create({
          organisation_id: orgId,
          product_id: data.product_id,
          product_name: products.find(p => p.id === data.product_id)?.name,
          warehouse_id: data.to_warehouse,
          warehouse_name: warehouses.find(w => w.id === data.to_warehouse)?.name,
          quantity: data.quantity,
          available_quantity: data.quantity
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      setShowTransfer(false);
      setTransferData({ product_id: "", from_warehouse: "", to_warehouse: "", quantity: 0 });
      toast.success("Stock transferred successfully");
    },
  });

  const getWarehouseStock = (warehouseId) => {
    return stockLevels.filter(s => s.warehouse_id === warehouseId);
  };

  const getTotalStock = (warehouseId) => {
    return getWarehouseStock(warehouseId).reduce((sum, s) => sum + (s.quantity || 0), 0);
  };

  const getStockValue = (warehouseId) => {
    return getWarehouseStock(warehouseId).reduce((sum, s) => {
      const product = products.find(p => p.id === s.product_id);
      return sum + ((s.quantity || 0) * (product?.cost_price || 0));
    }, 0);
  };

  const handleTransfer = () => {
    if (!transferData.product_id || !transferData.from_warehouse || !transferData.to_warehouse || !transferData.quantity) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (transferData.from_warehouse === transferData.to_warehouse) {
      toast({ title: "Source and destination must be different", variant: "destructive" });
      return;
    }
    transferMutation.mutate(transferData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0072C6]" />
            Stock by Location
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">View and manage stock across all locations</p>
          <Button onClick={() => setShowTransfer(true)} variant="outline">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transfer Stock
          </Button>
        </div>

        {warehouses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Warehouse className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No warehouses configured</p>
            <p className="text-sm">Add warehouses to track stock by location</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((warehouse) => {
              const warehouseStock = getWarehouseStock(warehouse.id);
              const totalStock = getTotalStock(warehouse.id);
              const stockValue = getStockValue(warehouse.id);
              
              return (
                <Card key={warehouse.id} className="border-t-4 border-t-[#0072C6]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Warehouse className="w-4 h-4" />
                        {warehouse.name}
                      </CardTitle>
                      <Badge variant="outline">{warehouse.city || 'N/A'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Total Items</p>
                        <p className="text-xl font-bold text-[#1EB053]">{totalStock.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Stock Value</p>
                        <p className="text-xl font-bold text-[#0072C6]">SLE {stockValue.toLocaleString()}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">Products ({warehouseStock.length})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {warehouseStock.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-2">No stock in this location</p>
                      ) : (
                        warehouseStock.slice(0, 5).map((stock) => {
                          const product = products.find(p => p.id === stock.product_id);
                          const percentage = Math.min(100, (stock.quantity / (stock.max_stock_level || 100)) * 100);
                          const isLow = stock.quantity <= (stock.reorder_level || 10);
                          
                          return (
                            <div key={stock.id} className="flex items-center gap-2">
                              <Package className="w-3 h-3 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{stock.product_name}</p>
                                <Progress 
                                  value={percentage} 
                                  className={`h-1 ${isLow ? 'bg-red-100' : 'bg-gray-100'}`}
                                />
                              </div>
                              <Badge 
                                variant={isLow ? "destructive" : "secondary"} 
                                className="text-xs"
                              >
                                {stock.quantity}
                              </Badge>
                            </div>
                          );
                        })
                      )}
                      {warehouseStock.length > 5 && (
                        <p className="text-xs text-gray-400 text-center">+{warehouseStock.length - 5} more items</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Transfer Dialog */}
        {showTransfer && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Stock Transfer
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product</Label>
                <Select
                  value={transferData.product_id}
                  onValueChange={(v) => setTransferData({ ...transferData, product_id: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>From Warehouse</Label>
                <Select
                  value={transferData.from_warehouse}
                  onValueChange={(v) => setTransferData({ ...transferData, from_warehouse: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To Warehouse</Label>
                <Select
                  value={transferData.to_warehouse}
                  onValueChange={(v) => setTransferData({ ...transferData, to_warehouse: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
              <Button 
                onClick={handleTransfer}
                disabled={transferMutation.isPending}
                className="bg-[#0072C6] hover:bg-[#005a9e]"
              >
                {transferMutation.isPending ? "Transferring..." : "Transfer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}