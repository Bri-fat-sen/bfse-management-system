import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, ArrowRight, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LowStockAlertWidget({ products }) {
  const lowStockProducts = products
    .filter(p => p.stock_quantity <= p.low_stock_threshold)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  const criticalStock = lowStockProducts.filter(p => p.stock_quantity === 0);
  const warningStock = lowStockProducts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">Out of Stock</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{criticalStock.length}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">Low Stock</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">{warningStock.length}</p>
            </div>
          </div>

          {/* Product List */}
          {lowStockProducts.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {lowStockProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`p-3 rounded-lg border ${
                    product.stock_quantity === 0 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Package className={`w-4 h-4 flex-shrink-0 ${
                        product.stock_quantity === 0 ? 'text-red-600' : 'text-amber-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-600">
                          SKU: {product.sku || 'N/A'} • Reorder: {product.reorder_point || 10}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      product.stock_quantity === 0 
                        ? 'bg-red-600 text-white' 
                        : 'bg-amber-600 text-white'
                    }>
                      {product.stock_quantity} left
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-green-50 rounded-xl text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-800">All stock levels healthy</p>
              <p className="text-xs text-green-600 mt-1">No low stock alerts</p>
            </div>
          )}

          <Link to={createPageUrl("Inventory")}>
            <Button className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white hover:shadow-lg transition-all">
              Manage Inventory <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}