import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  MapPin, 
  Warehouse, 
  Truck, 
  Package,
  ArrowLeftRight,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export default function MultiLocationStock({ orgId, products, warehouses, vehicles, stockLevels, currentEmployee }) {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferProduct, setTransferProduct] = useState(null);

  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse', icon: Warehouse })),
    ...vehicles.map(v => ({ id: v.id, name: v.registration_number, type: 'vehicle', icon: Truck }))
  ];

  // Get stock levels by location
  const getStockByLocation = (productId, locationId) => {
    const level = stockLevels.find(sl => 
      sl.product_id === productId && sl.warehouse_id === locationId
    );
    return level?.quantity || 0;
  };

  // Calculate total stock across locations for a product
  const getTotalStock = (productId) => {
    return stockLevels
      .filter(sl => sl.product_id === productId)
      .reduce((sum, sl) => sum + (sl.quantity || 0), 0);
  };

  // Get location-specific stock data
  const locationStockData = allLocations.map(location => {
    const locationProducts = products.map(product => {
      const stock = getStockByLocation(product.id, location.id);
      return { ...product, locationStock: stock };
    }).filter(p => p.locationStock > 0 || selectedLocation === location.id);

    const totalValue = locationProducts.reduce((sum, p) => 
      sum + (p.locationStock * (p.cost_price || 0)), 0
    );
    const totalItems = locationProducts.reduce((sum, p) => sum + p.locationStock, 0);
    const lowStockCount = locationProducts.filter(p => 
      p.locationStock > 0 && p.locationStock <= (p.low_stock_threshold || 10)
    ).length;

    return {
      ...location,
      products: locationProducts,
      totalValue,
      totalItems,
      lowStockCount,
      productCount: locationProducts.filter(p => p.locationStock > 0).length
    };
  });

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransfer = (product) => {
    setTransferProduct(product);
    setShowTransferDialog(true);
  };

  const createTransferMutation = useMutation({
    mutationFn: async (transferData) => {
      const { productId, fromLocationId, toLocationId, quantity } = transferData;
      
      // Update source location stock level
      const sourceLevel = stockLevels.find(sl => 
        sl.product_id === productId && sl.warehouse_id === fromLocationId
      );
      if (sourceLevel) {
        const newSourceQty = Math.max(0, (sourceLevel.quantity || 0) - quantity);
        await base44.entities.StockLevel.update(sourceLevel.id, {
          quantity: newSourceQty,
          available_quantity: newSourceQty
        });
      }

      // Update or create destination stock level
      const destLevel = stockLevels.find(sl => 
        sl.product_id === productId && sl.warehouse_id === toLocationId
      );
      const destLocation = allLocations.find(l => l.id === toLocationId);
      const product = products.find(p => p.id === productId);

      if (destLevel) {
        const newDestQty = (destLevel.quantity || 0) + quantity;
        await base44.entities.StockLevel.update(destLevel.id, {
          quantity: newDestQty,
          available_quantity: newDestQty
        });
      } else {
        await base44.entities.StockLevel.create({
          organisation_id: orgId,
          product_id: productId,
          product_name: product?.name,
          warehouse_id: toLocationId,
          warehouse_name: destLocation?.name,
          location_type: destLocation?.type,
          quantity: quantity,
          available_quantity: quantity,
          reorder_level: product?.reorder_point || 10
        });
      }

      // Product total stock remains the same (just moving between locations)
      // No need to update Product.stock_quantity for transfers

      // Create stock movement records (out from source, in to destination)
      const sourceLocation = allLocations.find(l => l.id === fromLocationId);
      
      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: productId,
        product_name: product?.name,
        warehouse_id: fromLocationId,
        warehouse_name: sourceLocation?.name,
        movement_type: 'out',
        quantity: quantity,
        previous_stock: sourceLevel?.quantity || 0,
        new_stock: Math.max(0, (sourceLevel?.quantity || 0) - quantity),
        reference_type: 'transfer',
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name,
        notes: `Transfer to ${destLocation?.name}`,
      });

      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: productId,
        product_name: product?.name,
        warehouse_id: toLocationId,
        warehouse_name: destLocation?.name,
        movement_type: 'in',
        quantity: quantity,
        previous_stock: destLevel?.quantity || 0,
        new_stock: (destLevel?.quantity || 0) + quantity,
        reference_type: 'transfer',
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name,
        notes: `Transfer from ${sourceLocation?.name}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      setShowTransferDialog(false);
      toast.success("Stock transferred successfully");
    },
  });

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createTransferMutation.mutate({
      productId: transferProduct.id,
      fromLocationId: formData.get('from_location'),
      toLocationId: formData.get('to_location'),
      quantity: parseInt(formData.get('quantity')),
    });
  };

  return (
    <div className="space-y-6">
      {/* Location Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {locationStockData.map(location => (
          <Card 
            key={location.id} 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedLocation === location.id ? 'ring-2 ring-[#1EB053]' : ''
            }`}
            onClick={() => setSelectedLocation(selectedLocation === location.id ? 'all' : location.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    location.type === 'warehouse' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <location.icon className={`w-5 h-5 ${
                      location.type === 'warehouse' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[120px]">{location.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{location.type}</p>
                  </div>
                </div>
                {location.lowStockCount > 0 && (
                  <Badge variant="destructive" className="text-xs">{location.lowStockCount} low</Badge>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Products:</span>
                  <span className="font-medium">{location.productCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Items:</span>
                  <span className="font-medium">{location.totalItems.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Value:</span>
                  <span className="font-medium text-green-600">Le {location.totalValue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stock Matrix */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              Stock by Location
            </CardTitle>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-2 p-3">
            {filteredProducts.slice(0, 30).map(product => {
              const totalStock = getTotalStock(product.id);
              const isLowStock = totalStock <= (product.low_stock_threshold || 10);
              
              return (
                <div key={product.id} className={`p-3 rounded-lg border ${isLowStock ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500">{product.sku || 'No SKU'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
                        {totalStock}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTransfer(product)} disabled={totalStock === 0}>
                        <ArrowLeftRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {totalStock > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {allLocations.map(loc => {
                        const stock = getStockByLocation(product.id, loc.id);
                        if (stock === 0) return null;
                        return (
                          <Badge key={loc.id} variant="outline" className="text-[10px]">
                            {loc.type === 'warehouse' ? '🏭' : '🚛'} {stock}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium sticky left-0 bg-white">Product</th>
                  <th className="text-center p-3 font-medium">Total</th>
                  {allLocations.map(loc => (
                    <th key={loc.id} className="text-center p-3 font-medium min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <loc.icon className="w-4 h-4" />
                        <span className="text-xs truncate max-w-[80px]">{loc.name}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.slice(0, 50).map(product => {
                  const totalStock = getTotalStock(product.id);
                  const isLowStock = totalStock <= (product.low_stock_threshold || 10);
                  
                  return (
                    <tr key={product.id} className={`border-b hover:bg-gray-50 ${isLowStock ? 'bg-red-50' : ''}`}>
                      <td className="p-3 sticky left-0 bg-inherit">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={isLowStock ? "destructive" : "secondary"}>
                          {totalStock}
                        </Badge>
                      </td>
                      {allLocations.map(loc => {
                        const stock = getStockByLocation(product.id, loc.id);
                        return (
                          <td key={loc.id} className="p-3 text-center">
                            {stock > 0 ? (
                              <span className={`font-medium ${
                                stock <= (product.low_stock_threshold || 10) / 2 ? 'text-red-600' : 'text-gray-700'
                              }`}>
                                {stock}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleTransfer(product)}
                          disabled={totalStock === 0}
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight className="w-4 h-4" />
              Transfer Stock
            </DialogTitle>
          </DialogHeader>
          {transferProduct && (
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{transferProduct.name}</p>
                <p className="text-xs text-gray-500">Total stock: {getTotalStock(transferProduct.id)}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>From Location</Label>
                  <Select name="from_location" required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {allLocations.filter(loc => getStockByLocation(transferProduct.id, loc.id) > 0).map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.type === 'warehouse' ? '🏭' : '🚛'} {loc.name} ({getStockByLocation(transferProduct.id, loc.id)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Location</Label>
                  <Select name="to_location" required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {allLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.type === 'warehouse' ? '🏭' : '🚛'} {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input name="quantity" type="number" min="1" required className="mt-1" />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTransferDialog(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#1EB053] w-full sm:w-auto">
                  Transfer Stock
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}