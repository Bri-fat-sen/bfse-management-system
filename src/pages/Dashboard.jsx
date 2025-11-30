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
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Activity,
  Layers,
  Bell,
  XCircle
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
import AIInsightsCard from "@/components/ai/AIInsightsCard";

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
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    ...queryConfig,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    ...queryConfig,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    ...queryConfig,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 20),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    ...queryConfig,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', 5),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    ...queryConfig,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['todayAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId, 
      date: format(new Date(), 'yyyy-MM-dd') 
    }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    ...queryConfig,
  });

  const { data: stockAlerts = [] } = useQuery({
    queryKey: ['stockAlerts', orgId],
    queryFn: () => base44.entities.StockAlert.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: inventoryBatches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 10),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    ...queryConfig,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!user || !currentEmployee) {
    return <LoadingSpinner message="Loading Dashboard..." subtitle="Preparing your overview" fullScreen={true} />;
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
  const todaySales = sales.filter(s => 
    s.created_date?.startsWith(format(new Date(), 'yyyy-MM-dd'))
  );
  const totalRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
  const activeEmployees = employees.filter(e => e.status === 'active');
  const todayTrips = trips.filter(t => t.date === format(new Date(), 'yyyy-MM-dd'));
  const transportRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const clockedIn = attendance.filter(a => a.clock_in_time && !a.clock_out_time);

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
        <div className="relative bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C] p-6 md:p-8 text-white overflow-hidden">
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
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-[#D4AF37] bg-clip-text text-transparent">
                Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Today's Sales</p>
                <p className="text-2xl font-bold text-[#1EB053]">Le {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">+12% from yesterday</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Active Staff</p>
                <p className="text-2xl font-bold text-[#0072C6]">{activeEmployees.length}</p>
                <p className="text-xs text-gray-500 mt-1">{clockedIn.length} clocked in</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#0072C6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#8b5cf6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Products</p>
                <p className="text-2xl font-bold text-[#8b5cf6]">{products.length}</p>
                <p className="text-xs text-gray-500 mt-1">{lowStockProducts.length} low stock</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#8b5cf6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#f59e0b]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Transport</p>
                <p className="text-2xl font-bold text-[#f59e0b]">Le {transportRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{todayTrips.length} trips</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#f59e0b]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#1EB053]">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
            </div>
            <Link to={createPageUrl("Sales")}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todaySales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No sales recorded today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{sale.sale_number || `Sale #${sale.id.slice(-6)}`}</p>
                        <p className="text-sm text-gray-500">{sale.employee_name || 'Staff'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1EB053]">SLE {sale.total_amount?.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-xs">
                        {sale.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Critical Alerts Section */}
          {(lowStockProducts.length > 0 || expiredBatches.length > 0 || expiringBatches.length > 0) && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
              <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-white">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 animate-pulse">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Expired Batches */}
                {expiredBatches.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                      <XCircle className="w-4 h-4" />
                      {expiredBatches.length} Expired Batch{expiredBatches.length > 1 ? 'es' : ''}
                    </div>
                    <div className="space-y-1">
                      {expiredBatches.slice(0, 2).map((batch) => (
                        <p key={batch.id} className="text-xs text-red-600 truncate">
                          {batch.product_name} - Batch {batch.batch_number}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expiring Soon */}
                {expiringBatches.length > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-700 font-medium text-sm mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      {expiringBatches.length} Expiring Within 30 Days
                    </div>
                    <div className="space-y-1">
                      {expiringBatches.slice(0, 2).map((batch) => (
                        <p key={batch.id} className="text-xs text-orange-600 truncate">
                          {batch.product_name} - {differenceInDays(new Date(batch.expiry_date), today)} days left
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Low Stock */}
                {lowStockProducts.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-2">
                      <Package className="w-4 h-4" />
                      {lowStockProducts.length} Low Stock Item{lowStockProducts.length > 1 ? 's' : ''}
                    </div>
                    <div className="space-y-1">
                      {lowStockProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1 text-amber-600">{product.name}</span>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {product.stock_quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link to={createPageUrl("Inventory")}>
                  <Button variant="ghost" size="sm" className="w-full">
                    View Inventory <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="relative">
        <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-gray-50/50 pointer-events-none" />
        <QuickActions />
      </div>

      {/* AI Insights */}
      <AIInsightsCard
        title="AI Business Insights"
        analysisType="sales_anomaly"
        data={{
          todaySales: todaySales.slice(0, 20),
          totalRevenue,
          avgSale: todaySales.length > 0 ? totalRevenue / todaySales.length : 0,
          salesCount: todaySales.length
        }}
        context={{
          period: 'today',
          previousAverage: sales.slice(0, 100).reduce((sum, s) => sum + (s.total_amount || 0), 0) / (sales.length || 1)
        }}
        compact={true}
      />

      {/* Additional Dashboard Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <TodayAttendance attendance={attendance} employees={employees} />
        <UpcomingMeetings meetings={meetings} />
        <TransportSummary trips={trips} vehicles={vehicles} routes={routes} />
        <FinanceSummary sales={sales} expenses={expenses} />
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