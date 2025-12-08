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
  Layers,
  Bell,
  XCircle,
  BarChart3,
  PieChart,
  TrendingDown,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import PerformanceIndicators from "@/components/dashboard/PerformanceIndicators";
import TopPerformers from "@/components/dashboard/TopPerformers";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

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

  // Calculate statistics - Enhanced
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(new Date(today.getTime() - 86400000), 'yyyy-MM-dd');
  
  const todaySales = sales.filter(s => s.created_date?.startsWith(todayStr));
  const yesterdaySales = sales.filter(s => s.created_date?.startsWith(yesterdayStr));
  const totalRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const revenueChange = yesterdayRevenue > 0 ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;
  
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold && p.is_active);
  const outOfStock = products.filter(p => p.stock_quantity === 0 && p.is_active);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock_quantity * (p.cost_price || 0)), 0);
  
  const activeEmployees = employees.filter(e => e.status === 'active');
  const todayTrips = trips.filter(t => t.date === todayStr);
  const transportRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const clockedIn = attendance.filter(a => a.clock_in_time && !a.clock_out_time);
  const attendanceRate = activeEmployees.length > 0 ? (clockedIn.length / activeEmployees.length * 100).toFixed(0) : 0;

  // Expiry tracking
  const expiringBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    const daysUntilExpiry = differenceInDays(new Date(batch.expiry_date), today);
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });
  const expiredBatches = inventoryBatches.filter(batch => {
    if (!batch.expiry_date) return false;
    return differenceInDays(new Date(batch.expiry_date), today) < 0;
  });
  
  // This month finances
  const thisMonth = format(today, 'yyyy-MM');
  const monthExpenses = expenses.filter(e => e.date?.startsWith(thisMonth));
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-4">
      {/* Welcome Header with Sierra Leone Theme - Compact */}
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        {/* Animated Flag stripe at top */}
        <div className="h-2 flex relative overflow-hidden">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
        <div className="relative bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C] p-4 sm:p-5 text-white overflow-hidden">
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
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white to-[#D4AF37] bg-clip-text text-transparent">
                Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-white/70 mt-1 flex items-center gap-2 text-sm">
                <Calendar className="w-3.5 h-3.5 text-[#1EB053]" />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <Link to={createPageUrl("Sales")}>
              <Button className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </Link>
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

      {/* Enhanced Stats Grid with Trends */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link to={createPageUrl("Sales")} className="group">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-gradient-to-r from-[#1EB053] to-[#0ea844]" />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0ea844] flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                {revenueChange !== 0 && (
                  <Badge className={`${parseFloat(revenueChange) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-0`}>
                    {parseFloat(revenueChange) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                    {Math.abs(revenueChange)}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-[#1EB053] mb-1">Le {totalRevenue.toLocaleString()}</p>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500">{todaySales.length} transactions</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1EB053] transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Inventory")} className="group">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]" />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                {lowStockProducts.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-0 animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {lowStockProducts.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Inventory Value</p>
              <p className="text-2xl font-bold text-[#8b5cf6] mb-1">Le {totalInventoryValue.toLocaleString()}</p>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500">{products.length} products</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8b5cf6] transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Attendance")} className="group">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-gradient-to-r from-[#0072C6] to-[#005a9e]" />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0072C6] to-[#005a9e] flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  {attendanceRate}%
                </Badge>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Attendance</p>
              <p className="text-2xl font-bold text-[#0072C6] mb-1">{clockedIn.length}/{activeEmployees.length}</p>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500">Active today</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0072C6] transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Transport")} className="group">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer">
            <div className="h-1.5 bg-gradient-to-r from-[#f59e0b] to-[#d97706]" />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-0">
                  {todayTrips.length} trips
                </Badge>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transport Revenue</p>
              <p className="text-2xl font-bold text-[#f59e0b] mb-1">Le {transportRevenue.toLocaleString()}</p>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500">{vehicles.filter(v => v.status === 'active').length} vehicles</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#f59e0b] transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Critical Alerts Banner */}
      {(lowStockProducts.length > 0 || expiredBatches.length > 0 || expiringBatches.length > 0 || outOfStock.length > 0) && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 p-0.5 shadow-lg">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse flex-shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Critical Alerts</p>
                  <p className="text-xs text-gray-600">Action required</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {outOfStock.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    {outOfStock.length} Out
                  </Badge>
                )}
                {expiredBatches.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {expiredBatches.length} Expired
                  </Badge>
                )}
                {expiringBatches.length > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {expiringBatches.length} Soon
                  </Badge>
                )}
                {lowStockProducts.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    {lowStockProducts.length} Low
                  </Badge>
                )}
              </div>
              <Link to={createPageUrl("Inventory")}>
                <Button size="sm" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                  View <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modern Tabbed Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-white">
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-white">
            <Truck className="w-4 h-4 mr-2" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-white">
            <Target className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <PerformanceIndicators 
            sales={sales}
            expenses={expenses}
            products={products}
            attendance={attendance}
            employees={employees}
            trips={trips}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesAnalytics sales={sales} organisation={organisation?.[0]} />
            <FinanceOverview 
              sales={sales}
              expenses={expenses}
              revenues={revenues}
              trips={trips}
            />
          </div>

          {/* Recent Sales & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Sales - Takes 2 columns */}
            <Card className="lg:col-span-2 border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#1EB053]" />
                    Recent Sales
                    <Badge variant="secondary" className="ml-2 text-xs">{todaySales.length} today</Badge>
                  </CardTitle>
                  <Link to={createPageUrl("Sales")}>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {todaySales.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No sales today</p>
                  </div>
                ) : (
                  <div className="divide-y max-h-72 overflow-y-auto">
                    {todaySales.slice(0, 6).map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs truncate">{sale.customer_name || 'Walk-in Customer'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{sale.employee_name} • {format(new Date(sale.created_date), 'h:mm a')}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-bold text-sm text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
                          <Badge variant="outline" className="text-[9px] mt-0.5">{sale.payment_method?.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity & Events - Stacked */}
            <div className="space-y-4">
              <Card className="border-0 shadow-md">
                <div className="h-1 bg-gradient-to-r from-[#0072C6] to-[#8b5cf6]" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0072C6]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivity activities={recentActivity} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <div className="h-1 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#8b5cf6]" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UpcomingMeetings meetings={meetings} />
                </CardContent>
              </Card>
            </div>
          </div>

          <TopPerformers 
            sales={sales}
            employees={employees}
            trips={trips}
            products={products}
          />
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
        <TabsContent value="inventory" className="space-y-4">
          <InventoryOverview 
            products={products} 
            stockMovements={stockMovements}
            categories={[...new Set(products.map(p => p.category).filter(Boolean))]}
          />
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <TabsContent value="insights" className="space-y-4">
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

      {/* Footer with Sierra Leone Pride - Compact */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0F1F3C] to-[#1a3a5c] p-3">
        <div className="flex items-center justify-center gap-2 relative z-10">
          <div className="flex h-5 w-10 rounded overflow-hidden shadow">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <p className="text-xs text-white/80 font-medium">🇸🇱 Proudly serving Sierra Leone</p>
        </div>
      </div>
    </div>
  );
}