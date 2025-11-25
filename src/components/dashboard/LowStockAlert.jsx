import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LowStockAlert({ products = [] }) {
  const lowStockProducts = products
    .filter(p => p.stock_quantity <= (p.low_stock_threshold || 10))
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Low Stock Alert
          <Badge variant="destructive" className="ml-auto">{lowStockProducts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
        <Link to={createPageUrl("Inventory")}>
          <Button variant="ghost" size="sm" className="w-full mt-3">
            View Inventory <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}