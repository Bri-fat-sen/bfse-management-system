import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Package,
  Calendar,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  depleted: "bg-gray-100 text-gray-700",
  quarantine: "bg-yellow-100 text-yellow-700"
};

export default function BatchManagement({ products = [], warehouses = [], orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InventoryBatch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      setShowBatchDialog(false);
      toast({ title: "Batch created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InventoryBatch.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      setShowBatchDialog(false);
      setEditingBatch(null);
      toast({ title: "Batch updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InventoryBatch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      toast({ title: "Batch deleted" });
    },
  });

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = productFilter === "all" || batch.product_id === productFilter;
    const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
    return matchesSearch && matchesProduct && matchesStatus;
  });

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { label: "Expired", color: "bg-red-500 text-white", days };
    if (days <= 7) return { label: `${days}d left`, color: "bg-red-100 text-red-700", days };
    if (days <= 30) return { label: `${days}d left`, color: "bg-orange-100 text-orange-700", days };
    if (days <= 90) return { label: `${days}d left`, color: "bg-yellow-100 text-yellow-700", days };
    return { label: `${days}d left`, color: "bg-green-100 text-green-700", days };
  };

  // Generate batch number: BATCH-YYYYMMDD-XXXX (random 4 digits)
  const generateBatchNumber = () => {
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BATCH-${date}-${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    const warehouse = warehouses.find(w => w.id === formData.get('warehouse_id'));

    const data = {
      organisation_id: orgId,
      product_id: formData.get('product_id'),
      product_name: product?.name,
      batch_number: editingBatch ? editingBatch.batch_number : generateBatchNumber(),
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name,
      quantity: parseInt(formData.get('quantity')) || 0,
      manufacturing_date: formData.get('manufacturing_date'),
      expiry_date: formData.get('expiry_date'),
      cost_price: parseFloat(formData.get('cost_price')) || 0,
      status: formData.get('status') || 'active',
      notes: formData.get('notes'),
    };

    if (editingBatch) {
      updateMutation.mutate({ id: editingBatch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search batch number or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
                <SelectItem value="quarantine">Quarantine</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setEditingBatch(null); setShowBatchDialog(true); }} className="bg-[#1EB053]">
              <Plus className="w-4 h-4 mr-2" />
              Add Batch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Batches Found"
          description="Add batch information to track inventory by batch number and expiry"
          action={() => setShowBatchDialog(true)}
          actionLabel="Add Batch"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Batch / Product</th>
                    <th className="text-left p-4 font-medium">Warehouse</th>
                    <th className="text-right p-4 font-medium">Quantity</th>
                    <th className="text-left p-4 font-medium">Mfg Date</th>
                    <th className="text-left p-4 font-medium">Expiry</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => {
                    const expiryStatus = getExpiryStatus(batch.expiry_date);
                    return (
                      <tr key={batch.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                              <Package className="w-5 h-5 text-[#0072C6]" />
                            </div>
                            <div>
                              <p className="font-semibold">{batch.batch_number}</p>
                              <p className="text-sm text-gray-500">{batch.product_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{batch.warehouse_name || 'Main'}</td>
                        <td className="p-4 text-right font-medium">{batch.quantity}</td>
                        <td className="p-4 text-gray-600">
                          {batch.manufacturing_date && format(new Date(batch.manufacturing_date), 'dd MMM yyyy')}
                        </td>
                        <td className="p-4">
                          {batch.expiry_date && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{format(new Date(batch.expiry_date), 'dd MMM yyyy')}</span>
                              {expiryStatus && (
                                <Badge className={expiryStatus.color}>{expiryStatus.label}</Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={STATUS_COLORS[batch.status]}>{batch.status}</Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditingBatch(batch); setShowBatchDialog(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => deleteMutation.mutate(batch.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product *</Label>
                <Select name="product_id" defaultValue={editingBatch?.product_id} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingBatch && (
                <div>
                  <Label>Batch Number</Label>
                  <Input value={editingBatch?.batch_number} disabled className="mt-1 bg-gray-100" />
                </div>
              )}
              <div>
                <Label>Quantity</Label>
                <Input name="quantity" type="number" defaultValue={editingBatch?.quantity || 0} className="mt-1" />
              </div>
              <div>
                <Label>Manufacturing Date</Label>
                <Input name="manufacturing_date" type="date" defaultValue={editingBatch?.manufacturing_date} className="mt-1" />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input name="expiry_date" type="date" defaultValue={editingBatch?.expiry_date} className="mt-1" />
              </div>
              <div>
                <Label>Warehouse</Label>
                <Select name="warehouse_id" defaultValue={editingBatch?.warehouse_id}>
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
                <Label>Cost Price (Le)</Label>
                <Input name="cost_price" type="number" step="0.01" defaultValue={editingBatch?.cost_price} className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={editingBatch?.status || "active"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="depleted">Depleted</SelectItem>
                    <SelectItem value="quarantine">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBatchDialog(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1EB053]">{editingBatch ? 'Update' : 'Create'} Batch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}