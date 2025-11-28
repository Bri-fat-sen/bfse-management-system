import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardCheck, 
  Search, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  FileText,
  Download,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function StockAudit() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [auditData, setAuditData] = useState({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [auditNotes, setAuditNotes] = useState("");
  const [auditName, setAuditName] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['currentEmployee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ stockLevelId, newQuantity, productId, warehouseId }) => {
      if (stockLevelId) {
        await base44.entities.StockLevel.update(stockLevelId, { quantity: newQuantity });
      } else {
        await base44.entities.StockLevel.create({
          organisation_id: orgId,
          product_id: productId,
          warehouse_id: warehouseId,
          quantity: newQuantity,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
    },
  });

  const saveAuditMutation = useMutation({
    mutationFn: async () => {
      const adjustments = Object.entries(auditData).filter(([_, data]) => data.adjusted);
      
      for (const [key, data] of adjustments) {
        await updateStockMutation.mutateAsync({
          stockLevelId: data.stockLevelId,
          newQuantity: data.countedQuantity,
          productId: data.productId,
          warehouseId: data.warehouseId,
        });

        // Log the adjustment
        await base44.entities.StockMovement.create({
          organisation_id: orgId,
          product_id: data.productId,
          product_name: data.productName,
          warehouse_id: data.warehouseId,
          warehouse_name: data.warehouseName,
          movement_type: 'adjustment',
          quantity: data.countedQuantity - data.systemQuantity,
          previous_quantity: data.systemQuantity,
          new_quantity: data.countedQuantity,
          reason: `Stock Audit: ${auditName}`,
          notes: auditNotes,
          performed_by: currentEmployee?.id,
          performed_by_name: currentEmployee?.full_name,
        });
      }

      // Log activity
      await base44.entities.ActivityLog.create({
        organisation_id: orgId,
        action: 'stock_audit_completed',
        entity_type: 'StockLevel',
        description: `Stock audit "${auditName}" completed with ${adjustments.length} adjustments`,
        performed_by: currentEmployee?.id,
        performed_by_name: currentEmployee?.full_name,
      });
    },
    onSuccess: () => {
      toast.success("Stock audit saved successfully");
      setAuditData({});
      setShowSaveDialog(false);
      setAuditName("");
      setAuditNotes("");
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
    },
    onError: (error) => {
      toast.error("Failed to save audit: " + error.message);
    },
  });

  // Build audit items combining products with stock levels
  const auditItems = products
    .filter(p => p.is_active !== false)
    .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(product => {
      const productStockLevels = stockLevels.filter(sl => sl.product_id === product.id);
      
      if (selectedWarehouse === "all") {
        // Show total across all warehouses
        const totalStock = productStockLevels.reduce((sum, sl) => sum + (sl.quantity || 0), 0);
        return {
          id: product.id,
          product,
          warehouseId: "all",
          warehouseName: "All Locations",
          systemQuantity: totalStock,
          stockLevelId: null,
        };
      } else {
        const stockLevel = productStockLevels.find(sl => sl.warehouse_id === selectedWarehouse);
        const warehouse = warehouses.find(w => w.id === selectedWarehouse);
        return {
          id: `${product.id}-${selectedWarehouse}`,
          product,
          warehouseId: selectedWarehouse,
          warehouseName: warehouse?.name || "Unknown",
          systemQuantity: stockLevel?.quantity || 0,
          stockLevelId: stockLevel?.id,
        };
      }
    });

  const handleCountChange = (itemId, countedQty, item) => {
    const counted = parseInt(countedQty) || 0;
    const variance = counted - item.systemQuantity;
    
    setAuditData(prev => ({
      ...prev,
      [itemId]: {
        countedQuantity: counted,
        variance,
        adjusted: counted !== item.systemQuantity,
        stockLevelId: item.stockLevelId,
        productId: item.product.id,
        productName: item.product.name,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName,
        systemQuantity: item.systemQuantity,
      }
    }));
  };

  const totalItems = auditItems.length;
  const countedItems = Object.values(auditData).filter(d => d.countedQuantity !== undefined).length;
  const varianceItems = Object.values(auditData).filter(d => d.adjusted).length;

  const exportAudit = () => {
    const rows = auditItems.map(item => {
      const data = auditData[item.id];
      return {
        Product: item.product.name,
        SKU: item.product.sku || '',
        Location: item.warehouseName,
        'System Qty': item.systemQuantity,
        'Counted Qty': data?.countedQuantity ?? '',
        Variance: data?.variance ?? '',
      };
    });

    const csv = [
      Object.keys(rows[0]).join(','),
      ...rows.map(r => Object.values(r).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-audit-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Audit"
        subtitle="Count and reconcile inventory"
        actionLabel="Save Audit"
        actionIcon={Save}
        action={() => setShowSaveDialog(true)}
      >
        <Button variant="outline" onClick={exportAudit}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Counted</p>
                <p className="text-xl font-bold">{countedItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Variances</p>
                <p className="text-xl font-bold">{varianceItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <ClipboardCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-xl font-bold">{totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0}%</p>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {warehouses.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">SKU</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">System Qty</TableHead>
                  <TableHead className="text-right">Counted Qty</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditItems.map(item => {
                  const data = auditData[item.id];
                  const variance = data?.variance || 0;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-500">{item.product.sku || '-'}</TableCell>
                      <TableCell>{item.warehouseName}</TableCell>
                      <TableCell className="text-right">{item.systemQuantity}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          className="w-20 text-right ml-auto"
                          value={data?.countedQuantity ?? ''}
                          onChange={(e) => handleCountChange(item.id, e.target.value, item)}
                          placeholder="-"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {data?.countedQuantity !== undefined && (
                          <span className={variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : ''}>
                            {variance > 0 ? '+' : ''}{variance}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {data?.countedQuantity !== undefined ? (
                          variance === 0 ? (
                            <Badge className="bg-green-100 text-green-700">Match</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700">Variance</Badge>
                          )
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Stock Audit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Audit Name</label>
              <Input
                value={auditName}
                onChange={(e) => setAuditName(e.target.value)}
                placeholder="e.g., Monthly Stock Count - November 2024"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Add any notes about this audit..."
                rows={3}
              />
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>{varianceItems}</strong> items have variances and will be adjusted.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => saveAuditMutation.mutate()}
              disabled={!auditName || saveAuditMutation.isPending}
              className="bg-[#1EB053] hover:bg-[#178f43]"
            >
              {saveAuditMutation.isPending ? 'Saving...' : 'Save & Apply Adjustments'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}