import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ShoppingCart, 
  AlertTriangle, 
  TrendingDown,
  RefreshCw,
  Check,
  X,
  Package,
  Clock,
  Truck,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, subDays, format } from "date-fns";

export default function ReorderSuggestions({ orgId, products, sales, suppliers, currentEmployee }) {
  const queryClient = useQueryClient();
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const { data: existingSuggestions = [] } = useQuery({
    queryKey: ['reorderSuggestions', orgId],
    queryFn: () => base44.entities.ReorderSuggestion.filter({ organisation_id: orgId, status: 'pending' }),
    enabled: !!orgId,
  });

  const createSuggestionMutation = useMutation({
    mutationFn: (data) => base44.entities.ReorderSuggestion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reorderSuggestions'] });
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReorderSuggestion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reorderSuggestions'] });
      toast.success("Suggestion updated");
    },
  });

  // Calculate reorder suggestions based on sales velocity
  const calculatedSuggestions = useMemo(() => {
    if (!products.length || !sales.length) return [];

    const last30Days = subDays(new Date(), 30);
    const suggestions = [];

    products.forEach(product => {
      // Calculate average daily sales for this product
      const productSales = sales.filter(s => {
        const saleDate = new Date(s.created_date);
        return saleDate >= last30Days && s.items?.some(item => item.product_id === product.id);
      });

      let totalSold = 0;
      productSales.forEach(sale => {
        sale.items?.forEach(item => {
          if (item.product_id === product.id) {
            totalSold += item.quantity || 0;
          }
        });
      });

      const avgDailySales = totalSold / 30;
      const currentStock = product.stock_quantity || 0;
      const reorderPoint = product.reorder_point || product.low_stock_threshold || 10;
      const leadTime = product.lead_time_days || 7;
      const daysOfStock = avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : 999;

      // Only suggest reorder if stock is at or below reorder point
      if (currentStock <= reorderPoint || daysOfStock <= leadTime) {
        // Calculate suggested quantity based on reorder quantity or lead time coverage
        const suggestedQty = product.reorder_quantity || Math.max(
          Math.ceil(avgDailySales * (leadTime + 14)), // Cover lead time + 2 weeks buffer
          reorderPoint * 2
        );

        let priority = 'low';
        if (currentStock === 0) priority = 'critical';
        else if (daysOfStock <= 3) priority = 'critical';
        else if (daysOfStock <= 7) priority = 'high';
        else if (daysOfStock <= 14) priority = 'medium';

        // Check if suggestion already exists
        const existing = existingSuggestions.find(s => s.product_id === product.id);
        if (!existing) {
          suggestions.push({
            product,
            avgDailySales: Math.round(avgDailySales * 100) / 100,
            daysOfStock,
            suggestedQty,
            priority,
            estimatedCost: suggestedQty * (product.cost_price || 0),
          });
        }
      }
    });

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [products, sales, existingSuggestions]);

  // Auto-create suggestions
  useEffect(() => {
    if (!orgId) return;
    
    calculatedSuggestions.forEach(suggestion => {
      createSuggestionMutation.mutate({
        organisation_id: orgId,
        product_id: suggestion.product.id,
        product_name: suggestion.product.name,
        current_stock: suggestion.product.stock_quantity,
        reorder_point: suggestion.product.reorder_point || suggestion.product.low_stock_threshold,
        suggested_quantity: suggestion.suggestedQty,
        avg_daily_sales: suggestion.avgDailySales,
        days_of_stock: suggestion.daysOfStock,
        lead_time_days: suggestion.product.lead_time_days || 7,
        priority: suggestion.priority,
        status: 'pending',
        supplier_id: suggestion.product.preferred_supplier_id,
        supplier_name: suggestion.product.preferred_supplier_name,
        estimated_cost: suggestion.estimatedCost,
      });
    });
  }, [calculatedSuggestions.length]);

  const allSuggestions = [...existingSuggestions].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleDismiss = (suggestion) => {
    updateSuggestionMutation.mutate({
      id: suggestion.id,
      data: { status: 'dismissed' }
    });
  };

  const handleCreatePO = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowCreatePO(true);
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      critical: "bg-red-100 text-red-800 border-red-300",
      high: "bg-orange-100 text-orange-800 border-orange-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return <Badge className={styles[priority]}>{priority}</Badge>;
  };

  const criticalCount = allSuggestions.filter(s => s.priority === 'critical').length;
  const highCount = allSuggestions.filter(s => s.priority === 'high').length;
  const totalEstimatedCost = allSuggestions.reduce((sum, s) => sum + (s.estimated_cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={criticalCount > 0 ? "border-red-300 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${criticalCount > 0 ? 'bg-red-200' : 'bg-red-100'}`}>
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Critical</p>
                <p className="text-xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-xl font-bold text-orange-600">{highCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Suggestions</p>
                <p className="text-xl font-bold">{allSuggestions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Cost</p>
                <p className="text-lg font-bold text-green-600">Le {totalEstimatedCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Reorder Suggestions
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['reorderSuggestions'] })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allSuggestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-green-600">All stock levels are healthy!</p>
              <p className="text-sm">No reorder suggestions at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className={`p-4 rounded-lg border ${
                    suggestion.priority === 'critical' ? 'border-red-300 bg-red-50' :
                    suggestion.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{suggestion.product_name}</span>
                        {getPriorityBadge(suggestion.priority)}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Current Stock</p>
                          <p className="font-medium">{suggestion.current_stock}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Days of Stock</p>
                          <p className={`font-medium ${suggestion.days_of_stock <= 7 ? 'text-red-600' : ''}`}>
                            {suggestion.days_of_stock === 999 ? '∞' : suggestion.days_of_stock} days
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Suggested Order</p>
                          <p className="font-medium text-green-600">{suggestion.suggested_quantity} units</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Est. Cost</p>
                          <p className="font-medium">Le {(suggestion.estimated_cost || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      {suggestion.avg_daily_sales > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Avg. {suggestion.avg_daily_sales} units/day | Lead time: {suggestion.lead_time_days} days
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDismiss(suggestion)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-[#1EB053] hover:bg-[#178f43]"
                        onClick={() => handleCreatePO(suggestion)}
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Order
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create PO Dialog */}
      <Dialog open={showCreatePO} onOpenChange={setShowCreatePO}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSuggestion.product_name}</p>
                <p className="text-sm text-gray-500">Suggested quantity: {selectedSuggestion.suggested_quantity}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" defaultValue={selectedSuggestion.suggested_quantity} className="mt-1" />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Select defaultValue={selectedSuggestion.supplier_id}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This will create a purchase order and mark this suggestion as ordered.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreatePO(false)}>Cancel</Button>
                <Button 
                  className="bg-[#1EB053]"
                  onClick={() => {
                    updateSuggestionMutation.mutate({
                      id: selectedSuggestion.id,
                      data: { status: 'ordered' }
                    });
                    setShowCreatePO(false);
                    toast.success("Purchase order created");
                  }}
                >
                  Create Order
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}