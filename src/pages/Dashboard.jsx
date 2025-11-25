import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
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

export default function Dashboard() {
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
  const userRole = currentEmployee?.role || 'read_only';

  // Role-based dashboard routing
  const isDriver = userRole === 'driver';
  const isSalesStaff = ['retail_cashier', 'vehicle_sales', 'warehouse_manager'].includes(userRole);
  const isManager = ['super_admin', 'org_admin', 'hr_admin', 'payroll_admin', 'accountant'].includes(userRole);

  // All hooks must be called before conditional returns
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', 10),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId, 
      date: format(new Date(), 'yyyy-MM-dd') 
    }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: stockAlerts = [] } = useQuery({
    queryKey: ['stockAlerts', orgId],
    queryFn: () => base44.entities.StockAlert.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: inventoryBatches = [] } = useQuery({
    queryKey: ['inventoryBatches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 20),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', orgId],
    queryFn: () => base44.entities.Route.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId && !isDriver && !isSalesStaff && !isManager,
  });

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
      <div className="relative overflow-hidden rounded-2xl">
        {/* Flag stripe at top */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <div className="sl-hero-pattern p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <p className="text-white/70 text-sm mb-1">🇸🇱 BRI-FAT-SEN Enterprise</p>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-white/80 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Sales")}>
                <Button variant="secondary" className="bg-white text-[#0072C6] hover:bg-white/90 font-semibold shadow-lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </Link>
            </div>
          </div>
          {/* Decorative cotton tree silhouette */}
          <div className="absolute right-4 bottom-0 opacity-10">
            <svg width="120" height="100" viewBox="0 0 120 100" fill="currentColor">
              <path d="M60 100V60M60 60C60 60 40 50 40 35C40 20 50 15 60 15C70 15 80 20 80 35C80 50 60 60 60 60Z M60 15C60 15 45 10 45 5C45 0 52 0 60 0C68 0 75 0 75 5C75 10 60 15 60 15Z M40 35C40 35 25 30 20 35C15 40 25 50 40 45 M80 35C80 35 95 30 100 35C105 40 95 50 80 45"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`SLE ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="+12% from yesterday"
        />
        <StatCard
          title="Active Staff"
          value={activeEmployees.length}
          icon={Users}
          color="blue"
          subtitle={`${clockedIn.length} clocked in today`}
        />
        <StatCard
          title="Products"
          value={products.length}
          icon={Package}
          color="navy"
          subtitle={`${lowStockProducts.length} low stock alerts`}
        />
        <StatCard
          title="Transport Revenue"
          value={`SLE ${transportRevenue.toLocaleString()}`}
          icon={Truck}
          color="gold"
          subtitle={`${todayTrips.length} trips today`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card className="lg:col-span-2 border-t-4 border-t-[#0072C6]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
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
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-500" />
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
      <QuickActions />

      {/* Additional Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TodayAttendance attendance={attendance} employees={employees} />
        <UpcomingMeetings meetings={meetings} />
        <TransportSummary trips={trips} vehicles={vehicles} routes={routes} />
        <FinanceSummary sales={sales} expenses={expenses} />
      </div>

      {/* Footer with Sierra Leone Pride */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-400">🇸🇱 Proudly serving businesses in Sierra Leone</p>
      </div>
    </div>
  );
}