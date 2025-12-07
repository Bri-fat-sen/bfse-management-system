import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Eye, Warehouse, Truck, AlertTriangle } from "lucide-react";

export default function InventoryProductGrid({ products, allLocations, onViewProduct, onEditProduct, primaryColor, secondaryColor }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const stockStatus = product.stock_quantity === 0 ? 'out' : 
                           product.stock_quantity <= (product.low_stock_threshold || 10) ? 'low' : 'good';
        
        return (
          <Card 
            key={product.id}
            className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            onClick={() => onViewProduct(product)}
          >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)` }}
                  >
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
              )}
              
              {/* Stock Badge */}
              <div className="absolute top-3 right-3">
                <Badge 
                  variant={stockStatus === 'out' ? "destructive" : stockStatus === 'low' ? "secondary" : "default"}
                  className="shadow-lg"
                >
                  {product.stock_quantity}
                </Badge>
              </div>

              {/* Low Stock Warning */}
              {stockStatus === 'low' && (
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Low
                  </Badge>
                </div>
              )}

              {/* Sierra Leone Stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                <div className="flex-1" style={{ backgroundColor: primaryColor }} />
                <div className="flex-1 bg-white" />
                <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title & SKU */}
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
              </div>

              {/* Category & Price */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {product.category || 'Other'}
                </Badge>
                <span className="font-bold text-lg" style={{ color: primaryColor }}>
                  Le {product.unit_price?.toLocaleString()}
                </span>
              </div>

              {/* Locations */}
              {product.location_ids?.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {product.location_ids.slice(0, 3).map(locId => {
                    const loc = allLocations.find(l => l.id === locId);
                    if (!loc) return null;
                    return (
                      <Badge key={locId} variant="outline" className="text-xs">
                        {loc.type === 'warehouse' ? <Warehouse className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      </Badge>
                    );
                  })}
                  {product.location_ids.length > 3 && (
                    <span className="text-xs text-gray-400">+{product.location_ids.length - 3}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProduct(product);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProduct(product);
                  }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}