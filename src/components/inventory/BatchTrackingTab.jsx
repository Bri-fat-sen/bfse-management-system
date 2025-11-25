import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import {
  Search,
  Package,
  Calendar,
  AlertTriangle,
  Clock,
  Plus,
  Filter,
  Trash2
} from "lucide-react";

export default function BatchTrackingTab({ products, warehouses, orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [showAddBatch, setShowAddBatch] = useState(false);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createBatchMutation = useMutation({
    mutationFn: (data) => base44.entities.InventoryBatch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      setShowAddBatch(false);
      toast({ title: "Batch created successfully" });
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InventoryBatch.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      toast({ title: "Batch updated" });
    },
  });

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchesSearch = batch.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           batch.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
      
      let matchesExpiry = true;
      if (expiryFilter !== "all" && batch.expiry_date) {
        const daysUntilExpiry = differenceInDays(new Date(batch.expiry_date), new Date());
        if (expiryFilter === "expired") matchesExpiry = daysUntilExpiry < 0;
        else if (expiryFilter === "7days") matchesExpiry = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
        else if (expiryFilter === "30days") matchesExpiry = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        else if (expiryFilter === "90days") matchesExpiry = daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
      }
      
      return matchesSearch && matchesStatus && matchesExpiry;
    });
  }, [batches, searchTerm, statusFilter, expiryFilter]);

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { label: "No expiry", color: "bg-gray-100 text-gray-800" };
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { label: "Expired", color: "bg-red-100 text-red-800" };
    if (days <= 7) return { label: `${days}d left`, color: "bg-red-100 text-red-800" };
    if (days <= 30) return { label: `${days}d left`, color: "bg-orange-100 text-orange-800" };
    if (days <= 90) return { label: `${days}d left`, color: "bg-yellow-100 text-yellow-800" };
    return { label: `${days}d left`, color: "bg-green-100 text-green-800" };
  };

  const handleAddBatch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    const warehouse = warehouses.find(w => w.id === formData.get('warehouse_id'));

    createBatchMutation.mutate({
      organisation_id: orgId,
      product_id: formData.get('product_id'),
      product_name: product?.name,
      batch_number: formData.get('batch_number'),
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name,
      quantity: parseInt(formData.get('quantity')) || 0,
      unit_cost: parseFloat(formData.get('unit_cost')) || 0,
      manufacturing_date: formData.get('manufacturing_date'),
      expiry_date: formData.get('expiry_date'),
      received_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      notes: formData.get('notes'),
    });
  };

  // Stats
  const activeBatches = batches.filter(b => b.status === 'active').length;
  const expiringBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    const days = differenceInDays(new Date(b.expiry_date), new Date());
    return days >= 0 && days <= 30;
  }).length;
  const expiredBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    return differenceInDays(new Date(b.expiry_date), new Date()) < 0;
  }).length;

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-[#1EB053]" />
              <div>
                <p className="text-2xl font-bold">{activeBatches}</p>
                <p className="text-sm text-gray-500">Active Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-[#D4AF37]" />
              <div>
                <p className="text-2xl font-bold">{expiringBatches}</p>
                <p className="text-sm text-gray-500">Expiring (30 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{expiredBatches}</p>
                <p className="text-sm text-gray-500">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#0072C6]" />
              <div>
                <p className="text-2xl font-bold">{batches.length}</p>
                <p className="text-sm text-gray-500">Total Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by batch number or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="quarantine">Quarantine</SelectItem>
              </SelectContent>
            </Select>
            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expiry</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="7days">Within 7 Days</SelectItem>
                <SelectItem value="30days">Within 30 Days</SelectItem>
                <SelectItem value="90days">Within 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddBatch(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Batch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batches List */}
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
          description="Start tracking inventory by batch number and expiry date"
          action={() => setShowAddBatch(true)}
          actionLabel="Add First Batch"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Batch</th>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Warehouse</th>
                    <th className="text-right p-4 font-medium">Quantity</th>
                    <th className="text-left p-4 font-medium">Expiry</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => {
                    const expiryStatus = getExpiryStatus(batch.expiry_date);
                    return (
                      <tr key={batch.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-mono font-medium">{batch.batch_number}</span>
                          {batch.manufacturing_date && (
                            <p className="text-xs text-gray-500">Mfg: {format(new Date(batch.manufacturing_date), 'dd MMM yyyy')}</p>
                          )}
                        </td>
                        <td className="p-4">{batch.product_name}</td>
                        <td className="p-4 text-gray-600">{batch.warehouse_name || 'Main'}</td>
                        <td className="p-4 text-right font-medium">{batch.quantity}</td>
                        <td className="p-4">
                          {batch.expiry_date ? (
                            <div>
                              <p className="text-sm">{format(new Date(batch.expiry_date), 'dd MMM yyyy')}</p>
                              <Badge className={expiryStatus.color}>{expiryStatus.label}</Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            batch.status === 'active' ? 'default' :
                            batch.status === 'expired' ? 'destructive' :
                            batch.status === 'quarantine' ? 'warning' : 'secondary'
                          } className={batch.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                            {batch.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateBatchMutation.mutate({
                              id: batch.id,
                              data: { status: batch.status === 'quarantine' ? 'active' : 'quarantine' }
                            })}
                          >
                            {batch.status === 'quarantine' ? 'Release' : 'Quarantine'}
                          </Button>
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

      {/* Add Batch Dialog */}
      <Dialog open={showAddBatch} onOpenChange={setShowAddBatch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Batch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product *</Label>
                <Select name="product_id" required>
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
              <div>
                <Label>Batch Number *</Label>
                <Input name="batch_number" required className="mt-1" placeholder="e.g., BTH-2024-001" />
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input name="quantity" type="number" required className="mt-1" />
              </div>
              <div>
                <Label>Manufacturing Date</Label>
                <Input name="manufacturing_date" type="date" className="mt-1" />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input name="expiry_date" type="date" className="mt-1" />
              </div>
              <div>
                <Label>Unit Cost (Le)</Label>
                <Input name="unit_cost" type="number" step="0.01" className="mt-1" />
              </div>
              <div>
                <Label>Warehouse</Label>
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
              <div className="col-span-2">
                <Label>Notes</Label>
                <Input name="notes" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddBatch(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#1EB053]" disabled={createBatchMutation.isPending}>
                Create Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}