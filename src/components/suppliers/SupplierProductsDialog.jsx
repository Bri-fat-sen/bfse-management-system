import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Star, Package, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SupplierProductsDialog({ 
  open, 
  onOpenChange, 
  supplier,
  products = [],
  orgId 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data: supplierProducts = [] } = useQuery({
    queryKey: ['supplierProducts', supplier?.id],
    queryFn: () => base44.entities.SupplierProduct.filter({ supplier_id: supplier?.id }),
    enabled: !!supplier?.id,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierProduct.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierProducts'] });
      setShowAddForm(false);
      toast({ title: "Product linked to supplier" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupplierProduct.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierProducts'] });
      setEditingProduct(null);
      toast({ title: "Product updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SupplierProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierProducts'] });
      toast({ title: "Product removed from supplier" });
    },
  });

  const setPreferredMutation = useMutation({
    mutationFn: async ({ productId, supplierProductId }) => {
      // Remove preferred from other suppliers for this product
      const otherSupplierProducts = await base44.entities.SupplierProduct.filter({
        organisation_id: orgId,
        product_id: productId,
        is_preferred: true
      });
      for (const sp of otherSupplierProducts) {
        if (sp.id !== supplierProductId) {
          await base44.entities.SupplierProduct.update(sp.id, { is_preferred: false });
        }
      }
      // Set this one as preferred
      await base44.entities.SupplierProduct.update(supplierProductId, { is_preferred: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierProducts'] });
      toast({ title: "Set as preferred supplier" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productId = formData.get('product_id');
    const product = products.find(p => p.id === productId);

    const data = {
      organisation_id: orgId,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      product_id: productId,
      product_name: product?.name,
      supplier_sku: formData.get('supplier_sku'),
      unit_cost: parseFloat(formData.get('unit_cost')) || 0,
      minimum_order_quantity: parseInt(formData.get('minimum_order_quantity')) || 1,
      lead_time_days: parseInt(formData.get('lead_time_days')) || supplier.default_lead_time_days || 7,
      is_preferred: formData.get('is_preferred') === 'on',
      notes: formData.get('notes'),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const availableProducts = products.filter(
    p => !supplierProducts.some(sp => sp.product_id === p.id) || editingProduct
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Products from {supplier?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product List */}
          {supplierProducts.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No products linked to this supplier</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4 bg-[#1EB053]">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{supplierProducts.length} products</p>
                {!showAddForm && !editingProduct && (
                  <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-[#1EB053]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>

              {!showAddForm && !editingProduct && (
                <div className="space-y-2">
                  {supplierProducts.map((sp) => {
                    const product = products.find(p => p.id === sp.product_id);
                    const productStock = product?.stock_quantity || 0;
                    const totalLocationStock = stockLevels
                      .filter(sl => sl.product_id === sp.product_id)
                      .reduce((sum, sl) => sum + (sl.quantity || 0), 0);
                    const isLowStock = productStock < (product?.low_stock_threshold || 10);
                    
                    return (
                      <Card key={sp.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                                <Package className="w-5 h-5 text-[#0072C6]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{sp.product_name}</span>
                                  {sp.is_preferred && (
                                    <Badge className="bg-[#D4AF37] text-white text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      Preferred
                                    </Badge>
                                  )}
                                  {isLowStock && (
                                    <Badge className="bg-red-100 text-red-700 text-xs">Low Stock</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  SKU: {sp.supplier_sku || '-'} • MOQ: {sp.minimum_order_quantity} • Lead: {sp.lead_time_days} days
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                    Stock: {productStock}
                                  </span>
                                  {totalLocationStock !== productStock && (
                                    <span className="text-gray-400 ml-2">
                                      (Locations: {totalLocationStock})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-[#1EB053]">Le {sp.unit_cost?.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">per unit</p>
                              </div>
                            <div className="flex gap-1">
                              {!sp.is_preferred && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setPreferredMutation.mutate({ productId: sp.product_id, supplierProductId: sp.id })}
                                  title="Set as preferred"
                                >
                                  <Star className="w-4 h-4 text-gray-400" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingProduct(sp);
                                  setShowAddForm(false);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => deleteMutation.mutate(sp.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Add/Edit Form */}
          {(showAddForm || editingProduct) && (
            <Card className="border-[#1EB053]">
              <CardContent className="p-4">
                <h4 className="font-medium mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Product *</Label>
                      <Select name="product_id" defaultValue={editingProduct?.product_id} required disabled={!!editingProduct}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {(editingProduct ? products : availableProducts).map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Supplier SKU</Label>
                      <Input name="supplier_sku" defaultValue={editingProduct?.supplier_sku} className="mt-1" />
                    </div>
                    <div>
                      <Label>Unit Cost (Le) *</Label>
                      <Input name="unit_cost" type="number" step="0.01" defaultValue={editingProduct?.unit_cost} required className="mt-1" />
                    </div>
                    <div>
                      <Label>Min Order Qty</Label>
                      <Input name="minimum_order_quantity" type="number" min="1" defaultValue={editingProduct?.minimum_order_quantity || 1} className="mt-1" />
                    </div>
                    <div>
                      <Label>Lead Time (Days)</Label>
                      <Input name="lead_time_days" type="number" min="1" defaultValue={editingProduct?.lead_time_days || supplier?.default_lead_time_days || 7} className="mt-1" />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input type="checkbox" name="is_preferred" id="is_preferred" defaultChecked={editingProduct?.is_preferred} className="rounded" />
                      <Label htmlFor="is_preferred" className="cursor-pointer">Set as preferred supplier for this product</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingProduct(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#1EB053]">
                      {editingProduct ? 'Update' : 'Add'} Product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}