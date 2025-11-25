import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LowStockAlert({ products = [] }) {
  const lowStockItems = products
    .filter(p => p.stock_quantity <= (p.low_stock_threshold || 10))
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  const criticalCount = lowStockItems.filter(p => p.stock_quantity === 0).length;

  return (
    <Card className="border-t-4 border-t-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Low Stock Alert
          </CardTitle>
          {criticalCount > 0 && (
            <Badge variant="destructive">{criticalCount} out of stock</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">All stock levels are healthy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((product) => {
              const threshold = product.low_stock_threshold || 10;
              const percentage = Math.min((product.stock_quantity / threshold) * 100, 100);
              const isOutOfStock = product.stock_quantity === 0;
              
              return (
                <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isOutOfStock ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        <Package className={`w-4 h-4 ${isOutOfStock ? 'text-red-600' : 'text-amber-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <Badge variant={isOutOfStock ? "destructive" : "outline"} className="ml-2">
                      {product.stock_quantity} {product.unit || 'pcs'}
                    </Badge>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-1.5 ${isOutOfStock ? '[&>div]:bg-red-500' : '[&>div]:bg-amber-500'}`}
                  />
                </div>
              );
            })}
            
            <Link to={createPageUrl("Inventory")}>
              <Button variant="ghost" className="w-full mt-2 text-[#0072C6]">
                View All Inventory
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}