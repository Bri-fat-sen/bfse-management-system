import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Minus, X, Check, Loader2, Zap } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function QuickStockAdjust({ open, onOpenChange, products, warehouses, orgId, currentEmployee }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [adjustType, setAdjustType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const adjustMutation = useMutation({
    mutationFn: async ({ productId, type, qty, notes }) => {
      const product = products.find(p => p.id === productId);
      const newStock = type === 'add' 
        ? product.stock_quantity + qty 
        : Math.max(0, product.stock_quantity - qty);

      await base44.entities.Product.update(productId, {
        stock_quantity: newStock
      });

      await base44.entities.StockMovement.create({
        organisation_id: orgId,
        product_id: productId,
        product_name: product.name,
        movement_type: type === 'add' ? 'in' : 'out',
        quantity: qty,
        previous_stock: product.stock_quantity,
        new_stock: newStock,
        reference_type: 'adjustment',
        notes: notes || 'Quick stock adjustment',
        recorded_by: currentEmployee?.id,
        recorded_by_name: currentEmployee?.full_name
      });

      return { product, newStock, qty };
    },
    onSuccess: ({ product, newStock, qty }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast.success(
        adjustType === 'add' ? "Stock added" : "Stock removed",
        `${product.name} now has ${newStock} units`
      );
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Adjustment failed", error.message);
    }
  });

  const resetForm = () => {
    setSelectedProduct("");
    setAdjustType("add");
    setQuantity("");
    setNotes("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (!selectedProduct || !qty) {
      toast.error("Missing information", "Please select product and enter quantity");
      return;
    }
    adjustMutation.mutate({ productId: selectedProduct, type: adjustType, qty, notes });
  };

  const product = products.find(p => p.id === selectedProduct);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md p-0">
        {/* Sierra Leone Header */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Quick Adjust</h2>
                <p className="text-white/80 text-sm">Add or remove stock</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Product *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.stock_quantity} in stock)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {product && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-bold">{product.stock_quantity} units</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={adjustType === 'add' ? 'default' : 'outline'}
              onClick={() => setAdjustType('add')}
              className={adjustType === 'add' ? 'bg-[#1EB053] hover:bg-[#16803d]' : ''}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
            <Button
              type="button"
              variant={adjustType === 'remove' ? 'default' : 'outline'}
              onClick={() => setAdjustType('remove')}
              className={adjustType === 'remove' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            >
              <Minus className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>

          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adjustment..."
              className="mt-1.5"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={adjustMutation.isPending}
              className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
            >
              {adjustMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Confirm</>
              )}
            </Button>
          </div>
        </form>

        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}