import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
  Eye,
  Building2,
  Wallet,
  PieChart as PieIcon,
  Printer,
  FileSpreadsheet,
  FileBarChart,
  Lightbulb,
  Landmark
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, Line } from "recharts";

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#0F1F3C', '#9333ea', '#f59e0b', '#ef4444', '#10b981'];

export default function UnifiedFinancialReports({ 
  orgId, 
  sales = [], 
  expenses = [], 
  trips = [], 
  revenues = [],
  truckContracts = [],
  maintenanceRecords = [],
  bankDeposits = [],
  organisation,
  payrolls = []
}) {
  const toast = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("pl");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("pl_statement");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportOptions, setExportOptions] = useState({
    includeLogo: true,
    includeCharts: true,
    includeAIAnalysis: true,
    includeNotes: true,
  });

  // Calculate date range
  const dateRange = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    switch (selectedPeriod) {
      case "all_time": return { start: new Date(2020, 0, 1), end: today, label: "All Time" };
      case "this_month": return { start: startOfMonth(today), end: endOfMonth(today), label: format(today, 'MMMM yyyy') };
      case "last_month": 
        const lm = subMonths(today, 1);
        return { start: startOfMonth(lm), end: endOfMonth(lm), label: format(lm, 'MMMM yyyy') };
      case "last_3_months": return { start: startOfMonth(subMonths(today, 2)), end: endOfMonth(today), label: "Last 3 Months" };
      case "this_year": return { start: startOfYear(today), end: endOfMonth(today), label: format(today, 'yyyy') };
      case "last_year": return { start: new Date(currentYear - 1, 0, 1), end: new Date(currentYear - 1, 11, 31), label: (currentYear - 1).toString() };
      default: return { start: startOfMonth(today), end: endOfMonth(today), label: format(today, 'MMMM yyyy') };
    }
  }, [selectedPeriod]);

  // Filter data by period
  const periodData = useMemo(() => {
    const filterByDate = (items, dateField = 'created_date') => 
      items.filter(item => {
        const d = new Date(item[dateField] || item.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });

    return {
      periodSales: filterByDate(sales),
      periodExpenses: filterByDate(expenses, 'date'),
      periodTrips: filterByDate(trips, 'date'),
      periodRevenues: filterByDate(revenues, 'date'),
      periodContracts: filterByDate(truckContracts, 'contract_date'),
      periodMaintenance: filterByDate(maintenanceRecords, 'date_performed'),
      periodDeposits: filterByDate(bankDeposits, 'date')
    };
  }, [sales, expenses, trips, revenues, truckContracts, maintenanceRecords, bankDeposits, dateRange]);

  // Calculate comprehensive financials
  const financials = useMemo(() => {
    const { periodSales, periodExpenses, periodTrips, periodRevenues, periodContracts, periodMaintenance, periodDeposits } = periodData;

    // Revenue
    const salesRevenue = periodSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const transportRevenue = periodTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const contractRevenue = periodContracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.contract_amount || 0), 0);
    const ownerContributions = periodRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalRevenue = salesRevenue + transportRevenue + contractRevenue + ownerContributions;

    // Expenses
    const recordedExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const fuelCosts = periodTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
    const tripOtherCosts = periodTrips.reduce((sum, t) => sum + (t.other_expenses || 0), 0);
    const contractExpenses = periodContracts.reduce((sum, c) => sum + (c.total_expenses || 0), 0);
    const maintenanceCosts = periodMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
    const totalExpenses = recordedExpenses + fuelCosts + tripOtherCosts + contractExpenses + maintenanceCosts;

    // Profit
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    // Banking
    const totalBankDeposits = periodDeposits.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + (d.amount || 0), 0);
    const cashOnHand = totalRevenue - totalBankDeposits;

    // Expense breakdown
    const expensesByCategory = {};
    periodExpenses.forEach(e => {
      const cat = e.category || 'other';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0);
    });

    return {
      revenue: { salesRevenue, transportRevenue, contractRevenue, ownerContributions, totalRevenue },
      expenses: { recordedExpenses, fuelCosts, tripOtherCosts, contractExpenses, maintenanceCosts, totalExpenses },
      netProfit,
      profitMargin,
      expensesByCategory,
      banking: { totalBankDeposits, cashOnHand }
    };
  }, [periodData]);

  // Monthly trend (6 months)
  const monthlyTrend = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthSales = sales.filter(s => {
        const d = new Date(s.created_date);
        return d >= monthStart && d <= monthEnd;
      }).reduce((sum, s) => sum + (s.total_amount || 0), 0);

      const monthTransport = trips.filter(t => {
        const d = new Date(t.date);
        return d >= monthStart && d <= monthEnd;
      }).reduce((sum, t) => sum + (t.total_revenue || 0), 0);

      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date || e.created_date);
        return d >= monthStart && d <= monthEnd;
      }).reduce((sum, e) => sum + (e.amount || 0), 0);

      data.push({
        month: format(date, 'MMM'),
        revenue: monthSales + monthTransport,
        expenses: monthExpenses,
        profit: (monthSales + monthTransport) - monthExpenses
      });
    }
    return data;
  }, [sales, trips, expenses]);

  // Charts data
  const expenseBreakdownData = useMemo(() => 
    Object.entries(financials.expensesByCategory)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        percentage: financials.expenses.totalExpenses > 0 ? ((value / financials.expenses.totalExpenses) * 100).toFixed(1) : 0
      })),
    [financials]
  );

  const revenueBreakdownData = [
    { name: 'Sales', value: financials.revenue.salesRevenue },
    { name: 'Transport', value: financials.revenue.transportRevenue },
    { name: 'Contracts', value: financials.revenue.contractRevenue },
    { name: 'Owner/CEO', value: financials.revenue.ownerContributions }
  ].filter(item => item.value > 0);

  // Generate AI Analysis
  const generateAIAnalysis = async () => {
    setGeneratingReport(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this financial data for ${dateRange.label}:

Revenue: Le ${financials.revenue.totalRevenue.toLocaleString()}
- Sales: Le ${financials.revenue.salesRevenue.toLocaleString()}
- Transport: Le ${financials.revenue.transportRevenue.toLocaleString()}
- Contracts: Le ${financials.revenue.contractRevenue.toLocaleString()}
- Owner/CEO: Le ${financials.revenue.ownerContributions.toLocaleString()}

Expenses: Le ${financials.expenses.totalExpenses.toLocaleString()}
- Recorded: Le ${financials.expenses.recordedExpenses.toLocaleString()}
- Fuel: Le ${financials.expenses.fuelCosts.toLocaleString()}
- Maintenance: Le ${financials.expenses.maintenanceCosts.toLocaleString()}

Net Profit: Le ${financials.netProfit.toLocaleString()} (${financials.profitMargin.toFixed(1)}%)

Provide executive summary, key insights, anomalies, recommendations, cash flow analysis, and cost optimization suggestions.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            anomalies: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            cash_flow_analysis: { type: "string" },
            cost_optimization: { type: "array", items: { type: "string" } },
            risk_level: { type: "string", enum: ["low", "medium", "high"] }
          }
        }
      });

      setAiAnalysis(result);
      toast.success("AI Analysis Complete", "Financial insights generated");
    } catch (error) {
      toast.error("Analysis Failed", error.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Export handlers
  const exportToCSV = (reportType) => {
    let csvContent = "";
    let filename = "";

    if (reportType === "pl_statement") {
      filename = `PL_Statement_${dateRange.label.replace(/\s/g, '_')}.csv`;
      csvContent = `Profit & Loss Statement\nPeriod,${dateRange.label}\n\n`;
      csvContent += "Category,Amount (Le)\n";
      csvContent += `Sales Revenue,${financials.revenue.salesRevenue}\n`;
      csvContent += `Transport Revenue,${financials.revenue.transportRevenue}\n`;
      csvContent += `Total Revenue,${financials.revenue.totalRevenue}\n\n`;
      csvContent += `Recorded Expenses,${financials.expenses.recordedExpenses}\n`;
      csvContent += `Total Expenses,${financials.expenses.totalExpenses}\n\n`;
      csvContent += `Net Profit,${financials.netProfit}\n`;
      csvContent += `Profit Margin (%),${financials.profitMargin.toFixed(2)}\n`;
    } else if (reportType === "cash_flow") {
      filename = `Cash_Flow_${dateRange.label.replace(/\s/g, '_')}.csv`;
      csvContent = `Cash Flow Statement\nPeriod,${dateRange.label}\n\n`;
      csvContent += "Activity,Amount (Le)\n";
      csvContent += `Operating Cash,${financials.revenue.totalRevenue - financials.expenses.totalExpenses}\n`;
      csvContent += `Bank Deposits,${financials.banking.totalBankDeposits}\n`;
      csvContent += `Cash On Hand,${financials.banking.cashOnHand}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("CSV exported", `Downloaded ${filename}`);
  };

  const exportToPDF = async (reportType) => {
    try {
      const response = await base44.functions.invoke('generateFinancialReportPDF', {
        reportData: {
          title: reportType === "pl_statement" ? "Profit & Loss Statement" : "Cash Flow Statement",
          period: dateRange.label,
          organisation,
          revenue: financials.revenue,
          expenses: financials.expenses,
          netProfit: financials.netProfit,
          profitMargin: financials.profitMargin
        },
        reportType,
        exportOptions,
        aiAnalysis: exportOptions.includeAIAnalysis ? aiAnalysis : null,
        monthlyTrend: exportOptions.includeCharts ? monthlyTrend : null
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_${dateRange.label.replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated", "Report downloaded");
    } catch (error) {
      toast.error("PDF generation failed", error.message);
    }
  };

  const handleExport = () => {
    if (exportFormat === "csv") {
      exportToCSV(selectedReportType);
    } else {
      exportToPDF(selectedReportType);
    }
    setShowExportDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#1EB053]" />
            Financial Reports
          </h2>
          <p className="text-sm text-gray-500">Comprehensive financial analysis and reporting</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="border-[#0072C6] text-[#0072C6] hover:bg-[#0072C6]/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={generateAIAnalysis}
            disabled={generatingReport}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {generatingReport ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />AI Analysis</>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Revenue</p>
                <p className="text-xl font-bold text-[#1EB053]">Le {financials.revenue.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Expenses</p>
                <p className="text-xl font-bold text-red-500">Le {financials.expenses.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${financials.netProfit >= 0 ? 'border-l-[#0072C6]' : 'border-l-orange-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${financials.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <DollarSign className={`w-5 h-5 ${financials.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Net Profit</p>
                <p className={`text-xl font-bold ${financials.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-500'}`}>
                  Le {financials.netProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#D4AF37]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Margin</p>
                <p className="text-xl font-bold text-[#D4AF37]">{financials.profitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className="overflow-hidden border-2 border-[#1EB053]/20">
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1EB053]" />
              AI Financial Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Executive Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summary
                </h3>
                <p className="text-sm text-blue-800">{aiAnalysis.executive_summary}</p>
              </div>

              {/* Key Insights */}
              {aiAnalysis.key_insights?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#1EB053]" />
                    Key Insights
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {aiAnalysis.key_insights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {aiAnalysis.recommendations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#0072C6]" />
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {aiAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-6 h-6 rounded-full bg-[#0072C6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="rounded-lg overflow-hidden border">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <TabsList className="bg-gray-100 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="pl" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-1" />
              P&L Statement
            </TabsTrigger>
            <TabsTrigger value="cash_flow" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <Wallet className="w-4 h-4 mr-1" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <PieIcon className="w-4 h-4 mr-1" />
              Breakdown
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-1" />
              Trends
            </TabsTrigger>
          </TabsList>
        </div>

        {/* P&L Statement */}
        <TabsContent value="pl" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>{dateRange.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Revenue */}
              <div>
                <div className="flex items-center justify-between py-2 border-b-2 border-green-200 bg-green-50 px-3 rounded-t-lg">
                  <span className="font-bold text-green-800">REVENUE</span>
                </div>
                <div className="space-y-2 mt-2">
                  {[
                    { label: 'Sales Revenue', amount: financials.revenue.salesRevenue },
                    { label: 'Transport Revenue', amount: financials.revenue.transportRevenue },
                    { label: 'Contract Revenue', amount: financials.revenue.contractRevenue },
                    { label: 'Owner/CEO Contributions', amount: financials.revenue.ownerContributions }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex justify-between px-3 py-2 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">Le {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-3 bg-green-100 rounded-lg font-bold text-green-800">
                    <span>Total Revenue</span>
                    <span>Le {financials.revenue.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <div className="flex items-center justify-between py-2 border-b-2 border-red-200 bg-red-50 px-3 rounded-t-lg">
                  <span className="font-bold text-red-800">EXPENSES</span>
                </div>
                <div className="space-y-2 mt-2">
                  {[
                    { label: 'Recorded Expenses', amount: financials.expenses.recordedExpenses },
                    { label: 'Fuel Costs', amount: financials.expenses.fuelCosts },
                    { label: 'Trip Expenses', amount: financials.expenses.tripOtherCosts },
                    { label: 'Contract Expenses', amount: financials.expenses.contractExpenses },
                    { label: 'Maintenance', amount: financials.expenses.maintenanceCosts }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex justify-between px-3 py-2 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">Le {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-3 bg-red-100 rounded-lg font-bold text-red-800">
                    <span>Total Expenses</span>
                    <span>Le {financials.expenses.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className={`p-4 rounded-lg ${financials.netProfit >= 0 ? 'bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10' : 'bg-orange-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">NET PROFIT</span>
                    <p className="text-sm text-gray-600">Profit Margin: {financials.profitMargin.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${financials.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-600'}`}>
                      Le {financials.netProfit.toLocaleString()}
                    </p>
                    <Badge className={financials.netProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {financials.netProfit >= 0 ? 'Profitable' : 'Loss'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow */}
        <TabsContent value="cash_flow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#1EB053]" />
                Cash Flow Analysis
              </CardTitle>
              <CardDescription>{dateRange.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-[#1EB053]">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Cash Inflow</p>
                    <p className="text-2xl font-bold text-[#1EB053]">Le {financials.revenue.totalRevenue.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Cash Outflow</p>
                    <p className="text-2xl font-bold text-red-500">Le {financials.expenses.totalExpenses.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-[#0072C6]">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">In Bank</p>
                    <p className="text-2xl font-bold text-[#0072C6]">Le {financials.banking.totalBankDeposits.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Banking Visual */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Revenue to Bank Ratio</span>
                  <span className="font-medium">
                    {financials.revenue.totalRevenue > 0 
                      ? ((financials.banking.totalBankDeposits / financials.revenue.totalRevenue) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                    style={{ width: `${financials.revenue.totalRevenue > 0 ? (financials.banking.totalBankDeposits / financials.revenue.totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown */}
        <TabsContent value="breakdown" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${((entry.value / financials.revenue.totalRevenue) * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseBreakdownData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{item.percentage}%</Badge>
                          <span className="text-sm font-bold">Le {item.value.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Financial Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1EB053" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1EB053" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} stroke="#9ca3af" />
                  <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#1EB053" fill="url(#revGrad)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#0072C6" strokeWidth={3} dot={{ fill: '#0072C6', r: 4 }} name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl w-[95vw] [&>button]:hidden">
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              Export Financial Report
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Report Type */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Select Report</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "pl_statement", label: "P&L Statement", icon: FileText, color: "green" },
                  { value: "cash_flow", label: "Cash Flow", icon: Wallet, color: "blue" }
                ].map(report => (
                  <button
                    key={report.value}
                    onClick={() => setSelectedReportType(report.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedReportType === report.value
                        ? `border-${report.color}-500 bg-${report.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <report.icon className={`w-8 h-8 mx-auto mb-2 ${selectedReportType === report.value ? `text-${report.color}-600` : 'text-gray-400'}`} />
                    <p className="font-semibold text-sm">{report.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat("pdf")}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    exportFormat === "pdf" ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <FileBarChart className={`w-6 h-6 ${exportFormat === "pdf" ? 'text-red-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">PDF</p>
                    <p className="text-xs text-gray-500">Professional</p>
                  </div>
                </button>
                <button
                  onClick={() => setExportFormat("csv")}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    exportFormat === "csv" ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <FileSpreadsheet className={`w-6 h-6 ${exportFormat === "csv" ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">CSV</p>
                    <p className="text-xs text-gray-500">Spreadsheet</p>
                  </div>
                </button>
              </div>
            </div>

            {/* PDF Options */}
            {exportFormat === "pdf" && (
              <div>
                <Label className="text-sm font-semibold mb-3 block">PDF Options</Label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                  {[
                    { id: 'includeLogo', label: 'Include logo and branding', key: 'includeLogo' },
                    { id: 'includeCharts', label: 'Include charts', key: 'includeCharts' },
                    { id: 'includeAIAnalysis', label: 'Include AI insights', key: 'includeAIAnalysis', disabled: !aiAnalysis },
                    { id: 'includeNotes', label: 'Include notes', key: 'includeNotes' }
                  ].map(option => (
                    <div key={option.id} className="flex items-center gap-2">
                      <Checkbox
                        id={option.id}
                        checked={exportOptions[option.key]}
                        onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, [option.key]: checked }))}
                        disabled={option.disabled}
                      />
                      <Label htmlFor={option.id} className="text-sm cursor-pointer">
                        {option.label} {option.disabled && "(Generate AI report first)"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Export Preview</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {selectedReportType === "pl_statement" ? "P&L Statement" : "Cash Flow Statement"}
                    {" - "}{dateRange.label}{" - "}{exportFormat.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}