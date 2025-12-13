import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  Truck, Calendar, AlertTriangle, Target, ArrowRight, Download,
  FileText, BarChart3, Activity
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#FF6B35', '#8B5CF6', '#EF4444', '#10B981'];

export default function ExecutiveDashboard() {
  const [dateRange, setDateRange] = useState("this_month");
  const [selectedModule, setSelectedModule] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case "this_week":
        return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
      case "this_month":
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case "last_month":
        const lastMonth = subMonths(now, 1);
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
      case "last_3_months":
        return { startDate: subMonths(startOfMonth(now), 3), endDate: endOfMonth(now) };
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  }, [dateRange]);

  // Fetch all module data
  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stockMovements', orgId],
    queryFn: () => base44.entities.StockMovement.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  // Filter data by date range
  const filteredData = useMemo(() => {
    const filterByDate = (items, dateField = 'created_date') => {
      return items.filter(item => {
        const itemDate = new Date(item[dateField] || item.date || item.created_date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    };

    return {
      sales: filterByDate(sales),
      expenses: filterByDate(expenses),
      trips: filterByDate(trips, 'date'),
      stockMovements: filterByDate(stockMovements),
      payrolls: filterByDate(payrolls, 'period_start'),
      attendance: filterByDate(attendance, 'date')
    };
  }, [sales, expenses, trips, stockMovements, payrolls, attendance, startDate, endDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSales = filteredData.sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalTrips = filteredData.trips.length;
    const tripRevenue = filteredData.trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const lowStock = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const netIncome = totalSales + tripRevenue - totalExpenses;
    const totalPayroll = filteredData.payrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0);

    return {
      totalSales,
      totalExpenses,
      tripRevenue,
      totalTrips,
      lowStock,
      activeEmployees,
      netIncome,
      totalPayroll,
      totalInventoryValue: products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0)
    };
  }, [filteredData, products, employees]);

  // Sales trend data
  const salesTrendData = useMemo(() => {
    const grouped = {};
    filteredData.sales.forEach(sale => {
      const date = format(new Date(sale.created_date), 'MMM dd');
      grouped[date] = (grouped[date] || 0) + (sale.total_amount || 0);
    });
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  }, [filteredData.sales]);

  // Revenue breakdown
  const revenueBreakdown = [
    { name: 'Sales', value: metrics.totalSales, color: '#1EB053' },
    { name: 'Transport', value: metrics.tripRevenue, color: '#FF6B35' },
  ];

  // Expense breakdown
  const expenseBreakdown = useMemo(() => {
    const grouped = {};
    filteredData.expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      grouped[cat] = (grouped[cat] || 0) + (exp.amount || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredData.expenses]);

  // Top products
  const topProducts = useMemo(() => {
    const productSales = {};
    filteredData.sales.forEach(sale => {
      (sale.items || []).forEach(item => {
        const id = item.product_id;
        if (!productSales[id]) {
          productSales[id] = { name: item.product_name, quantity: 0, revenue: 0 };
        }
        productSales[id].quantity += item.quantity || 0;
        productSales[id].revenue += item.total || 0;
      });
    });
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredData.sales]);

  if (!user || !currentEmployee) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="h-1 flex relative z-10">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                Executive Dashboard
              </h1>
            </div>
            <p className="text-blue-100 ml-16 text-sm">Real-time business intelligence and performance analytics</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white border-0 shadow-lg hover:shadow-xl transition-all">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        <div className="h-1 flex relative z-10">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Revenue</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Le {(metrics.totalSales + metrics.tripRevenue).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                Sales: {metrics.totalSales.toLocaleString()}
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                Transport: {metrics.tripRevenue.toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-red-50 to-rose-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Expenses</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Le {metrics.totalExpenses.toLocaleString()}
            </div>
            <div className="mt-3">
              <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                {filteredData.expenses.length} transactions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Net Income</CardTitle>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metrics.netIncome >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'} flex items-center justify-center shadow-lg`}>
                {metrics.netIncome >= 0 ? <TrendingUp className="w-5 h-5 text-white" /> : <TrendingDown className="w-5 h-5 text-white" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold bg-gradient-to-r ${metrics.netIncome >= 0 ? 'from-green-600 to-emerald-600' : 'from-red-600 to-rose-600'} bg-clip-text text-transparent`}>
              Le {metrics.netIncome.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge className={`${metrics.netIncome >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-0 text-xs`}>
                {metrics.netIncome >= 0 ? '✓ Profitable' : '⚠ Loss'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Inventory Value</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Le {metrics.totalInventoryValue.toLocaleString()}
            </div>
            <div className="mt-3">
              {metrics.lowStock > 0 ? (
                <Badge className="bg-red-100 text-red-700 border-0 text-xs animate-pulse">
                  ⚠ {metrics.lowStock} low stock
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                  ✓ All stocked
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-white border shadow-sm p-1.5 rounded-xl h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5">Overview</TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5">Sales</TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5">Inventory</TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5">Finance</TabsTrigger>
          <TabsTrigger value="hr" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5">HR</TabsTrigger>
          <TabsTrigger value="transport" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5">Transport</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1EB053" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1EB053" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `Le ${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#1EB053" strokeWidth={3} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  Revenue vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Revenue', Sales: metrics.totalSales, Transport: metrics.tripRevenue },
                    { name: 'Expenses', value: metrics.totalExpenses }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `Le ${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="Sales" fill="#1EB053" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Transport" fill="#FF6B35" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="value" fill="#EF4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  Revenue Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `Le ${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                          idx === 0 ? 'from-yellow-400 to-orange-500' :
                          idx === 1 ? 'from-gray-300 to-gray-400' :
                          idx === 2 ? 'from-orange-400 to-orange-500' :
                          'from-blue-400 to-blue-500'
                        } flex items-center justify-center text-white font-bold shadow-lg text-lg`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Package className="w-3 h-3" />
                            {product.quantity} units sold
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Le {product.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Le {metrics.totalSales.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">{filteredData.sales.length} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Sale Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Le {filteredData.sales.length > 0 ? Math.round(metrics.totalSales / filteredData.sales.length).toLocaleString() : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sales Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">+15%</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detailed Sales Analytics</CardTitle>
              <Link to={createPageUrl("Sales")}>
                <Button variant="outline" size="sm">
                  View Details <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#1EB053" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{metrics.lowStock}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stock Movements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredData.stockMovements.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  Le {metrics.totalInventoryValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventory Management</CardTitle>
              <Link to={createPageUrl("Inventory")}>
                <Button variant="outline" size="sm">
                  Manage Inventory <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-sm">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Le {(metrics.totalSales + metrics.tripRevenue).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-sm">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  Le {metrics.totalExpenses.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-sm">Net Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Le {metrics.netIncome.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HR Tab */}
        <TabsContent value="hr" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.attendance.length > 0 ? Math.round((filteredData.attendance.filter(a => a.status === 'present').length / filteredData.attendance.length) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payroll Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  Le {metrics.totalPayroll.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredData.attendance.length}</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>HR Management</CardTitle>
              <Link to={createPageUrl("HRManagement")}>
                <Button variant="outline" size="sm">
                  View HR Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Transport Tab */}
        <TabsContent value="transport" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalTrips}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Transport Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  Le {metrics.tripRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Trip Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Le {metrics.totalTrips > 0 ? Math.round(metrics.tripRevenue / metrics.totalTrips).toLocaleString() : 0}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transport Operations</CardTitle>
              <Link to={createPageUrl("Transport")}>
                <Button variant="outline" size="sm">
                  View Transport Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Sales Report", module: "Sales", icon: ShoppingCart, color: "green" },
              { title: "Inventory Report", module: "Inventory", icon: Package, color: "purple" },
              { title: "Financial Report", module: "Finance", icon: DollarSign, color: "blue" },
              { title: "HR Report", module: "HRManagement", icon: Users, color: "indigo" },
              { title: "Transport Report", module: "Transport", icon: Truck, color: "orange" },
              { title: "Activity Report", module: "ActivityLog", icon: Activity, color: "gray" },
            ].map((report, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <report.icon className={`w-5 h-5 text-${report.color}-600`} />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to={createPageUrl(report.module)}>
                    <Button variant="outline" className="w-full" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}