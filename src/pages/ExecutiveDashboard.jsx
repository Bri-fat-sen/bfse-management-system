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
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border shadow-sm bg-white">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#1EB053]" />
              Executive Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive business performance overview</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              Le {(metrics.totalSales + metrics.tripRevenue).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                Sales: Le {metrics.totalSales.toLocaleString()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Transport: Le {metrics.tripRevenue.toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              Le {metrics.totalExpenses.toLocaleString()}
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {filteredData.expenses.length} transactions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Le {metrics.netIncome.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {metrics.netIncome >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                {metrics.netIncome >= 0 ? 'Profitable' : 'Loss'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              Le {metrics.totalInventoryValue.toLocaleString()}
            </div>
            <div className="mt-2">
              {metrics.lowStock > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {metrics.lowStock} low stock alerts
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Area type="monotone" dataKey="amount" stroke="#1EB053" fill="#1EB053" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Revenue vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Revenue', Sales: metrics.totalSales, Transport: metrics.tripRevenue },
                    { name: 'Expenses', value: metrics.totalExpenses }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Sales" fill="#1EB053" />
                    <Bar dataKey="Transport" fill="#FF6B35" />
                    <Bar dataKey="value" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">Le {product.revenue.toLocaleString()}</span>
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