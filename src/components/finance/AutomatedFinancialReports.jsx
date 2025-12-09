import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PieChart as PieIcon,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
  Eye,
  Printer,
  Send,
  Building2,
  Activity
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart } from "recharts";
import ReactMarkdown from "react-markdown";
import BalanceSheetGenerator from "./BalanceSheetGenerator";
import CashFlowStatement from "./CashFlowStatement";

export default function AutomatedFinancialReports({ 
  orgId, 
  sales = [], 
  expenses = [], 
  trips = [], 
  revenues = [],
  truckContracts = [],
  maintenanceRecords = [],
  organisation,
  products = [],
  bankDeposits = []
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState("pl");

  // Calculate date range
  const dateRange = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    switch (selectedPeriod) {
      case "all_time":
        return { start: new Date(2020, 0, 1), end: today, label: "All Time" };
      case "this_month":
        return { start: startOfMonth(today), end: endOfMonth(today), label: format(today, 'MMMM yyyy') };
      case "last_month":
        const lm = subMonths(today, 1);
        return { start: startOfMonth(lm), end: endOfMonth(lm), label: format(lm, 'MMMM yyyy') };
      case "last_3_months":
        return { start: startOfMonth(subMonths(today, 2)), end: endOfMonth(today), label: "Last 3 Months" };
      case "this_year":
        return { start: startOfYear(today), end: endOfMonth(today), label: format(today, 'yyyy') };
      case "last_year":
        return { start: new Date(currentYear - 1, 0, 1), end: new Date(currentYear - 1, 11, 31), label: (currentYear - 1).toString() };
      case "2024":
        return { start: new Date(2024, 0, 1), end: new Date(2024, 11, 31), label: "2024" };
      case "2023":
        return { start: new Date(2023, 0, 1), end: new Date(2023, 11, 31), label: "2023" };
      case "2022":
        return { start: new Date(2022, 0, 1), end: new Date(2022, 11, 31), label: "2022" };
      default:
        return { start: startOfMonth(today), end: endOfMonth(today), label: format(today, 'MMMM yyyy') };
    }
  }, [selectedPeriod]);

  // Filter data by period
  const periodData = useMemo(() => {
    const filterByDate = (items, dateField = 'created_date') => 
      items.filter(item => {
        const d = new Date(item[dateField] || item.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });

    const periodSales = filterByDate(sales);
    const periodExpenses = filterByDate(expenses, 'date');
    const periodTrips = filterByDate(trips, 'date');
    const periodRevenues = filterByDate(revenues, 'date');
    const periodContracts = filterByDate(truckContracts, 'contract_date');
    const periodMaintenance = filterByDate(maintenanceRecords, 'date_performed');

    return { periodSales, periodExpenses, periodTrips, periodRevenues, periodContracts, periodMaintenance };
  }, [sales, expenses, trips, revenues, truckContracts, maintenanceRecords, dateRange]);

  // Calculate P&L
  const profitLoss = useMemo(() => {
    const { periodSales, periodExpenses, periodTrips, periodRevenues, periodContracts, periodMaintenance } = periodData;

    // Revenue
    const salesRevenue = periodSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const transportRevenue = periodTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const contractRevenue = periodContracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.contract_amount || 0), 0);
    const otherRevenue = periodRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalRevenue = salesRevenue + transportRevenue + contractRevenue + otherRevenue;

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

    // Expense breakdown
    const expensesByCategory = {};
    periodExpenses.forEach(e => {
      const cat = e.category || 'other';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0);
    });

    return {
      revenue: { salesRevenue, transportRevenue, contractRevenue, otherRevenue, totalRevenue },
      expenses: { recordedExpenses, fuelCosts, tripOtherCosts, contractExpenses, maintenanceCosts, totalExpenses },
      netProfit,
      profitMargin,
      expensesByCategory,
      transactionCounts: {
        sales: periodSales.length,
        trips: periodTrips.length,
        contracts: periodContracts.length,
        revenues: periodRevenues.length
      }
    };
  }, [periodData]);

  // Monthly trend (last 6 months)
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

      const revenue = monthSales + monthTransport;
      const profit = revenue - monthExpenses;

      data.push({
        month: format(date, 'MMM'),
        revenue,
        expenses: monthExpenses,
        profit
      });
    }
    return data;
  }, [sales, trips, expenses]);

  // Generate AI Analysis
  const generateAIAnalysis = async () => {
    setGeneratingReport(true);
    try {
      const reportData = {
        period: dateRange.label,
        revenue: profitLoss.revenue,
        expenses: profitLoss.expenses,
        netProfit: profitLoss.netProfit,
        profitMargin: profitLoss.profitMargin.toFixed(1),
        transactionCounts: profitLoss.transactionCounts,
        expensesByCategory: profitLoss.expensesByCategory,
        monthlyTrend: monthlyTrend,
        topExpenses: Object.entries(profitLoss.expensesByCategory)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a financial analyst for a business in Sierra Leone. Analyze the following financial data and provide actionable insights.

**Financial Report for ${reportData.period}**

**Revenue Breakdown:**
- Sales Revenue: Le ${reportData.revenue.salesRevenue.toLocaleString()}
- Transport Revenue: Le ${reportData.revenue.transportRevenue.toLocaleString()}
- Contract Revenue: Le ${reportData.revenue.contractRevenue.toLocaleString()}
- Other Revenue: Le ${reportData.revenue.otherRevenue.toLocaleString()}
- **Total Revenue: Le ${reportData.revenue.totalRevenue.toLocaleString()}**

**Expense Breakdown:**
- Recorded Expenses: Le ${reportData.expenses.recordedExpenses.toLocaleString()}
- Fuel Costs: Le ${reportData.expenses.fuelCosts.toLocaleString()}
- Trip Costs: Le ${reportData.expenses.tripOtherCosts.toLocaleString()}
- Contract Expenses: Le ${reportData.expenses.contractExpenses.toLocaleString()}
- Maintenance: Le ${reportData.expenses.maintenanceCosts.toLocaleString()}
- **Total Expenses: Le ${reportData.expenses.totalExpenses.toLocaleString()}**

**Profitability:**
- Net Profit: Le ${reportData.netProfit.toLocaleString()}
- Profit Margin: ${reportData.profitMargin}%

**Top Expense Categories:**
${reportData.topExpenses.map(([cat, amt]) => `- ${cat}: Le ${amt.toLocaleString()}`).join('\n')}

**6-Month Trend:**
${reportData.monthlyTrend.map(m => `${m.month}: Revenue Le ${m.revenue.toLocaleString()}, Expenses Le ${m.expenses.toLocaleString()}, Profit Le ${m.profit.toLocaleString()}`).join('\n')}

Please provide:
1. **Executive Summary**: 2-3 sentences on overall financial health
2. **Key Insights**: 3-5 bullet points highlighting important observations
3. **Anomalies Detected**: Any unusual patterns or concerning trends
4. **Recommendations**: 3-5 specific, actionable recommendations to improve profitability
5. **Cash Flow Analysis**: Brief assessment of cash flow health
6. **Cost Optimization**: Specific areas where costs can be reduced

Format your response in markdown with clear sections.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            anomalies: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            cash_flow_analysis: { type: "string" },
            cost_optimization: { type: "array", items: { type: "string" } },
            risk_level: { type: "string", enum: ["low", "medium", "high"] },
            confidence_score: { type: "number" }
          }
        }
      });

      setAiAnalysis(result);
      toast.success("AI Analysis Complete", "Financial insights generated");
    } catch (error) {
      console.error("AI Analysis error:", error);
      toast.error("Analysis Failed", error.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const expenseBreakdownData = useMemo(() => {
    return Object.entries(profitLoss.expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        percentage: profitLoss.expenses.totalExpenses > 0 ? ((value / profitLoss.expenses.totalExpenses) * 100).toFixed(1) : 0
      }));
  }, [profitLoss]);

  const revenueBreakdownData = [
    { name: 'Sales', value: profitLoss.revenue.salesRevenue },
    { name: 'Transport', value: profitLoss.revenue.transportRevenue },
    { name: 'Contracts', value: profitLoss.revenue.contractRevenue },
    { name: 'Other', value: profitLoss.revenue.otherRevenue }
  ].filter(item => item.value > 0);

  const riskLevelColors = {
    low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  };

  const exportToCSV = (reportType) => {
    const orgName = organisation?.name || 'Organisation';
    let csvContent = `${orgName}\n${reportType}\nPeriod: ${dateRange.label}\nGenerated: ${format(new Date(), 'MMM d, yyyy')}\n\n`;
    
    csvContent += `REVENUE\n`;
    csvContent += `Sales Revenue,Le ${profitLoss.revenue.salesRevenue.toLocaleString()}\n`;
    csvContent += `Transport Revenue,Le ${profitLoss.revenue.transportRevenue.toLocaleString()}\n`;
    csvContent += `Contract Revenue,Le ${profitLoss.revenue.contractRevenue.toLocaleString()}\n`;
    csvContent += `Other Revenue,Le ${profitLoss.revenue.otherRevenue.toLocaleString()}\n`;
    csvContent += `Total Revenue,Le ${profitLoss.revenue.totalRevenue.toLocaleString()}\n\n`;
    
    csvContent += `EXPENSES\n`;
    csvContent += `Recorded Expenses,Le ${profitLoss.expenses.recordedExpenses.toLocaleString()}\n`;
    csvContent += `Fuel Costs,Le ${profitLoss.expenses.fuelCosts.toLocaleString()}\n`;
    csvContent += `Trip Expenses,Le ${profitLoss.expenses.tripOtherCosts.toLocaleString()}\n`;
    csvContent += `Contract Expenses,Le ${profitLoss.expenses.contractExpenses.toLocaleString()}\n`;
    csvContent += `Maintenance,Le ${profitLoss.expenses.maintenanceCosts.toLocaleString()}\n`;
    csvContent += `Total Expenses,Le ${profitLoss.expenses.totalExpenses.toLocaleString()}\n\n`;
    
    csvContent += `NET PROFIT,Le ${profitLoss.netProfit.toLocaleString()}\n`;
    csvContent += `Profit Margin,${profitLoss.profitMargin.toFixed(1)}%\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("CSV exported");
  };

  const exportToPDF = (reportType) => {
    window.print();
    toast.success("Print dialog opened");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#1EB053]" />
            Automated Financial Reports
          </h2>
          <p className="text-sm text-gray-500">AI-powered insights and comprehensive financial analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={generateAIAnalysis}
            disabled={generatingReport}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {generatingReport ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Report
              </>
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
                <p className="text-xl font-bold text-[#1EB053]">Le {profitLoss.revenue.totalRevenue.toLocaleString()}</p>
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
                <p className="text-xl font-bold text-red-500">Le {profitLoss.expenses.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${profitLoss.netProfit >= 0 ? 'border-l-[#0072C6]' : 'border-l-orange-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profitLoss.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <DollarSign className={`w-5 h-5 ${profitLoss.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Net Profit</p>
                <p className={`text-xl font-bold ${profitLoss.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-500'}`}>
                  Le {profitLoss.netProfit.toLocaleString()}
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
                <p className="text-xl font-bold text-[#D4AF37]">{profitLoss.profitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <Card className="overflow-hidden border-2 border-[#1EB053]/20">
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1EB053]" />
                AI Financial Analysis
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${riskLevelColors[aiAnalysis.risk_level]?.bg} ${riskLevelColors[aiAnalysis.risk_level]?.text}`}>
                  Risk: {aiAnalysis.risk_level}
                </Badge>
                <Badge variant="outline">
                  Confidence: {(aiAnalysis.confidence_score * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Executive Summary
                </h3>
                <p className="text-sm text-blue-800">{aiAnalysis.executive_summary}</p>
              </div>

              {/* Key Insights */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#1EB053]" />
                  Key Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {aiAnalysis.key_insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomalies */}
              {aiAnalysis.anomalies && aiAnalysis.anomalies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Anomalies Detected
                  </h3>
                  <div className="space-y-2">
                    {aiAnalysis.anomalies.map((anomaly, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{anomaly}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0072C6]" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-6 h-6 rounded-full bg-[#0072C6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Flow Analysis */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Cash Flow Analysis
                </h3>
                <p className="text-sm text-purple-800">{aiAnalysis.cash_flow_analysis}</p>
              </div>

              {/* Cost Optimization */}
              {aiAnalysis.cost_optimization && aiAnalysis.cost_optimization.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    Cost Optimization Opportunities
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {aiAnalysis.cost_optimization.map((opt, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{opt}</p>
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
      <Tabs value={activeReportTab} onValueChange={setActiveReportTab}>
        <div className="rounded-lg overflow-hidden border">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <TabsList className="bg-gray-100 p-1 w-full justify-start">
            <TabsTrigger 
              value="pl" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-1" />
              P&L Statement
            </TabsTrigger>
            <TabsTrigger 
              value="balance_sheet" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
            >
              <Building2 className="w-4 h-4 mr-1" />
              Balance Sheet
            </TabsTrigger>
            <TabsTrigger 
              value="cash_flow" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-1" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
            >
              <PieIcon className="w-4 h-4 mr-1" />
              Expense Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="trends" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Trends
            </TabsTrigger>
          </TabsList>
        </div>

        {/* P&L Statement */}
        <TabsContent value="pl" className="mt-6">
          <Card className="overflow-hidden">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <CardDescription>{dateRange.label}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToPDF('pl')}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV('pl')}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Revenue Section */}
                <div>
                  <div className="flex items-center justify-between py-2 border-b-2 border-green-200 bg-green-50 px-3 rounded-t-lg">
                    <span className="font-bold text-green-800">REVENUE</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-gray-600">Sales Revenue</span>
                      <span className="font-medium">Le {profitLoss.revenue.salesRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-gray-50">
                      <span className="text-gray-600">Transport Revenue</span>
                      <span className="font-medium">Le {profitLoss.revenue.transportRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-gray-600">Contract Revenue</span>
                      <span className="font-medium">Le {profitLoss.revenue.contractRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-gray-50">
                      <span className="text-gray-600">Other Revenue</span>
                      <span className="font-medium">Le {profitLoss.revenue.otherRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-3 bg-green-100 rounded-lg font-bold text-green-800">
                      <span>Total Revenue</span>
                      <span>Le {profitLoss.revenue.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div>
                  <div className="flex items-center justify-between py-2 border-b-2 border-red-200 bg-red-50 px-3 rounded-t-lg">
                    <span className="font-bold text-red-800">EXPENSES</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-gray-600">Recorded Expenses</span>
                      <span className="font-medium">Le {profitLoss.expenses.recordedExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-gray-50">
                      <span className="text-gray-600">Fuel Costs</span>
                      <span className="font-medium">Le {profitLoss.expenses.fuelCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-gray-600">Trip Expenses</span>
                      <span className="font-medium">Le {profitLoss.expenses.tripOtherCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-gray-50">
                      <span className="text-gray-600">Contract Expenses</span>
                      <span className="font-medium">Le {profitLoss.expenses.contractExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-gray-600">Maintenance</span>
                      <span className="font-medium">Le {profitLoss.expenses.maintenanceCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-3 py-3 bg-red-100 rounded-lg font-bold text-red-800">
                      <span>Total Expenses</span>
                      <span>Le {profitLoss.expenses.totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div className={`p-4 rounded-lg ${profitLoss.netProfit >= 0 ? 'bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10' : 'bg-orange-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900">NET PROFIT</span>
                      <p className="text-sm text-gray-600">Profit Margin: {profitLoss.profitMargin.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${profitLoss.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-600'}`}>
                        Le {profitLoss.netProfit.toLocaleString()}
                      </p>
                      {profitLoss.netProfit >= 0 ? (
                        <Badge className="bg-green-100 text-green-700">Profitable</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">Loss</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance_sheet" className="mt-6">
          <BalanceSheetGenerator
            sales={periodData.periodSales}
            expenses={periodData.periodExpenses}
            revenues={periodData.periodRevenues}
            bankDeposits={bankDeposits || []}
            products={products || []}
            dateRange={dateRange}
          />
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cash_flow" className="mt-6">
          <CashFlowStatement
            sales={periodData.periodSales}
            expenses={periodData.periodExpenses}
            revenues={periodData.periodRevenues}
            bankDeposits={bankDeposits || []}
            trips={periodData.periodTrips}
            dateRange={dateRange}
          />
        </TabsContent>

        {/* Expense Analysis */}
        <TabsContent value="expenses" className="mt-6">
          <Card className="overflow-hidden">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardHeader>
              <CardTitle>Expense Breakdown Analysis</CardTitle>
              <CardDescription>Detailed view of expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseBreakdownData.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{item.percentage}%</Badge>
                        <span className="font-bold text-gray-900">Le {item.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="mt-6">
          <Card className="overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  #1EB053 0px,
                  #1EB053 10px,
                  #FFFFFF 10px,
                  #FFFFFF 20px,
                  #0072C6 20px,
                  #0072C6 30px,
                  transparent 30px,
                  transparent 60px
                )`
              }} />
            </div>

            <div className="h-1.5 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardHeader>
              <CardTitle>6-Month Financial Trend</CardTitle>
              <CardDescription>Revenue, expenses, and profit over time</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart 
                  data={monthlyTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1EB053" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1EB053" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="profitLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1EB053" />
                      <stop offset="50%" stopColor="#0072C6" />
                      <stop offset="100%" stopColor="#1EB053" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                  />
                  <YAxis 
                    tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`}
                    stroke="#9ca3af"
                    style={{ fontSize: '11px' }}
                    axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`Le ${value.toLocaleString()}`, name]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #1EB053',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#0F1F3C', marginBottom: '6px', fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1EB053"
                    strokeWidth={2}
                    fill="url(#revenueAreaGrad)"
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#expenseAreaGrad)"
                    name="Expenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="url(#profitLineGrad)"
                    strokeWidth={3}
                    dot={{ fill: '#0072C6', strokeWidth: 2, r: 5, stroke: 'white' }}
                    activeDot={{ r: 7, strokeWidth: 3, stroke: '#1EB053' }}
                    name="Net Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}