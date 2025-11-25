import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, parseISO, differenceInDays } from "date-fns";
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Truck,
  Calendar,
  Filter,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#0F1F3C', '#9333ea', '#f59e0b', '#ef4444', '#10b981'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

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

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-date', 500),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-date', 500),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId }, '-date', 500),
    enabled: !!orgId,
  });

  // Date filtering
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const date = s.created_date?.split('T')[0];
      return date >= startDate && date <= endDate;
    });
  }, [sales, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => e.date >= startDate && e.date <= endDate);
  }, [expenses, startDate, endDate]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => t.date >= startDate && t.date <= endDate);
  }, [trips, startDate, endDate]);

  // Sales analytics
  const salesAnalytics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const totalTransactions = filteredSales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // By payment method
    const byPayment = {};
    filteredSales.forEach(s => {
      const method = s.payment_method || 'cash';
      byPayment[method] = (byPayment[method] || 0) + (s.total_amount || 0);
    });

    // By sale type
    const bySaleType = {};
    filteredSales.forEach(s => {
      const type = s.sale_type || 'retail';
      bySaleType[type] = (bySaleType[type] || 0) + (s.total_amount || 0);
    });

    // Top products
    const productSales = {};
    filteredSales.forEach(s => {
      s.items?.forEach(item => {
        productSales[item.product_name] = (productSales[item.product_name] || 0) + (item.total || 0);
      });
    });
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Daily trend
    const dailyTrend = {};
    filteredSales.forEach(s => {
      const date = s.created_date?.split('T')[0];
      dailyTrend[date] = (dailyTrend[date] || 0) + (s.total_amount || 0);
    });
    const trendData = Object.entries(dailyTrend)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({
        date: format(parseISO(date), 'MMM d'),
        revenue
      }));

    return {
      totalRevenue,
      totalTransactions,
      avgTransaction,
      byPayment: Object.entries(byPayment).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })),
      bySaleType: Object.entries(bySaleType).map(([name, value]) => ({ name, value })),
      topProducts,
      trendData
    };
  }, [filteredSales]);

  // Expense analytics
  const expenseAnalytics = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // By category
    const byCategory = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
    });

    return {
      totalExpenses,
      byCategory: Object.entries(byCategory)
        .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
        .sort((a, b) => b.value - a.value)
    };
  }, [filteredExpenses]);

  // Transport analytics
  const transportAnalytics = useMemo(() => {
    const totalRevenue = filteredTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const totalPassengers = filteredTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
    const totalFuelCost = filteredTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
    const netRevenue = filteredTrips.reduce((sum, t) => sum + (t.net_revenue || 0), 0);

    // By route
    const byRoute = {};
    filteredTrips.forEach(t => {
      const route = t.route_name || 'Unknown';
      byRoute[route] = (byRoute[route] || 0) + (t.total_revenue || 0);
    });

    return {
      totalRevenue,
      totalPassengers,
      totalFuelCost,
      netRevenue,
      totalTrips: filteredTrips.length,
      byRoute: Object.entries(byRoute).map(([name, value]) => ({ name, value }))
    };
  }, [filteredTrips]);

  // Profit/Loss
  const profitLoss = useMemo(() => {
    const totalRevenue = salesAnalytics.totalRevenue + transportAnalytics.totalRevenue;
    const totalExpenses = expenseAnalytics.totalExpenses + transportAnalytics.totalFuelCost;
    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0
    };
  }, [salesAnalytics, transportAnalytics, expenseAnalytics]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    switch (range) {
      case 'week':
        setStartDate(format(new Date(today.setDate(today.getDate() - 7)), 'yyyy-MM-dd'));
        setEndDate(format(new Date(), 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
        break;
      case 'quarter':
        setStartDate(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
        setEndDate(format(new Date(), 'yyyy-MM-dd'));
        break;
      case 'year':
        setStartDate(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
        setEndDate(format(new Date(), 'yyyy-MM-dd'));
        break;
      default:
        break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive business insights"
      >
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </PageHeader>

      {/* Date Range Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm">Period:</span>
            </div>
            <div className="flex gap-2">
              {['week', 'month', 'quarter', 'year'].map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDateRangeChange(range)}
                  className={dateRange === range ? "sl-gradient" : ""}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }}
                className="w-36"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }}
                className="w-36"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Le ${profitLoss.revenue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={`Le ${profitLoss.expenses.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Net Profit"
          value={`Le ${profitLoss.profit.toLocaleString()}`}
          icon={DollarSign}
          color={profitLoss.profit >= 0 ? "green" : "red"}
        />
        <StatCard
          title="Profit Margin"
          value={`${profitLoss.margin}%`}
          icon={BarChart3}
          color="blue"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 flex-wrap">
          <TabsTrigger value="sales" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Sales
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="transport" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Transport
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-[#1EB053]">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold text-[#1EB053]">Le {salesAnalytics.totalRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#0072C6]">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-2xl font-bold text-[#0072C6]">{salesAnalytics.totalTransactions}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#D4AF37]">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Avg. Transaction</p>
                <p className="text-2xl font-bold text-[#D4AF37]">Le {salesAnalytics.avgTransaction.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#1EB053]" />
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesAnalytics.trendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1EB053" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1EB053" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Le ${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#1EB053" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#0072C6]" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={salesAnalytics.byPayment}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {salesAnalytics.byPayment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D4AF37]" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesAnalytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1EB053" />
                        <stop offset="100%" stopColor="#0072C6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses: Le {expenseAnalytics.totalExpenses.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={expenseAnalytics.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transport Tab */}
        <TabsContent value="transport" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-t-4 border-t-[#1EB053]">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-[#1EB053]">Le {transportAnalytics.totalRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#0072C6]">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Trips</p>
                <p className="text-2xl font-bold text-[#0072C6]">{transportAnalytics.totalTrips}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#D4AF37]">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Passengers</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{transportAnalytics.totalPassengers}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-purple-500">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Net Revenue</p>
                <p className="text-2xl font-bold text-purple-600">Le {transportAnalytics.netRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Route</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transportAnalytics.byRoute}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-[#1EB053]">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-[#1EB053]">{products.length}</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-amber-500">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600">
                  {products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10)).length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-red-500">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock_quantity === 0).length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Levels by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const byCategory = {};
                products.forEach(p => {
                  const cat = p.category || 'Uncategorized';
                  if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
                  byCategory[cat].count += p.stock_quantity || 0;
                  byCategory[cat].value += (p.stock_quantity || 0) * (p.unit_price || 0);
                });
                const data = Object.entries(byCategory).map(([name, { count, value }]) => ({ name, count, value }));
                return (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1EB053" name="Units" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}