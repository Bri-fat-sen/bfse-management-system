import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Users,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Activity,
  Bell,
  XCircle,
  BarChart3,
  TrendingDown,
  Target,
  Sparkles,
  Zap,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import DriverDashboard from "@/components/dashboard/DriverDashboard";
import SalesDashboard from "@/components/dashboard/SalesDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import AIInsightsPanel from "@/components/ai/AIInsightsPanel";
import InventoryOverview from "@/components/dashboard/InventoryOverview";
import SalesAnalytics from "@/components/dashboard/SalesAnalytics";
import HRMetrics from "@/components/dashboard/HRMetrics";
import TransportMetrics from "@/components/dashboard/TransportMetrics";
import FinanceOverview from "@/components/dashboard/FinanceOverview";
import PerformanceIndicators from "@/components/dashboard/PerformanceIndicators";
import TopPerformers from "@/components/dashboard/TopPerformers";
import PendingApprovalsWidget from "@/components/finance/PendingApprovalsWidget";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings";
import TodayAttendance from "@/components/dashboard/TodayAttendance";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const userRole = currentEmployee?.role || 'read_only';

  const { data: organisations } = useQuery({
    queryKey: ['organisations'],
    queryFn: () => base44.entities.Organisation.list(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  const organisation = organisations ? [organisations.find(org => org.id === orgId)] : [];

  const isDriver = userRole === 'driver';
  const isSalesStaff = ['retail_cashier', 'vehicle_sales', 'warehouse_manager'].includes(userRole);
  const isManager = ['super_admin', 'org_admin', 'hr_admin', 'payroll_admin', 'accountant'].includes(userRole);

  const queryConfig = { staleTime: 2 * 60 * 1000, refetchOnWindowFocus: false };
  
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    ...queryConfig,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    ...queryConfig,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 20),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['todayAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId, 
      date: format(new Date(), 'yyyy-MM-dd') 
    }),
    enabled: !!orgId,
    ...queryConfig,
  });

  const attendance = Array.isArray(attendanceData) ? attendanceData : [];

  const { data: stockAlerts = [] } = useQuery({
    queryKey: ['stockAlerts', orgId],
    queryFn: () => base44.entities.StockAlert.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: inventoryBatches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 10),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: truckContracts = [] } = useQuery({
    queryKey: ['truckContracts', orgId],
    queryFn: () => base44.entities.TruckContract.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    ...queryConfig,
  });

  const { data: revenues = [] } = useQuery({
    queryKey: ['revenues', orgId],
    queryFn: () => base44.entities.Revenue.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    ...queryConfig,
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stockMovements', orgId],
    queryFn: () => base44.entities.StockMovement.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
    ...queryConfig,
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['leaveRequests', orgId],
    queryFn: () => base44.entities.LeaveRequest.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    ...queryConfig,
  });

  if (loadingUser || (user && loadingEmployee)) {
    return <LoadingSpinner message="Loading Dashboard..." subtitle="Preparing your overview" fullScreen={true} />;
  }

  if (!user || !currentEmployee) {
    return <LoadingSpinner message="Setting up..." subtitle="Please wait" fullScreen={true} />;
  }

  if (isDriver) {
    return <DriverDashboard currentEmployee={currentEmployee} orgId={orgId} />;
  }

  if (isSalesStaff) {
    return <SalesDashboard currentEmployee={currentEmployee} orgId={orgId} />;
  }

  if (isManager) {
    return <ManagerDashboard currentEmployee={currentEmployee} orgId={orgId} user={user} />;
  }

  // Calculate statistics
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(new Date(today.getTime() - 86400000), 'yyyy-MM-dd');
  const thisMonth = format(today, 'yyyy-MM');
  
  const todaySales = sales.filter(s => {
    const saleDate = s.created_date ? s.created_date.split('T')[0] : '';
    return saleDate === todayStr;
  });
  const yesterdaySales = sales.filter(s => {
    const saleDate = s.created_date ? s.created_date.split('T')[0] : '';
    return saleDate === yesterdayStr;
  });
  const totalRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const revenueChange = yesterdayRevenue > 0 ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;
  
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold && p.is_active !== false);
  const outOfStock = products.filter(p => p.stock_quantity === 0 && p.is_active !== false);
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0);
  
  const activeEmployees = employees.filter(e => e.status === 'active');
  const clockedIn = attendance.filter(a => a.clock_in_time && !a.clock_out_time);
  const attendanceRate = activeEmployees.length > 0 ? (clockedIn.length / activeEmployees.length * 100).toFixed(0) : 0;
  
  const todayTrips = trips.filter(t => {
    const tripDate = t.date || (t.created_date ? t.created_date.split('T')[0] : '');
    return tripDate === todayStr;
  });
  const transportRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);

  const expiringBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    const daysUntilExpiry = differenceInDays(new Date(batch.expiry_date), today);
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });
  const expiredBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    return differenceInDays(new Date(batch.expiry_date), today) < 0;
  });
  
  const monthSales = sales.filter(s => {
    const saleDate = s.created_date ? s.created_date.split('T')[0] : '';
    return saleDate.startsWith(thisMonth);
  });
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const monthExpenses = expenses.filter(e => {
    const expenseDate = e.date || (e.created_date ? e.created_date.split('T')[0] : '');
    return expenseDate.startsWith(thisMonth);
  });
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-green-50/20">
      {/* Ultra Modern Hero Header */}
      <div className="relative bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        
        <div className="relative px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#1EB053] to-[#0072C6] rounded-3xl blur-2xl opacity-50"></div>
                  <div className="relative p-5 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-3xl shadow-2xl">
                    <BarChart3 className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-black mb-2">Dashboard</h1>
                  <p className="text-blue-200 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-blue-300 mt-1">Welcome back, {user?.full_name}</p>
                </div>
              </div>

              <Link to={createPageUrl("Sales")}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white h-14 px-8 text-base font-bold shadow-2xl">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    New Sale
                    <Zap className="w-5 h-5 ml-2 text-[#1EB053]" />
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: "Today's Revenue", 
                  value: `Le ${totalRevenue.toLocaleString()}`, 
                  change: revenueChange,
                  icon: DollarSign, 
                  gradient: "from-[#1EB053] to-emerald-600",
                  count: `${todaySales.length} sales`
                },
                { 
                  label: "Inventory Value", 
                  value: `Le ${totalInventoryValue.toLocaleString()}`, 
                  icon: Package, 
                  gradient: "from-purple-500 to-purple-600",
                  count: `${products.length} items`,
                  alert: lowStockProducts.length + outOfStock.length
                },
                { 
                  label: "Staff Present", 
                  value: `${clockedIn.length}/${activeEmployees.length}`, 
                  icon: Users, 
                  gradient: "from-[#0072C6] to-blue-600",
                  count: `${attendanceRate}% rate`
                },
                { 
                  label: "Transport", 
                  value: `Le ${transportRevenue.toLocaleString()}`, 
                  icon: Truck, 
                  gradient: "from-amber-500 to-orange-600",
                  count: `${todayTrips.length} trips`
                }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-xl`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      {stat.alert > 0 && (
                        <Badge className="bg-red-500 text-white animate-pulse">
                          {stat.alert}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-blue-200 mb-1 font-medium">{stat.label}</p>
                    <p className="text-3xl font-black text-white mb-2">{stat.value}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-blue-300">{stat.count}</p>
                      {stat.change && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${parseFloat(stat.change) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {parseFloat(stat.change) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(stat.change)}%
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sierra Leone Stripe */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#0072C6]"></div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {(lowStockProducts.length > 0 || expiredBatches.length > 0 || expiringBatches.length > 0 || outOfStock.length > 0) && (
        <div className="px-6 -mt-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 opacity-90"></div>
            <div className="relative p-6 text-white backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl animate-pulse">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-xl">Critical Alerts</p>
                    <p className="text-sm text-white/80">Immediate attention required</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {outOfStock.length > 0 && (
                    <Badge className="bg-white/20 backdrop-blur text-white border border-white/30 font-bold">
                      <XCircle className="w-4 h-4 mr-2" />
                      {outOfStock.length} Out of Stock
                    </Badge>
                  )}
                  {expiredBatches.length > 0 && (
                    <Badge className="bg-white/20 backdrop-blur text-white border border-white/30 font-bold">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {expiredBatches.length} Expired
                    </Badge>
                  )}
                  {expiringBatches.length > 0 && (
                    <Badge className="bg-white/20 backdrop-blur text-white border border-white/30 font-bold">
                      <Clock className="w-4 h-4 mr-2" />
                      {expiringBatches.length} Expiring Soon
                    </Badge>
                  )}
                  {lowStockProducts.length > 0 && (
                    <Badge className="bg-white/20 backdrop-blur text-white border border-white/30 font-bold">
                      <Package className="w-4 h-4 mr-2" />
                      {lowStockProducts.length} Low Stock
                    </Badge>
                  )}
                </div>
                <Link to={createPageUrl("Inventory")}>
                  <Button className="bg-white text-red-600 hover:bg-white/90 font-bold shadow-xl">
                    Take Action
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-gray-200">
              {[
                { value: "overview", icon: BarChart3, label: "Overview" },
                { value: "sales", icon: ShoppingCart, label: "Sales" },
                { value: "inventory", icon: Package, label: "Inventory" },
                { value: "operations", icon: Activity, label: "Operations" },
                { value: "insights", icon: Target, label: "AI Insights" }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white rounded-xl px-6 py-3 font-bold transition-all"
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <QuickActions />
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <PerformanceIndicators 
              sales={sales}
              expenses={expenses}
              products={products}
              attendance={attendance}
              employees={employees}
              trips={trips}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesAnalytics sales={sales} organisation={organisation?.[0]} />
              <FinanceOverview 
                sales={sales}
                expenses={expenses}
                revenues={revenues}
                trips={trips}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed orgId={orgId} maxHeight="600px" />

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UpcomingMeetings meetings={meetings} />
                  </CardContent>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#1EB053]" />
                      Today's Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TodayAttendance attendance={attendance} employees={employees} />
                  </CardContent>
                </motion.div>
              </div>
            </div>

            <PendingApprovalsWidget orgId={orgId} currentEmployee={currentEmployee} />
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesAnalytics sales={sales} organisation={organisation?.[0]} />
              </div>
              <TopPerformers 
                sales={sales}
                employees={employees}
                trips={trips}
                products={products}
              />
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <InventoryOverview 
              products={products} 
              stockMovements={stockMovements}
              categories={[...new Set(products.map(p => p.category).filter(Boolean))]}
            />
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HRMetrics 
                employees={employees} 
                attendance={attendance}
                leaveRequests={leaveRequests}
              />
              <TransportMetrics 
                trips={trips}
                vehicles={vehicles}
                routes={routes}
                truckContracts={truckContracts}
              />
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <AIInsightsPanel 
              data={{
                sales: todaySales,
                attendance: attendance,
                products: products.slice(0, 20),
                trips: todayTrips,
                expenses: monthExpenses
              }}
              type="sales"
              title="Smart Business Recommendations"
              orgId={orgId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}