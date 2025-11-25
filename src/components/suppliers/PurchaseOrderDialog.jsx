import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Plus, Trash2, Package } from "lucide-react";

export default function PurchaseOrderDialog({
  open,
  onOpenChange,
  supplier: initialSupplier,
  suppliers = [],
  products = [],
  supplierProducts = [],
  warehouses = [],
  orgId,
  currentEmployee
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSupplier, setSelectedSupplier] = useState(initialSupplier?.id || "");
  const [items, setItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    if (initialSupplier) {
      setSelectedSupplier(initialSupplier.id);
    }
  }, [initialSupplier]);

  useEffect(() => {
    if (!open) {
      setItems([]);
      setShippingCost(0);
      if (!initialSupplier) setSelectedSupplier("");
    }
  }, [open, initialSupplier]);

  const createPOMutation = useMutation({
    mutationFn: (data) => base44.entities.PurchaseOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      onOpenChange(false);
      toast({ title: "Purchase order created successfully" });
    },
  });

  // Get products for selected supplier
  const supplierProductsList = selectedSupplier 
    ? supplierProducts.filter(sp => sp.supplier_id === selectedSupplier)
    : [];
  
  const availableProducts = supplierProductsList.length > 0
    ? products.filter(p => supplierProductsList.some(sp => sp.product_id === p.id))
    : products;

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, unit_cost: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'product_id') {
      const sp = supplierProductsList.find(s => s.product_id === value);
      const product = products.find(p => p.id === value);
      newItems[index].product_name = product?.name;
      newItems[index].unit_cost = sp?.unit_cost || product?.cost_price || 0;
    }
    
    newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_cost || 0);
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const total = subtotal + (parseFloat(shippingCost) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const supplier = suppliers.find(s => s.id === selectedSupplier);
    const warehouse = warehouses.find(w => w.id === formData.get('warehouse_id'));

    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    const data = {
      organisation_id: orgId,
      po_number: poNumber,
      supplier_id: selectedSupplier,
      supplier_name: supplier?.name,
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name,
      items: items.map(item => ({
        ...item,
        quantity_ordered: item.quantity,
        quantity_received: 0
      })),
      subtotal,
      shipping_cost: parseFloat(shippingCost) || 0,
      total_amount: total,
      status: 'draft',
      payment_status: 'unpaid',
      order_date: formData.get('order_date'),
      expected_date: formData.get('expected_date'),
      created_by: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name,
      notes: formData.get('notes'),
    };

    createPOMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Create Purchase Order
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Supplier *</Label>
              <Select 
                value={selectedSupplier} 
                onValueChange={setSelectedSupplier}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.status === 'active').map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Delivery Warehouse</Label>
              <Select name="warehouse_id">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order Date</Label>
              <Input 
                name="order_date" 
                type="date" 
                defaultValue={format(new Date(), 'yyyy-MM-dd')} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Expected Delivery</Label>
              <Input name="expected_date" type="date" className="mt-1" />
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Order Items</Label>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No items added yet</p>
                <Button type="button" size="sm" variant="link" onClick={addItem}>
                  Add your first item
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Select 
                        value={item.product_id} 
                        onValueChange={(val) => updateItem(index, 'product_id', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        placeholder="Unit Cost"
                      />
                    </div>
                    <div className="w-28 text-right font-medium">
                      Le {(item.total || 0).toLocaleString()}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          {items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Le {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span>Shipping Cost</span>
                <Input
                  type="number"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-32 h-8"
                />
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-[#1EB053]">Le {total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea name="notes" className="mt-1" placeholder="Additional notes..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1EB053] hover:bg-[#178f43]"
              disabled={items.length === 0 || !selectedSupplier || createPOMutation.isPending}
            >
              Create Purchase Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}