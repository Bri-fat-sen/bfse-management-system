import React from "react";
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
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Activity,
  Layers,
  Bell,
  XCircle,
  Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "@/components/ui/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import TodayAttendance from "@/components/dashboard/TodayAttendance";
import TransportSummary from "@/components/dashboard/TransportSummary";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import DriverDashboard from "@/components/dashboard/DriverDashboard";
import SalesDashboard from "@/components/dashboard/SalesDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import AIInsightsPanel from "@/components/ai/AIInsightsPanel";
import InventoryOverview from "@/components/dashboard/InventoryOverview";
import SalesAnalytics from "@/components/dashboard/SalesAnalytics";
import HRMetrics from "@/components/dashboard/HRMetrics";
import TransportMetrics from "@/components/dashboard/TransportMetrics";
import FinanceOverview from "@/components/dashboard/FinanceOverview";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const userRole = currentEmployee?.role || 'read_only';

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Role-based dashboard routing
  const isDriver = userRole === 'driver';
  const isSalesStaff = ['retail_cashier', 'vehicle_sales', 'warehouse_manager'].includes(userRole);
  const isManager = ['super_admin', 'org_admin', 'hr_admin', 'payroll_admin', 'accountant'].includes(userRole);

  // All hooks must be called before conditional returns - with caching to reduce API calls
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

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', 5),
    enabled: !!orgId,
    ...queryConfig,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['todayAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId, 
      date: format(new Date(), 'yyyy-MM-dd') 
    }),
    enabled: !!orgId,
    ...queryConfig,
  });

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

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['maintenanceRecords', orgId],
    queryFn: () => base44.entities.VehicleMaintenance.filter({ organisation_id: orgId }),
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

  // Allow super admins to see dashboard even without employee record
  if (!user) {
    return <LoadingSpinner message="Loading Dashboard..." subtitle="Preparing your overview" fullScreen={true} />;
  }

  // If user is admin but has no employee record, show manager dashboard
  if (!currentEmployee && user?.role === 'admin') {
    return <ManagerDashboard currentEmployee={null} orgId={null} user={user} />;
  }

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator to set up your employee profile.
        </p>
      </div>
    );
  }

  // Show role-specific dashboard
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
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySales = sales.filter(s => s.created_date?.startsWith(todayStr));
  const totalRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  
  const yesterdayStr = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  const yesterdaySales = sales.filter(s => s.created_date?.startsWith(yesterdayStr));
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const revenueGrowth = yesterdayRevenue > 0 ? (((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1) : 0;
  
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
  const activeEmployees = employees.filter(e => e.status === 'active');
  const todayTrips = trips.filter(t => t.date === todayStr);
  const transportRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const clockedIn = attendance.filter(a => a.clock_in_time && !a.clock_out_time);
  
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price), 0);
  const thisMonthExpenses = expenses.filter(e => e.date?.startsWith(format(new Date(), 'yyyy-MM'))).reduce((sum, e) => sum + (e.amount || 0), 0);

  // Expiry tracking
  const today = new Date();
  const expiringBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    const daysUntilExpiry = differenceInDays(new Date(batch.expiry_date), today);
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });
  const expiredBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    return differenceInDays(new Date(batch.expiry_date), today) < 0;
  });
  const activeAlerts = stockAlerts.filter(a => a.status === 'active');

  return (
    <div className="space-y-6">
      {/* Welcome Header with Sierra Leone Theme */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Animated Flag stripe at top */}
        <div className="h-2 flex relative overflow-hidden">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
        <div className="relative bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C] p-4 sm:p-6 md:p-8 text-white overflow-hidden">
          {/* Decorative background patterns */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1EB053] rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0072C6] rounded-full blur-[80px] opacity-20" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#D4AF37] rounded-full blur-[60px] opacity-10" />
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-1.5 rounded-full overflow-hidden">
                  <div className="w-full bg-gradient-to-b from-[#1EB053] via-white to-[#0072C6]" />
                </div>
                <p className="text-[#D4AF37] text-sm font-semibold tracking-wide">🇸🇱 BRI-FAT-SEN ENTERPRISE</p>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-[#D4AF37] bg-clip-text text-transparent">
                Welcome, {user?.full_name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-white/70 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1EB053]" />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Sales")}>
                <Button className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Decorative cotton tree silhouette - larger and more prominent */}
          <div className="absolute right-8 bottom-0 opacity-20">
            <svg width="150" height="120" viewBox="0 0 120 100" fill="currentColor">
              <path d="M60 100V60M60 60C60 60 40 50 40 35C40 20 50 15 60 15C70 15 80 20 80 35C80 50 60 60 60 60Z M60 15C60 15 45 10 45 5C45 0 52 0 60 0C68 0 75 0 75 5C75 10 60 15 60 15Z M40 35C40 35 25 30 20 35C15 40 25 50 40 45 M80 35C80 35 95 30 100 35C105 40 95 50 80 45"/>
            </svg>
          </div>
          
          {/* Diamond accent */}
          <div className="absolute right-32 top-4 w-3 h-3 bg-[#D4AF37] rotate-45 opacity-60" />
          <div className="absolute right-40 top-8 w-2 h-2 bg-[#1EB053] rotate-45 opacity-40" />
        </div>
        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-0 shadow-lg overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="h-1 bg-gradient-to-r from-[#1EB053] to-[#0d8f3f]" />
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Today's Revenue</p>
                <p className="text-2xl font-bold text-[#1EB053]">Le {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0d8f3f] flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
              </span>
              <span className="text-xs text-gray-500">vs yesterday</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">{todaySales.length} transactions</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="h-1 bg-gradient-to-r from-[#0072C6] to-[#005a9e]" />
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Attendance</p>
                <p className="text-2xl font-bold text-[#0072C6]">{clockedIn.length}/{activeEmployees.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0072C6] to-[#005a9e] flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-[#0072C6]" />
              <span className="text-xs font-medium text-[#0072C6]">
                {activeEmployees.length > 0 ? ((clockedIn.length / activeEmployees.length) * 100).toFixed(0) : 0}%
              </span>
              <span className="text-xs text-gray-500">present</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">{activeEmployees.length} active employees</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="h-1 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]" />
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Inventory Value</p>
                <p className="text-2xl font-bold text-[#8b5cf6]">Le {totalInventoryValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">{lowStockProducts.length} low stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">All stocked well</span>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">{products.length} total products</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="h-1 bg-gradient-to-r from-[#f59e0b] to-[#d97706]" />
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transport</p>
                <p className="text-2xl font-bold text-[#f59e0b]">Le {transportRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-3 h-3 text-[#f59e0b]" />
              <span className="text-xs font-medium text-[#f59e0b]">{todayTrips.length} trips today</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">{vehicles.filter(v => v.status === 'active').length} active vehicles</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Module Analytics Section */}
      <div className="space-y-6">
        {/* Sales Analytics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#1EB053] to-[#0072C6]" />
            <h2 className="text-lg font-bold text-gray-900">Sales Performance</h2>
          </div>
          <SalesAnalytics sales={sales} organisation={organisation?.[0]} />
        </div>

        {/* Inventory Overview */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#8b5cf6] to-[#1EB053]" />
            <h2 className="text-lg font-bold text-gray-900">Inventory Insights</h2>
          </div>
          <InventoryOverview 
            products={products} 
            stockMovements={stockMovements}
            categories={[...new Set(products.map(p => p.category).filter(Boolean))]}
          />
        </div>

        {/* HR Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#0072C6] to-[#8b5cf6]" />
            <h2 className="text-lg font-bold text-gray-900">Human Resources</h2>
          </div>
          <HRMetrics 
            employees={employees} 
            attendance={attendance}
            leaveRequests={leaveRequests}
          />
        </div>

        {/* Transport Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#f59e0b] to-[#ef4444]" />
            <h2 className="text-lg font-bold text-gray-900">Transport Operations</h2>
          </div>
          <TransportMetrics 
            trips={trips}
            vehicles={vehicles}
            routes={routes}
            truckContracts={truckContracts}
          />
        </div>

        {/* Finance Overview */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#1EB053] via-[#f59e0b] to-[#ef4444]" />
            <h2 className="text-lg font-bold text-gray-900">Financial Overview</h2>
          </div>
          <FinanceOverview 
            sales={sales}
            expenses={expenses}
            revenues={revenues}
            trips={trips}
          />
        </div>
      </div>

      {/* AI Insights */}
      <AIInsightsPanel 
        data={{
          sales: todaySales,
          attendance: attendance,
          products: products.slice(0, 20),
          trips: todayTrips
        }}
        type="sales"
        title="AI Business Insights"
        orgId={orgId}
      />

      {/* Activity & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Wider */}
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#0072C6] via-white to-[#1EB053]" />
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#1EB053]">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.employee_name || 'System'}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <Badge variant="outline" className="text-xs">{activity.action_type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Meetings */}
        <div className="space-y-4">
          {(lowStockProducts.length > 0 || expiredBatches.length > 0 || expiringBatches.length > 0) && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 to-amber-500" />
              <CardHeader className="pb-3 bg-red-50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-red-700">Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {expiredBatches.length > 0 && (
                  <div className="p-2 bg-red-100 rounded border border-red-300">
                    <p className="text-xs font-semibold text-red-700">🚨 {expiredBatches.length} Expired</p>
                  </div>
                )}
                {expiringBatches.length > 0 && (
                  <div className="p-2 bg-orange-100 rounded border border-orange-300">
                    <p className="text-xs font-semibold text-orange-700">⚠️ {expiringBatches.length} Expiring Soon</p>
                  </div>
                )}
                {lowStockProducts.length > 0 && (
                  <div className="p-2 bg-amber-100 rounded border border-amber-300">
                    <p className="text-xs font-semibold text-amber-700">📦 {lowStockProducts.length} Low Stock</p>
                  </div>
                )}
                <Link to={createPageUrl("Inventory")}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Review Inventory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          <UpcomingMeetings meetings={meetings} />
        </div>
      </div>

      {/* Footer with Sierra Leone Pride */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0F1F3C] to-[#1a3a5c] p-4 mt-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1EB053] rounded-full blur-[50px]" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0072C6] rounded-full blur-[40px]" />
        </div>
        <div className="flex items-center justify-center gap-3 relative z-10">
          <div className="flex h-6 w-12 rounded overflow-hidden shadow-lg">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <p className="text-sm text-white/80 font-medium">Proudly serving businesses in Sierra Leone</p>
          <div className="flex h-6 w-12 rounded overflow-hidden shadow-lg">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </div>
      </div>
    </div>
  );
}