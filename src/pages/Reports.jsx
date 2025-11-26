import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import { format, startOfMonth, endOfMonth, subMonths, subDays, parseISO, differenceInDays } from "date-fns";
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
  Printer,
  Brain,
  Save,
  LayoutGrid
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
import AdvancedFilters from "@/components/analytics/AdvancedFilters";
import PredictiveAnalytics from "@/components/analytics/PredictiveAnalytics";
import SavedReportsManager from "@/components/analytics/SavedReportsManager";
import {
  GradientAreaChart,
  MultiAreaChart,
  GradientBarChart,
  ColorfulBarChart,
  DonutChart,
  GlowLineChart,
  StackedBarChart,
  ProgressRing,
  SL_COLORS
} from "@/components/charts/AdvancedCharts";

const COLORS = SL_COLORS.chart;

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [filters, setFilters] = useState({
    date_range: 'month',
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    employee_ids: [],
    categories: [],
    payment_methods: [],
    sale_types: [],
    statuses: []
  });

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

  // Advanced filtering
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const date = s.created_date?.split('T')[0];
      if (date < filters.start_date || date > filters.end_date) return false;
      if (filters.employee_ids?.length > 0 && !filters.employee_ids.includes(s.employee_id)) return false;
      if (filters.payment_methods?.length > 0 && !filters.payment_methods.includes(s.payment_method)) return false;
      if (filters.sale_types?.length > 0 && !filters.sale_types.includes(s.sale_type)) return false;
      if (filters.statuses?.length > 0 && !filters.statuses.includes(s.payment_status)) return false;
      return true;
    });
  }, [sales, filters]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (e.date < filters.start_date || e.date > filters.end_date) return false;
      if (filters.employee_ids?.length > 0 && !filters.employee_ids.includes(e.recorded_by)) return false;
      if (filters.categories?.length > 0 && !filters.categories.includes(e.category)) return false;
      if (filters.statuses?.length > 0 && !filters.statuses.includes(e.status)) return false;
      return true;
    });
  }, [expenses, filters]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      if (t.date < filters.start_date || t.date > filters.end_date) return false;
      if (filters.employee_ids?.length > 0 && !filters.employee_ids.includes(t.driver_id)) return false;
      if (filters.statuses?.length > 0 && !filters.statuses.includes(t.status)) return false;
      return true;
    });
  }, [trips, filters]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleLoadSavedReport = (report) => {
    if (report.filters) {
      setFilters(report.filters);
    }
    setActiveTab(report.report_type === 'custom' ? 'sales' : report.report_type);
  };

  return (
    <ProtectedPage module="finance">
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive business insights with predictive analytics"
      >
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </PageHeader>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        employees={employees}
        showEmployeeFilter={true}
        showCategoryFilter={activeTab === 'expenses'}
        showPaymentFilter={activeTab === 'sales'}
        showSaleTypeFilter={activeTab === 'sales'}
        showStatusFilter={true}
      />

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
          <TabsTrigger value="predictions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Brain className="w-4 h-4 mr-1" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Save className="w-4 h-4 mr-1" />
            Saved
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
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <GradientAreaChart 
                  data={salesAnalytics.trendData}
                  dataKey="revenue"
                  xKey="date"
                  height={300}
                  formatter={(v) => `Le ${v.toLocaleString()}`}
                />
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#9333EA]/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#9333EA]">
                    <PieChart className="w-4 h-4 text-white" />
                  </div>
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <DonutChart 
                  data={salesAnalytics.byPayment}
                  height={300}
                  innerRadius={70}
                  outerRadius={110}
                  formatter={(v) => `Le ${v.toLocaleString()}`}
                  centerValue={salesAnalytics.totalTransactions}
                  centerLabel="Transactions"
                />
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="lg:col-span-2 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#D4AF37]/5 to-[#F59E0B]/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F59E0B]">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <GradientBarChart 
                  data={salesAnalytics.topProducts}
                  dataKey="value"
                  xKey="name"
                  height={300}
                  horizontal={true}
                  formatter={(v) => `Le ${v.toLocaleString()}`}
                  barSize={24}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ColorfulBarChart 
                  data={expenseAnalytics.byCategory}
                  dataKey="value"
                  xKey="name"
                  height={400}
                  formatter={(v) => `Le ${v.toLocaleString()}`}
                  colors={['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6']}
                />
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <DonutChart 
                  data={expenseAnalytics.byCategory}
                  height={400}
                  innerRadius={60}
                  outerRadius={90}
                  formatter={(v) => `Le ${v.toLocaleString()}`}
                  showLabels={false}
                />
              </CardContent>
            </Card>
          </div>
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

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-6">
          <PredictiveAnalytics 
            sales={sales} 
            products={products} 
            expenses={expenses} 
          />
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="saved" className="mt-6">
          <SavedReportsManager 
            orgId={orgId} 
            onLoadReport={handleLoadSavedReport}
          />
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedPage>
  );
}