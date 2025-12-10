import { Package, Edit, Trash2, MapPin, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product, locations, onEdit, onDelete }) {
  const stockStatus = product.stock_quantity === 0 
    ? 'out' 
    : product.stock_quantity <= (product.low_stock_threshold || 10) 
    ? 'low' 
    : 'good';

  const statusConfig = {
    out: { color: 'bg-red-500', text: 'Out of Stock', badge: 'destructive' },
    low: { color: 'bg-amber-500', text: 'Low Stock', badge: 'secondary' },
    good: { color: 'bg-[#1EB053]', text: 'In Stock', badge: 'default' }
  };

  const productLocations = product.location_ids?.length 
    ? locations.filter(l => product.location_ids.includes(l.id))
    : [];

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 border-t-[#1EB053]">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant={statusConfig[stockStatus].badge} className="shadow-lg">
              {product.stock_quantity} {product.unit || 'units'}
            </Badge>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {product.category || 'Other'}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title and Price */}
          <div>
            <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
            <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1EB053]">
              Le {product.unit_price?.toLocaleString()}
            </span>
            {product.cost_price > 0 && (
              <span className="text-xs text-gray-500 line-through">
                Le {product.cost_price?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Stock Level</span>
              <span>{product.stock_quantity} / {product.low_stock_threshold || 10}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${statusConfig[stockStatus].color} transition-all`}
                style={{ 
                  width: `${Math.min(100, (product.stock_quantity / (product.low_stock_threshold || 10)) * 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Locations */}
          {productLocations.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <MapPin className="w-3 h-3 text-gray-400" />
              {productLocations.slice(0, 2).map(loc => (
                <Badge key={loc.id} variant="outline" className="text-xs">
                  {loc.name}
                </Badge>
              ))}
              {productLocations.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{productLocations.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-[#1EB053] hover:text-white hover:border-[#1EB053]"
              onClick={() => onEdit(product)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-red-500 hover:text-white hover:border-red-500"
              onClick={() => onDelete(product)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}