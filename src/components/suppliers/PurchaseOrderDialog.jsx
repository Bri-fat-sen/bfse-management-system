import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/components/ui/Toast";
import { 
  Plus, Trash2, Package, Calculator, X, Check, Loader2,
  Building2, Calendar, Warehouse, CreditCard, Truck, FileText
} from "lucide-react";
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
  currentEmployee,
  organisation
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedSupplier, setSelectedSupplier] = useState(purchaseOrder?.supplier_id || "");
  const [items, setItems] = useState(purchaseOrder?.items || []);
  const [shippingCost, setShippingCost] = useState(purchaseOrder?.shipping_cost || 0);
  const [taxAmount, setTaxAmount] = useState(purchaseOrder?.tax_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState(purchaseOrder?.payment_method || "bank_transfer");
  const [activeSection, setActiveSection] = useState('supplier');

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const { data: supplierProducts = [] } = useQuery({
    queryKey: ['supplierProducts', selectedSupplier],
    queryFn: () => base44.entities.SupplierProduct.filter({ supplier_id: selectedSupplier }),
    enabled: !!selectedSupplier,
  });

  const supplier = suppliers.find(s => s.id === selectedSupplier);
  const isCashOnly = supplier?.cash_only || false;

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
    if (open) {
      setActiveSection('supplier');
    }
  }, [purchaseOrder, open]);

  useEffect(() => {
    if (supplier?.cash_only) {
      setPaymentMethod("cash");
    }
  }, [supplier]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PurchaseOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      onOpenChange(false);
      toast.success("Purchase order created", "Order has been created successfully");
    },
    onError: (error) => {
      console.error('Create PO error:', error);
      toast.error("Failed to create purchase order", error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PurchaseOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      onOpenChange(false);
      toast.success("Purchase order updated", "Order has been updated successfully");
    },
    onError: (error) => {
      console.error('Update PO error:', error);
      toast.error("Failed to update purchase order", error.message);
    }
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
    
    const poNumber = purchaseOrder?.po_number || `PO-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
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

  const sections = [
    { id: 'supplier', label: 'Supplier', icon: Building2 },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'summary', label: 'Summary', icon: Calculator },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
                </h2>
                <p className="text-white/80 text-sm">
                  {purchaseOrder ? `PO: ${purchaseOrder.po_number}` : 'Order products from suppliers'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
                {section.id === 'items' && items.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded-full text-xs">
                    {items.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6">
            
            {/* Supplier Section */}
            {activeSection === 'supplier' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Building2 className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Supplier & Delivery</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Select Supplier *
                    </Label>
                    <Select 
                      value={selectedSupplier} 
                      onValueChange={setSelectedSupplier}
                      required
                    >
                      <SelectTrigger className="mt-2 border-[#1EB053]/30 bg-white">
                        <SelectValue placeholder="Choose a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.filter(s => s.status === 'active').map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Order Date *
                    </Label>
                    <Input 
                      name="order_date" 
                      type="date" 
                      defaultValue={purchaseOrder?.order_date || format(new Date(), 'yyyy-MM-dd')} 
                      required 
                      className="mt-1.5 border-gray-200" 
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Expected Delivery</Label>
                    <Input 
                      name="expected_delivery_date" 
                      type="date" 
                      defaultValue={purchaseOrder?.expected_delivery_date || defaultExpectedDate} 
                      className="mt-1.5 border-gray-200" 
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Warehouse className="w-3 h-3" /> Warehouse
                    </Label>
                    <Select name="warehouse_id" defaultValue={purchaseOrder?.warehouse_id || ""}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
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
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <CreditCard className="w-3 h-3" /> Payment Method 
                      {isCashOnly && <span className="text-xs text-orange-500">(Cash Only)</span>}
                    </Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isCashOnly}>
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
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
              </div>
            )}

            {/* Items Section */}
            {activeSection === 'items' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                      <Package className="w-4 h-4" style={{ color: secondaryColor }} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Order Items</h3>
                  </div>
                  <Button type="button" onClick={addItem} size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No items added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Item" to start building your order</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-12 md:col-span-5">
                            <Label className="text-xs text-gray-500">Product</Label>
                            <Select 
                              value={item.product_id} 
                              onValueChange={(val) => updateItem(index, 'product_id', val)}
                            >
                              <SelectTrigger className="mt-1 bg-white border-gray-200">
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
                          <div className="col-span-4 md:col-span-2">
                            <Label className="text-xs text-gray-500">Qty</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={item.quantity_ordered}
                              onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 0)}
                              className="mt-1 bg-white border-gray-200"
                            />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <Label className="text-xs text-gray-500">Unit Cost</Label>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={item.unit_cost}
                              onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                              className="mt-1 bg-white border-gray-200"
                            />
                          </div>
                          <div className="col-span-3 md:col-span-2">
                            <Label className="text-xs text-gray-500">Total</Label>
                            <div className="mt-1 h-10 px-3 flex items-center bg-[#1EB053]/10 border border-[#1EB053]/20 rounded-md font-semibold text-[#1EB053]">
                              Le {item.total?.toLocaleString()}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Summary Section */}
            {activeSection === 'summary' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Order Summary</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium">Shipping Cost (Le)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      className="mt-2 bg-white border-gray-200"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium">Tax Amount (Le)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="mt-2 bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* Totals Card */}
                <Card className="border-2 border-[#1EB053]/30 bg-gradient-to-br from-[#1EB053]/5 to-[#0072C6]/5">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({items.length} items)</span>
                        <span className="font-medium">Le {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">Le {parseFloat(shippingCost || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">Le {parseFloat(taxAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t-2 border-[#1EB053]/20">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[#1EB053]">Le {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label className="text-gray-700 font-medium flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Notes
                  </Label>
                  <Textarea name="notes" defaultValue={purchaseOrder?.notes} className="mt-1.5 border-gray-200" rows={3} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || items.length === 0}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{purchaseOrder ? 'Update' : 'Create'} Order</>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}