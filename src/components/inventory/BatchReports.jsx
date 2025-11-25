import React, { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  FileText,
  Download,
  Printer,
  Package,
  Calendar,
  AlertTriangle
} from "lucide-react";

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#EF4444', '#8B5CF6'];

export default function BatchReports({ batches = [], products = [], warehouses = [] }) {
  const [reportType, setReportType] = useState("summary");

  // Calculate report data
  const reportData = useMemo(() => {
    const today = new Date();
    
    // Batch summary by product
    const byProduct = products.map(product => {
      const productBatches = batches.filter(b => b.product_id === product.id);
      const totalQty = productBatches.reduce((sum, b) => sum + (b.quantity || 0), 0);
      const activeBatches = productBatches.filter(b => b.status === 'active').length;
      const expiredBatches = productBatches.filter(b => b.status === 'expired').length;
      const expiringWithin30 = productBatches.filter(b => {
        if (!b.expiry_date) return false;
        const days = differenceInDays(new Date(b.expiry_date), today);
        return days >= 0 && days <= 30;
      }).length;
      
      return {
        name: product.name,
        totalBatches: productBatches.length,
        totalQuantity: totalQty,
        activeBatches,
        expiredBatches,
        expiringWithin30,
        value: totalQty
      };
    }).filter(p => p.totalBatches > 0);

    // By warehouse
    const byWarehouse = warehouses.map(warehouse => {
      const warehouseBatches = batches.filter(b => b.warehouse_id === warehouse.id);
      return {
        name: warehouse.name,
        batches: warehouseBatches.length,
        quantity: warehouseBatches.reduce((sum, b) => sum + (b.quantity || 0), 0)
      };
    }).filter(w => w.batches > 0);

    // By status
    const byStatus = [
      { name: 'Active', value: batches.filter(b => b.status === 'active').length, color: '#1EB053' },
      { name: 'Expired', value: batches.filter(b => b.status === 'expired').length, color: '#EF4444' },
      { name: 'Depleted', value: batches.filter(b => b.status === 'depleted').length, color: '#6B7280' },
      { name: 'Quarantine', value: batches.filter(b => b.status === 'quarantine').length, color: '#F59E0B' },
    ].filter(s => s.value > 0);

    // Expiry timeline
    const expiryTimeline = [
      { name: 'Expired', count: batches.filter(b => b.expiry_date && differenceInDays(new Date(b.expiry_date), today) < 0).length },
      { name: '0-7 days', count: batches.filter(b => b.expiry_date && differenceInDays(new Date(b.expiry_date), today) >= 0 && differenceInDays(new Date(b.expiry_date), today) <= 7).length },
      { name: '8-30 days', count: batches.filter(b => b.expiry_date && differenceInDays(new Date(b.expiry_date), today) > 7 && differenceInDays(new Date(b.expiry_date), today) <= 30).length },
      { name: '31-90 days', count: batches.filter(b => b.expiry_date && differenceInDays(new Date(b.expiry_date), today) > 30 && differenceInDays(new Date(b.expiry_date), today) <= 90).length },
      { name: '90+ days', count: batches.filter(b => b.expiry_date && differenceInDays(new Date(b.expiry_date), today) > 90).length },
    ];

    // Batch value summary
    const totalValue = batches.reduce((sum, b) => sum + ((b.quantity || 0) * (b.cost_price || 0)), 0);
    const expiredValue = batches.filter(b => b.status === 'expired').reduce((sum, b) => sum + ((b.quantity || 0) * (b.cost_price || 0)), 0);

    return { byProduct, byWarehouse, byStatus, expiryTimeline, totalValue, expiredValue };
  }, [batches, products, warehouses]);

  const handleExport = () => {
    const csvContent = batches.map(b => ({
      'Batch Number': b.batch_number,
      'Product': b.product_name,
      'Warehouse': b.warehouse_name || 'Main',
      'Quantity': b.quantity,
      'Manufacturing Date': b.manufacturing_date || '',
      'Expiry Date': b.expiry_date || '',
      'Status': b.status,
      'Cost Price': b.cost_price || 0
    }));

    const headers = Object.keys(csvContent[0] || {}).join(',');
    const rows = csvContent.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="expiry">Expiry Report</SelectItem>
                <SelectItem value="detailed">Detailed List</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Report */}
      {reportType === 'summary' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-t-4 border-t-[#1EB053]">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Batches</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#0072C6]">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Quantity</p>
                <p className="text-2xl font-bold">{batches.reduce((sum, b) => sum + (b.quantity || 0), 0).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#D4AF37]">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">Le {reportData.totalValue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-red-500">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Expired Value</p>
                <p className="text-2xl font-bold text-red-500">Le {reportData.expiredValue.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Batches by Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.byProduct.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalQuantity" fill="#1EB053" name="Quantity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.byStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {reportData.byStatus.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Expiry Report */}
      {reportType === 'expiry' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Expiry Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.expiryTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0072C6" name="Batches" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products with Expiring Stock</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Product</th>
                      <th className="text-right p-4 font-medium">Total Batches</th>
                      <th className="text-right p-4 font-medium">Active</th>
                      <th className="text-right p-4 font-medium">Expired</th>
                      <th className="text-right p-4 font-medium">Expiring (30d)</th>
                      <th className="text-right p-4 font-medium">Total Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.byProduct.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4 text-right">{product.totalBatches}</td>
                        <td className="p-4 text-right text-green-600">{product.activeBatches}</td>
                        <td className="p-4 text-right text-red-600">{product.expiredBatches}</td>
                        <td className="p-4 text-right">
                          {product.expiringWithin30 > 0 && (
                            <Badge className="bg-orange-100 text-orange-700">{product.expiringWithin30}</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right font-medium">{product.totalQuantity.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Detailed List */}
      {reportType === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>All Batches</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Batch #</th>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Warehouse</th>
                    <th className="text-right p-4 font-medium">Qty</th>
                    <th className="text-left p-4 font-medium">Mfg Date</th>
                    <th className="text-left p-4 font-medium">Expiry Date</th>
                    <th className="text-right p-4 font-medium">Value</th>
                    <th className="text-center p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => {
                    const daysToExpiry = batch.expiry_date ? differenceInDays(new Date(batch.expiry_date), new Date()) : null;
                    return (
                      <tr key={batch.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{batch.batch_number}</td>
                        <td className="p-4">{batch.product_name}</td>
                        <td className="p-4 text-gray-600">{batch.warehouse_name || 'Main'}</td>
                        <td className="p-4 text-right">{batch.quantity}</td>
                        <td className="p-4 text-gray-600">{batch.manufacturing_date && format(new Date(batch.manufacturing_date), 'dd MMM yyyy')}</td>
                        <td className="p-4">
                          {batch.expiry_date && (
                            <div className="flex items-center gap-2">
                              <span>{format(new Date(batch.expiry_date), 'dd MMM yyyy')}</span>
                              {daysToExpiry !== null && daysToExpiry <= 30 && (
                                <AlertTriangle className={`w-4 h-4 ${daysToExpiry < 0 ? 'text-red-500' : 'text-orange-500'}`} />
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">Le {((batch.quantity || 0) * (batch.cost_price || 0)).toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <Badge className={
                            batch.status === 'active' ? 'bg-green-100 text-green-700' :
                            batch.status === 'expired' ? 'bg-red-100 text-red-700' :
                            batch.status === 'quarantine' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }>{batch.status}</Badge>
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
    </div>
  );
}