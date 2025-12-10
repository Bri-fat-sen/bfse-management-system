import { Download, Upload, ArrowLeftRight, Package, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function StockMovementsList({ movements, products, locations }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === movements.length ? [] : movements.map(m => m.id)
    );
  };

  const deleteMovementMutation = useMutation({
    mutationFn: async (movement) => {
      // If this movement was from a sale, restore the sale
      if (movement.reference_type === 'sale' && movement.reference_id) {
        const saleNumber = movement.reference_id;
        
        // Check if sale was deleted
        const existingSale = await base44.entities.Sale.filter({ sale_number: saleNumber });
        
        if (existingSale.length === 0) {
          // Sale was deleted, reverse the stock movement
          const product = await base44.entities.Product.filter({ id: movement.product_id });
          const productData = product?.[0];
          
          if (productData) {
            // Reverse the movement
            if (movement.movement_type === 'out') {
              // This was a sale that reduced stock, so we need to restore it
              const newStock = (productData.stock_quantity || 0) + movement.quantity;
              await base44.entities.Product.update(movement.product_id, {
                stock_quantity: newStock
              });
              
              // Update stock level at location
              const stockLevel = await base44.entities.StockLevel.filter({
                product_id: movement.product_id,
                warehouse_id: movement.warehouse_id
              });
              
              if (stockLevel?.[0]) {
                const newLocationStock = (stockLevel[0].quantity || 0) + movement.quantity;
                await base44.entities.StockLevel.update(stockLevel[0].id, {
                  quantity: newLocationStock,
                  available_quantity: newLocationStock
                });
              }
            }
          }
        }
      }
      
      // Delete the movement
      await base44.entities.StockMovement.delete(movement.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      toast.success("Stock movement deleted and inventory adjusted");
    },
    onError: (error) => {
      toast.error("Failed to delete movement");
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const movementsToDelete = movements.filter(m => ids.includes(m.id));
      
      // Process each movement
      for (const movement of movementsToDelete) {
        // If this movement was from a sale, restore stock
        if (movement.reference_type === 'sale' && movement.reference_id) {
          const saleNumber = movement.reference_id;
          const existingSale = await base44.entities.Sale.filter({ sale_number: saleNumber });
          
          if (existingSale.length === 0) {
            // Sale was deleted, reverse the stock movement
            const product = await base44.entities.Product.filter({ id: movement.product_id });
            const productData = product?.[0];
            
            if (productData && movement.movement_type === 'out') {
              const newStock = (productData.stock_quantity || 0) + movement.quantity;
              await base44.entities.Product.update(movement.product_id, {
                stock_quantity: newStock
              });
              
              const stockLevel = await base44.entities.StockLevel.filter({
                product_id: movement.product_id,
                warehouse_id: movement.warehouse_id
              });
              
              if (stockLevel?.[0]) {
                const newLocationStock = (stockLevel[0].quantity || 0) + movement.quantity;
                await base44.entities.StockLevel.update(stockLevel[0].id, {
                  quantity: newLocationStock,
                  available_quantity: newLocationStock
                });
              }
            }
          }
        }
      }
      
      // Delete all movements
      await Promise.all(ids.map(id => base44.entities.StockMovement.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      toast.success(`${selectedIds.length} movements deleted and inventory adjusted`);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    },
    onError: (error) => {
      toast.error("Bulk delete failed");
    }
  });
  if (movements.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No movements yet</h3>
          <p className="text-gray-500">Stock movements will appear here</p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'in': return Download;
      case 'out': return Upload;
      case 'transfer': return ArrowLeftRight;
      default: return Package;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'in': return 'text-[#1EB053] bg-[#1EB053]/10';
      case 'out': return 'text-red-500 bg-red-50';
      case 'transfer': return 'text-[#0072C6] bg-[#0072C6]/10';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <Card className="border-t-4 border-t-[#1EB053]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Movements</CardTitle>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedIds.length} Selected
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.length > 1 && (
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                checked={selectedIds.length === movements.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-gray-600">
                {selectedIds.length === movements.length ? 'Deselect All' : 'Select All'}
              </span>
            </div>
          )}
          {movements.map((movement) => {
            const Icon = getIcon(movement.movement_type);
            const colorClass = getColor(movement.movement_type);
            
            return (
              <div key={movement.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  checked={selectedIds.includes(movement.id)}
                  onCheckedChange={() => toggleSelection(movement.id)}
                />
                <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{movement.product_name}</p>
                  <p className="text-sm text-gray-500">{movement.notes || movement.reference_type}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(movement.created_date), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-bold text-lg ${movement.movement_type === 'in' ? 'text-[#1EB053]' : 'text-red-500'}`}>
                      {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      {movement.previous_stock} → {movement.new_stock}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this stock movement? Stock will be adjusted automatically.')) {
                        deleteMovementMutation.mutate(movement);
                      }
                    }}
                    className="hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <ConfirmDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        title="Delete Stock Movements"
        description={`Are you sure you want to delete ${selectedIds.length} stock movement${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        isLoading={bulkDeleteMutation.isPending}
      />
    </Card>
  );
}