import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  Trash2,
  RefreshCw,
  Package,
  ArrowRight,
  Database,
  Loader2,
  XCircle
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function InventoryFix() {
  const queryClient = useQueryClient();
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState(null);

  // Fetch current user and employee
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employees[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch all inventory data
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockLevels = [], isLoading: loadingStockLevels } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockMovements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['stockMovements', orgId],
    queryFn: () => base44.entities.StockMovement.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const isLoading = loadingProducts || loadingStockLevels || loadingMovements || loadingBatches;

  // Analyze issues
  const analyzeIssues = () => {
    const issues = {
      orphanedStockLevels: [],
      orphanedMovements: [],
      mismatchedProductStock: [],
      duplicateStockLevels: [],
      invalidBatchReferences: []
    };

    const productIds = new Set(products.map(p => p.id));
    const batchNumbers = new Set(batches.map(b => b.batch_number));
    const warehouseIds = new Set(warehouses.map(w => w.id));

    // Check for orphaned stock levels (product doesn't exist)
    stockLevels.forEach(sl => {
      if (!productIds.has(sl.product_id)) {
        issues.orphanedStockLevels.push({
          id: sl.id,
          reason: 'Product not found',
          product_id: sl.product_id,
          product_name: sl.product_name,
          quantity: sl.quantity
        });
      }
    });

    // Check for orphaned movements (product doesn't exist)
    stockMovements.forEach(sm => {
      if (!productIds.has(sm.product_id)) {
        issues.orphanedMovements.push({
          id: sm.id,
          reason: 'Product not found',
          product_id: sm.product_id,
          product_name: sm.product_name,
          quantity: sm.quantity
        });
      }
    });

    // Check for movements with deleted batch references
    stockMovements.forEach(sm => {
      if (sm.reference_type === 'batch_allocation' && sm.notes) {
        const batchMatch = sm.notes.match(/BATCH-\d{8}-\d{4}/);
        if (batchMatch && !batchNumbers.has(batchMatch[0])) {
          issues.invalidBatchReferences.push({
            id: sm.id,
            batch_number: batchMatch[0],
            product_name: sm.product_name,
            quantity: sm.quantity
          });
        }
      }
    });

    // Check for mismatched product stock quantities
    products.forEach(product => {
      const productStockLevels = stockLevels.filter(sl => sl.product_id === product.id);
      const totalFromLevels = productStockLevels.reduce((sum, sl) => sum + (sl.quantity || 0), 0);
      
      if (Math.abs(totalFromLevels - (product.stock_quantity || 0)) > 0.01) {
        issues.mismatchedProductStock.push({
          id: product.id,
          name: product.name,
          recorded: product.stock_quantity || 0,
          calculated: totalFromLevels,
          difference: totalFromLevels - (product.stock_quantity || 0)
        });
      }
    });

    // Check for duplicate stock levels (same product + warehouse)
    const seenCombos = new Map();
    stockLevels.forEach(sl => {
      const key = `${sl.product_id}-${sl.warehouse_id}`;
      if (seenCombos.has(key)) {
        issues.duplicateStockLevels.push({
          id: sl.id,
          product_name: sl.product_name,
          warehouse_name: sl.warehouse_name,
          quantity: sl.quantity,
          duplicate_of: seenCombos.get(key)
        });
      } else {
        seenCombos.set(key, sl.id);
      }
    });

    return issues;
  };

  const issues = !isLoading ? analyzeIssues() : null;
  const totalIssues = issues ? 
    issues.orphanedStockLevels.length + 
    issues.orphanedMovements.length + 
    issues.mismatchedProductStock.length + 
    issues.duplicateStockLevels.length +
    issues.invalidBatchReferences.length : 0;

  // Fix all issues
  const handleFixAll = async () => {
    setFixing(true);
    setFixResults(null);
    const results = {
      deletedStockLevels: 0,
      deletedMovements: 0,
      fixedProducts: 0,
      mergedDuplicates: 0
    };

    try {
      // Delete orphaned stock levels
      for (const sl of issues.orphanedStockLevels) {
        await base44.entities.StockLevel.delete(sl.id);
        results.deletedStockLevels++;
      }

      // Delete orphaned movements
      for (const sm of issues.orphanedMovements) {
        await base44.entities.StockMovement.delete(sm.id);
        results.deletedMovements++;
      }

      // Delete movements with invalid batch references
      for (const sm of issues.invalidBatchReferences) {
        await base44.entities.StockMovement.delete(sm.id);
        results.deletedMovements++;
      }

      // Fix mismatched product stock quantities
      for (const mismatch of issues.mismatchedProductStock) {
        await base44.entities.Product.update(mismatch.id, {
          stock_quantity: mismatch.calculated
        });
        results.fixedProducts++;
      }

      // Handle duplicate stock levels - delete duplicates
      for (const dup of issues.duplicateStockLevels) {
        await base44.entities.StockLevel.delete(dup.id);
        results.mergedDuplicates++;
      }

      setFixResults(results);
      toast.success("All inventory issues fixed!");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
    } catch (error) {
      toast.error("Error fixing issues: " + error.message);
    } finally {
      setFixing(false);
    }
  };

  // Clear all stock data
  const handleClearAllStock = async () => {
    if (!confirm("This will DELETE all stock levels, movements, and reset all product quantities to 0. Are you sure?")) {
      return;
    }
    
    setFixing(true);
    try {
      // Delete all stock levels
      for (const sl of stockLevels) {
        await base44.entities.StockLevel.delete(sl.id);
      }

      // Delete all stock movements
      for (const sm of stockMovements) {
        await base44.entities.StockMovement.delete(sm.id);
      }

      // Delete all batches
      for (const batch of batches) {
        await base44.entities.InventoryBatch.delete(batch.id);
      }

      // Reset all product stock to 0
      for (const product of products) {
        await base44.entities.Product.update(product.id, {
          stock_quantity: 0
        });
      }

      toast.success("All stock data cleared. You can now start fresh.");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
    } catch (error) {
      toast.error("Error clearing stock: " + error.message);
    } finally {
      setFixing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Analyzing inventory..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Fix Tool"
        subtitle="Detect and fix inventory data issues"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={totalIssues === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="p-4 text-center">
            {totalIssues === 0 ? (
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            )}
            <p className="text-2xl font-bold">{totalIssues}</p>
            <p className="text-sm text-gray-600">Total Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-sm text-gray-600">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stockLevels.length}</p>
            <p className="text-sm text-gray-600">Stock Levels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ArrowRight className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stockMovements.length}</p>
            <p className="text-sm text-gray-600">Movements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{batches.length}</p>
            <p className="text-sm text-gray-600">Batches</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={handleFixAll}
            disabled={fixing || totalIssues === 0}
            className="bg-[#1EB053]"
          >
            {fixing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Fix All Issues ({totalIssues})
          </Button>
          <Button
            onClick={handleClearAllStock}
            disabled={fixing}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Stock Data
          </Button>
          <Button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] });
              queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
              queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
              queryClient.invalidateQueries({ queryKey: ['inventoryBatches'] });
            }}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </CardContent>
      </Card>

      {/* Fix Results */}
      {fixResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Fix Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">{fixResults.deletedStockLevels}</p>
                <p className="text-sm text-gray-600">Stock Levels Deleted</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">{fixResults.deletedMovements}</p>
                <p className="text-sm text-gray-600">Movements Deleted</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">{fixResults.fixedProducts}</p>
                <p className="text-sm text-gray-600">Products Fixed</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">{fixResults.mergedDuplicates}</p>
                <p className="text-sm text-gray-600">Duplicates Removed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue Details */}
      {issues && (
        <div className="space-y-4">
          {/* Orphaned Stock Levels */}
          {issues.orphanedStockLevels.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Orphaned Stock Levels ({issues.orphanedStockLevels.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Stock levels referencing products that no longer exist</p>
                <div className="space-y-2">
                  {issues.orphanedStockLevels.map(sl => (
                    <div key={sl.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{sl.product_name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-500">Qty: {sl.quantity}</p>
                      </div>
                      <Badge variant="destructive">Will be deleted</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orphaned Movements */}
          {issues.orphanedMovements.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Orphaned Movements ({issues.orphanedMovements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Stock movements referencing products that no longer exist</p>
                <div className="space-y-2">
                  {issues.orphanedMovements.map(sm => (
                    <div key={sm.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">{sm.product_name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-500">Qty: {sm.quantity}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">Will be deleted</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invalid Batch References */}
          {issues.invalidBatchReferences.length > 0 && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-700 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Invalid Batch References ({issues.invalidBatchReferences.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Movements referencing batches that were deleted</p>
                <div className="space-y-2">
                  {issues.invalidBatchReferences.map(sm => (
                    <div key={sm.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">{sm.product_name}</p>
                        <p className="text-sm text-gray-500">Batch: {sm.batch_number} | Qty: {sm.quantity}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">Will be deleted</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mismatched Stock */}
          {issues.mismatchedProductStock.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Mismatched Product Stock ({issues.mismatchedProductStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Products where recorded stock doesn't match sum of stock levels</p>
                <div className="space-y-2">
                  {issues.mismatchedProductStock.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-gray-500">
                          Recorded: {p.recorded} | Calculated: {p.calculated} | Diff: {p.difference > 0 ? '+' : ''}{p.difference}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">Will sync to {p.calculated}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duplicate Stock Levels */}
          {issues.duplicateStockLevels.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Duplicate Stock Levels ({issues.duplicateStockLevels.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Multiple stock levels for the same product/warehouse combination</p>
                <div className="space-y-2">
                  {issues.duplicateStockLevels.map(sl => (
                    <div key={sl.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{sl.product_name}</p>
                        <p className="text-sm text-gray-500">{sl.warehouse_name} | Qty: {sl.quantity}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">Will be merged</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Clear */}
          {totalIssues === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700">All Clear!</h3>
                <p className="text-green-600">No inventory issues detected. Your data is consistent.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}