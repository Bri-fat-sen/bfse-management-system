import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  Bell,
  ArrowRight,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function ManagerDashboard({ user, currentEmployee, orgId }) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['todayAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId, date: today }),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: stockAlerts = [] } = useQuery({
    queryKey: ['stockAlerts', orgId],
    queryFn: () => base44.entities.StockAlert.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches', orgId],
    queryFn: () => base44.entities.InventoryBatch.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const { data: pendingPayrolls = [] } = useQuery({
    queryKey: ['pendingPayrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId, status: 'pending_approval' }),
    enabled: !!orgId,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', 10),
    enabled: !!orgId,
  });

  // Calculate stats
  const todaySales = sales.filter(s => s.created_date?.startsWith(today));
  const totalRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const todayTrips = trips.filter(t => t.date === today);
  const transportRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const activeEmployees = employees.filter(e => e.status === 'active');
  const clockedIn = attendance.filter(a => a.clock_in_time && !a.clock_out_time);
  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));

  // Expiring batches
  const expiringBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    const daysLeft = differenceInDays(new Date(b.expiry_date), new Date());
    return daysLeft <= 30 && daysLeft >= 0;
  });

  const expiredBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    return differenceInDays(new Date(b.expiry_date), new Date()) < 0;
  });

  // Month expenses
  const monthExpenses = expenses
    .filter(e => e.created_date?.startsWith(format(new Date(), 'yyyy-MM')))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const criticalAlerts = [
    ...(lowStockProducts.length > 0 ? [{ type: 'low_stock', count: lowStockProducts.length, label: 'Low Stock Items', color: 'amber', link: 'Inventory' }] : []),
    ...(expiredBatches.length > 0 ? [{ type: 'expired', count: expiredBatches.length, label: 'Expired Batches', color: 'red', link: 'Inventory' }] : []),
    ...(expiringBatches.length > 0 ? [{ type: 'expiring', count: expiringBatches.length, label: 'Expiring Soon', color: 'orange', link: 'Inventory' }] : []),
    ...(pendingPayrolls.length > 0 ? [{ type: 'payroll', count: pendingPayrolls.length, label: 'Pending Payrolls', color: 'blue', link: 'HR' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="sl-hero-pattern rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm">🇸🇱 BRI-FAT-SEN Enterprise</p>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.full_name?.split(' ')[0] || 'Manager'}!</h1>
            <p className="text-white/80 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Sales")}>
              <Button className="bg-white text-[#0072C6] hover:bg-white/90">
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {criticalAlerts.map((alert) => (
                <Link key={alert.type} to={createPageUrl(alert.link)}>
                  <div className={`p-3 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer ${
                    alert.color === 'red' ? 'bg-red-50 border-red-200' :
                    alert.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                    alert.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <p className="text-2xl font-bold">{alert.count}</p>
                    <p className="text-sm text-gray-600">{alert.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`Le ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle={`${todaySales.length} transactions`}
        />
        <StatCard
          title="Active Staff"
          value={activeEmployees.length}
          icon={Users}
          color="blue"
          subtitle={`${clockedIn.length} clocked in`}
        />
        <StatCard
          title="Transport Revenue"
          value={`Le ${transportRevenue.toLocaleString()}`}
          icon={Truck}
          color="gold"
          subtitle={`${todayTrips.length} trips today`}
        />
        <StatCard
          title="Month Expenses"
          value={`Le ${monthExpenses.toLocaleString()}`}
          icon={TrendingUp}
          color="navy"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card className="lg:col-span-2 border-t-4 border-t-[#0072C6]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Sales</CardTitle>
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
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{sale.sale_number || `Sale #${sale.id.slice(-6)}`}</p>
                        <p className="text-sm text-gray-500">{sale.employee_name || 'Staff'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-xs">{sale.payment_method}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Attendance
            </CardTitle>
            <Link to={createPageUrl("Attendance")}>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Clocked In</span>
                </div>
                <span className="text-xl font-bold text-green-600">{clockedIn.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <span>Not Clocked In</span>
                </div>
                <span className="text-xl font-bold text-gray-600">{activeEmployees.length - clockedIn.length}</span>
              </div>
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  {((clockedIn.length / activeEmployees.length) * 100 || 0).toFixed(0)}% attendance rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Activity & Transport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivity} />
        
        {/* Transport Summary */}
        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Today's Trips
            </CardTitle>
            <Link to={createPageUrl("Transport")}>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">
                  {todayTrips.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">
                  {todayTrips.filter(t => t.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-600">
                  {todayTrips.filter(t => t.status === 'scheduled').length}
                </p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg text-center">
              <p className="text-sm text-gray-500">Total Passengers Today</p>
              <p className="text-2xl font-bold">{todayTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}