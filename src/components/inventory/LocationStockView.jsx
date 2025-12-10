import { Warehouse, Truck, Package, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function LocationStockView({ stockLevels, products, warehouses, vehicles, orgId }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteStockMutation = useMutation({
    mutationFn: async (stockLevel) => {
      await base44.entities.StockLevel.delete(stockLevel.id);
      
      // Recalculate product stock from remaining location totals
      const allProductStockLevels = await base44.entities.StockLevel.filter({
        organisation_id: orgId,
        product_id: stockLevel.product_id
      });
      const totalProductStock = allProductStockLevels.reduce((sum, sl) => sum + (sl.quantity || 0), 0);
      await base44.entities.Product.update(stockLevel.product_id, {
        stock_quantity: totalProductStock
      });

      // Log stock movement
      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: stockLevel.product_id,
        product_name: stockLevel.product_name,
        warehouse_id: stockLevel.warehouse_id,
        warehouse_name: stockLevel.warehouse_name,
        movement_type: 'out',
        quantity: stockLevel.quantity,
        previous_stock: stockLevel.quantity,
        new_stock: 0,
        reference_type: 'manual',
        notes: 'Stock deleted at location'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stockLevels']);
      queryClient.invalidateQueries(['products']);
      toast.success('Stock Deleted', 'Location stock removed successfully');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Delete Failed', error.message);
    }
  });
  const allLocations = [
    ...warehouses.map(w => ({ ...w, type: 'warehouse' })),
    ...vehicles.map(v => ({ ...v, type: 'vehicle', name: v.registration_number }))
  ];

  if (allLocations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Warehouse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No locations yet</h3>
          <p className="text-gray-500">Add warehouses or vehicles to track stock by location</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allLocations.map(location => {
        const locationStock = stockLevels.filter(sl => sl.warehouse_id === location.id);
        const totalItems = locationStock.reduce((sum, sl) => sum + (sl.quantity || 0), 0);
        const Icon = location.type === 'warehouse' ? Warehouse : Truck;
        
        return (
          <Card key={location.id} className="border-t-4 border-t-[#1EB053]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  location.type === 'warehouse' ? 'bg-[#1EB053]/10' : 'bg-[#0072C6]/10'
                }`}>
                  <Icon className={`w-6 h-6 ${location.type === 'warehouse' ? 'text-[#1EB053]' : 'text-[#0072C6]'}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{location.name}</CardTitle>
                  <p className="text-xs text-gray-500 capitalize">{location.type}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="font-bold text-lg">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Products</span>
                  <span className="font-bold text-lg">{locationStock.length}</span>
                </div>
                {locationStock.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Stock:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {locationStock.map(sl => (
                        <div key={sl.id} className="flex justify-between items-center text-sm gap-2">
                          <span className="text-gray-600 truncate flex-1">{sl.product_name}</span>
                          <Badge variant="outline">{sl.quantity}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(sl)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Location Stock"
        description={`Are you sure you want to delete ${deleteConfirm?.quantity} units of "${deleteConfirm?.product_name}" from ${deleteConfirm?.warehouse_name}? This will update the product's total stock.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteStockMutation.mutate(deleteConfirm)}
        isLoading={deleteStockMutation.isPending}
      />
    </div>
  );
}