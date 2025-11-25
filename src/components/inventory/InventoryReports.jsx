import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  FileText, 
  Download, 
  Printer,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from "recharts";

const REPORT_TYPES = [
  { key: 'stock_valuation', name: 'Stock Valuation', icon: DollarSign },
  { key: 'stock_movement', name: 'Stock Movement', icon: TrendingUp },
  { key: 'low_stock', name: 'Low Stock Report', icon: TrendingDown },
  { key: 'category_summary', name: 'Category Summary', icon: PieChart },
];

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#E74C3C', '#9B59B6', '#3498DB'];

export default function InventoryReports({ 
  products = [], 
  stockMovements = [],
  categories = [],
  warehouses = []
}) {
  const [reportType, setReportType] = useState('stock_valuation');
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [showReport, setShowReport] = useState(false);

  // Stock Valuation Report
  const stockValuationData = useMemo(() => {
    return products.map(p => ({
      name: p.name,
      sku: p.sku || '-',
      category: p.category || 'Uncategorized',
      quantity: p.stock_quantity || 0,
      unit_cost: p.cost_price || 0,
      unit_price: p.unit_price || 0,
      total_cost: (p.stock_quantity || 0) * (p.cost_price || 0),
      total_value: (p.stock_quantity || 0) * (p.unit_price || 0),
      potential_profit: ((p.stock_quantity || 0) * (p.unit_price || 0)) - ((p.stock_quantity || 0) * (p.cost_price || 0))
    }));
  }, [products]);

  const totalStockValue = stockValuationData.reduce((sum, p) => sum + p.total_value, 0);
  const totalStockCost = stockValuationData.reduce((sum, p) => sum + p.total_cost, 0);
  const totalPotentialProfit = totalStockValue - totalStockCost;

  // Stock Movement Report
  const stockMovementData = useMemo(() => {
    return stockMovements
      .filter(m => {
        const date = new Date(m.created_date);
        return date >= new Date(dateFrom) && date <= new Date(dateTo);
      })
      .map(m => ({
        date: format(new Date(m.created_date), 'PP'),
        product: m.product_name,
        type: m.movement_type,
        quantity: m.quantity,
        previous: m.previous_stock,
        new: m.new_stock,
        reference: m.reference_type,
        recorded_by: m.recorded_by_name
      }));
  }, [stockMovements, dateFrom, dateTo]);

  // Low Stock Report
  const lowStockData = useMemo(() => {
    return products
      .filter(p => p.stock_quantity <= (p.low_stock_threshold || 10))
      .map(p => ({
        name: p.name,
        sku: p.sku || '-',
        category: p.category || 'Uncategorized',
        current_stock: p.stock_quantity || 0,
        threshold: p.low_stock_threshold || 10,
        shortage: Math.max(0, (p.low_stock_threshold || 10) - (p.stock_quantity || 0)),
        status: p.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'
      }))
      .sort((a, b) => a.current_stock - b.current_stock);
  }, [products]);

  // Category Summary
  const categorySummaryData = useMemo(() => {
    const categoryMap = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { 
          name: cat, 
          count: 0, 
          totalStock: 0, 
          totalValue: 0,
          lowStock: 0 
        };
      }
      categoryMap[cat].count++;
      categoryMap[cat].totalStock += p.stock_quantity || 0;
      categoryMap[cat].totalValue += (p.stock_quantity || 0) * (p.unit_price || 0);
      if (p.stock_quantity <= (p.low_stock_threshold || 10)) {
        categoryMap[cat].lowStock++;
      }
    });
    return Object.values(categoryMap);
  }, [products]);

  const generateCSV = () => {
    let csvContent = "";
    let data = [];
    let headers = [];

    switch (reportType) {
      case 'stock_valuation':
        headers = ['Product', 'SKU', 'Category', 'Quantity', 'Unit Cost', 'Unit Price', 'Total Cost', 'Total Value'];
        data = stockValuationData.map(r => [r.name, r.sku, r.category, r.quantity, r.unit_cost, r.unit_price, r.total_cost, r.total_value]);
        break;
      case 'stock_movement':
        headers = ['Date', 'Product', 'Type', 'Quantity', 'Previous', 'New', 'Reference', 'Recorded By'];
        data = stockMovementData.map(r => [r.date, r.product, r.type, r.quantity, r.previous, r.new, r.reference, r.recorded_by]);
        break;
      case 'low_stock':
        headers = ['Product', 'SKU', 'Category', 'Current Stock', 'Threshold', 'Shortage', 'Status'];
        data = lowStockData.map(r => [r.name, r.sku, r.category, r.current_stock, r.threshold, r.shortage, r.status]);
        break;
      case 'category_summary':
        headers = ['Category', 'Products', 'Total Stock', 'Total Value', 'Low Stock Items'];
        data = categorySummaryData.map(r => [r.name, r.count, r.totalStock, r.totalValue, r.lowStock]);
        break;
    }

    csvContent = headers.join(',') + '\n' + data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            Generate Inventory Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(r => (
                    <SelectItem key={r.key} value={r.key}>
                      <div className="flex items-center gap-2">
                        <r.icon className="w-4 h-4" />
                        {r.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1" 
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1" 
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => setShowReport(true)} className="w-full bg-[#1EB053]">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Output */}
      {showReport && (
        <Card className="print:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between print:hidden">
            <CardTitle>
              {REPORT_TYPES.find(r => r.key === reportType)?.name}
              <Badge variant="secondary" className="ml-2">
                {format(new Date(dateFrom), 'PP')} - {format(new Date(dateTo), 'PP')}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateCSV}>
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={printReport}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Stock Valuation Report */}
            {reportType === 'stock_valuation' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">Total Stock Cost</p>
                      <p className="text-2xl font-bold text-[#0072C6]">SLE {totalStockCost.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">Total Stock Value</p>
                      <p className="text-2xl font-bold text-[#1EB053]">SLE {totalStockValue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">Potential Profit</p>
                      <p className="text-2xl font-bold text-[#D4AF37]">SLE {totalPotentialProfit.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockValuationData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.sku}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell className="text-right">SLE {row.unit_cost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">SLE {row.unit_price.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold">SLE {row.total_value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Stock Movement Report */}
            {reportType === 'stock_movement' && (
              <div className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockMovementData.slice(0, 20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#1EB053" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Previous</TableHead>
                      <TableHead className="text-right">New</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovementData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="font-medium">{row.product}</TableCell>
                        <TableCell>
                          <Badge variant={row.type === 'in' ? 'default' : row.type === 'out' ? 'destructive' : 'secondary'}
                                 className={row.type === 'in' ? 'bg-[#1EB053]' : ''}>
                            {row.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell className="text-right">{row.previous}</TableCell>
                        <TableCell className="text-right">{row.new}</TableCell>
                        <TableCell>{row.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Low Stock Report */}
            {reportType === 'low_stock' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">Shortage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.sku}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell className="text-right font-bold text-red-500">{row.current_stock}</TableCell>
                      <TableCell className="text-right">{row.threshold}</TableCell>
                      <TableCell className="text-right">{row.shortage}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'Out of Stock' ? 'destructive' : 'default'}
                               className={row.status === 'Low Stock' ? 'bg-[#D4AF37]' : ''}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Category Summary Report */}
            {reportType === 'category_summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categorySummaryData}
                          dataKey="totalValue"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {categorySummaryData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `SLE ${value.toLocaleString()}`} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categorySummaryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#1EB053" name="Products" />
                        <Bar dataKey="lowStock" fill="#E74C3C" name="Low Stock" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Products</TableHead>
                      <TableHead className="text-right">Total Stock</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead className="text-right">Low Stock Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorySummaryData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {row.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{row.totalStock}</TableCell>
                        <TableCell className="text-right font-bold">SLE {row.totalValue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {row.lowStock > 0 ? (
                            <Badge variant="destructive">{row.lowStock}</Badge>
                          ) : (
                            <Badge variant="secondary">0</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}