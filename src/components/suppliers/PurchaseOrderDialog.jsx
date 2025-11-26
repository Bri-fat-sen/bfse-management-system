import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Plus, Trash2, Package, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays } from "date-fns";

export default function PurchaseOrderDialog({ 
  open, 
  onOpenChange, 
  purchaseOrder,
  suppliers = [],
  products = [],
  warehouses = [],
  orgId,
  currentEmployee
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSupplier, setSelectedSupplier] = useState(purchaseOrder?.supplier_id || "");
  const [items, setItems] = useState(purchaseOrder?.items || []);
  const [shippingCost, setShippingCost] = useState(purchaseOrder?.shipping_cost || 0);
  const [taxAmount, setTaxAmount] = useState(purchaseOrder?.tax_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState(purchaseOrder?.payment_method || "bank_transfer");
  
  const isCashOnly = supplier?.cash_only || false;

  const { data: supplierProducts = [] } = useQuery({
    queryKey: ['supplierProducts', selectedSupplier],
    queryFn: () => base44.entities.SupplierProduct.filter({ supplier_id: selectedSupplier }),
    enabled: !!selectedSupplier,
  });

  const supplier = suppliers.find(s => s.id === selectedSupplier);

  useEffect(() => {
    if (purchaseOrder) {
      setSelectedSupplier(purchaseOrder.supplier_id);
      setItems(purchaseOrder.items || []);
      setShippingCost(purchaseOrder.shipping_cost || 0);
      setTaxAmount(purchaseOrder.tax_amount || 0);
      setPaymentMethod(purchaseOrder.payment_method || "bank_transfer");
    } else {
      setSelectedSupplier("");
      setItems([]);
      setShippingCost(0);
      setTaxAmount(0);
      setPaymentMethod("bank_transfer");
    }
  }, [purchaseOrder, open]);

  // Auto-set cash when supplier is cash only
  useEffect(() => {
    if (supplier?.cash_only) {
      setPaymentMethod("cash");
    }
  }, [purchaseOrder, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PurchaseOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      onOpenChange(false);
      toast({ title: "Purchase order created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PurchaseOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      onOpenChange(false);
      toast({ title: "Purchase order updated" });
    },
  });

  const addItem = () => {
    setItems([...items, { product_id: "", product_name: "", quantity_ordered: 1, quantity_received: 0, unit_cost: 0, total: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      const supplierProduct = supplierProducts.find(sp => sp.product_id === value);
      newItems[index].product_name = product?.name || "";
      newItems[index].unit_cost = supplierProduct?.unit_cost || product?.cost_price || 0;
    }
    
    if (field === 'quantity_ordered' || field === 'unit_cost') {
      newItems[index].total = (newItems[index].quantity_ordered || 0) * (newItems[index].unit_cost || 0);
    }
    
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const total = subtotal + (parseFloat(shippingCost) || 0) + (parseFloat(taxAmount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const warehouse = warehouses.find(w => w.id === formData.get('warehouse_id'));
    
    const poNumber = purchaseOrder?.po_number || `PO-${Date.now().toString(36).toUpperCase()}`;
    
    const data = {
      organisation_id: orgId,
      po_number: poNumber,
      supplier_id: selectedSupplier,
      supplier_name: supplier?.name,
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name || 'Main',
      order_date: formData.get('order_date'),
      expected_delivery_date: formData.get('expected_delivery_date'),
      items: items.filter(item => item.product_id),
      subtotal: subtotal,
      tax_amount: parseFloat(taxAmount) || 0,
      shipping_cost: parseFloat(shippingCost) || 0,
      total_amount: total,
      status: purchaseOrder?.status || 'draft',
      payment_status: purchaseOrder?.payment_status || 'unpaid',
      payment_method: paymentMethod,
      created_by: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name,
      notes: formData.get('notes'),
    };

    if (purchaseOrder) {
      updateMutation.mutate({ id: purchaseOrder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const defaultExpectedDate = supplier 
    ? format(addDays(new Date(), supplier.default_lead_time_days || 7), 'yyyy-MM-dd')
    : format(addDays(new Date(), 7), 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
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
              <Label>Order Date *</Label>
              <Input 
                name="order_date" 
                type="date" 
                defaultValue={purchaseOrder?.order_date || format(new Date(), 'yyyy-MM-dd')} 
                required 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Expected Delivery</Label>
              <Input 
                name="expected_delivery_date" 
                type="date" 
                defaultValue={purchaseOrder?.expected_delivery_date || defaultExpectedDate} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select name="warehouse_id" defaultValue={purchaseOrder?.warehouse_id || ""}>
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
              <Label>Payment Method {isCashOnly && <span className="text-xs text-orange-500 ml-1">(Cash Only Supplier)</span>}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isCashOnly}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  {!isCashOnly && (
                    <>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="credit">Credit (Pay Later)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Order Items</h4>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">
                    <div className="col-span-5">
                      <Label className="text-xs">Product</Label>
                      <Select 
                        value={item.product_id} 
                        onValueChange={(val) => updateItem(index, 'product_id', val)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => {
                            const sp = supplierProducts.find(sp => sp.product_id === p.id);
                            return (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} {sp ? `(Le ${sp.unit_cost?.toLocaleString()})` : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity_ordered}
                        onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Unit Cost (Le)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <div className="mt-1 h-10 px-3 flex items-center bg-white border rounded-md font-medium">
                        Le {item.total?.toLocaleString()}
                      </div>
                    </div>
                    <div className="col-span-1">
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Shipping Cost (Le)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Tax Amount (Le)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Le {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Le {parseFloat(shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>Le {parseFloat(taxAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#1EB053]">Le {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={purchaseOrder?.notes} className="mt-1" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1EB053] hover:bg-[#178f43]"
              disabled={createMutation.isPending || updateMutation.isPending || items.length === 0}
            >
              {purchaseOrder ? 'Update' : 'Create'} Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}