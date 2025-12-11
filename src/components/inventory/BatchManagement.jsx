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
  MapPin,
  Upload,
  Download
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import BatchStockAllocation from "./BatchStockAllocation";
import BatchTemplatePrint from "./BatchTemplatePrint";
import DocumentUploadExtractor from "@/components/finance/DocumentUploadExtractor";
import { logInventoryAudit } from "./inventoryAuditHelper";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  depleted: "bg-gray-100 text-gray-700",
  quarantine: "bg-yellow-100 text-yellow-700"
};

export default function BatchManagement({ products = [], warehouses = [], vehicles = [], stockLevels = [], orgId, currentEmployee, organisation }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [allocatingBatch, setAllocatingBatch] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [useEmployeeProducer, setUseEmployeeProducer] = useState(true);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [showBulkAllocationDialog, setShowBulkAllocationDialog] = useState(false);
  const [bulkAllocationLocation, setBulkAllocationLocation] = useState('');
  const [bulkAllocationAction, setBulkAllocationAction] = useState('allocate'); // 'allocate' or 'reverse'

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.InventoryBatch.create(data);
      
      // Don't update product stock_quantity - stock is only updated when batch is allocated to locations
      
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
        notes: `Created batch ${data.batch_number} with ${data.quantity} units (not yet allocated to locations)`,
        newValues: { quantity: data.quantity, status: data.status }
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      setShowBatchDialog(false);
      setEditingBatch(null);
      toast.success("Batch created", "Allocate stock to locations to make it available");
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

  const bulkAllocateMutation = useMutation({
    mutationFn: async ({ batchIds, locationId, action }) => {
      const batchesToProcess = batches.filter(b => batchIds.includes(b.id));
      const targetLocation = [...warehouses, ...vehicles].find(l => l.id === locationId);
      
      if (!targetLocation) throw new Error("Invalid location selected");
      
      if (action === 'allocate') {
        // Allocate all selected batches to the chosen location
        for (const batch of batchesToProcess) {
          const availableQty = batch.quantity - (batch.allocated_quantity || 0);
          if (availableQty <= 0) continue;
          
          const existingStock = stockLevels.find(
            sl => sl.product_id === batch.product_id && sl.warehouse_id === locationId
          );

          if (existingStock) {
            const newQty = (existingStock.quantity || 0) + availableQty;
            await base44.entities.StockLevel.update(existingStock.id, {
              quantity: newQty,
              available_quantity: newQty
            });
          } else {
            await base44.entities.StockLevel.create({
              organisation_id: orgId,
              product_id: batch.product_id,
              product_name: batch.product_name,
              warehouse_id: locationId,
              warehouse_name: targetLocation.name || targetLocation.registration_number,
              location_type: targetLocation.registration_number ? 'vehicle' : 'warehouse',
              quantity: availableQty,
              available_quantity: availableQty,
              reorder_level: 10
            });
          }

          await base44.entities.StockMovement.create({
            organisation_id: orgId,
            product_id: batch.product_id,
            product_name: batch.product_name,
            warehouse_id: locationId,
            warehouse_name: targetLocation.name || targetLocation.registration_number,
            movement_type: 'in',
            quantity: availableQty,
            previous_stock: existingStock?.quantity || 0,
            new_stock: (existingStock?.quantity || 0) + availableQty,
            reference_type: 'batch_allocation',
            reference_id: batch.id,
            batch_number: batch.batch_number,
            notes: `Bulk allocation from batch ${batch.batch_number}`,
            recorded_by: currentEmployee?.id,
            recorded_by_name: currentEmployee?.full_name
          });

          await base44.entities.InventoryBatch.update(batch.id, {
            allocated_quantity: batch.quantity,
            status: 'depleted'
          });
          
          // Update product total stock
          const product = products.find(p => p.id === batch.product_id);
          if (product) {
            await base44.entities.Product.update(batch.product_id, {
              stock_quantity: (product.stock_quantity || 0) + availableQty
            });
          }
        }
      } else if (action === 'reverse') {
        // Reverse all allocations for selected batches
        for (const batch of batchesToProcess) {
          // Find all stock movements for this batch
          const batchMovements = await base44.entities.StockMovement.filter({
            organisation_id: orgId,
            batch_number: batch.batch_number,
            reference_type: 'batch_allocation'
          });

          // Reverse each allocation
          for (const movement of batchMovements) {
            const stockLevel = stockLevels.find(
              sl => sl.product_id === batch.product_id && sl.warehouse_id === movement.warehouse_id
            );

            if (stockLevel) {
              const newQty = Math.max(0, (stockLevel.quantity || 0) - movement.quantity);
              if (newQty === 0) {
                await base44.entities.StockLevel.delete(stockLevel.id);
              } else {
                await base44.entities.StockLevel.update(stockLevel.id, {
                  quantity: newQty,
                  available_quantity: newQty
                });
              }
            }

            // Create reverse movement record
            await base44.entities.StockMovement.create({
              organisation_id: orgId,
              product_id: batch.product_id,
              product_name: batch.product_name,
              warehouse_id: movement.warehouse_id,
              warehouse_name: movement.warehouse_name,
              movement_type: 'out',
              quantity: movement.quantity,
              previous_stock: stockLevel?.quantity || 0,
              new_stock: Math.max(0, (stockLevel?.quantity || 0) - movement.quantity),
              reference_type: 'batch_deallocation',
              reference_id: batch.id,
              batch_number: batch.batch_number,
              notes: `Bulk reverse: reversed allocation from batch ${batch.batch_number}`,
              recorded_by: currentEmployee?.id,
              recorded_by_name: currentEmployee?.full_name
            });
          }

          // Reset batch allocation
          await base44.entities.InventoryBatch.update(batch.id, {
            allocated_quantity: 0,
            status: 'active'
          });
          
          // Update product total stock
          const allProductStockLevels = await base44.entities.StockLevel.filter({
            organisation_id: orgId,
            product_id: batch.product_id
          });
          const totalProductStock = allProductStockLevels.reduce((sum, sl) => sum + (sl.quantity || 0), 0);
          await base44.entities.Product.update(batch.product_id, {
            stock_quantity: totalProductStock
          });
        }
      }
    },
    onSuccess: (_, { action, batchIds }) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (action === 'allocate') {
        toast.success(`All ${batchIds.length} batches allocated successfully`);
      } else {
        toast.success(`All ${batchIds.length} batch allocations reversed`);
      }
      
      setSelectedBatchIds([]);
      setShowBulkAllocationDialog(false);
      setBulkAllocationLocation('');
    },
    onError: (error) => toast.error("Bulk action failed: " + error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (batchId) => {
      const batch = batches.find(b => b.id === batchId);
      
      // Find all stock movements with this batch number
      const batchMovements = await base44.entities.StockMovement.filter({ 
        organisation_id: orgId, 
        batch_number: batch?.batch_number 
      });
      
      // For each location that received stock from this batch, reduce their stock levels
      const locationStockUpdates = new Map();
      for (const movement of batchMovements) {
        if (movement.movement_type === 'in' && movement.reference_type === 'batch_allocation') {
          const key = `${movement.product_id}_${movement.warehouse_id}`;
          locationStockUpdates.set(key, {
            product_id: movement.product_id,
            warehouse_id: movement.warehouse_id,
            quantity: (locationStockUpdates.get(key)?.quantity || 0) + movement.quantity
          });
        }
      }
      
      // Fetch fresh stock levels from database and update or delete them
      for (const [_, update] of locationStockUpdates) {
        const locationStocks = await base44.entities.StockLevel.filter({
          organisation_id: orgId,
          product_id: update.product_id,
          warehouse_id: update.warehouse_id
        });
        
        const stockLevel = locationStocks[0];
        if (stockLevel) {
          const newQty = Math.max(0, (stockLevel.quantity || 0) - update.quantity);
          if (newQty === 0) {
            await base44.entities.StockLevel.delete(stockLevel.id);
          } else {
            await base44.entities.StockLevel.update(stockLevel.id, {
              quantity: newQty,
              available_quantity: newQty
            });
          }
        }
      }
      
      // Delete all stock movements for this batch
      if (batchMovements.length > 0) {
        await Promise.all(batchMovements.map(sm => base44.entities.StockMovement.delete(sm.id)));
      }
      
      // Recalculate product stock from remaining location totals
      if (batch?.product_id) {
        const allProductStockLevels = await base44.entities.StockLevel.filter({
          organisation_id: orgId,
          product_id: batch.product_id
        });
        const totalProductStock = allProductStockLevels.reduce((sum, sl) => sum + (sl.quantity || 0), 0);
        await base44.entities.Product.update(batch.product_id, {
          stock_quantity: totalProductStock
        });
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
        notes: `Deleted batch ${batch?.batch_number} with ${batch?.quantity} units. Removed ${locationStockUpdates.size} location allocations and ${batchMovements.length} movements. Updated product stock.`,
        previousValues: { quantity: batch?.quantity, allocated: batch?.allocated_quantity }
      });
      
      // Then delete the batch itself
      await base44.entities.InventoryBatch.delete(batchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Batch deleted", "All related stock allocations and movements removed");
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
    const date = new Date(expiryDate);
    if (isNaN(date.getTime())) return null;
    const days = differenceInDays(date, new Date());
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

    // Calculate duration hours if start and end times are provided
    const startTime = formData.get('start_time');
    const endTime = formData.get('end_time');
    let durationHours = 0;
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      durationHours = (endMinutes - startMinutes) / 60;
      if (durationHours < 0) durationHours += 24; // Handle overnight production
    }

    // Handle producer/supervisor
    let producerId = '';
    let producerName = '';
    if (useEmployeeProducer) {
      producerId = formData.get('supervisor_id') || '';
      const employee = employees.find(e => e.id === producerId);
      producerName = employee?.full_name || '';
    } else {
      producerName = formData.get('supervisor_name') || '';
    }

    const data = {
      organisation_id: orgId,
      product_id: formData.get('product_id'),
      product_name: product?.name,
      batch_number: editingBatch ? editingBatch.batch_number : generateBatchNumber(),
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name,
      quantity: parseInt(formData.get('quantity')) || 0,
      rolls: parseInt(formData.get('rolls')) || 0,
      weight_kg: parseFloat(formData.get('weight_kg')) || 0,
      manufacturing_date: formData.get('manufacturing_date'),
      start_time: startTime || '',
      end_time: endTime || '',
      duration_hours: durationHours,
      expiry_date: formData.get('expiry_date'),
      cost_price: parseFloat(formData.get('cost_price')) || 0,
      status: formData.get('status') || 'active',
      quality_status: formData.get('quality_status') || 'pending',
      wastage_quantity: parseInt(formData.get('wastage_quantity')) || 0,
      wastage_cost: parseFloat(formData.get('wastage_cost')) || 0,
      supervisor_id: producerId,
      supervisor_name: producerName,
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
            <BatchTemplatePrint organisation={organisation} />
            <Button variant="outline" onClick={() => setShowUploadForm(true)} className="border-[#0072C6]/30 hover:border-[#0072C6]">
              <Upload className="w-4 h-4 mr-2" />
              Upload Form
            </Button>
            {selectedBatchIds.length > 0 && (
              <Button 
                onClick={() => setShowBulkAllocationDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Allocate {selectedBatchIds.length}
              </Button>
            )}
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
                          {batch.rolls > 0 && <span>• {batch.rolls} rolls</span>}
                          {batch.weight_kg > 0 && <span>• {batch.weight_kg}kg</span>}
                          {batch.warehouse_name && <span>• {batch.warehouse_name}</span>}
                        </div>
                        {batch.expiry_date && !isNaN(new Date(batch.expiry_date).getTime()) && (
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
                      <th className="p-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedBatchIds.length === filteredBatches.length && filteredBatches.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBatchIds(filteredBatches.map(b => b.id));
                            } else {
                              setSelectedBatchIds([]);
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </th>
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
                            <input
                              type="checkbox"
                              checked={selectedBatchIds.includes(batch.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBatchIds([...selectedBatchIds, batch.id]);
                                } else {
                                  setSelectedBatchIds(selectedBatchIds.filter(id => id !== batch.id));
                                }
                              }}
                              className="w-4 h-4"
                            />
                          </td>
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
                          <td className="p-4">
                            <div>
                              <p className="text-gray-600">{batch.warehouse_name || 'Main'}</p>
                              {batch.supervisor_name && (
                                <p className="text-xs text-gray-500">By: {batch.supervisor_name}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div>
                              <span className="font-medium">{batch.quantity}</span>
                              {batch.rolls > 0 && <p className="text-xs text-gray-500">{batch.rolls} rolls</p>}
                              {batch.weight_kg > 0 && <p className="text-xs text-gray-500">{batch.weight_kg} kg</p>}
                              {(batch.allocated_quantity || 0) > 0 && (
                                <p className="text-xs text-blue-500">
                                  {batch.allocated_quantity} allocated
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">
                            {batch.manufacturing_date && !isNaN(new Date(batch.manufacturing_date).getTime()) && format(new Date(batch.manufacturing_date), 'dd MMM yyyy')}
                          </td>
                          <td className="p-4">
                            {batch.expiry_date && !isNaN(new Date(batch.expiry_date).getTime()) && (
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

      {/* Document Upload Dialog */}
      <DocumentUploadExtractor
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        type="production"
        orgId={orgId}
        currentEmployee={currentEmployee}
        products={products}
        warehouses={warehouses}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] })}
      />

      {/* Upload Filled Form Dialog */}
      <DocumentUploadExtractor
        open={showUploadForm}
        onOpenChange={setShowUploadForm}
        autoDetectType={false}
        forcedRecordType="batch"
        title="Upload Filled Batch Form"
        description="Upload your filled batch entry form. The system will automatically extract batch information."
        orgId={orgId}
        currentEmployee={currentEmployee}
        products={products}
        warehouses={warehouses}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
          setShowUploadForm(false);
        }}
      />

      {/* Bulk Allocation Dialog */}
      <Dialog open={showBulkAllocationDialog} onOpenChange={setShowBulkAllocationDialog}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Bulk Batch Operations</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>{selectedBatchIds.length}</strong> batch(es) selected
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Select Action</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={bulkAllocationAction === 'allocate' ? 'default' : 'outline'}
                  onClick={() => setBulkAllocationAction('allocate')}
                  className="h-auto py-3"
                >
                  <div className="flex flex-col items-center gap-1">
                    <MapPin className="w-5 h-5" />
                    <span className="text-xs">Allocate to Location</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={bulkAllocationAction === 'reverse' ? 'default' : 'outline'}
                  onClick={() => setBulkAllocationAction('reverse')}
                  className="h-auto py-3"
                >
                  <div className="flex flex-col items-center gap-1">
                    <XCircle className="w-5 h-5" />
                    <span className="text-xs">Reverse All</span>
                  </div>
                </Button>
              </div>
            </div>

            {bulkAllocationAction === 'allocate' && (
              <div>
                <Label className="mb-2 block">Select Location</Label>
                <Select value={bulkAllocationLocation} onValueChange={setBulkAllocationLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose warehouse or vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">Warehouses</div>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        🏭 {w.name}
                      </SelectItem>
                    ))}
                    {vehicles.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase mt-2">Vehicles</div>
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            🚚 {v.registration_number}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAllocationAction === 'reverse' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    This will reverse all allocations for the selected batches, returning stock from all locations back to the batch pool.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowBulkAllocationDialog(false);
                setBulkAllocationLocation('');
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (bulkAllocationAction === 'allocate' && !bulkAllocationLocation) {
                  toast.error("Please select a location");
                  return;
                }
                bulkAllocateMutation.mutate({
                  batchIds: selectedBatchIds,
                  locationId: bulkAllocationLocation,
                  action: bulkAllocationAction
                });
              }}
              disabled={bulkAllocateMutation.isPending || (bulkAllocationAction === 'allocate' && !bulkAllocationLocation)}
              className={bulkAllocationAction === 'allocate' 
                ? "bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                : "bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"}
            >
              {bulkAllocateMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : bulkAllocationAction === 'allocate' ? (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Allocate {selectedBatchIds.length}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reverse {selectedBatchIds.length}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label>Rolls</Label>
                <Input name="rolls" type="number" defaultValue={editingBatch?.rolls || 0} className="mt-1" />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input name="weight_kg" type="number" step="0.01" defaultValue={editingBatch?.weight_kg || 0} className="mt-1" />
              </div>
              <div>
                <Label>Manufacturing Date</Label>
                <Input name="manufacturing_date" type="date" defaultValue={editingBatch?.manufacturing_date} className="mt-1" />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input name="start_time" type="time" defaultValue={editingBatch?.start_time} className="mt-1" />
              </div>
              <div>
                <Label>End Time</Label>
                <Input name="end_time" type="time" defaultValue={editingBatch?.end_time} className="mt-1" />
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
              <div className="col-span-2">
                <Label>Produced By</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={useEmployeeProducer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseEmployeeProducer(true)}
                    className="flex-1"
                  >
                    Select Employee
                  </Button>
                  <Button
                    type="button"
                    variant={!useEmployeeProducer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseEmployeeProducer(false)}
                    className="flex-1"
                  >
                    Enter Name
                  </Button>
                </div>
                {useEmployeeProducer ? (
                  <Select name="supervisor_id" defaultValue={editingBatch?.supervisor_id}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} {emp.employee_code ? `(${emp.employee_code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    name="supervisor_name"
                    defaultValue={editingBatch?.supervisor_name}
                    placeholder="Enter producer name..."
                    className="mt-2"
                  />
                )}
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
              <div>
                <Label>Quality Status</Label>
                <Select name="quality_status" defaultValue={editingBatch?.quality_status || "pending"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Wastage Quantity</Label>
                <Input name="wastage_quantity" type="number" defaultValue={editingBatch?.wastage_quantity || 0} className="mt-1" />
              </div>
              <div>
                <Label>Wastage Cost (Le)</Label>
                <Input name="wastage_cost" type="number" step="0.01" defaultValue={editingBatch?.wastage_cost || 0} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input name="notes" defaultValue={editingBatch?.notes} className="mt-1" placeholder="Additional notes..." />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowBatchDialog(false)} className="w-full sm:w-auto" disabled={createMutation.isPending || updateMutation.isPending}>Cancel</Button>
              <Button type="submit" className="bg-[#1EB053] w-full sm:w-auto" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingBatch ? 'Update' : 'Create') + ' Batch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}