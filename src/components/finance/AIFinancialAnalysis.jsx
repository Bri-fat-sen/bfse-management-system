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
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Lightbulb, PiggyBank, BarChart3, FileText, RefreshCw, Download,
  DollarSign, Target, Zap, ArrowUpRight, ArrowDownRight, Brain,
  Calendar, Printer
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from "recharts";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

export default function AIFinancialAnalysis({ orgId, expenses = [], sales = [], trips = [], organisation }) {
  const [activeTab, setActiveTab] = useState("spending");
  const [analysisLoading, setAnalysisLoading] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});

  // Prepare financial data for analysis
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

      const expenseTotal = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const salesTotal = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const transportRevenue = monthTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
      const revenue = salesTotal + transportRevenue;

      // Group expenses by category
      const expensesByCategory = {};
      monthExpenses.forEach(e => {
        const cat = e.category || 'other';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0);
      });

      monthlyData.push({
        month: format(date, 'MMM yyyy'),
        monthShort: format(date, 'MMM'),
        revenue,
        expenses: expenseTotal,
        profit: revenue - expenseTotal,
        salesCount: monthSales.length,
        expensesByCategory
      });
    }

    return {
      monthly: monthlyData,
      totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
      totalExpenses: monthlyData.reduce((sum, m) => sum + m.expenses, 0),
      totalProfit: monthlyData.reduce((sum, m) => sum + m.profit, 0),
      avgMonthlyRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0) / 6,
      avgMonthlyExpenses: monthlyData.reduce((sum, m) => sum + m.expenses, 0) / 6
    };
  }, [expenses, sales, trips]);

  // Run AI Analysis
  const runAnalysis = async (type) => {
    setAnalysisLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      let prompt = "";
      let schema = {};

      switch (type) {
        case "spending":
          // Calculate category totals across all 6 months
          const categoryTotals = {};
          financialData.monthly.forEach(m => {
            Object.entries(m.expensesByCategory || {}).forEach(([cat, amount]) => {
              categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
            });
          });
          
          // Sort categories by total spending (highest to lowest)
          const topCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat, amount]) => ({ category: cat, total: amount }));

          prompt = `Analyze this business spending data and identify cost-saving opportunities:

Monthly Data (last 6 months):
${JSON.stringify(financialData.monthly.map(m => ({
  month: m.month,
  totalExpenses: m.expenses,
  expensesByCategory: m.expensesByCategory
})), null, 2)}

Total Expenses: Le ${financialData.totalExpenses.toLocaleString()}
Average Monthly: Le ${financialData.avgMonthlyExpenses.toLocaleString()}

TOP SPENDING CATEGORIES (verified calculation):
${topCategories.map((c, i) => `${i + 1}. ${c.category.replace(/_/g, ' ')}: Le ${c.total.toLocaleString()}`).join('\n')}

IMPORTANT: Use these verified top categories. The HIGHEST spending category is "${topCategories[0]?.category.replace(/_/g, ' ')}" with Le ${topCategories[0]?.total.toLocaleString()}.

Provide specific, actionable cost-saving recommendations. Consider:
1. Focus on the verified top spending categories listed above
2. Month-over-month spending trends
3. Potential areas of waste or inefficiency
4. Industry benchmarks for Sierra Leone businesses`;

          schema = {
            type: "object",
            properties: {
              summary: { type: "string", description: "Executive summary of spending patterns" },
              total_potential_savings: { type: "number", description: "Estimated total potential monthly savings in Leones" },
              cost_saving_opportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    current_spending: { type: "number" },
                    potential_savings: { type: "number" },
                    recommendation: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    implementation_difficulty: { type: "string", enum: ["easy", "moderate", "hard"] }
                  }
                }
              },
              spending_trends: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    trend: { type: "string" },
                    impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                    action_needed: { type: "string" }
                  }
                }
              },
              quick_wins: {
                type: "array",
                items: { type: "string" }
              }
            }
          };
          break;

        case "cashflow":
          prompt = `Forecast cash flow for this Sierra Leone business considering local economic factors:

Historical Data (6 months):
${JSON.stringify(financialData.monthly.map(m => ({
  month: m.month,
  revenue: m.revenue,
  expenses: m.expenses,
  profit: m.profit
})), null, 2)}

Average Monthly Revenue: Le ${financialData.avgMonthlyRevenue.toLocaleString()}
Average Monthly Expenses: Le ${financialData.avgMonthlyExpenses.toLocaleString()}

Consider Sierra Leone economic factors:
- Currency (Leone) stability
- Seasonal business patterns
- Local market conditions
- Typical cash flow challenges for businesses

Provide a 6-month cash flow forecast with confidence levels.`;

          schema = {
            type: "object",
            properties: {
              summary: { type: "string" },
              current_health: { type: "string", enum: ["excellent", "good", "fair", "concerning", "critical"] },
              forecast: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: { type: "string" },
                    projected_revenue: { type: "number" },
                    projected_expenses: { type: "number" },
                    projected_cash_position: { type: "number" },
                    confidence: { type: "string", enum: ["high", "medium", "low"] },
                    key_factors: { type: "array", items: { type: "string" } }
                  }
                }
              },
              risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    risk: { type: "string" },
                    probability: { type: "string", enum: ["high", "medium", "low"] },
                    impact: { type: "string" },
                    mitigation: { type: "string" }
                  }
                }
              },
              recommendations: { type: "array", items: { type: "string" } }
            }
          };
          break;

        case "revenue":
          prompt = `Analyze revenue data and identify growth opportunities for this Sierra Leone business:

Sales Data (6 months):
${JSON.stringify(financialData.monthly.map(m => ({
  month: m.month,
  revenue: m.revenue,
  salesCount: m.salesCount,
  avgTransactionValue: m.salesCount > 0 ? Math.round(m.revenue / m.salesCount) : 0
})), null, 2)}

Total Revenue: Le ${financialData.totalRevenue.toLocaleString()}
Total Transactions: ${sales.length}

Consider:
1. Revenue trends and seasonality
2. Average transaction value optimization
3. Customer acquisition opportunities
4. Product/service mix optimization
5. Local market opportunities in Sierra Leone`;

          schema = {
            type: "object",
            properties: {
              summary: { type: "string" },
              growth_potential: { type: "string", enum: ["high", "moderate", "limited"] },
              estimated_growth_opportunity: { type: "number", description: "Potential monthly revenue increase in Leones" },
              opportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    opportunity: { type: "string" },
                    potential_impact: { type: "number" },
                    effort_required: { type: "string", enum: ["low", "medium", "high"] },
                    timeframe: { type: "string" },
                    action_steps: { type: "array", items: { type: "string" } }
                  }
                }
              },
              quick_revenue_wins: { type: "array", items: { type: "string" } },
              pricing_insights: { type: "string" },
              market_recommendations: { type: "array", items: { type: "string" } }
            }
          };
          break;

        case "summary":
          prompt = `Generate a comprehensive financial summary report for this Sierra Leone business:

Financial Overview (Last 6 Months):
- Total Revenue: Le ${financialData.totalRevenue.toLocaleString()}
- Total Expenses: Le ${financialData.totalExpenses.toLocaleString()}
- Net Profit: Le ${financialData.totalProfit.toLocaleString()}
- Profit Margin: ${financialData.totalRevenue > 0 ? ((financialData.totalProfit / financialData.totalRevenue) * 100).toFixed(1) : 0}%

Monthly Breakdown:
${JSON.stringify(financialData.monthly, null, 2)}

Create an executive summary suitable for business owners and stakeholders.`;

          schema = {
            type: "object",
            properties: {
              executive_summary: { type: "string" },
              financial_health_score: { type: "number", description: "Score from 1-100" },
              key_metrics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    metric: { type: "string" },
                    value: { type: "string" },
                    trend: { type: "string", enum: ["up", "down", "stable"] },
                    assessment: { type: "string" }
                  }
                }
              },
              strengths: { type: "array", items: { type: "string" } },
              concerns: { type: "array", items: { type: "string" } },
              priorities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: { type: "string" },
                    urgency: { type: "string", enum: ["immediate", "short-term", "medium-term"] },
                    expected_outcome: { type: "string" }
                  }
                }
              },
              outlook: { type: "string" }
            }
          };
          break;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema,
        add_context_from_internet: type === "cashflow" || type === "revenue"
      });

      setAnalysisResults(prev => ({ ...prev, [type]: result }));
      toast.success("Analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to run analysis");
    } finally {
      setAnalysisLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Generate and print report
  const printReport = (type) => {
    const result = analysisResults[type];
    if (!result) return;

    let sections = [];
    let summaryCards = [];

    switch (type) {
      case "spending":
        summaryCards = [
          { label: "Potential Savings", value: `Le ${(result.total_potential_savings || 0).toLocaleString()}`, highlight: "green" },
          { label: "Opportunities", value: (result.cost_saving_opportunities?.length || 0).toString(), highlight: "blue" },
          { label: "Quick Wins", value: (result.quick_wins?.length || 0).toString(), highlight: "gold" }
        ];
        sections = [
          { title: "📊 Executive Summary", content: `<p style="font-size: 14px; line-height: 1.6;">${result.summary}</p>` },
          {
            title: "💰 Cost-Saving Opportunities",
            table: {
              columns: ["Category", "Current Spending", "Potential Savings", "Priority", "Recommendation"],
              rows: (result.cost_saving_opportunities || []).map(o => [
                o.category,
                `Le ${(o.current_spending || 0).toLocaleString()}`,
                `Le ${(o.potential_savings || 0).toLocaleString()}`,
                o.priority,
                o.recommendation
              ])
            }
          },
          {
            title: "⚡ Quick Wins",
            content: `<ul style="margin: 0; padding-left: 20px;">${(result.quick_wins || []).map(w => `<li style="margin: 8px 0;">${w}</li>`).join('')}</ul>`
          }
        ];
        break;

      case "cashflow":
        summaryCards = [
          { label: "Cash Health", value: result.current_health || "N/A", highlight: result.current_health === "excellent" || result.current_health === "good" ? "green" : "gold" },
          { label: "Forecast Months", value: (result.forecast?.length || 0).toString(), highlight: "blue" },
          { label: "Risks Identified", value: (result.risks?.length || 0).toString(), highlight: "red" }
        ];
        sections = [
          { title: "📊 Summary", content: `<p style="font-size: 14px; line-height: 1.6;">${result.summary}</p>` },
          {
            title: "📈 6-Month Forecast",
            table: {
              columns: ["Month", "Projected Revenue", "Projected Expenses", "Cash Position", "Confidence"],
              rows: (result.forecast || []).map(f => [
                f.month,
                `Le ${(f.projected_revenue || 0).toLocaleString()}`,
                `Le ${(f.projected_expenses || 0).toLocaleString()}`,
                `Le ${(f.projected_cash_position || 0).toLocaleString()}`,
                f.confidence
              ])
            }
          },
          {
            title: "⚠️ Risks & Mitigation",
            table: {
              columns: ["Risk", "Probability", "Impact", "Mitigation"],
              rows: (result.risks || []).map(r => [r.risk, r.probability, r.impact, r.mitigation])
            }
          }
        ];
        break;

      case "revenue":
        summaryCards = [
          { label: "Growth Potential", value: result.growth_potential || "N/A", highlight: "green" },
          { label: "Est. Monthly Opportunity", value: `Le ${(result.estimated_growth_opportunity || 0).toLocaleString()}`, highlight: "gold" },
          { label: "Opportunities", value: (result.opportunities?.length || 0).toString(), highlight: "blue" }
        ];
        sections = [
          { title: "📊 Summary", content: `<p style="font-size: 14px; line-height: 1.6;">${result.summary}</p>` },
          {
            title: "🚀 Growth Opportunities",
            table: {
              columns: ["Opportunity", "Potential Impact", "Effort", "Timeframe"],
              rows: (result.opportunities || []).map(o => [
                o.opportunity,
                `Le ${(o.potential_impact || 0).toLocaleString()}`,
                o.effort_required,
                o.timeframe
              ])
            }
          },
          {
            title: "💡 Quick Revenue Wins",
            content: `<ul style="margin: 0; padding-left: 20px;">${(result.quick_revenue_wins || []).map(w => `<li style="margin: 8px 0;">${w}</li>`).join('')}</ul>`
          }
        ];
        break;

      case "summary":
        summaryCards = [
          { label: "Health Score", value: `${result.financial_health_score || 0}/100`, highlight: (result.financial_health_score || 0) >= 70 ? "green" : "gold" },
          { label: "Strengths", value: (result.strengths?.length || 0).toString(), highlight: "green" },
          { label: "Concerns", value: (result.concerns?.length || 0).toString(), highlight: "red" }
        ];
        sections = [
          { title: "📊 Executive Summary", content: `<p style="font-size: 14px; line-height: 1.6;">${result.executive_summary}</p>` },
          {
            title: "📈 Key Metrics",
            table: {
              columns: ["Metric", "Value", "Trend", "Assessment"],
              rows: (result.key_metrics || []).map(m => [m.metric, m.value, m.trend, m.assessment])
            }
          },
          {
            title: "✅ Strengths",
            content: `<ul style="margin: 0; padding-left: 20px;">${(result.strengths || []).map(s => `<li style="margin: 8px 0; color: #166534;">${s}</li>`).join('')}</ul>`
          },
          {
            title: "⚠️ Concerns",
            content: `<ul style="margin: 0; padding-left: 20px;">${(result.concerns || []).map(c => `<li style="margin: 8px 0; color: #991b1b;">${c}</li>`).join('')}</ul>`
          },
          {
            title: "🎯 Priorities",
            table: {
              columns: ["Priority", "Urgency", "Expected Outcome"],
              rows: (result.priorities || []).map(p => [p.priority, p.urgency, p.expected_outcome])
            }
          },
          { title: "🔮 Outlook", content: `<p style="font-size: 14px; line-height: 1.6;">${result.outlook}</p>` }
        ];
        break;
    }

    const titles = {
      spending: "Cost Savings Analysis",
      cashflow: "Cash Flow Forecast",
      revenue: "Revenue Growth Analysis",
      summary: "Financial Summary Report"
    };

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: titles[type],
      docNumber: `AI-${type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      docDate: format(new Date(), 'MMMM d, yyyy'),
      organisation,
      infoBar: [
        { label: 'Report Type', value: 'AI Analysis' },
        { label: 'Generated', value: format(new Date(), 'MMM d, yyyy h:mm a') },
        { label: 'Period', value: 'Last 6 Months' }
      ],
      summaryCards,
      sections,
      notes: 'This report was generated using AI-powered financial analysis. Recommendations should be reviewed by management before implementation.',
      showFooter: true
    });

    printUnifiedPDF(html, `ai-${type}-report`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "fair": return "text-amber-600";
      case "concerning": return "text-orange-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#0072C6]" />
            AI Financial Analysis
          </h2>
          <p className="text-sm text-gray-500">Powered by AI to provide actionable financial insights</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">6-Month Revenue</p>
                <p className="text-lg font-bold text-green-600">Le {financialData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-t-4 border-t-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">6-Month Expenses</p>
                <p className="text-lg font-bold text-red-600">Le {financialData.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${financialData.totalProfit >= 0 ? 'from-blue-50 border-t-[#0072C6]' : 'from-orange-50 border-t-orange-500'} to-white border-t-4`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${financialData.totalProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'} flex items-center justify-center`}>
                <DollarSign className={`w-5 h-5 ${financialData.totalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Net Profit</p>
                <p className={`text-lg font-bold ${financialData.totalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  Le {financialData.totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Profit Margin</p>
                <p className="text-lg font-bold text-purple-600">
                  {financialData.totalRevenue > 0 ? ((financialData.totalProfit / financialData.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="overflow-hidden">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle>Financial Trend (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthShort" />
                <YAxis tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1EB053" fill="#1EB053" fillOpacity={0.6} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="rounded-lg overflow-hidden border">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <TabsList className="grid w-full grid-cols-4 rounded-none">
          <TabsTrigger value="spending" className="gap-1">
            <PiggyBank className="w-4 h-4" />
            <span className="hidden sm:inline">Cost Savings</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Cash Flow</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Spending Analysis Tab */}
        <TabsContent value="spending" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0072C6]" />
                  AI Cost Savings Analysis
                </CardTitle>
                <CardDescription>Identify opportunities to reduce expenses</CardDescription>
              </div>
              <div className="flex gap-2">
                {analysisResults.spending && (
                  <Button variant="outline" size="sm" onClick={() => printReport("spending")}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                )}
                <Button 
                  onClick={() => runAnalysis("spending")}
                  disabled={analysisLoading.spending}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {analysisLoading.spending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {analysisResults.spending ? 'Re-analyze' : 'Run Analysis'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {analysisResults.spending ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{analysisResults.spending.summary}</p>
                  </div>

                  {/* Potential Savings */}
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <PiggyBank className="w-10 h-10 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600">Total Potential Monthly Savings</p>
                      <p className="text-2xl font-bold text-green-700">
                        Le {(analysisResults.spending.total_potential_savings || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Cost-Saving Opportunities
                    </h4>
                    <div className="space-y-3">
                      {(analysisResults.spending.cost_saving_opportunities || [])
                        .sort((a, b) => (b.current_spending || 0) - (a.current_spending || 0))
                        .map((opp, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(opp.priority)}>{opp.priority}</Badge>
                              <span className="font-medium capitalize">{opp.category?.replace(/_/g, ' ')}</span>
                            </div>
                            <span className="text-green-600 font-bold">Save Le {(opp.potential_savings || 0).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">{opp.recommendation}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>Current: Le {(opp.current_spending || 0).toLocaleString()}</span>
                            <span>•</span>
                            <span>Difficulty: {opp.implementation_difficulty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Wins */}
                  {analysisResults.spending.quick_wins?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Quick Wins
                      </h4>
                      <div className="grid gap-2">
                        {analysisResults.spending.quick_wins.map((win, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span className="text-sm">{win}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Click "Run Analysis" to identify cost-saving opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0072C6]" />
                  AI Cash Flow Forecast
                </CardTitle>
                <CardDescription>Predict future cash position with economic factors</CardDescription>
              </div>
              <div className="flex gap-2">
                {analysisResults.cashflow && (
                  <Button variant="outline" size="sm" onClick={() => printReport("cashflow")}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                )}
                <Button 
                  onClick={() => runAnalysis("cashflow")}
                  disabled={analysisLoading.cashflow}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {analysisLoading.cashflow ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {analysisResults.cashflow ? 'Re-forecast' : 'Generate Forecast'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {analysisResults.cashflow ? (
                <div className="space-y-6">
                  {/* Health Status */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`text-3xl font-bold capitalize ${getHealthColor(analysisResults.cashflow.current_health)}`}>
                      {analysisResults.cashflow.current_health}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Cash Health</p>
                      <p className="text-sm text-gray-600">{analysisResults.cashflow.summary}</p>
                    </div>
                  </div>

                  {/* Forecast Chart */}
                  {analysisResults.cashflow.forecast?.length > 0 && (
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analysisResults.cashflow.forecast}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                          <Legend />
                          <Area type="monotone" dataKey="projected_revenue" stroke="#1EB053" fill="#1EB053" fillOpacity={0.3} name="Projected Revenue" />
                          <Area type="monotone" dataKey="projected_expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Projected Expenses" />
                          <Line type="monotone" dataKey="projected_cash_position" stroke="#0072C6" strokeWidth={3} name="Cash Position" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Risks */}
                  {analysisResults.cashflow.risks?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Identified Risks
                      </h4>
                      <div className="space-y-3">
                        {analysisResults.cashflow.risks.map((risk, idx) => (
                          <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium">{risk.risk}</span>
                              <Badge className={getPriorityColor(risk.probability)}>{risk.probability} probability</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2"><strong>Impact:</strong> {risk.impact}</p>
                            <p className="text-sm text-green-700"><strong>Mitigation:</strong> {risk.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResults.cashflow.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="grid gap-2">
                        {analysisResults.cashflow.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Click "Generate Forecast" to predict future cash flow</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0072C6]" />
                  AI Revenue Growth Analysis
                </CardTitle>
                <CardDescription>Discover opportunities to increase revenue</CardDescription>
              </div>
              <div className="flex gap-2">
                {analysisResults.revenue && (
                  <Button variant="outline" size="sm" onClick={() => printReport("revenue")}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                )}
                <Button 
                  onClick={() => runAnalysis("revenue")}
                  disabled={analysisLoading.revenue}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {analysisLoading.revenue ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {analysisResults.revenue ? 'Re-analyze' : 'Find Opportunities'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {analysisResults.revenue ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-600">Growth Potential</span>
                      <Badge className="bg-green-100 text-green-700 capitalize">{analysisResults.revenue.growth_potential}</Badge>
                    </div>
                    <p className="text-sm text-green-800">{analysisResults.revenue.summary}</p>
                  </div>

                  {/* Estimated Opportunity */}
                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Target className="w-10 h-10 text-amber-600" />
                    <div>
                      <p className="text-sm text-amber-600">Estimated Monthly Revenue Opportunity</p>
                      <p className="text-2xl font-bold text-amber-700">
                        Le {(analysisResults.revenue.estimated_growth_opportunity || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Opportunities */}
                  {analysisResults.revenue.opportunities?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        Growth Opportunities
                      </h4>
                      <div className="space-y-3">
                        {analysisResults.revenue.opportunities.map((opp, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium">{opp.opportunity}</span>
                              <span className="text-green-600 font-bold">+Le {(opp.potential_impact || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                              <span>Effort: {opp.effort_required}</span>
                              <span>•</span>
                              <span>Timeframe: {opp.timeframe}</span>
                            </div>
                            {opp.action_steps?.length > 0 && (
                              <div className="pl-4 border-l-2 border-green-300">
                                {opp.action_steps.map((step, sIdx) => (
                                  <p key={sIdx} className="text-sm text-gray-600 mb-1">• {step}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Wins */}
                  {analysisResults.revenue.quick_revenue_wins?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Quick Revenue Wins
                      </h4>
                      <div className="grid gap-2">
                        {analysisResults.revenue.quick_revenue_wins.map((win, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{win}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Insights */}
                  {analysisResults.revenue.pricing_insights && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-2 text-blue-700">Pricing Insights</h4>
                      <p className="text-sm text-blue-800">{analysisResults.revenue.pricing_insights}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Click "Find Opportunities" to discover revenue growth potential</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0072C6]" />
                  AI Financial Summary
                </CardTitle>
                <CardDescription>Comprehensive automated financial report</CardDescription>
              </div>
              <div className="flex gap-2">
                {analysisResults.summary && (
                  <Button variant="outline" size="sm" onClick={() => printReport("summary")}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print Report
                  </Button>
                )}
                <Button 
                  onClick={() => runAnalysis("summary")}
                  disabled={analysisLoading.summary}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {analysisLoading.summary ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {analysisResults.summary ? 'Regenerate' : 'Generate Report'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {analysisResults.summary ? (
                <div className="space-y-6">
                  {/* Health Score */}
                  <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                        <span className={`text-3xl font-bold ${
                          (analysisResults.summary.financial_health_score || 0) >= 70 ? 'text-green-600' :
                          (analysisResults.summary.financial_health_score || 0) >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {analysisResults.summary.financial_health_score || 0}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Financial Health Score</p>
                      <p className="font-semibold text-lg">
                        {(analysisResults.summary.financial_health_score || 0) >= 70 ? 'Healthy' :
                         (analysisResults.summary.financial_health_score || 0) >= 50 ? 'Fair' : 'Needs Attention'}
                      </p>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Executive Summary</h4>
                    <p className="text-sm text-gray-700">{analysisResults.summary.executive_summary}</p>
                  </div>

                  {/* Key Metrics */}
                  {analysisResults.summary.key_metrics?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Key Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysisResults.summary.key_metrics.map((metric, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">{metric.metric}</p>
                              <p className="font-semibold">{metric.value}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {metric.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                              {metric.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                              {metric.trend === 'stable' && <span className="w-4 h-0.5 bg-gray-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Strengths
                      </h4>
                      <div className="space-y-2">
                        {(analysisResults.summary.strengths || []).map((s, idx) => (
                          <div key={idx} className="p-2 bg-green-50 rounded text-sm text-green-800">{s}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        Concerns
                      </h4>
                      <div className="space-y-2">
                        {(analysisResults.summary.concerns || []).map((c, idx) => (
                          <div key={idx} className="p-2 bg-red-50 rounded text-sm text-red-800">{c}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Priorities */}
                  {analysisResults.summary.priorities?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Action Priorities</h4>
                      <div className="space-y-3">
                        {analysisResults.summary.priorities.map((p, idx) => (
                          <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{p.priority}</span>
                              <Badge className={
                                p.urgency === 'immediate' ? 'bg-red-100 text-red-700' :
                                p.urgency === 'short-term' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                              }>{p.urgency}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{p.expected_outcome}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outlook */}
                  {analysisResults.summary.outlook && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-2 text-blue-700">Business Outlook</h4>
                      <p className="text-sm text-blue-800">{analysisResults.summary.outlook}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Click "Generate Report" to create a comprehensive financial summary</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}