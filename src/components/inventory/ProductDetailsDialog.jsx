import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Download,
  Upload,
  ArrowLeftRight,
  ShoppingCart,
  Clock,
  User,
  Warehouse,
  Truck,
  TrendingUp,
  TrendingDown,
  History
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

const MOVEMENT_TYPE_CONFIG = {
  in: { icon: Download, color: "text-green-600", bgColor: "bg-green-100", label: "Stock In" },
  out: { icon: Upload, color: "text-red-600", bgColor: "bg-red-100", label: "Stock Out" },
  transfer: { icon: ArrowLeftRight, color: "text-purple-600", bgColor: "bg-purple-100", label: "Transfer" },
  sale: { icon: ShoppingCart, color: "text-blue-600", bgColor: "bg-blue-100", label: "Sale" },
  adjustment: { icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-100", label: "Adjustment" },
};

export default function ProductDetailsDialog({ 
  open, 
  onOpenChange, 
  product, 
  warehouses = [], 
  vehicles = [],
  stockLevels = [],
  orgId 
}) {
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (open) {
      setActiveTab("details");
    }
  }, [open]);

  // Fetch stock movements for this specific product
  const { data: productMovements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ['productStockMovements', product?.id],
    queryFn: () => base44.entities.StockMovement.filter({ 
      organisation_id: orgId, 
      product_id: product?.id 
    }, '-created_date', 100),
    enabled: !!product?.id && !!orgId && open,
  });

  if (!product) return null;

  // Get locations for this product
  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'warehouse' })),
    ...vehicles.map(v => ({ id: v.id, name: `${v.registration_number} - ${v.brand || ''} ${v.model || ''}`.trim(), type: 'vehicle' }))
  ];

  const productStockLevels = stockLevels.filter(sl => sl.product_id === product.id);

  const getMovementConfig = (movement) => {
    // Determine type based on reference_type or movement_type
    if (movement.reference_type === 'sale') {
      return MOVEMENT_TYPE_CONFIG.sale;
    }
    if (movement.reference_type === 'transfer') {
      return MOVEMENT_TYPE_CONFIG.transfer;
    }
    if (movement.reference_type === 'adjustment') {
      return MOVEMENT_TYPE_CONFIG.adjustment;
    }
    return MOVEMENT_TYPE_CONFIG[movement.movement_type] || MOVEMENT_TYPE_CONFIG.in;
  };

  const getLocationName = (warehouseId) => {
    const location = allLocations.find(l => l.id === warehouseId);
    return location?.name || 'Main Warehouse';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <div className="flex items-center gap-3">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#1D5FC3]/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#1D5FC3]" />
              </div>
            )}
            <div>
              <DialogTitle>{product.name}</DialogTitle>
              <p className="text-sm text-gray-500">{product.sku || 'No SKU'}</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="locations">Stock Levels</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="w-3 h-3" />
              Stock History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <Badge variant="secondary">{product.category || 'Other'}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unit Price</p>
                  <p className="font-semibold text-[#1EB053]">Le {product.unit_price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cost Price</p>
                  <p className="font-medium">Le {product.cost_price?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wholesale Price</p>
                  <p className="font-medium">Le {product.wholesale_price?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Current Stock</p>
                  <Badge variant={product.stock_quantity <= product.low_stock_threshold ? "destructive" : "secondary"}>
                    {product.stock_quantity} {product.unit}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Low Stock Threshold</p>
                  <p className="font-medium">{product.low_stock_threshold || 10}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="font-medium capitalize">{product.unit || 'piece'}</p>
                </div>
              </div>
              {product.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            {productStockLevels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Warehouse className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No location-specific stock levels</p>
              </div>
            ) : (
              <div className="space-y-2">
                {productStockLevels.map((sl) => {
                  const location = allLocations.find(l => l.id === sl.warehouse_id);
                  return (
                    <Card key={sl.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {sl.location_type === 'vehicle' ? (
                            <Truck className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Warehouse className="w-5 h-5 text-blue-600" />
                          )}
                          <div>
                            <p className="font-medium">{sl.warehouse_name || location?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 capitalize">{sl.location_type || 'warehouse'}</p>
                          </div>
                        </div>
                        <Badge variant={sl.quantity <= (sl.reorder_level || 10) ? "destructive" : "secondary"}>
                          {sl.quantity} units
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {movementsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : productMovements.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No Stock History"
                  description="Stock movements will appear here when changes are made"
                />
              ) : (
                <div className="space-y-3">
                  {productMovements.map((movement) => {
                    const config = getMovementConfig(movement);
                    const Icon = config.icon;
                    const isPositive = movement.movement_type === 'in';

                    return (
                      <Card key={movement.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-sm">{config.label}</p>
                                  <p className="text-xs text-gray-500 line-clamp-1">
                                    {movement.notes || movement.reference_type || 'Stock movement'}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : '-'}{movement.quantity}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {movement.previous_stock} → {movement.new_stock}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {movement.created_date && format(new Date(movement.created_date), 'dd MMM yyyy, HH:mm')}
                                </div>
                                {movement.performed_by_name && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {movement.performed_by_name}
                                  </div>
                                )}
                                {movement.warehouse_id && (
                                  <div className="flex items-center gap-1">
                                    <Warehouse className="w-3 h-3" />
                                    {getLocationName(movement.warehouse_id)}
                                  </div>
                                )}
                              </div>

                              {movement.batch_number && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  Batch: {movement.batch_number}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}