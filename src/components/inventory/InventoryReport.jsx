import React, { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Printer,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToCSV as exportCSVUtil } from "@/components/exports/SierraLeoneExportStyles";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

const REPORT_TYPES = [
  { value: "stock_summary", label: "Stock Summary", icon: Package },
  { value: "stock_valuation", label: "Stock Valuation", icon: TrendingUp },
  { value: "movement_summary", label: "Movement Summary", icon: BarChart3 },
  { value: "low_stock", label: "Low Stock Report", icon: TrendingDown },
];

export default function InventoryReport({
  open,
  onOpenChange,
  products = [],
  stockMovements = [],
  warehouses = [],
  categories = [],
  organisation
}) {
  const [reportType, setReportType] = useState("stock_summary");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesWarehouse = warehouseFilter === "all" || p.warehouse_id === warehouseFilter;
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesWarehouse && matchesCategory;
    });
  }, [products, warehouseFilter, categoryFilter]);

  const reportData = useMemo(() => {
    switch (reportType) {
      case "stock_summary":
        return {
          title: "Stock Summary Report",
          summary: {
            totalProducts: filteredProducts.length,
            totalUnits: filteredProducts.reduce((sum, p) => sum + (p.stock_quantity || 0), 0),
            lowStockItems: filteredProducts.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10)).length,
            outOfStock: filteredProducts.filter(p => p.stock_quantity === 0).length,
          },
          columns: ["Product", "SKU", "Category", "Stock", "Unit", "Status"],
          rows: filteredProducts.map(p => ({
            product: p.name,
            sku: p.sku || "-",
            category: p.category || "Other",
            stock: p.stock_quantity,
            unit: p.unit || "piece",
            status: p.stock_quantity === 0 ? "Out of Stock" : 
                    p.stock_quantity <= (p.low_stock_threshold || 10) ? "Low Stock" : "In Stock"
          }))
        };

      case "stock_valuation":
        const totalCost = filteredProducts.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0);
        const totalRetail = filteredProducts.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);
        return {
          title: "Stock Valuation Report",
          summary: {
            totalProducts: filteredProducts.length,
            totalCostValue: totalCost,
            totalRetailValue: totalRetail,
            potentialProfit: totalRetail - totalCost,
          },
          columns: ["Product", "Stock", "Cost Price", "Retail Price", "Cost Value", "Retail Value"],
          rows: filteredProducts.map(p => ({
            product: p.name,
            stock: p.stock_quantity || 0,
            costPrice: p.cost_price || 0,
            retailPrice: p.unit_price || 0,
            costValue: (p.stock_quantity || 0) * (p.cost_price || 0),
            retailValue: (p.stock_quantity || 0) * (p.unit_price || 0)
          }))
        };

      case "movement_summary":
        const movementsByType = stockMovements.reduce((acc, m) => {
          acc[m.movement_type] = (acc[m.movement_type] || 0) + Math.abs(m.quantity || 0);
          return acc;
        }, {});
        return {
          title: "Stock Movement Summary",
          summary: {
            totalMovements: stockMovements.length,
            stockIn: movementsByType.in || 0,
            stockOut: movementsByType.out || 0,
            transfers: movementsByType.transfer || 0,
            adjustments: movementsByType.adjustment || 0,
          },
          columns: ["Date", "Product", "Type", "Quantity", "Reference", "Recorded By"],
          rows: stockMovements.slice(0, 50).map(m => ({
            date: format(new Date(m.created_date), 'MMM d, yyyy'),
            product: m.product_name,
            type: m.movement_type,
            quantity: m.quantity > 0 ? `+${m.quantity}` : m.quantity,
            reference: m.reference_type || "-",
            recordedBy: m.recorded_by_name || "-"
          }))
        };

      case "low_stock":
        const lowStockProducts = filteredProducts.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
        return {
          title: "Low Stock Report",
          summary: {
            totalLowStock: lowStockProducts.length,
            outOfStock: lowStockProducts.filter(p => p.stock_quantity === 0).length,
            criticalItems: lowStockProducts.filter(p => p.stock_quantity <= 5).length,
            reorderNeeded: lowStockProducts.length,
          },
          columns: ["Product", "Current Stock", "Threshold", "Shortfall", "Status"],
          rows: lowStockProducts.map(p => ({
            product: p.name,
            currentStock: p.stock_quantity,
            threshold: p.low_stock_threshold || 10,
            shortfall: Math.max(0, (p.low_stock_threshold || 10) - p.stock_quantity),
            status: p.stock_quantity === 0 ? "OUT" : p.stock_quantity <= 5 ? "CRITICAL" : "LOW"
          }))
        };

      default:
        return { title: "", summary: {}, columns: [], rows: [] };
    }
  }, [reportType, filteredProducts, stockMovements]);

  const exportCSV = () => {
    exportCSVUtil(
      reportData.columns,
      reportData.rows.map(row => Object.values(row)),
      `${reportType}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
  };

  const printReport = () => {
    // Convert summary object to array format
    const summaryCards = Object.entries(reportData.summary).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').trim(),
      value: typeof value === 'number' && key.toLowerCase().includes('value') 
        ? `SLE ${value.toLocaleString()}` 
        : value.toLocaleString(),
      highlight: key.toLowerCase().includes('out') || key.toLowerCase().includes('critical') ? 'red' : 
                 key.toLowerCase().includes('profit') ? 'green' : undefined
    }));

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: reportData.title,
      organisation: organisation,
      summaryCards: summaryCards,
      sections: [{
        title: 'Report Details',
        icon: '📦',
        table: { 
          columns: reportData.columns, 
          rows: reportData.rows.map(row => Object.values(row)) 
        }
      }]
    });
    
    printUnifiedPDF(html, `${reportType}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            Inventory Reports
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Warehouse</Label>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={exportCSV} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button onClick={printReport} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>

        {/* Report Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{reportData.title}</h2>
          <Badge variant="outline">{format(new Date(), 'MMM d, yyyy')}</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(reportData.summary).map(([key, value]) => (
            <Card key={key} className="border-t-4 border-t-[#1EB053]">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#1EB053]">
                  {typeof value === 'number' && key.toLowerCase().includes('value') 
                    ? `SLE ${value.toLocaleString()}` 
                    : value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    {reportData.columns.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={reportData.columns.length} className="text-center py-8 text-gray-500">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.rows.map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((val, cellIdx) => (
                          <TableCell key={cellIdx}>
                            {typeof val === 'number' 
                              ? val.toLocaleString() 
                              : val === "OUT" || val === "CRITICAL" 
                                ? <Badge variant="destructive">{val}</Badge>
                                : val === "LOW" 
                                  ? <Badge className="bg-amber-500">{val}</Badge>
                                  : val === "In Stock"
                                    ? <Badge className="bg-green-500">{val}</Badge>
                                    : val
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}