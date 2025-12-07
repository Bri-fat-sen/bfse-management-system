import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Eye, Warehouse, Truck } from "lucide-react";

export default function InventoryProductList({ products, allLocations, onViewProduct, onEditProduct, primaryColor }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="text-left p-3 font-semibold text-sm text-gray-700">Product</th>
            <th className="text-left p-3 font-semibold text-sm text-gray-700">SKU</th>
            <th className="text-left p-3 font-semibold text-sm text-gray-700">Category</th>
            <th className="text-right p-3 font-semibold text-sm text-gray-700">Price</th>
            <th className="text-right p-3 font-semibold text-sm text-gray-700">Stock</th>
            <th className="text-left p-3 font-semibold text-sm text-gray-700">Locations</th>
            <th className="text-right p-3 font-semibold text-sm text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr 
              key={product.id}
              className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onViewProduct(product)}
            >
              <td className="p-3">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <span className="text-sm text-gray-600">{product.sku || '-'}</span>
              </td>
              <td className="p-3">
                <Badge variant="secondary" className="text-xs">
                  {product.category || 'Other'}
                </Badge>
              </td>
              <td className="p-3 text-right">
                <span className="font-semibold" style={{ color: primaryColor }}>
                  Le {product.unit_price?.toLocaleString()}
                </span>
              </td>
              <td className="p-3 text-right">
                <Badge 
                  variant={
                    product.stock_quantity === 0 ? "destructive" :
                    product.stock_quantity <= (product.low_stock_threshold || 10) ? "secondary" : "default"
                  }
                >
                  {product.stock_quantity} {product.unit}
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex gap-1">
                  {product.location_ids?.length > 0 ? (
                    product.location_ids.slice(0, 2).map(locId => {
                      const loc = allLocations.find(l => l.id === locId);
                      if (!loc) return null;
                      return (
                        <Badge key={locId} variant="outline" className="text-xs">
                          {loc.type === 'warehouse' ? <Warehouse className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-400">All</span>
                  )}
                  {product.location_ids?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.location_ids.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProduct(product);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}