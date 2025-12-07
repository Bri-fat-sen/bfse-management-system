import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";

export default function InventoryInsights({ products, primaryColor }) {
  const insights = useMemo(() => {
    const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10));
    const outOfStock = products.filter(p => p.stock_quantity === 0);
    const highValue = products
      .map(p => ({ ...p, value: (p.stock_quantity || 0) * (p.cost_price || 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return { lowStock, outOfStock, highValue };
  }, [products]);

  if (insights.lowStock.length === 0 && insights.outOfStock.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div 
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${primaryColor} 0%, #EF4444 100%)` }}
      />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">Inventory Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Stock */}
          {insights.lowStock.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <p className="font-medium text-amber-900">Low Stock Items</p>
                <Badge variant="secondary" className="ml-auto">
                  {insights.lowStock.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {insights.lowStock.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1">{product.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {product.stock_quantity}
                    </Badge>
                  </div>
                ))}
                {insights.lowStock.length > 3 && (
                  <p className="text-xs text-amber-600 pt-1">
                    +{insights.lowStock.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Out of Stock */}
          {insights.outOfStock.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-red-600" />
                <p className="font-medium text-red-900">Out of Stock</p>
                <Badge variant="destructive" className="ml-auto">
                  {insights.outOfStock.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {insights.outOfStock.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1">{product.name}</span>
                    <Badge variant="destructive">0</Badge>
                  </div>
                ))}
                {insights.outOfStock.length > 3 && (
                  <p className="text-xs text-red-600 pt-1">
                    +{insights.outOfStock.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* High Value Items */}
          {insights.highValue.length > 0 && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="font-medium text-green-900">Top Value Items</p>
              </div>
              <div className="space-y-2">
                {insights.highValue.map(product => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1">{product.name}</span>
                    <span className="font-semibold text-green-700 ml-2">
                      Le {product.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}