import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { 
  Warehouse, 
  Search, 
  AlertTriangle, 
  Package,
  MapPin,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function StockLevelsView({ 
  products = [], 
  warehouses = [], 
  stockLevels = [],
  orgId,
  onTransfer
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Build stock matrix (product x warehouse)
  const stockMatrix = products.map(product => {
    const warehouseStocks = warehouses.map(warehouse => {
      const stockLevel = stockLevels.find(
        sl => sl.product_id === product.id && sl.warehouse_id === warehouse.id
      );
      return {
        warehouse_id: warehouse.id,
        warehouse_name: warehouse.name,
        quantity: stockLevel?.quantity ?? 0,
        reorder_level: stockLevel?.reorder_level ?? product.low_stock_threshold ?? 10,
        bin_location: stockLevel?.bin_location || '-'
      };
    });

    const totalStock = warehouseStocks.reduce((sum, ws) => sum + ws.quantity, 0);
    const status = totalStock === 0 ? 'out_of_stock' : 
                   totalStock <= product.low_stock_threshold ? 'low_stock' : 'in_stock';

    return {
      ...product,
      warehouseStocks,
      totalStock,
      status
    };
  });

  // Filter products
  const filteredProducts = stockMatrix.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = warehouseFilter === "all" || 
                             p.warehouseStocks.some(ws => ws.warehouse_id === warehouseFilter && ws.quantity > 0);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  const lowStockCount = stockMatrix.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = stockMatrix.filter(p => p.status === 'out_of_stock').length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-[#1EB053]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Warehouses</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
              <Warehouse className="w-8 h-8 text-[#0072C6]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{lowStockCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold text-red-500">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-48">
                <Warehouse className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1EB053]" />
            Stock by Location
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Products Found"
              description="Adjust your filters or add products to see stock levels"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white z-10">Product</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    {warehouses.map(w => (
                      <TableHead key={w.id} className="text-center min-w-24">
                        <div className="flex flex-col items-center">
                          <Warehouse className="w-4 h-4 mb-1 text-[#0072C6]" />
                          <span className="text-xs">{w.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-[#0072C6]" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku || product.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={product.status === 'out_of_stock' ? 'destructive' : 
                                  product.status === 'low_stock' ? 'warning' : 'secondary'}
                          className={product.status === 'low_stock' ? 'bg-[#D4AF37] text-white' : ''}
                        >
                          {product.status === 'out_of_stock' ? 'Out' : 
                           product.status === 'low_stock' ? 'Low' : 'OK'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {product.totalStock}
                      </TableCell>
                      {product.warehouseStocks.map((ws) => (
                        <TableCell key={ws.warehouse_id} className="text-center">
                          <span className={`font-medium ${
                            ws.quantity === 0 ? 'text-red-500' :
                            ws.quantity <= product.low_stock_threshold ? 'text-[#D4AF37]' :
                            'text-[#1EB053]'
                          }`}>
                            {ws.quantity}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}