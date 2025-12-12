import { } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const EXPENSE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function FinanceOverview({ sales = [], expenses = [], revenues = [], trips = [] }) {
  // This month's data
  const thisMonth = format(new Date(), 'yyyy-MM');
  const monthSales = sales.filter(s => s.created_date?.startsWith(thisMonth));
  const monthExpenses = expenses.filter(e => e.date?.startsWith(thisMonth));
  const monthRevenues = revenues.filter(r => r.date?.startsWith(thisMonth));
  
  const totalSalesRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalOtherRevenue = monthRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalRevenue = totalSalesRevenue + totalOtherRevenue;
  
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netIncome = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0;

  // Expense breakdown by category
  const expenseCategories = [...new Set(monthExpenses.map(e => e.category))];
  const expenseBreakdown = expenseCategories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: monthExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.amount || 0), 0)
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  // Last 30 days trend
  const last30Days = [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const financeTrend = last30Days.map(date => {
    const daySales = sales.filter(s => s.created_date?.startsWith(date));
    const dayExpenses = expenses.filter(e => e.date === date);
    const dayRevenues = revenues.filter(r => r.date === date);
    
    const revenue = daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0) +
                   dayRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const expense = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
      date: date.split('-')[2],
      revenue,
      expense,
      net: revenue - expense
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Financial Summary */}
      <Card className="border-l-4 border-l-[#1EB053]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#1EB053]" />
            This Month Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-[#1EB053]">Le {totalRevenue.toLocaleString()}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <Badge variant="secondary">Sales: Le {totalSalesRevenue.toLocaleString()}</Badge>
              <Badge variant="outline">Other: Le {totalOtherRevenue.toLocaleString()}</Badge>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-600 font-medium">Total Expenses</p>
            </div>
            <p className="text-2xl font-bold text-red-600">Le {totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{monthExpenses.length} transactions</p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${netIncome >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <p className="text-xs text-gray-500 mb-1">Net Income</p>
            <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Le {netIncome.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {netIncome >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin}% Margin
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="border-l-4 border-l-[#ef4444]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#ef4444]" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenseBreakdown.length > 0 ? (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-3">
                {expenseBreakdown.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }} />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="font-semibold">Le {cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No expense data</p>
          )}
        </CardContent>
      </Card>

      {/* Revenue vs Expenses Trend */}
      <Card className="lg:col-span-3 border-l-4 border-l-[#0072C6]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0072C6]" />
            Cash Flow (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1EB053" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1EB053" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value) => `Le ${value.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1EB053" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}