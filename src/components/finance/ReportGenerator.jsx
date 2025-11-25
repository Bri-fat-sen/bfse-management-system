import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval } from "date-fns";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Truck,
  ShoppingCart,
  FileSpreadsheet,
  Loader2
} from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const reportTypes = [
  { id: "sales", name: "Sales Report", icon: ShoppingCart, color: "green" },
  { id: "expenses", name: "Expense Report", icon: TrendingDown, color: "red" },
  { id: "payroll", name: "Payroll Report", icon: Users, color: "blue" },
  { id: "profit_loss", name: "Profit & Loss", icon: DollarSign, color: "gold" },
];

const expenseCategories = [
  "all", "fuel", "maintenance", "utilities", "supplies", "rent", 
  "salaries", "transport", "marketing", "insurance", "petty_cash", "other"
];

export default function ReportGenerator({ sales = [], expenses = [], payrolls = [], employees = [], trips = [] }) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("sales");
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [category, setCategory] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Filter data based on date range
  const filterByDate = (items, dateField = 'created_date') => {
    return items.filter(item => {
      const itemDate = parseISO(item[dateField] || item.created_date);
      return isWithinInterval(itemDate, { start: parseISO(dateFrom), end: parseISO(dateTo) });
    });
  };

  // Generate report data
  const reportData = useMemo(() => {
    if (!showReport) return null;

    switch (reportType) {
      case "sales": {
        let filteredSales = filterByDate(sales);
        if (employeeFilter !== "all") {
          filteredSales = filteredSales.filter(s => s.employee_id === employeeFilter);
        }
        const totalAmount = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
        const totalItems = filteredSales.reduce((sum, s) => sum + (s.items?.length || 0), 0);
        return {
          title: "Sales Report",
          summary: [
            { label: "Total Sales", value: filteredSales.length },
            { label: "Total Revenue", value: `SLE ${totalAmount.toLocaleString()}` },
            { label: "Items Sold", value: totalItems },
            { label: "Avg Sale Value", value: `SLE ${filteredSales.length ? Math.round(totalAmount / filteredSales.length).toLocaleString() : 0}` },
          ],
          columns: ["Date", "Sale #", "Customer", "Employee", "Items", "Payment", "Amount"],
          rows: filteredSales.map(s => ([
            format(parseISO(s.created_date), 'MMM d, yyyy'),
            s.sale_number || '-',
            s.customer_name || 'Walk-in',
            s.employee_name || '-',
            s.items?.length || 0,
            s.payment_method?.replace('_', ' ') || '-',
            `SLE ${(s.total_amount || 0).toLocaleString()}`
          ])),
          rawData: filteredSales
        };
      }
      case "expenses": {
        let filteredExpenses = filterByDate(expenses, 'date');
        if (category !== "all") {
          filteredExpenses = filteredExpenses.filter(e => e.category === category);
        }
        if (employeeFilter !== "all") {
          filteredExpenses = filteredExpenses.filter(e => e.recorded_by === employeeFilter);
        }
        const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const byCategory = {};
        filteredExpenses.forEach(e => {
          byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
        });
        return {
          title: "Expense Report",
          summary: [
            { label: "Total Expenses", value: filteredExpenses.length },
            { label: "Total Amount", value: `SLE ${totalAmount.toLocaleString()}` },
            { label: "Approved", value: filteredExpenses.filter(e => e.status === 'approved').length },
            { label: "Pending", value: filteredExpenses.filter(e => e.status === 'pending').length },
          ],
          categoryBreakdown: byCategory,
          columns: ["Date", "Category", "Description", "Vendor", "Payment", "Status", "Amount"],
          rows: filteredExpenses.map(e => ([
            format(parseISO(e.date), 'MMM d, yyyy'),
            e.category?.replace(/_/g, ' ') || '-',
            e.description || '-',
            e.vendor || '-',
            e.payment_method?.replace('_', ' ') || '-',
            e.status || '-',
            `SLE ${(e.amount || 0).toLocaleString()}`
          ])),
          rawData: filteredExpenses
        };
      }
      case "payroll": {
        let filteredPayrolls = filterByDate(payrolls, 'period_start');
        if (employeeFilter !== "all") {
          filteredPayrolls = filteredPayrolls.filter(p => p.employee_id === employeeFilter);
        }
        const totalGross = filteredPayrolls.reduce((sum, p) => sum + (p.gross_pay || 0), 0);
        const totalNet = filteredPayrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0);
        const totalDeductions = filteredPayrolls.reduce((sum, p) => sum + (p.total_deductions || 0), 0);
        return {
          title: "Payroll Report",
          summary: [
            { label: "Payroll Records", value: filteredPayrolls.length },
            { label: "Total Gross Pay", value: `SLE ${totalGross.toLocaleString()}` },
            { label: "Total Deductions", value: `SLE ${totalDeductions.toLocaleString()}` },
            { label: "Total Net Pay", value: `SLE ${totalNet.toLocaleString()}` },
          ],
          columns: ["Period", "Employee", "Base Salary", "Allowances", "Deductions", "Net Pay", "Status"],
          rows: filteredPayrolls.map(p => ([
            `${format(parseISO(p.period_start), 'MMM d')} - ${format(parseISO(p.period_end), 'MMM d, yyyy')}`,
            p.employee_name || '-',
            `SLE ${(p.base_salary || 0).toLocaleString()}`,
            `SLE ${(p.total_allowances || 0).toLocaleString()}`,
            `SLE ${(p.total_deductions || 0).toLocaleString()}`,
            `SLE ${(p.net_pay || 0).toLocaleString()}`,
            p.status || '-'
          ])),
          rawData: filteredPayrolls
        };
      }
      case "profit_loss": {
        const filteredSales = filterByDate(sales);
        const filteredTrips = filterByDate(trips, 'date');
        const filteredExpenses = filterByDate(expenses, 'date');
        
        const salesRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
        const tripRevenue = filteredTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
        const totalRevenue = salesRevenue + tripRevenue;
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        
        return {
          title: "Profit & Loss Statement",
          summary: [
            { label: "Sales Revenue", value: `SLE ${salesRevenue.toLocaleString()}` },
            { label: "Transport Revenue", value: `SLE ${tripRevenue.toLocaleString()}` },
            { label: "Total Expenses", value: `SLE ${totalExpenses.toLocaleString()}` },
            { label: "Net Profit", value: `SLE ${netProfit.toLocaleString()}`, highlight: netProfit >= 0 ? 'green' : 'red' },
          ],
          columns: ["Category", "Type", "Amount"],
          rows: [
            ["Sales Revenue", "Income", `SLE ${salesRevenue.toLocaleString()}`],
            ["Transport Revenue", "Income", `SLE ${tripRevenue.toLocaleString()}`],
            ...Object.entries(
              filteredExpenses.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
                return acc;
              }, {})
            ).map(([cat, amount]) => [
              cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              "Expense",
              `SLE ${amount.toLocaleString()}`
            ]),
            ["Net Profit/Loss", "Total", `SLE ${netProfit.toLocaleString()}`]
          ],
          rawData: { sales: filteredSales, trips: filteredTrips, expenses: filteredExpenses }
        };
      }
      default:
        return null;
    }
  }, [showReport, reportType, dateFrom, dateTo, category, employeeFilter, sales, expenses, payrolls, trips]);

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setShowReport(true);
      setIsGenerating(false);
      toast({ title: "Report generated successfully" });
    }, 500);
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    let csvContent = `${reportData.title}\n`;
    csvContent += `Generated: ${format(new Date(), 'PPpp')}\n`;
    csvContent += `Period: ${format(parseISO(dateFrom), 'MMM d, yyyy')} - ${format(parseISO(dateTo), 'MMM d, yyyy')}\n\n`;
    
    // Summary
    csvContent += "Summary\n";
    reportData.summary.forEach(s => {
      csvContent += `${s.label},${s.value}\n`;
    });
    csvContent += "\n";
    
    // Data table
    csvContent += reportData.columns.join(",") + "\n";
    reportData.rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast({ title: "CSV exported successfully" });
  };

  const exportToPDF = () => {
    // Create a printable version
    const printContent = document.getElementById('report-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportData?.title || 'Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1EB053; border-bottom: 3px solid; border-image: linear-gradient(to right, #1EB053, #fff, #0072C6) 1; padding-bottom: 10px; }
            .header { margin-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-item { background: #f5f5f5; padding: 15px; border-radius: 8px; border-top: 3px solid #1EB053; }
            .summary-item.green { border-color: #1EB053; }
            .summary-item.red { border-color: #ef4444; }
            .summary-label { font-size: 12px; color: #666; }
            .summary-value { font-size: 18px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: linear-gradient(135deg, #1EB053, #0072C6); color: white; padding: 12px 8px; text-align: left; }
            td { padding: 10px 8px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportData?.title}</h1>
            <p>Generated: ${format(new Date(), 'PPpp')}</p>
            <p>Period: ${format(parseISO(dateFrom), 'MMMM d, yyyy')} - ${format(parseISO(dateTo), 'MMMM d, yyyy')}</p>
          </div>
          <div class="summary">
            ${reportData?.summary.map(s => `
              <div class="summary-item ${s.highlight || ''}">
                <div class="summary-label">${s.label}</div>
                <div class="summary-value">${s.value}</div>
              </div>
            `).join('')}
          </div>
          <table>
            <thead>
              <tr>${reportData?.columns.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${reportData?.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>🇸🇱 BFSE Management System - Sierra Leone</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast({ title: "PDF export ready - use Print dialog to save as PDF" });
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              reportType === type.id 
                ? 'ring-2 ring-[#1EB053] border-[#1EB053]' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => { setReportType(type.id); setShowReport(false); }}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                type.color === 'green' ? 'bg-green-100' :
                type.color === 'red' ? 'bg-red-100' :
                type.color === 'blue' ? 'bg-blue-100' : 'bg-amber-100'
              }`}>
                <type.icon className={`w-6 h-6 ${
                  type.color === 'green' ? 'text-green-600' :
                  type.color === 'red' ? 'text-red-600' :
                  type.color === 'blue' ? 'text-blue-600' : 'text-amber-600'
                }`} />
              </div>
              <p className="font-medium text-sm">{type.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Date From</Label>
              <Input 
                type="date" 
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setShowReport(false); }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input 
                type="date" 
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setShowReport(false); }}
                className="mt-1"
              />
            </div>
            {reportType === "expenses" && (
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); setShowReport(false); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {reportType !== "profit_loss" && (
              <div>
                <Label>Employee</Label>
                <Select value={employeeFilter} onValueChange={(v) => { setEmployeeFilter(v); setShowReport(false); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={generateReport} className="bg-[#1EB053] hover:bg-[#178f43]" disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><FileText className="w-4 h-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Output */}
      {showReport && reportData && (
        <Card id="report-content" className="border-t-4 border-t-[#1EB053]">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1EB053]" />
                  {reportData.title}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {format(parseISO(dateFrom), 'MMMM d, yyyy')} - {format(parseISO(dateTo), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {reportData.summary.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border-t-4 ${
                    item.highlight === 'green' ? 'bg-green-50 border-t-[#1EB053]' :
                    item.highlight === 'red' ? 'bg-red-50 border-t-red-500' :
                    'bg-gray-50 border-t-[#0072C6]'
                  }`}
                >
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className={`text-xl font-bold ${
                    item.highlight === 'green' ? 'text-[#1EB053]' :
                    item.highlight === 'red' ? 'text-red-500' :
                    'text-gray-900'
                  }`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Category Breakdown for Expenses */}
            {reportData.categoryBreakdown && Object.keys(reportData.categoryBreakdown).length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">By Category</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(reportData.categoryBreakdown).map(([cat, amount]) => (
                    <Badge key={cat} variant="secondary" className="px-3 py-1">
                      {cat.replace(/_/g, ' ')}: SLE {amount.toLocaleString()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Data Table */}
            {reportData.rows.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                      {reportData.columns.map((col, idx) => (
                        <TableHead key={idx} className="text-white font-semibold">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.rows.slice(0, 50).map((row, rowIdx) => (
                      <TableRow key={rowIdx} className="hover:bg-gray-50">
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx} className={cellIdx === row.length - 1 ? 'font-semibold' : ''}>
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {reportData.rows.length > 50 && (
                  <div className="p-3 text-center text-sm text-gray-500 bg-gray-50">
                    Showing 50 of {reportData.rows.length} records. Export to see all.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No data found for the selected filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}