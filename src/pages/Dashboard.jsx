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
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Welcome, {user?.full_name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl("Sales")}>
            <Button className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-sm hover:shadow-md transition-all">
              <ShoppingCart className="w-4 h-4 mr-2" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Clean Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue Today</CardTitle>
            <DollarSign className="w-4 h-4 text-[#1EB053]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Le {totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{todaySales.length} sales</Badge>
              {revenueChange !== 0 && (
                <span className={`text-xs flex items-center ${parseFloat(revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(revenueChange) >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(revenueChange)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inventory</CardTitle>
            <Package className="w-4 h-4 text-[#8b5cf6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Le {totalInventoryValue.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{products.length} items</Badge>
              {(lowStockProducts.length > 0 || outOfStock.length > 0) && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {lowStockProducts.length + outOfStock.length} alerts
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attendance</CardTitle>
            <Users className="w-4 h-4 text-[#0072C6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{clockedIn.length}/{activeEmployees.length}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{attendanceRate}% rate</Badge>
              <span className="text-xs text-gray-500">present today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transport</CardTitle>
            <Truck className="w-4 h-4 text-[#f59e0b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Le {transportRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{todayTrips.length} trips</Badge>
              <span className="text-xs text-gray-500">today</span>
            </div>
          </CardContent>
        </Card>
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

      {/* Modern Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-[#1EB053] data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-[#0072C6] data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-[#f59e0b] data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>
          <QuickActions />
        </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

            <Card className="border-0 shadow-md">
              <div className="h-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1EB053]" />
                  Today's Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TodayAttendance attendance={attendance} employees={employees} />
              </CardContent>
            </Card>
          </div>
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

    </div>
  );
}