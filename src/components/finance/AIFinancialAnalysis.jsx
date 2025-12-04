import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles, TrendingUp, TrendingDown, DollarSign, PiggyBank,
  AlertTriangle, Lightbulb, BarChart3, Target, RefreshCw,
  FileText, Download, ArrowUpRight, ArrowDownRight, Zap,
  Calendar, Building2, ShoppingCart, Truck, Clock
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";

export default function AIFinancialAnalysis({ 
  orgId, 
  expenses = [], 
  sales = [], 
  trips = [], 
  revenues = [],
  organisation 
}) {
  const [activeTab, setActiveTab] = useState("spending");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [forecastMonths, setForecastMonths] = useState(3);

  // Prepare financial data for AI analysis
  const financialData = useMemo(() => {
    const now = new Date();
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date || e.created_date);
        return d >= monthStart && d <= monthEnd;
      });
      
      const monthSales = sales.filter(s => {
        const d = new Date(s.created_date);
        return d >= monthStart && d <= monthEnd;
      });
      
      const monthTrips = trips.filter(t => {
        const d = new Date(t.date || t.created_date);
        return d >= monthStart && d <= monthEnd;
      });

      const expensesByCategory = {};
      monthExpenses.forEach(e => {
        const cat = e.category || 'other';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0);
      });

      monthlyData.push({
        month: format(date, 'MMM yyyy'),
        monthShort: format(date, 'MMM'),
        revenue: monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0) +
                 monthTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0),
        expenses: monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        expensesByCategory,
        salesCount: monthSales.length,
        tripCount: monthTrips.length,
        avgSaleValue: monthSales.length > 0 
          ? monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0) / monthSales.length 
          : 0
      });
    }

    return monthlyData;
  }, [expenses, sales, trips]);

  // AI Spending Analysis
  const { data: spendingAnalysis, isLoading: loadingSpending, refetch: refetchSpending } = useQuery({
    queryKey: ['ai-spending-analysis', orgId, expenses.length],
    queryFn: async () => {
      const expenseData = expenses.slice(0, 100).map(e => ({
        category: e.category,
        amount: e.amount,
        date: e.date,
        vendor: e.vendor
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these business expenses and identify cost-saving opportunities:

Expenses Data: ${JSON.stringify(expenseData)}

Monthly Trends: ${JSON.stringify(financialData)}

Provide:
1. Top 3 categories with highest spending and potential savings
2. Unusual spending patterns or anomalies
3. Specific actionable recommendations to reduce costs
4. Vendor consolidation opportunities
5. Seasonal patterns to prepare for`,
        response_json_schema: {
          type: "object",
          properties: {
            top_spending_categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  total_spent: { type: "number" },
                  percentage_of_total: { type: "number" },
                  potential_savings: { type: "number" },
                  saving_strategy: { type: "string" }
                }
              }
            },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  severity: { type: "string" },
                  amount_involved: { type: "number" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  estimated_savings: { type: "number" },
                  implementation_effort: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            seasonal_insights: { type: "string" },
            overall_health_score: { type: "number" }
          }
        }
      });
      return response;
    },
    enabled: !!orgId && expenses.length > 0,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // AI Cash Flow Forecast
  const { data: cashFlowForecast, isLoading: loadingCashFlow, refetch: refetchCashFlow } = useQuery({
    queryKey: ['ai-cashflow-forecast', orgId, forecastMonths, financialData.length],
    queryFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this historical financial data, forecast cash flow for the next ${forecastMonths} months:

Historical Monthly Data: ${JSON.stringify(financialData)}

Consider:
1. Seasonal trends in the data
2. Growth patterns
3. Economic factors for Sierra Leone businesses
4. Common business cycles

Provide month-by-month forecast with confidence levels.`,
        response_json_schema: {
          type: "object",
          properties: {
            forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  projected_revenue: { type: "number" },
                  projected_expenses: { type: "number" },
                  projected_net: { type: "number" },
                  confidence: { type: "number" },
                  key_factors: { type: "string" }
                }
              }
            },
            overall_trend: { type: "string" },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            opportunities: {
              type: "array",
              items: { type: "string" }
            },
            recommended_cash_reserve: { type: "number" }
          }
        },
        add_context_from_internet: true
      });
      return response;
    },
    enabled: !!orgId && financialData.length > 0,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // AI Revenue Insights
  const { data: revenueInsights, isLoading: loadingRevenue, refetch: refetchRevenue } = useQuery({
    queryKey: ['ai-revenue-insights', orgId, sales.length],
    queryFn: async () => {
      const salesData = sales.slice(0, 100).map(s => ({
        type: s.sale_type,
        amount: s.total_amount,
        items_count: s.items?.length || 0,
        payment_method: s.payment_method,
        date: s.created_date
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze sales data and provide revenue growth opportunities:

Sales Data: ${JSON.stringify(salesData)}
Monthly Trends: ${JSON.stringify(financialData)}

Identify:
1. Best performing sales channels
2. Growth opportunities by segment
3. Pricing optimization suggestions
4. Customer behavior patterns
5. Cross-selling/upselling opportunities`,
        response_json_schema: {
          type: "object",
          properties: {
            channel_performance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channel: { type: "string" },
                  revenue: { type: "number" },
                  growth_rate: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            growth_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  potential_revenue: { type: "number" },
                  implementation: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            pricing_insights: { type: "string" },
            customer_patterns: { type: "string" },
            top_recommendation: { type: "string" }
          }
        },
        add_context_from_internet: true
      });
      return response;
    },
    enabled: !!orgId && sales.length > 0,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // AI Financial Summary Generator
  const { data: financialSummary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['ai-financial-summary', orgId, financialData.length],
    queryFn: async () => {
      const totalRevenue = financialData.reduce((sum, m) => sum + m.revenue, 0);
      const totalExpenses = financialData.reduce((sum, m) => sum + m.expenses, 0);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an executive financial summary for this business:

Organisation: ${organisation?.name || 'Business'}
Period: Last 6 months
Total Revenue: Le ${totalRevenue.toLocaleString()}
Total Expenses: Le ${totalExpenses.toLocaleString()}
Net Profit: Le ${(totalRevenue - totalExpenses).toLocaleString()}

Monthly Breakdown: ${JSON.stringify(financialData)}

Create a professional executive summary suitable for stakeholders.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_highlights: {
              type: "array",
              items: { type: "string" }
            },
            financial_health: {
              type: "object",
              properties: {
                score: { type: "number" },
                status: { type: "string" },
                trend: { type: "string" }
              }
            },
            kpis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  trend: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            outlook: { type: "string" }
          }
        }
      });
      return response;
    },
    enabled: !!orgId && financialData.length > 0,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const handleRefreshAll = () => {
    setIsAnalyzing(true);
    Promise.all([
      refetchSpending(),
      refetchCashFlow(),
      refetchRevenue(),
      refetchSummary()
    ]).finally(() => {
      setIsAnalyzing(false);
      toast.success("Analysis refreshed");
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  // Prepare forecast chart data
  const forecastChartData = useMemo(() => {
    const historical = financialData.map(m => ({
      period: m.monthShort,
      revenue: m.revenue,
      expenses: m.expenses,
      net: m.revenue - m.expenses,
      type: 'historical'
    }));

    const forecast = cashFlowForecast?.forecast?.map(f => ({
      period: f.month?.slice(0, 3) || 'N/A',
      revenue: f.projected_revenue,
      expenses: f.projected_expenses,
      net: f.projected_net,
      type: 'forecast'
    })) || [];

    return [...historical, ...forecast];
  }, [financialData, cashFlowForecast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#1EB053]" />
            AI Financial Analysis
          </h2>
          <p className="text-sm text-gray-500">Intelligent insights powered by AI</p>
        </div>
        <Button 
          onClick={handleRefreshAll}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Quick Stats from AI Summary */}
      {financialSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-white border-t-4 border-t-[#1EB053]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  financialSummary.financial_health?.score >= 70 ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  <Target className={`w-6 h-6 ${getHealthColor(financialSummary.financial_health?.score || 0)}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Health Score</p>
                  <p className={`text-2xl font-bold ${getHealthColor(financialSummary.financial_health?.score || 0)}`}>
                    {financialSummary.financial_health?.score || 0}/100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {financialSummary.kpis?.slice(0, 3).map((kpi, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{kpi.name}</p>
                    <p className="text-lg font-bold text-[#0072C6]">{kpi.value}</p>
                  </div>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  ) : kpi.trend === 'down' ? (
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spending" className="gap-1">
            <PiggyBank className="w-4 h-4" />
            <span className="hidden sm:inline">Spending</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Cash Flow</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
        </TabsList>

        {/* Spending Analysis Tab */}
        <TabsContent value="spending" className="space-y-4 mt-4">
          {loadingSpending ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#1EB053] mx-auto animate-pulse mb-2" />
                  <p className="text-gray-500">Analyzing spending patterns...</p>
                </div>
              </CardContent>
            </Card>
          ) : spendingAnalysis ? (
            <>
              {/* Health Score */}
              <Card className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Spending Health Score</p>
                      <p className="text-xs text-gray-500">Based on spending patterns and efficiency</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={spendingAnalysis.overall_health_score || 70} className="w-32 h-3" />
                      <span className="font-bold text-lg">{spendingAnalysis.overall_health_score || 70}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Spending Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-red-500" />
                    Top Spending Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {spendingAnalysis.top_spending_categories?.map((cat, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold capitalize">{cat.category?.replace(/_/g, ' ')}</span>
                          <span className="text-lg font-bold">Le {cat.total_spent?.toLocaleString()}</span>
                        </div>
                        <Progress value={cat.percentage_of_total} className="h-2 mb-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{cat.percentage_of_total?.toFixed(1)}% of total</span>
                          <Badge className="bg-green-100 text-green-700">
                            Potential Savings: Le {cat.potential_savings?.toLocaleString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{cat.saving_strategy}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Cost-Saving Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {spendingAnalysis.recommendations?.map((rec, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#1EB053]" />
                            <span className="font-semibold">{rec.title}</span>
                          </div>
                          <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600 font-medium">
                            Est. Savings: Le {rec.estimated_savings?.toLocaleString()}
                          </span>
                          <span className="text-gray-500">Effort: {rec.implementation_effort}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Anomalies */}
              {spendingAnalysis.anomalies?.length > 0 && (
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Spending Anomalies Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {spendingAnalysis.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <span className="text-sm">{anomaly.description}</span>
                          <Badge variant="outline" className="border-amber-500 text-amber-700">
                            Le {anomaly.amount_involved?.toLocaleString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No spending data available for analysis
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cash Flow Forecast Tab */}
        <TabsContent value="cashflow" className="space-y-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium">Forecast Period:</span>
            <Select value={forecastMonths.toString()} onValueChange={(v) => setForecastMonths(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingCashFlow ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#1EB053] mx-auto animate-pulse mb-2" />
                  <p className="text-gray-500">Forecasting cash flow...</p>
                </div>
              </CardContent>
            </Card>
          ) : cashFlowForecast ? (
            <>
              {/* Forecast Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Forecast</CardTitle>
                  <CardDescription>Historical data + AI-powered projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => `Le ${value?.toLocaleString()}`} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#1EB053" 
                          fill="#1EB053" 
                          fillOpacity={0.3} 
                          name="Revenue" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#ef4444" 
                          fill="#ef4444" 
                          fillOpacity={0.3} 
                          name="Expenses" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="net" 
                          stroke="#0072C6" 
                          strokeWidth={2} 
                          name="Net Cash Flow" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Forecast Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Projections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-3">
                        {cashFlowForecast.forecast?.map((f, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{f.month}</span>
                              <Badge variant="outline">
                                {f.confidence}% confidence
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">Revenue</p>
                                <p className="font-semibold text-green-600">Le {f.projected_revenue?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Expenses</p>
                                <p className="font-semibold text-red-600">Le {f.projected_expenses?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Net</p>
                                <p className={`font-semibold ${f.projected_net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                  Le {f.projected_net?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{f.key_factors}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk & Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Risk Factors
                        </h4>
                        <ul className="space-y-1">
                          {cashFlowForecast.risk_factors?.map((risk, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Opportunities
                        </h4>
                        <ul className="space-y-1">
                          {cashFlowForecast.opportunities?.map((opp, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-400">•</span>
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Recommended Cash Reserve:</strong> Le {cashFlowForecast.recommended_cash_reserve?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No data available for forecasting
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Insights Tab */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          {loadingRevenue ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#1EB053] mx-auto animate-pulse mb-2" />
                  <p className="text-gray-500">Analyzing revenue opportunities...</p>
                </div>
              </CardContent>
            </Card>
          ) : revenueInsights ? (
            <>
              {/* Top Recommendation */}
              <Card className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Top Revenue Opportunity</p>
                      <p className="text-lg font-semibold">{revenueInsights.top_recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Channel Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#0072C6]" />
                    Channel Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueInsights.channel_performance?.map((channel, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold capitalize">{channel.channel}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Le {channel.revenue?.toLocaleString()}</span>
                            <Badge className={channel.growth_rate >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {channel.growth_rate >= 0 ? '+' : ''}{channel.growth_rate}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{channel.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Growth Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1EB053]" />
                    Growth Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {revenueInsights.growth_opportunities?.map((opp, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">{opp.opportunity}</h4>
                        <p className="text-sm text-gray-600 mb-3">{opp.implementation}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium">
                            +Le {opp.potential_revenue?.toLocaleString()}
                          </span>
                          <Badge variant="outline">{opp.timeline}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Patterns */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Customer Behavior Patterns</h4>
                  <p className="text-gray-600">{revenueInsights.customer_patterns}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No sales data available for analysis
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          {loadingSummary ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#1EB053] mx-auto animate-pulse mb-2" />
                  <p className="text-gray-500">Generating financial summary...</p>
                </div>
              </CardContent>
            </Card>
          ) : financialSummary ? (
            <>
              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0072C6]" />
                    Executive Summary
                  </CardTitle>
                  <CardDescription>AI-generated overview of your financial performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{financialSummary.executive_summary}</p>
                </CardContent>
              </Card>

              {/* Key Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {financialSummary.key_highlights?.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {financialSummary.kpis?.map((kpi, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">{kpi.name}</p>
                        <p className="text-xl font-bold text-[#0072C6]">{kpi.value}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {kpi.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : kpi.trend === 'down' ? (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          ) : null}
                          <Badge variant="outline" className={
                            kpi.status === 'good' ? 'text-green-600' : 
                            kpi.status === 'warning' ? 'text-amber-600' : 'text-gray-600'
                          }>
                            {kpi.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Strategic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {financialSummary.recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <Zap className="w-4 h-4 text-amber-600 mt-0.5" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Outlook */}
              <Card className="bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#0072C6]" />
                    Financial Outlook
                  </h4>
                  <p className="text-gray-700">{financialSummary.outlook}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No data available for summary generation
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}