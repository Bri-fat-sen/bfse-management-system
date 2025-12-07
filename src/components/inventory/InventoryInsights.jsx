import { TrendingUp, TrendingDown, Package, AlertCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InventoryInsights({ products, stockMovements, stockLevels, orgId }) {
  // Calculate insights
  const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * (p.cost_price || 0)), 0);
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10));
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  
  // Top products by value
  const topByValue = [...products]
    .map(p => ({ ...p, value: p.stock_quantity * (p.cost_price || 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Recent movements
  const recentMovements = stockMovements.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1EB053]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#1EB053]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">Le {totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0072C6]/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#0072C6]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                <p className="text-2xl font-bold">{products.filter(p => p.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products by Value */}
      <Card className="border-t-4 border-t-[#1EB053]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1EB053]" />
            Top Products by Inventory Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topByValue.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.stock_quantity} units @ Le {product.cost_price?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1EB053]">Le {product.value.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-1">{product.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockProducts.length > 0 && (
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 5).map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      <Badge variant="secondary">{product.stock_quantity} left</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockProducts.length > 0 && (
            <Card className="border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockProducts.slice(0, 5).map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      <Badge variant="destructive">0 stock</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}