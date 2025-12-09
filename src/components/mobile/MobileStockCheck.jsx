import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  WifiOff
} from "lucide-react";
import { useOffline } from "@/components/offline/OfflineManager";

export default function MobileStockCheck({ open, onOpenChange, orgId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const offlineContext = useOffline();
  const isOnline = offlineContext?.isOnline ?? true;
  const cachedProducts = offlineContext?.getCachedData?.('products') || [];

  const { data: fetchedProducts = [], isLoading } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId && open && isOnline,
    staleTime: 2 * 60 * 1000,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId && open && isOnline,
    staleTime: 2 * 60 * 1000,
  });

  // Use fetched products when online, cached when offline
  const products = isOnline ? fetchedProducts : (fetchedProducts.length > 0 ? fetchedProducts : cachedProducts);

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  );

  const getStockStatus = (product) => {
    const stock = product.stock_quantity || 0;
    const threshold = product.low_stock_threshold || 10;
    
    if (stock === 0) return { status: 'out', color: 'bg-red-100 text-red-700', icon: XCircle };
    if (stock <= threshold) return { status: 'low', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle };
    return { status: 'ok', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
  };

  const getLocationStock = (productId) => {
    return stockLevels.filter(sl => sl.product_id === productId);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0072C6]" />
            Stock Check
            {!isOnline && (
              <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search product or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-green-700">
                {products.filter(p => (p.stock_quantity || 0) > (p.low_stock_threshold || 10)).length}
              </p>
              <p className="text-xs text-green-600">In Stock</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-amber-700">
                {products.filter(p => {
                  const stock = p.stock_quantity || 0;
                  const threshold = p.low_stock_threshold || 10;
                  return stock > 0 && stock <= threshold;
                }).length}
              </p>
              <p className="text-xs text-amber-600">Low Stock</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-red-700">
                {products.filter(p => (p.stock_quantity || 0) === 0).length}
              </p>
              <p className="text-xs text-red-600">Out of Stock</p>
            </div>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-8 h-8 border-4 border-[#1EB053] border-t-transparent rounded-full" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Package className="w-10 h-10 mb-2" />
                <p className="text-sm">No products found</p>
              </div>
            ) : (
              filteredProducts.map(product => {
                const stockInfo = getStockStatus(product);
                const locations = getLocationStock(product.id);
                const StatusIcon = stockInfo.icon;
                
                return (
                  <div key={product.id} className="bg-white border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                          </div>
                          <Badge className={stockInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {product.stock_quantity || 0}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-sm font-medium text-[#1EB053]">
                            Le {product.unit_price?.toLocaleString()}
                          </p>
                          {product.wholesale_price && (
                            <p className="text-xs text-gray-400">
                              Wholesale: Le {product.wholesale_price?.toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Location breakdown */}
                        {locations.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {locations.slice(0, 3).map(loc => (
                              <Badge key={loc.id} variant="outline" className="text-xs">
                                <MapPin className="w-2 h-2 mr-1" />
                                {loc.warehouse_name}: {loc.quantity}
                              </Badge>
                            ))}
                            {locations.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{locations.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}