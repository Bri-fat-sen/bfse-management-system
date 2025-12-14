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
  Target,
  TrendingDown,
  Sparkles,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import QuickActions from "@/components/dashboard/QuickActions";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings";
import TodayAttendance from "@/components/dashboard/TodayAttendance";
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const userRole = currentEmployee?.role || 'read_only';

  const { data: organisations } = useQuery({
    queryKey: ['organisations'],
    queryFn: () => base44.entities.Organisation.list(),
    staleTime: 10 * 60 * 1000,
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

  const { data: inventoryBatches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    ...queryConfig,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 10),
    enabled: !!orgId,
    ...queryConfig,
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
    ...queryConfig,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
    ...queryConfig,
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
    return <LoadingSpinner message="Setting up..." fullScreen={true} />;
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

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(new Date(today.getTime() - 86400000), 'yyyy-MM-dd');
  const thisMonth = format(today, 'yyyy-MM');
  
  const todaySales = sales.filter(s => (s.created_date || '').split('T')[0] === todayStr);
  const yesterdaySales = sales.filter(s => (s.created_date || '').split('T')[0] === yesterdayStr);
  const totalRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const revenueChange = yesterdayRevenue > 0 ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;
  
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold && p.is_active !== false);
  const outOfStock = products.filter(p => p.stock_quantity === 0 && p.is_active !== false);
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0);
  
  const activeEmployees = employees.filter(e => e.status === 'active');
  const clockedIn = attendance.filter(a => a.clock_in_time && !a.clock_out_time);
  const attendanceRate = activeEmployees.length > 0 ? (clockedIn.length / activeEmployees.length * 100).toFixed(0) : 0;
  
  const todayTrips = trips.filter(t => (t.date || (t.created_date || '').split('T')[0]) === todayStr);
  const transportRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);

  const expiringBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    const days = differenceInDays(new Date(batch.expiry_date), today);
    return days <= 30 && days >= 0;
  });
  
  const expiredBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    return differenceInDays(new Date(batch.expiry_date), today) < 0;
  });
  
  const monthSales = sales.filter(s => (s.created_date || '').split('T')[0].startsWith(thisMonth));
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const monthExpenses = expenses.filter(e => (e.date || (e.created_date || '').split('T')[0]).startsWith(thisMonth));
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netIncome = monthRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Ultra Modern Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C] text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
        
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-2xl shadow-xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-1">Business Dashboard</h1>
                  <p className="text-blue-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <p className="text-lg text-blue-100 ml-16">Welcome back, <span className="font-bold">{user?.full_name?.split(' ')[0]}</span> 👋</p>
            </div>
            
            <Link to={createPageUrl("Sales")}>
              <Button size="lg" className="bg-white text-[#0072C6] hover:bg-gray-100 shadow-xl font-bold">
                <ShoppingCart className="w-5 h-5 mr-2" />
                New Sale
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Modern Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#1EB053]/30 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Today's Revenue</p>
                  <p className="text-2xl font-black text-white">Le {totalRevenue.toLocaleString()}</p>
                  {revenueChange !== 0 && (
                    <p className={`text-xs flex items-center gap-1 mt-1 ${parseFloat(revenueChange) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {parseFloat(revenueChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(revenueChange)}% vs yesterday
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0072C6]/30 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Inventory Value</p>
                  <p className="text-2xl font-black text-white">Le {totalInventoryValue.toLocaleString()}</p>
                  <p className="text-xs text-blue-300 mt-1">{products.length} products</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/30 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Attendance</p>
                  <p className="text-2xl font-black text-white">{clockedIn.length}/{activeEmployees.length}</p>
                  <p className="text-xs text-blue-300 mt-1">{attendanceRate}% present</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/30 rounded-xl">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Fleet Revenue</p>
                  <p className="text-2xl font-black text-white">Le {transportRevenue.toLocaleString()}</p>
                  <p className="text-xs text-blue-300 mt-1">{todayTrips.length} trips today</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </motion.div>

      {/* Critical Alerts */}
      {(lowStockProducts.length > 0 || expiredBatches.length > 0 || expiringBatches.length > 0 || outOfStock.length > 0) && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-1 shadow-xl"
        >
          <div className="bg-white rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">Critical Alerts</p>
                  <p className="text-sm text-gray-600">Immediate action required</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {outOfStock.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-0 font-bold">
                    <XCircle className="w-4 h-4 mr-1" />
                    {outOfStock.length} Out of Stock
                  </Badge>
                )}
                {expiredBatches.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-0 font-bold">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {expiredBatches.length} Expired
                  </Badge>
                )}
                {expiringBatches.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-0 font-bold">
                    <Clock className="w-4 h-4 mr-1" />
                    {expiringBatches.length} Expiring Soon
                  </Badge>
                )}
                {lowStockProducts.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 font-bold">
                    <Package className="w-4 h-4 mr-1" />
                    {lowStockProducts.length} Low Stock
                  </Badge>
                )}
              </div>
              <Link to={createPageUrl("Inventory")}>
                <Button className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-lg hover:shadow-xl transition-all">
                  View Inventory
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modern Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 p-1.5 rounded-2xl shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white rounded-xl font-bold">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white rounded-xl font-bold">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white rounded-xl font-bold">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white rounded-xl font-bold">
              <Activity className="w-4 h-4 mr-2" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white rounded-xl font-bold">
              <Zap className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>
          <QuickActions />
        </div>

        <TabsContent value="overview" className="space-y-6 mt-6">
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
            <FinanceOverview sales={sales} expenses={expenses} revenues={revenues} trips={trips} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed orgId={orgId} maxHeight="600px" />
            <div className="space-y-6">
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UpcomingMeetings meetings={meetings} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#0072C6]" />
                    Today's Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TodayAttendance attendance={attendance} employees={employees} />
                </CardContent>
              </Card>
            </div>
          </div>

          <PendingApprovalsWidget orgId={orgId} currentEmployee={currentEmployee} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesAnalytics sales={sales} organisation={organisation?.[0]} />
            </div>
            <TopPerformers sales={sales} employees={employees} trips={trips} products={products} />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <InventoryOverview 
            products={products} 
            stockMovements={stockMovements}
            categories={[...new Set(products.map(p => p.category).filter(Boolean))]}
          />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HRMetrics employees={employees} attendance={attendance} leaveRequests={leaveRequests} />
            <TransportMetrics trips={trips} vehicles={vehicles} routes={routes} truckContracts={truckContracts} />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-6">
          <AIInsightsPanel 
            data={{
              sales: todaySales,
              attendance: attendance,
              products: products.slice(0, 20),
              trips: todayTrips,
              expenses: monthExpenses
            }}
            type="sales"
            title="AI-Powered Business Intelligence"
            orgId={orgId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}