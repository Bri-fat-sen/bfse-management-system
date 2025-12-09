import { } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Package, ArrowRight, ShoppingCart, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LowStockAlert({ products = [], reorderSuggestions = [] }) {
  const lowStockProducts = products
    .filter(p => p.stock_quantity <= (p.low_stock_threshold || 10))
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  const criticalReorders = reorderSuggestions.filter(s => s.priority === 'critical' || s.priority === 'high');
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

  if (lowStockProducts.length === 0 && criticalReorders.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Stock Alerts
          <div className="ml-auto flex gap-1">
            {outOfStockCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">{outOfStockCount} OOS</Badge>
            )}
            <Badge variant="secondary" className="text-[10px]">{lowStockProducts.length} low</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Critical reorder suggestions */}
        {criticalReorders.length > 0 && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-red-700 mb-1">
              <TrendingDown className="w-3 h-3" />
              <span className="font-medium">{criticalReorders.length} Critical Reorder{criticalReorders.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {criticalReorders.slice(0, 3).map(s => (
                <Badge key={s.id} variant="outline" className="text-[10px] bg-white">
                  {s.product_name}
                </Badge>
              ))}
              {criticalReorders.length > 3 && (
                <Badge variant="outline" className="text-[10px] bg-white">+{criticalReorders.length - 3}</Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {lowStockProducts.map((product) => {
            const threshold = product.low_stock_threshold || 10;
            const percentage = Math.min((product.stock_quantity / threshold) * 100, 100);
            const isOutOfStock = product.stock_quantity === 0;
            
            return (
              <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm truncate flex-1">{product.name}</span>
                  <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
                    {product.stock_quantity} left
                  </Badge>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-1.5 ${isOutOfStock ? '[&>div]:bg-red-500' : '[&>div]:bg-amber-500'}`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-3">
          <Link to={createPageUrl("Inventory")} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full">
              <Package className="w-4 h-4 mr-1" /> Inventory
            </Button>
          </Link>
          {criticalReorders.length > 0 && (
            <Link to={createPageUrl("Inventory") + "?tab=reorder"} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                <ShoppingCart className="w-4 h-4 mr-1" /> Reorder
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}