import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Minus, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function QuickStockUpdate({ products = [], orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});

  const updateStockMutation = useMutation({
    mutationFn: async ({ product, adjustment }) => {
      const newStock = Math.max(0, product.stock_quantity + adjustment);
      
      await base44.entities.Product.update(product.id, {
        stock_quantity: newStock
      });

      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: product.id,
        product_name: product.name,
        movement_type: adjustment > 0 ? 'in' : 'out',
        quantity: Math.abs(adjustment),
        previous_stock: product.stock_quantity,
        new_stock: newStock,
        reference_type: 'manual',
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name,
        notes: 'Quick stock update from dashboard'
      });

      return { product, newStock };
    },
    onSuccess: ({ product, newStock }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast({ title: `${product.name} updated to ${newStock} units` });
      setQuantities(prev => ({ ...prev, [product.id]: '' }));
    },
  });

  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 6);

  const handleQuickAdjust = (product, adjustment) => {
    updateStockMutation.mutate({ product, adjustment });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-[#1EB053]" />
          Quick Stock Update
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <Badge 
                  variant={product.stock_quantity <= (product.low_stock_threshold || 10) ? "destructive" : "secondary"}
                  className="text-xs mt-1"
                >
                  {product.stock_quantity} {product.unit || 'pcs'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => handleQuickAdjust(product, -1)}
                  disabled={product.stock_quantity === 0 || updateStockMutation.isPending}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={quantities[product.id] || ''}
                  onChange={(e) => setQuantities(prev => ({ ...prev, [product.id]: e.target.value }))}
                  placeholder="0"
                  className="w-16 h-8 text-center text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => handleQuickAdjust(product, 1)}
                  disabled={updateStockMutation.isPending}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                {quantities[product.id] && (
                  <Button
                    size="sm"
                    className="h-8 ml-1 bg-[#1EB053] hover:bg-[#178f43]"
                    onClick={() => handleQuickAdjust(product, parseInt(quantities[product.id]) || 0)}
                    disabled={updateStockMutation.isPending}
                  >
                    {updateStockMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Set'
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}