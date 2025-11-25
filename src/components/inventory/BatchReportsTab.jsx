import React, { useState, useMemo } from "react";
import { format, differenceInDays, startOfMonth, endOfMonth } from "date-fns";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Package,
  AlertTriangle
} from "lucide-react";

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#ef4444', '#8b5cf6'];

export default function BatchReportsTab({ batches = [], products = [], warehouses = [] }) {
  const [reportType, setReportType] = useState("expiry_summary");
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // Expiry Summary Data
  const expirySummary = useMemo(() => {
    const today = new Date();
    const summary = {
      expired: 0,
      within7Days: 0,
      within30Days: 0,
      within90Days: 0,
      beyond90Days: 0,
      noExpiry: 0
    };

    batches.filter(b => b.status === 'active' && b.quantity > 0).forEach(batch => {
      if (!batch.expiry_date) {
        summary.noExpiry += batch.quantity;
        return;
      }
      const days = differenceInDays(new Date(batch.expiry_date), today);
      if (days < 0) summary.expired += batch.quantity;
      else if (days <= 7) summary.within7Days += batch.quantity;
      else if (days <= 30) summary.within30Days += batch.quantity;
      else if (days <= 90) summary.within90Days += batch.quantity;
      else summary.beyond90Days += batch.quantity;
    });

    return [
      { name: 'Expired', value: summary.expired, color: '#ef4444' },
      { name: '0-7 Days', value: summary.within7Days, color: '#f97316' },
      { name: '8-30 Days', value: summary.within30Days, color: '#eab308' },
      { name: '31-90 Days', value: summary.within90Days, color: '#22c55e' },
      { name: '90+ Days', value: summary.beyond90Days, color: '#1EB053' },
      { name: 'No Expiry', value: summary.noExpiry, color: '#94a3b8' },
    ].filter(item => item.value > 0);
  }, [batches]);

  // Batch by Product Data
  const batchByProduct = useMemo(() => {
    const productMap = {};
    batches.filter(b => b.status === 'active').forEach(batch => {
      if (!productMap[batch.product_name]) {
        productMap[batch.product_name] = { batches: 0, quantity: 0, expiringSoon: 0 };
      }
      productMap[batch.product_name].batches += 1;
      productMap[batch.product_name].quantity += batch.quantity || 0;
      
      if (batch.expiry_date) {
        const days = differenceInDays(new Date(batch.expiry_date), new Date());
        if (days <= 30 && days >= 0) {
          productMap[batch.product_name].expiringSoon += batch.quantity || 0;
        }
      }
    });

    return Object.entries(productMap)
      .map(([name, data]) => ({ name: name.substring(0, 15), ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [batches]);

  // Detailed Expiry Report
  const detailedExpiryReport = useMemo(() => {
    return batches
      .filter(b => b.status === 'active' && b.quantity > 0 && b.expiry_date)
      .map(b => ({
        ...b,
        daysUntilExpiry: differenceInDays(new Date(b.expiry_date), new Date())
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [batches]);

  const handleExport = () => {
    let csvContent = "";
    
    if (reportType === "expiry_summary") {
      csvContent = "Category,Quantity\n";
      expirySummary.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });
    } else if (reportType === "batch_by_product") {
      csvContent = "Product,Total Batches,Total Quantity,Expiring Soon (30 days)\n";
      batchByProduct.forEach(item => {
        csvContent += `${item.name},${item.batches},${item.quantity},${item.expiringSoon}\n`;
      });
    } else if (reportType === "detailed_expiry") {
      csvContent = "Batch Number,Product,Warehouse,Quantity,Expiry Date,Days Until Expiry\n";
      detailedExpiryReport.forEach(item => {
        csvContent += `${item.batch_number},${item.product_name},${item.warehouse_name || 'Main'},${item.quantity},${item.expiry_date},${item.daysUntilExpiry}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_report_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const getExpiryBadge = (days) => {
    if (days < 0) return <Badge className="bg-red-500 text-white">Expired</Badge>;
    if (days <= 7) return <Badge className="bg-red-100 text-red-800">{days}d</Badge>;
    if (days <= 30) return <Badge className="bg-orange-100 text-orange-800">{days}d</Badge>;
    if (days <= 90) return <Badge className="bg-yellow-100 text-yellow-800">{days}d</Badge>;
    return <Badge className="bg-green-100 text-green-800">{days}d</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Report Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiry_summary">Expiry Summary</SelectItem>
                  <SelectItem value="batch_by_product">Batch by Product</SelectItem>
                  <SelectItem value="detailed_expiry">Detailed Expiry Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Summary Report */}
      {reportType === "expiry_summary" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Expiry Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expirySummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {expirySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {expirySummary.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value.toLocaleString()} units</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch by Product Report */}
      {reportType === "batch_by_product" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Batch Distribution by Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchByProduct}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" name="Total Quantity" fill="#1EB053" />
                  <Bar dataKey="expiringSoon" name="Expiring (30d)" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Expiry Report */}
      {reportType === "detailed_expiry" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Detailed Expiry Report ({detailedExpiryReport.length} batches)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Batch</th>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Warehouse</th>
                    <th className="text-right p-4 font-medium">Quantity</th>
                    <th className="text-left p-4 font-medium">Expiry Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedExpiryReport.slice(0, 50).map((batch) => (
                    <tr key={batch.id} className={`border-b ${batch.daysUntilExpiry < 0 ? 'bg-red-50' : batch.daysUntilExpiry <= 7 ? 'bg-orange-50' : ''}`}>
                      <td className="p-4 font-mono">{batch.batch_number}</td>
                      <td className="p-4">{batch.product_name}</td>
                      <td className="p-4 text-gray-600">{batch.warehouse_name || 'Main'}</td>
                      <td className="p-4 text-right font-medium">{batch.quantity}</td>
                      <td className="p-4">{format(new Date(batch.expiry_date), 'dd MMM yyyy')}</td>
                      <td className="p-4">{getExpiryBadge(batch.daysUntilExpiry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}