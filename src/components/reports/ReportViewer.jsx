import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, parseISO, startOfWeek, startOfMonth, getWeek } from "date-fns";
import {
  FileText,
  Download,
  Printer,
  Mail,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Loader2,
  BarChart3,
  Table as TableIcon,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ColorfulBarChart, DonutChart, GradientAreaChart } from "@/components/charts/AdvancedCharts";

const COLUMN_FORMATTERS = {
  total_amount: (v) => `Le ${(v || 0).toLocaleString()}`,
  amount: (v) => `Le ${(v || 0).toLocaleString()}`,
  base_salary: (v) => `Le ${(v || 0).toLocaleString()}`,
  gross_pay: (v) => `Le ${(v || 0).toLocaleString()}`,
  net_pay: (v) => `Le ${(v || 0).toLocaleString()}`,
  unit_price: (v) => `Le ${(v || 0).toLocaleString()}`,
  cost_price: (v) => `Le ${(v || 0).toLocaleString()}`,
  stock_value: (v) => `Le ${(v || 0).toLocaleString()}`,
  ticket_revenue: (v) => `Le ${(v || 0).toLocaleString()}`,
  fuel_cost: (v) => `Le ${(v || 0).toLocaleString()}`,
  net_revenue: (v) => `Le ${(v || 0).toLocaleString()}`,
  subtotal: (v) => `Le ${(v || 0).toLocaleString()}`,
  discount: (v) => `Le ${(v || 0).toLocaleString()}`,
  tax: (v) => `Le ${(v || 0).toLocaleString()}`,
  nassit_employee: (v) => `Le ${(v || 0).toLocaleString()}`,
  paye_tax: (v) => `Le ${(v || 0).toLocaleString()}`,
  total_deductions: (v) => `Le ${(v || 0).toLocaleString()}`,
  total_allowances: (v) => `Le ${(v || 0).toLocaleString()}`,
  total_bonuses: (v) => `Le ${(v || 0).toLocaleString()}`,
  created_date: (v) => v ? format(parseISO(v), 'MMM d, yyyy') : '-',
  date: (v) => v ? format(parseISO(v), 'MMM d, yyyy') : '-',
  period_start: (v) => v ? format(parseISO(v), 'MMM d, yyyy') : '-',
  period_end: (v) => v ? format(parseISO(v), 'MMM d, yyyy') : '-',
  payment_method: (v) => v?.replace(/_/g, ' ') || '-',
  payment_status: (v) => v || '-',
  status: (v) => v || '-',
  category: (v) => v?.replace(/_/g, ' ') || '-',
  sale_type: (v) => v || '-',
};

const COLUMN_LABELS = {
  sale_number: "Sale #",
  created_date: "Date",
  customer_name: "Customer",
  employee_name: "Employee",
  sale_type: "Type",
  items_count: "Items",
  subtotal: "Subtotal",
  discount: "Discount",
  tax: "Tax",
  total_amount: "Total",
  payment_method: "Payment",
  payment_status: "Status",
  name: "Name",
  sku: "SKU",
  category: "Category",
  stock_quantity: "Stock",
  unit_price: "Price",
  cost_price: "Cost",
  stock_value: "Value",
  low_stock_threshold: "Reorder",
  status: "Status",
  employee_role: "Role",
  period_start: "Start",
  period_end: "End",
  base_salary: "Base",
  total_allowances: "Allowances",
  total_bonuses: "Bonuses",
  gross_pay: "Gross",
  nassit_employee: "NASSIT",
  paye_tax: "PAYE",
  total_deductions: "Deductions",
  net_pay: "Net Pay",
  date: "Date",
  vehicle_registration: "Vehicle",
  driver_name: "Driver",
  route_name: "Route",
  passengers: "Passengers",
  ticket_revenue: "Revenue",
  fuel_cost: "Fuel",
  other_expenses: "Expenses",
  net_revenue: "Net",
  description: "Description",
  amount: "Amount",
  approved_by_name: "Approved By",
};

export default function ReportViewer({ 
  reportConfig, 
  data = [],
  isLoading,
  organisation,
  onRefresh,
  onSendEmail
}) {
  const [viewMode, setViewMode] = useState("table");
  const [sortConfig, setSortConfig] = useState({ 
    key: reportConfig?.sort_by || 'created_date', 
    direction: reportConfig?.sort_order || 'desc' 
  });
  const [expandedGroups, setExpandedGroups] = useState({});

  const processedData = useMemo(() => {
    if (!data.length) return { rows: [], grouped: {}, totals: {} };

    // Calculate derived fields
    const enrichedData = data.map(item => ({
      ...item,
      items_count: item.items?.length || 0,
      stock_value: (item.stock_quantity || 0) * (item.unit_price || 0),
    }));

    // Sort data
    const sorted = [...enrichedData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    // Group data if needed
    const grouped = {};
    if (reportConfig?.group_by && reportConfig.group_by !== 'none') {
      sorted.forEach(item => {
        let groupKey;
        switch (reportConfig.group_by) {
          case 'day':
            groupKey = item.created_date?.split('T')[0] || item.date || 'Unknown';
            break;
          case 'week':
            const dateW = item.created_date || item.date;
            groupKey = dateW ? `Week ${getWeek(parseISO(dateW))}` : 'Unknown';
            break;
          case 'month':
            const dateM = item.created_date || item.date || item.period_start;
            groupKey = dateM ? format(parseISO(dateM), 'MMMM yyyy') : 'Unknown';
            break;
          default:
            groupKey = item[reportConfig.group_by] || 'Unknown';
        }
        if (!grouped[groupKey]) grouped[groupKey] = [];
        grouped[groupKey].push(item);
      });
    }

    // Calculate totals
    const totals = {};
    const numericColumns = ['total_amount', 'amount', 'subtotal', 'discount', 'tax', 
      'base_salary', 'gross_pay', 'net_pay', 'total_deductions', 'nassit_employee', 
      'paye_tax', 'total_allowances', 'total_bonuses', 'stock_quantity', 'stock_value',
      'ticket_revenue', 'fuel_cost', 'other_expenses', 'net_revenue', 'passengers'];
    
    numericColumns.forEach(col => {
      if (reportConfig?.columns?.includes(col)) {
        totals[col] = sorted.reduce((sum, item) => sum + (item[col] || 0), 0);
      }
    });

    return { rows: sorted, grouped, totals };
  }, [data, sortConfig, reportConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportConfig?.name || 'Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1EB053; color: white; }
            .header { text-align: center; margin-bottom: 20px; }
            .totals { font-weight: bold; background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${organisation?.name || 'Organisation'}</h1>
            <h2>${reportConfig?.name || 'Report'}</h2>
            <p>Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
            <p>Period: ${reportConfig?.filters?.start_date} to ${reportConfig?.filters?.end_date}</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const columns = reportConfig?.columns || [];
    const headers = columns.map(col => COLUMN_LABELS[col] || col);
    const rows = processedData.rows.map(row => 
      columns.map(col => {
        const val = row[col];
        if (typeof val === 'number') return val;
        if (val && col.includes('date')) return format(parseISO(val), 'yyyy-MM-dd');
        return val || '';
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportConfig?.name || 'report'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const chartData = useMemo(() => {
    if (reportConfig?.group_by === 'none' || !Object.keys(processedData.grouped).length) {
      return [];
    }
    return Object.entries(processedData.grouped).map(([name, items]) => ({
      name,
      value: items.reduce((sum, i) => sum + (i.total_amount || i.amount || i.net_pay || i.net_revenue || 0), 0),
      count: items.length
    }));
  }, [processedData.grouped, reportConfig?.group_by]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{reportConfig?.name || 'Report'}</h2>
          <p className="text-sm text-gray-500">
            {reportConfig?.filters?.start_date} to {reportConfig?.filters?.end_date} • {processedData.rows.length} records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="h-8">
              <TabsTrigger value="table" className="text-xs px-2">
                <TableIcon className="w-3 h-3 mr-1" />
                Table
              </TabsTrigger>
              <TabsTrigger value="chart" className="text-xs px-2">
                <BarChart3 className="w-3 h-3 mr-1" />
                Chart
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
          </Button>
          {onSendEmail && (
            <Button size="sm" onClick={onSendEmail} className="bg-[#1EB053] hover:bg-[#178f43]">
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Card id="report-content">
        <CardContent className="p-0">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10">
                    {reportConfig?.columns?.map((col) => (
                      <TableHead 
                        key={col} 
                        className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          {COLUMN_LABELS[col] || col}
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportConfig?.group_by && reportConfig.group_by !== 'none' ? (
                    Object.entries(processedData.grouped).map(([groupKey, items]) => (
                      <React.Fragment key={groupKey}>
                        <TableRow 
                          className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleGroup(groupKey)}
                        >
                          <TableCell colSpan={reportConfig.columns?.length || 1} className="font-medium">
                            <div className="flex items-center gap-2">
                              {expandedGroups[groupKey] !== false ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                              {groupKey} ({items.length} records)
                              <Badge variant="outline" className="ml-2">
                                Total: Le {items.reduce((s, i) => s + (i.total_amount || i.amount || i.net_pay || i.net_revenue || 0), 0).toLocaleString()}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedGroups[groupKey] !== false && items.map((row, idx) => (
                          <TableRow key={idx}>
                            {reportConfig.columns?.map((col) => (
                              <TableCell key={col} className="whitespace-nowrap">
                                {COLUMN_FORMATTERS[col] 
                                  ? COLUMN_FORMATTERS[col](row[col])
                                  : row[col] ?? '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    processedData.rows.map((row, idx) => (
                      <TableRow key={idx}>
                        {reportConfig?.columns?.map((col) => (
                          <TableCell key={col} className="whitespace-nowrap">
                            {COLUMN_FORMATTERS[col] 
                              ? COLUMN_FORMATTERS[col](row[col])
                              : row[col] ?? '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                  {/* Totals Row */}
                  {Object.keys(processedData.totals).length > 0 && (
                    <TableRow className="bg-gradient-to-r from-[#1EB053]/20 to-[#0072C6]/20 font-bold">
                      {reportConfig?.columns?.map((col, idx) => (
                        <TableCell key={col}>
                          {idx === 0 ? 'TOTAL' : 
                           processedData.totals[col] !== undefined 
                             ? (COLUMN_FORMATTERS[col] 
                                 ? COLUMN_FORMATTERS[col](processedData.totals[col])
                                 : processedData.totals[col].toLocaleString())
                             : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6">
              {chartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">By {reportConfig?.group_by?.replace(/_/g, ' ')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ColorfulBarChart
                        data={chartData}
                        dataKey="value"
                        xKey="name"
                        height={300}
                        formatter={(v) => `Le ${v.toLocaleString()}`}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DonutChart
                        data={chartData}
                        height={300}
                        formatter={(v) => `Le ${v.toLocaleString()}`}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a grouping option to view charts</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}