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
  Building2, Calendar, Warehouse, CreditCard, Truck, FileText, Repeat, Shield
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
  const [showSummary, setShowSummary] = useState(false);
  const [isRecurring, setIsRecurring] = useState(purchaseOrder?.is_recurring || false);
  const [recurrenceData, setRecurrenceData] = useState(purchaseOrder?.recurrence || {
    frequency: 'monthly',
    next_order_date: '',
    end_date: '',
    auto_approve: false,
    quantity_adjustment: { enabled: false, adjustment_percentage: 0 }
  });

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const { data: approvalRules = [] } = useQuery({
    queryKey: ['approvalRules', orgId],
    queryFn: () => base44.entities.ApprovalWorkflowRule.filter({ organisation_id: orgId, is_active: true }, '-priority'),
    enabled: !!orgId,
  });

  const { data: supplierProducts = [] } = useQuery({
    queryKey: ['supplierProducts', selectedSupplier],
    queryFn: () => base44.entities.SupplierProduct.filter({ supplier_id: selectedSupplier }),
    enabled: !!selectedSupplier,
  });

  const supplier = suppliers.find(s => s.id === selectedSupplier);
  const isCashOnly = supplier?.cash_only || false;

  useEffect(() => {
    if (open) {
      if (purchaseOrder) {
        setSelectedSupplier(purchaseOrder.supplier_id);
        setItems(purchaseOrder.items || []);
        setShippingCost(purchaseOrder.shipping_cost || 0);
        setTaxAmount(purchaseOrder.tax_amount || 0);
        setPaymentMethod(purchaseOrder.payment_method || "bank_transfer");
        setIsRecurring(purchaseOrder.is_recurring || false);
        setRecurrenceData(purchaseOrder.recurrence || {
          frequency: 'monthly',
          next_order_date: '',
          end_date: '',
          auto_approve: false,
          quantity_adjustment: { enabled: false, adjustment_percentage: 0 }
        });
      } else {
        setSelectedSupplier("");
        setItems([]);
        setShippingCost(0);
        setTaxAmount(0);
        setPaymentMethod("bank_transfer");
        setShowSummary(false);
        setIsRecurring(false);
        setRecurrenceData({
          frequency: 'monthly',
          next_order_date: '',
          end_date: '',
          auto_approve: false,
          quantity_adjustment: { enabled: false, adjustment_percentage: 0 }
        });
      }
    }
  }, [purchaseOrder, open]);

  useEffect(() => {
    if (supplier?.cash_only) {
      setPaymentMethod("cash");
    }
  }, [supplier]);

  const determineApprovalWorkflow = (totalAmount) => {
    const matchingRule = approvalRules.find(rule => {
      if (rule.trigger_type === 'value_based' && rule.conditions) {
        const min = rule.conditions.min_amount || 0;
        const max = rule.conditions.max_amount || Infinity;
        return totalAmount >= min && totalAmount <= max;
      }
      return false;
    });

    if (matchingRule) {
      return {
        required_approvers: matchingRule.approval_levels.map(level => ({
          level: level.level,
          role: level.required_role,
          status: 'pending'
        })),
        current_level: 1,
        workflow_type: 'value_based'
      };
    }
    return null;
  };

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

  const addItem = (isInventory = true) => {
    setItems([...items, { 
      product_id: "", 
      product_name: "", 
      is_inventory_item: isInventory,
      description: "",
      quantity_ordered: 1, 
      quantity_received: 0,
      unit: "piece",
      unit_cost: 0, 
      total: 0 
    }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === value);
      const supplierProduct = supplierProducts.find(sp => sp.product_id === value);
      newItems[index].product_name = product?.name || "";
      newItems[index].unit_cost = supplierProduct?.unit_cost || product?.cost_price || 0;
      newItems[index].is_inventory_item = true;
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
    
    const approvalWorkflow = determineApprovalWorkflow(total);
    const initialStatus = approvalWorkflow ? 'pending_approval' : 'draft';
    
    const data = {
      organisation_id: orgId,
      po_number: poNumber,
      supplier_id: selectedSupplier,
      supplier_name: supplier?.name,
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name || 'Main',
      order_date: formData.get('order_date'),
      expected_delivery_date: formData.get('expected_delivery_date'),
      items: items.filter(item => item.is_inventory_item ? item.product_id : item.product_name).map(item => ({
        ...item,
        delivery_history: []
      })),
      subtotal: subtotal,
      tax_amount: parseFloat(taxAmount) || 0,
      shipping_cost: parseFloat(shippingCost) || 0,
      total_amount: total,
      status: purchaseOrder?.status || initialStatus,
      payment_status: purchaseOrder?.payment_status || 'unpaid',
      payment_method: paymentMethod,
      created_by: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name,
      notes: formData.get('notes'),
      approval_workflow: approvalWorkflow,
      is_recurring: isRecurring,
      recurrence: isRecurring ? recurrenceData : null,
      discrepancies: []
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{purchaseOrder ? 'Edit Order' : 'Purchase Order'}</h2>
                <p className="text-white/80 text-xs">{items.length} items • Le {total.toLocaleString()}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
              <Label className="text-[#1EB053] font-medium">Supplier *</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier} required>
                <SelectTrigger className="mt-2 border-[#1EB053]/30 bg-white">
                  <SelectValue placeholder="Choose supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.status === 'active').map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Order Date</Label>
                <Input name="order_date" type="date" defaultValue={purchaseOrder?.order_date || format(new Date(), 'yyyy-MM-dd')} required className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Expected Delivery</Label>
                <Input name="expected_delivery_date" type="date" defaultValue={purchaseOrder?.expected_delivery_date || defaultExpectedDate} className="mt-1.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Order Items *</Label>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => addItem(true)} size="sm" variant="outline" className="text-xs">
                    <Plus className="w-4 h-4 mr-1" />Inventory
                  </Button>
                  <Button type="button" onClick={() => addItem(false)} size="sm" variant="outline" className="text-xs text-purple-600 border-purple-300 hover:bg-purple-50">
                    <Plus className="w-4 h-4 mr-1" />Other
                  </Button>
                </div>
              </div>
              {items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No items yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${item.is_inventory_item ? 'bg-gray-50' : 'bg-purple-50 border-purple-200'}`}>
                      <div className="grid grid-cols-12 gap-2 items-end">
                        {item.is_inventory_item ? (
                          <div className="col-span-5">
                            <Label className="text-xs">Product</Label>
                            <Select value={item.product_id} onValueChange={(val) => updateItem(index, 'product_id', val)}>
                              <SelectTrigger className="mt-1 bg-white text-xs h-9">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(p => (
                                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="col-span-5">
                            <Label className="text-xs text-purple-700">Item Name</Label>
                            <Input 
                              placeholder="e.g. Office supplies, Service" 
                              value={item.product_name} 
                              onChange={(e) => updateItem(index, 'product_name', e.target.value)} 
                              className="mt-1 bg-white text-xs h-9 border-purple-200" 
                            />
                          </div>
                        )}
                        <div className="col-span-2">
                          <Label className="text-xs">Qty</Label>
                          <Input type="number" step="0.01" min="0.01" value={item.quantity_ordered} onChange={(e) => updateItem(index, 'quantity_ordered', parseFloat(e.target.value) || 0)} className="mt-1 bg-white text-xs h-9" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Unit</Label>
                          <Select value={item.unit || "piece"} onValueChange={(val) => updateItem(index, 'unit', val)}>
                            <SelectTrigger className="mt-1 bg-white text-xs h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="piece" className="text-xs">Piece</SelectItem>
                              <SelectItem value="kg" className="text-xs">Kg</SelectItem>
                              <SelectItem value="litre" className="text-xs">Litre</SelectItem>
                              <SelectItem value="dozen" className="text-xs">Dozen</SelectItem>
                              <SelectItem value="box" className="text-xs">Box</SelectItem>
                              <SelectItem value="bag" className="text-xs">Bag</SelectItem>
                              <SelectItem value="tonne" className="text-xs">Tonne</SelectItem>
                              <SelectItem value="metre" className="text-xs">Metre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Cost</Label>
                          <Input type="number" step="0.01" value={item.unit_cost} onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)} className="mt-1 bg-white text-xs h-9" />
                        </div>
                        <div className="col-span-1 flex items-end pb-1">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(index)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      {!item.is_inventory_item && (
                        <div className="mt-2">
                          <Input 
                            placeholder="Description (optional)" 
                            value={item.description || ""} 
                            onChange={(e) => updateItem(index, 'description', e.target.value)} 
                            className="text-xs h-8 bg-white border-purple-200" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-[#1EB053]/5 to-[#0072C6]/5 rounded-lg border">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">Le {subtotal.toLocaleString()}</span>
                </div>
                <button type="button" onClick={() => setShowSummary(!showSummary)} className="text-xs text-gray-600 hover:text-gray-900">
                  {showSummary ? '− Hide' : '+ Show'} Shipping & Tax
                </button>
                {showSummary && (
                  <div className="space-y-2 mt-2 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Shipping</Label>
                        <Input type="number" step="0.01" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className="mt-1 text-xs h-8" />
                      </div>
                      <div>
                        <Label className="text-xs">Tax</Label>
                        <Input type="number" step="0.01" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} className="mt-1 text-xs h-8" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-bold">Total:</span>
                  <span className="text-lg font-bold text-[#1EB053]">Le {total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm">Warehouse & Payment</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <Select name="warehouse_id" defaultValue={purchaseOrder?.warehouse_id || warehouses[0]?.id}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                    <SelectItem value="bank_transfer" className="text-xs">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money" className="text-xs">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-purple-600" />
                  <Label className="text-sm font-medium">Recurring Order</Label>
                </div>
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded" />
              </div>
              {isRecurring && (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Frequency</Label>
                      <Select value={recurrenceData.frequency} onValueChange={(val) => setRecurrenceData({...recurrenceData, frequency: val})}>
                        <SelectTrigger className="mt-1 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <Input type="date" value={recurrenceData.end_date} onChange={(e) => setRecurrenceData({...recurrenceData, end_date: e.target.value})} className="mt-1 text-xs h-8" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={recurrenceData.auto_approve} onChange={(e) => setRecurrenceData({...recurrenceData, auto_approve: e.target.checked})} />
                    <span>Auto-approve recurring orders</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || items.length === 0} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{purchaseOrder ? 'Update' : 'Create'}</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}