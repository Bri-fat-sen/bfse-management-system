import { Package, Edit, Trash2, MapPin, Warehouse, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export default function ProductTable({ products, locations, onEdit, onDelete, onBulkDelete }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === products.length ? [] : products.map(p => p.id)
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} selected product(s)?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedIds.length} Selected
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border-b-2 border-[#1EB053]">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700 w-12">
                  <Checkbox
                    checked={selectedIds.length === products.length && products.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">Product</th>
                <th className="text-left p-4 font-semibold text-gray-700">SKU</th>
                <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                <th className="text-left p-4 font-semibold text-gray-700">Locations</th>
                <th className="text-right p-4 font-semibold text-gray-700">Price</th>
                <th className="text-right p-4 font-semibold text-gray-700">Stock</th>
                <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const productLocations = product.location_ids?.length 
                  ? locations.filter(l => product.location_ids.includes(l.id))
                  : [];
                
                const stockStatus = product.stock_quantity === 0 
                  ? 'destructive' 
                  : product.stock_quantity <= (product.low_stock_threshold || 10) 
                  ? 'secondary' 
                  : 'default';

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={() => toggleSelection(product.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                            <Package className="w-6 h-6 text-[#0072C6]" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.description?.substring(0, 40)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{product.sku || '-'}</td>
                    <td className="p-4">
                      <Badge variant="outline">{product.category || 'Other'}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {productLocations.length === 0 ? (
                          <span className="text-xs text-gray-400">All locations</span>
                        ) : (
                          <>
                            {productLocations.slice(0, 2).map(loc => (
                              <Badge key={loc.id} variant="outline" className="text-xs flex items-center gap-1">
                                {loc.type === 'warehouse' ? <Warehouse className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                                {loc.name}
                              </Badge>
                            ))}
                            {productLocations.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{productLocations.length - 2}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-[#1EB053]">
                        Le {product.unit_price?.toLocaleString()}
                      </div>
                      {product.cost_price > 0 && (
                        <div className="text-xs text-gray-500">
                          Cost: Le {product.cost_price?.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Badge variant={stockStatus} className="font-semibold">
                        {product.stock_quantity} {product.unit || 'pcs'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product)}
                          className="hover:bg-[#1EB053]/10 hover:text-[#1EB053]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Delete ${product.name}?`)) {
                              onDelete(product);
                            }
                          }}
                          className="hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}