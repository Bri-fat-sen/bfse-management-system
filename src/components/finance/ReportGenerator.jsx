import React, { useState, useMemo, useEffect } from "react";
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
import { base44 } from "@/api/base44Client";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

const reportTypes = [
  { id: "sales", name: "Sales Report", icon: ShoppingCart, color: "green" },
  { id: "expenses", name: "Expense Report", icon: TrendingDown, color: "red" },
  { id: "profit_loss", name: "Profit & Loss", icon: DollarSign, color: "gold" },
];

const expenseCategories = [
  "all", "fuel", "maintenance", "utilities", "supplies", "rent", 
  "salaries", "transport", "marketing", "insurance", "petty_cash", "other"
];

export default function ReportGenerator({ sales = [], expenses = [], employees = [], trips = [], organisation }) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("sales");
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [category, setCategory] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setShowReport(false);
  }, [reportType, dateFrom, dateTo, category, employeeFilter]);

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
        
        // Sort categories by amount (highest first) - VERIFIED
        const sortedCategories = Object.entries(byCategory)
          .sort((a, b) => b[1] - a[1]);
        const byCategorySorted = Object.fromEntries(sortedCategories);
        return {
          title: "Expense Report",
          summary: [
            { label: "Total Expenses", value: filteredExpenses.length },
            { label: "Total Amount", value: `SLE ${totalAmount.toLocaleString()}` },
            { label: "Approved", value: filteredExpenses.filter(e => e.status === 'approved').length },
            { label: "Pending", value: filteredExpenses.filter(e => e.status === 'pending').length },
          ],
          categoryBreakdown: byCategorySorted,
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
  }, [showReport, reportType, dateFrom, dateTo, category, employeeFilter, sales, expenses, trips]);

  const generateReport = () => {
    if (!dateFrom || !dateTo) {
      toast({ title: "Please select date range", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setShowReport(true);
      setIsGenerating(false);
      toast({ title: "Report generated successfully" });
    }, 500);
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    exportToCSV(
      reportData.columns,
      reportData.rows,
      `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      organisation
    );
    toast({ title: "CSV exported successfully" });
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
    
    setIsGenerating(true);
    
    // Convert summary to cards format
    const summaryCards = reportData.summary.map(item => ({
      label: item.label,
      value: item.value,
      highlight: item.highlight === 'green' ? 'green' : item.highlight === 'red' ? 'red' : undefined
    }));

    // Build sections
    const sections = [];
    
    // Add category breakdown if exists
    if (reportData.categoryBreakdown && Object.keys(reportData.categoryBreakdown).length > 0) {
      sections.push({
        title: 'By Category',
        icon: '📊',
        breakdown: reportData.categoryBreakdown
      });
    }
    
    // Add data table
    sections.push({
      title: 'Details',
      icon: '📋',
      table: {
        columns: reportData.columns,
        rows: reportData.rows
      }
    });

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: reportData.title,
      organisation: organisation,
      infoBar: [{ label: 'Period', value: `${format(parseISO(dateFrom), 'MMM d, yyyy')} - ${format(parseISO(dateTo), 'MMM d, yyyy')}` }],
      summaryCards: summaryCards,
      sections: sections
    });
    
    const fileName = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    printUnifiedPDF(html, fileName);
    
    // Save to Drive automatically in background
    base44.functions.invoke('saveToDrive', {
      reportData: {
        title: reportData.title,
        period: `${format(parseISO(dateFrom), 'MMM d, yyyy')} - ${format(parseISO(dateTo), 'MMM d, yyyy')}`,
        summary: reportData.summary,
        columns: reportData.columns,
        rows: reportData.rows
      },
      fileName: fileName
    }).then(result => {
      if (result.data.success) {
        toast({ 
          title: "Also saved to Google Drive",
          description: fileName 
        });
      }
    }).catch(error => {
      console.log('Drive save skipped:', error.message);
    });
    
    setIsGenerating(false);
    toast({ title: "Report downloaded" });
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
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
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
                <h4 className="font-semibold mb-3">By Category (Highest to Lowest)</h4>
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