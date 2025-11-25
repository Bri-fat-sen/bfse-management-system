import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Package,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  DollarSign,
  Star
} from "lucide-react";

export default function SupplierDetailDialog({
  open,
  onOpenChange,
  supplier,
  supplierProducts = [],
  purchaseOrders = [],
  products = [],
  orgId
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddProduct, setShowAddProduct] = useState(false);

  const addProductMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierProduct.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierProducts'] });
      setShowAddProduct(false);
      toast({ title: "Product linked to supplier" });
    },
  });

  const removeProductMutation = useMutation({
    mutationFn: (id) => base44.entities.SupplierProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierProducts'] });
      toast({ title: "Product removed from supplier" });
    },
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    
    addProductMutation.mutate({
      organisation_id: orgId,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      product_id: formData.get('product_id'),
      product_name: product?.name,
      supplier_sku: formData.get('supplier_sku'),
      unit_cost: parseFloat(formData.get('unit_cost')) || 0,
      minimum_order_quantity: parseInt(formData.get('moq')) || 1,
      lead_time_days: parseInt(formData.get('lead_time')) || 7,
    });
  };

  if (!supplier) return null;

  const totalOrders = purchaseOrders.length;
  const totalSpent = purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const availableProducts = products.filter(p => 
    !supplierProducts.some(sp => sp.product_id === p.id)
  );

  const paymentTermsLabels = {
    immediate: 'Immediate',
    net_7: 'Net 7 Days',
    net_15: 'Net 15 Days',
    net_30: 'Net 30 Days',
    net_60: 'Net 60 Days'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span>{supplier.name}</span>
              {supplier.code && <Badge variant="outline" className="ml-2">{supplier.code}</Badge>}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="border-t-4 border-t-[#1EB053]">
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-[#1EB053]" />
              <p className="text-2xl font-bold">{supplierProducts.length}</p>
              <p className="text-sm text-gray-500">Products</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-[#0072C6]">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#0072C6]" />
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-sm text-gray-500">Orders</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-[#D4AF37]">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-[#D4AF37]" />
              <p className="text-2xl font-bold">Le {totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Information</TabsTrigger>
            <TabsTrigger value="products" className="flex-1">Products ({supplierProducts.length})</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">Orders ({purchaseOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Contact Person</Label>
                <p className="font-medium">{supplier.contact_person || '-'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Status</Label>
                <div>
                  <Badge className={
                    supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                    supplier.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }>
                    {supplier.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Phone</Label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {supplier.phone || '-'}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Email</Label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {supplier.email || '-'}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-500">Address</Label>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {[supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Payment Terms</Label>
                <p className="font-medium">{paymentTermsLabels[supplier.payment_terms] || '-'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Tax ID</Label>
                <p className="font-medium">{supplier.tax_id || '-'}</p>
              </div>
              {supplier.bank_name && (
                <>
                  <div>
                    <Label className="text-gray-500">Bank</Label>
                    <p className="font-medium">{supplier.bank_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account</Label>
                    <p className="font-medium">{supplier.bank_account}</p>
                  </div>
                </>
              )}
              {supplier.rating && (
                <div>
                  <Label className="text-gray-500">Rating</Label>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < supplier.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {supplier.notes && (
              <div>
                <Label className="text-gray-500">Notes</Label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{supplier.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Products supplied by this vendor</p>
              <Button size="sm" onClick={() => setShowAddProduct(!showAddProduct)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </Button>
            </div>

            {showAddProduct && (
              <Card className="mb-4 bg-gray-50">
                <CardContent className="p-4">
                  <form onSubmit={handleAddProduct} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label>Product</Label>
                        <Select name="product_id" required>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Supplier SKU</Label>
                        <Input name="supplier_sku" className="mt-1" placeholder="Supplier's code" />
                      </div>
                      <div>
                        <Label>Unit Cost (Le)</Label>
                        <Input name="unit_cost" type="number" step="0.01" className="mt-1" />
                      </div>
                      <div>
                        <Label>Min Order Qty</Label>
                        <Input name="moq" type="number" defaultValue="1" className="mt-1" />
                      </div>
                      <div>
                        <Label>Lead Time (Days)</Label>
                        <Input name="lead_time" type="number" defaultValue="7" className="mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={addProductMutation.isPending}>
                        Add Product
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowAddProduct(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {supplierProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No products linked to this supplier</p>
              </div>
            ) : (
              <div className="space-y-2">
                {supplierProducts.map((sp) => (
                  <div key={sp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0072C6]/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#0072C6]" />
                      </div>
                      <div>
                        <p className="font-medium">{sp.product_name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {sp.supplier_sku && <span>SKU: {sp.supplier_sku}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sp.lead_time_days} days
                          </span>
                          <span>MOQ: {sp.minimum_order_quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#1EB053]">Le {(sp.unit_cost || 0).toLocaleString()}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => removeProductMutation.mutate(sp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No purchase orders with this supplier</p>
              </div>
            ) : (
              <div className="space-y-2">
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{po.po_number}</p>
                      <p className="text-sm text-gray-500">
                        {po.order_date ? format(new Date(po.order_date), 'dd MMM yyyy') : 'No date'} • {po.items?.length || 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        po.status === 'received' ? 'default' :
                        po.status === 'cancelled' ? 'destructive' : 'secondary'
                      }>
                        {po.status}
                      </Badge>
                      <span className="font-bold">Le {(po.total_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}