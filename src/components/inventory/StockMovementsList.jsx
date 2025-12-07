import { Download, Upload, ArrowLeftRight, Package, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";

export default function StockMovementsList({ movements, products, locations }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const deleteMovementMutation = useMutation({
    mutationFn: (id) => base44.entities.StockMovement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast.success("Movement deleted", "Stock movement removed successfully");
    },
    onError: (error) => {
      toast.error("Delete failed", error.message);
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
        <CardTitle>Stock Movements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.map((movement) => {
            const Icon = getIcon(movement.movement_type);
            const colorClass = getColor(movement.movement_type);
            
            return (
              <div key={movement.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                      if (confirm('Delete this stock movement?')) {
                        deleteMovementMutation.mutate(movement.id);
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
    </Card>
  );
}