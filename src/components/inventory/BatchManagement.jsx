import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/Toast";
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
  XCircle,
  MapPin
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import BatchStockAllocation from "./BatchStockAllocation";
import { logInventoryAudit } from "./inventoryAuditHelper";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  depleted: "bg-gray-100 text-gray-700",
  quarantine: "bg-yellow-100 text-yellow-700"
};

export default function BatchManagement({ products = [], warehouses = [], vehicles = [], stockLevels = [], orgId, currentEmployee }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [allocatingBatch, setAllocatingBatch] = useState(null);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.InventoryBatch.create(data);
      await logInventoryAudit({
        orgId,
        actionType: 'batch_created',
        entityType: 'batch',
        entityId: result.id,
        entityName: data.product_name,
        performedById: currentEmployee?.id,
        performedByName: currentEmployee?.full_name,
        batchNumber: data.batch_number,
        quantityChanged: data.quantity,
        notes: `Created batch ${data.batch_number} with ${data.quantity} units`,
        newValues: { quantity: data.quantity, status: data.status }
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      setShowBatchDialog(false);
      toast.success("Batch created", "Batch has been added to inventory");
    },
    onError: (error) => {
      console.error('Create batch error:', error);
      toast.error("Failed to create batch", error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, previousData }) => {
      await base44.entities.InventoryBatch.update(id, data);
      await logInventoryAudit({
        orgId,
        actionType: 'batch_updated',
        entityType: 'batch',
        entityId: id,
        entityName: data.product_name,
        performedById: currentEmployee?.id,
        performedByName: currentEmployee?.full_name,
        batchNumber: data.batch_number,
        previousValues: previousData,
        newValues: data,
        notes: `Updated batch ${data.batch_number}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      setShowBatchDialog(false);
      setEditingBatch(null);
      toast.success("Batch updated", "Changes have been saved");
    },
    onError: (error) => {
      console.error('Update batch error:', error);
      toast.error("Failed to update batch", error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (batchId) => {
      const batch = batches.find(b => b.id === batchId);
      
      // Delete all stock level allocations for this batch
      const batchAllocations = await base44.entities.StockLevel.filter({ 
        organisation_id: orgId, 
        batch_id: batchId 
      });
      if (batchAllocations.length > 0) {
        await Promise.all(batchAllocations.map(sl => base44.entities.StockLevel.delete(sl.id)));
      }
      
      // Delete all stock movements for this batch
      const batchMovements = await base44.entities.StockMovement.filter({ 
        organisation_id: orgId, 
        batch_number: batch?.batch_number 
      });
      if (batchMovements.length > 0) {
        await Promise.all(batchMovements.map(sm => base44.entities.StockMovement.delete(sm.id)));
      }
      
      // Log audit before deletion
      await logInventoryAudit({
        orgId,
        actionType: 'batch_deleted',
        entityType: 'batch',
        entityId: batchId,
        entityName: batch?.product_name,
        performedById: currentEmployee?.id,
        performedByName: currentEmployee?.full_name,
        batchNumber: batch?.batch_number,
        quantityChanged: -(batch?.quantity || 0),
        notes: `Deleted batch ${batch?.batch_number} with ${batch?.quantity} units. Also deleted ${batchAllocations.length} allocations and ${batchMovements.length} movements.`,
        previousValues: { quantity: batch?.quantity, allocated: batch?.allocated_quantity }
      });
      
      // Then delete the batch itself
      await base44.entities.InventoryBatch.delete(batchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast.success("Batch deleted", "Batch and related data removed");
    },
    onError: (error) => {
      console.error('Delete batch error:', error);
      toast.error("Failed to delete batch", error.message);
    }
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
      updateMutation.mutate({ 
        id: editingBatch.id, 
        data,
        previousData: { quantity: editingBatch.quantity, status: editingBatch.status }
      });
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
        <>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3">
            {filteredBatches.map((batch) => {
              const expiryStatus = getExpiryStatus(batch.expiry_date);
              return (
                <Card key={batch.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-[#0072C6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{batch.batch_number}</p>
                            <p className="text-xs text-gray-500 truncate">{batch.product_name}</p>
                          </div>
                          <Badge className={STATUS_COLORS[batch.status] + " text-[10px] flex-shrink-0"}>{batch.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600">
                          <span>Qty: <strong>{batch.quantity}</strong></span>
                          {batch.warehouse_name && <span>• {batch.warehouse_name}</span>}
                        </div>
                        {batch.expiry_date && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">Exp: {format(new Date(batch.expiry_date), 'dd MMM yy')}</span>
                            {expiryStatus && <Badge className={expiryStatus.color + " text-[10px]"}>{expiryStatus.label}</Badge>}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-2 justify-end">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#1EB053]" onClick={() => { setAllocatingBatch(batch); setShowAllocationDialog(true); }}>
                            <MapPin className="w-3 h-3 mr-1" />Allocate
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingBatch(batch); setShowBatchDialog(true); }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(batch.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table */}
          <Card className="hidden md:block">
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
                          <td className="p-4 text-right">
                            <div>
                              <span className="font-medium">{batch.quantity}</span>
                              {(batch.allocated_quantity || 0) > 0 && (
                                <p className="text-xs text-gray-500">
                                  {batch.allocated_quantity} allocated
                                </p>
                              )}
                            </div>
                          </td>
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
                                size="sm"
                                className="text-[#1EB053] hover:text-[#1EB053] hover:bg-[#1EB053]/10"
                                onClick={() => { 
                                  setAllocatingBatch(batch); 
                                  setShowAllocationDialog(true); 
                                }}
                                title="Allocate to locations"
                              >
                                <MapPin className="w-4 h-4 mr-1" />
                                Allocate
                              </Button>
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
        </>
      )}

      {/* Batch Stock Allocation Dialog */}
      <BatchStockAllocation
        open={showAllocationDialog}
        onOpenChange={setShowAllocationDialog}
        batch={allocatingBatch}
        product={products.find(p => p.id === allocatingBatch?.product_id)}
        warehouses={warehouses}
        vehicles={vehicles}
        stockLevels={stockLevels}
        allBatches={batches}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowBatchDialog(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" className="bg-[#1EB053] w-full sm:w-auto">{editingBatch ? 'Update' : 'Create'} Batch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}