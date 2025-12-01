import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, ArrowRight, X, Bell, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LowStockNotificationBanner({ 
  products = [], 
  reorderSuggestions = [],
  onDismiss,
  compact = false 
}) {
  const lowStockProducts = products.filter(p => 
    p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10)
  );
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const criticalSuggestions = reorderSuggestions.filter(s => s.priority === 'critical');

  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

  if (totalAlerts === 0 && criticalSuggestions.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-800">
          {outOfStockProducts.length > 0 && (
            <span className="font-semibold text-red-600">{outOfStockProducts.length} out of stock</span>
          )}
          {outOfStockProducts.length > 0 && lowStockProducts.length > 0 && ", "}
          {lowStockProducts.length > 0 && (
            <span>{lowStockProducts.length} low stock</span>
          )}
        </span>
        <Link to={createPageUrl("Inventory") + "?tab=reorder"}>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-amber-700">
            View <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
      {onDismiss && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Bell className="w-6 h-6 text-amber-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2">
            Stock Alerts
            <Badge variant="destructive" className="text-xs">{totalAlerts}</Badge>
          </h3>
          
          <div className="mt-2 space-y-2">
            {outOfStockProducts.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="destructive" className="text-xs">Critical</Badge>
                <span className="text-red-700 font-medium">
                  {outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''} out of stock
                </span>
              </div>
            )}
            
            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-amber-100 text-amber-800 text-xs">Warning</Badge>
                <span className="text-amber-700">
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low
                </span>
              </div>
            )}

            {criticalSuggestions.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-orange-100 text-orange-800 text-xs">Reorder</Badge>
                <span className="text-orange-700">
                  {criticalSuggestions.length} critical reorder suggestion{criticalSuggestions.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Quick list of affected products */}
          <div className="mt-3 flex flex-wrap gap-1">
            {[...outOfStockProducts.slice(0, 3), ...lowStockProducts.slice(0, 2)].map(p => (
              <Badge key={p.id} variant="outline" className="text-xs bg-white">
                <Package className="w-3 h-3 mr-1" />
                {p.name}
              </Badge>
            ))}
            {totalAlerts > 5 && (
              <Badge variant="outline" className="text-xs bg-white">
                +{totalAlerts - 5} more
              </Badge>
            )}
          </div>
        </div>

        <Link to={createPageUrl("Inventory") + "?tab=reorder"}>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}