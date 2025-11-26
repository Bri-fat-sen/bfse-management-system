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
  AlertTriangle,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Bell,
  ArrowRight,
  Activity,
  Wrench,
  FileText,
  Fuel,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function ManagerDashboard({ currentEmployee, orgId, user, organisation }) {
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
    queryKey: ['todayAttendance', orgId, today],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId, date: today }),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: pendingPayrolls = [] } = useQuery({
    queryKey: ['pendingPayrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId, status: 'pending_approval' }),
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

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', 10),
    enabled: !!orgId,
  });

  const { data: truckContracts = [] } = useQuery({
    queryKey: ['truckContracts', orgId],
    queryFn: () => base44.entities.TruckContract.filter({ organisation_id: orgId }, '-contract_date', 100),
    enabled: !!orgId,
  });

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['vehicleMaintenance', orgId],
    queryFn: () => base44.entities.VehicleMaintenance.filter({ organisation_id: orgId }, '-date_performed', 100),
    enabled: !!orgId,
  });

  // Calculate metrics
  const todaySales = (sales || []).filter(s => s?.created_date?.startsWith(today));
  const todaySalesRevenue = todaySales.reduce((sum, s) => sum + (s?.total_amount || 0), 0);
  
  const todayTrips = (trips || []).filter(t => t?.date === today);
  const todayTransportRevenue = todayTrips.reduce((sum, t) => sum + (t?.total_revenue || 0), 0);
  
  const todayContracts = (truckContracts || []).filter(c => c?.contract_date === today && c?.status === 'completed');
  const todayContractRevenue = todayContracts.reduce((sum, c) => sum + (c?.contract_amount || 0), 0);
  
  // Total today's revenue from all sources
  const todayTotalRevenue = todaySalesRevenue + todayTransportRevenue + todayContractRevenue;
  
  const activeEmployees = employees.filter(e => e.status === 'active');
  const clockedIn = attendance.filter(a => a.clock_in_time && !a.clock_out_time);
  
  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10));
  
  const expiringBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    const daysLeft = differenceInDays(new Date(b.expiry_date), new Date());
    return daysLeft <= 30 && daysLeft >= 0;
  });
  
  const expiredBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    return differenceInDays(new Date(b.expiry_date), new Date()) < 0;
  });

  // Monthly calculations - ALL REVENUE SOURCES
  const now = new Date();
  const monthSalesRevenue = sales.filter(s => {
    const saleDate = new Date(s.created_date);
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
  }).reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const monthTransportRevenue = trips.filter(t => {
    const tripDate = new Date(t.date);
    return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + (t.total_revenue || 0), 0);

  const monthContractRevenue = truckContracts.filter(c => {
    const contractDate = new Date(c.contract_date);
    return contractDate.getMonth() === now.getMonth() && contractDate.getFullYear() === now.getFullYear() && c.status === 'completed';
  }).reduce((sum, c) => sum + (c.contract_amount || 0), 0);

  const monthTotalRevenue = monthSalesRevenue + monthTransportRevenue + monthContractRevenue;

  // Monthly calculations - ALL EXPENSE SOURCES
  const monthRecordedExpenses = expenses.filter(e => {
    const expDate = new Date(e.date);
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + (e.amount || 0), 0);

  const monthTripExpenses = trips.filter(t => {
    const tripDate = new Date(t.date);
    return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + (t.fuel_cost || 0) + (t.other_expenses || 0), 0);

  const monthContractExpenses = truckContracts.filter(c => {
    const contractDate = new Date(c.contract_date);
    return contractDate.getMonth() === now.getMonth() && contractDate.getFullYear() === now.getFullYear();
  }).reduce((sum, c) => sum + (c.total_expenses || 0), 0);

  const monthMaintenanceExpenses = maintenanceRecords.filter(m => {
    const maintDate = new Date(m.date_performed);
    return maintDate.getMonth() === now.getMonth() && maintDate.getFullYear() === now.getFullYear();
  }).reduce((sum, m) => sum + (m.cost || 0), 0);

  const monthTotalExpenses = monthRecordedExpenses + monthTripExpenses + monthContractExpenses + monthMaintenanceExpenses;
  const monthNetProfit = monthTotalRevenue - monthTotalExpenses;

  const criticalAlerts = [
    ...(expiredBatches.length > 0 ? [{ type: 'danger', title: `${expiredBatches.length} Expired Batches`, link: 'Inventory' }] : []),
    ...(expiringBatches.length > 0 ? [{ type: 'warning', title: `${expiringBatches.length} Batches Expiring Soon`, link: 'Inventory' }] : []),
    ...(lowStockProducts.length > 0 ? [{ type: 'warning', title: `${lowStockProducts.length} Low Stock Items`, link: 'Inventory' }] : []),
    ...(pendingPayrolls.length > 0 ? [{ type: 'info', title: `${pendingPayrolls.length} Payrolls Pending Approval`, link: 'HR' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <div className="sl-hero-pattern p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">🇸🇱 {organisation?.name || ''}</p>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Manager'}!
              </h1>
              <p className="text-white/80 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Sales")}>
                <Button variant="secondary" className="bg-white text-[#0072C6] hover:bg-white/90">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-red-500" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {criticalAlerts.map((alert, idx) => (
                <Link key={idx} to={createPageUrl(alert.link)}>
                  <div className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:opacity-80 ${
                    alert.type === 'danger' ? 'bg-red-100 text-red-700' :
                    alert.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{alert.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Total Revenue"
          value={`Le ${todayTotalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="All sources"
        />
        <StatCard
          title="Month Revenue"
          value={`Le ${monthTotalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
          subtitle="All revenue sources"
        />
        <StatCard
          title="Month Expenses"
          value={`Le ${monthTotalExpenses.toLocaleString()}`}
          icon={Receipt}
          color="red"
          subtitle="All expense sources"
        />
        <StatCard
          title="Month Net Profit"
          value={`Le ${monthNetProfit.toLocaleString()}`}
          icon={TrendingUp}
          color={monthNetProfit >= 0 ? "green" : "red"}
          subtitle={monthNetProfit >= 0 ? 'Positive' : 'Negative'}
        />
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Today's Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Sales</span>
              </div>
              <p className="text-2xl font-bold text-green-700">Le {todaySalesRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">{todaySales.length} transactions</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Transport</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">Le {todayTransportRevenue.toLocaleString()}</p>
              <p className="text-sm text-blue-600">{todayTrips.length} trips</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span className="font-medium text-teal-800">Contracts</span>
              </div>
              <p className="text-2xl font-bold text-teal-700">Le {todayContractRevenue.toLocaleString()}</p>
              <p className="text-sm text-teal-600">{todayContracts.length} completed</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">Le {todayTotalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">All sources combined</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-600" />
            This Month's Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Recorded</span>
              </div>
              <p className="text-lg font-bold text-red-700">Le {monthRecordedExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Fuel className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Trip Costs</span>
              </div>
              <p className="text-lg font-bold text-orange-700">Le {monthTripExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-800">Contract</span>
              </div>
              <p className="text-lg font-bold text-violet-700">Le {monthContractExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-cyan-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-medium text-cyan-800">Maintenance</span>
              </div>
              <p className="text-lg font-bold text-cyan-700">Le {monthMaintenanceExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Total</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Le {monthTotalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Staff Present"
          value={`${clockedIn.length}/${activeEmployees.length}`}
          icon={Users}
          color="blue"
          subtitle="Clocked in today"
        />
        <StatCard
          title="Products"
          value={products.length}
          icon={Package}
          color="navy"
          subtitle={`${lowStockProducts.length} low stock`}
        />
        <StatCard
          title="Active Contracts"
          value={truckContracts.filter(c => c.status === 'in_progress' || c.status === 'pending').length}
          icon={FileText}
          color="gold"
          subtitle="In progress"
        />
        <StatCard
          title="Maintenance Due"
          value={maintenanceRecords.filter(m => m.next_due_date && new Date(m.next_due_date) <= new Date()).length}
          icon={Wrench}
          color="red"
          subtitle="Overdue services"
        />
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={createPageUrl("Sales")}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-[#1EB053]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="text-xl font-bold">{todaySales.length} today</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-[#1EB053]" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Le {todaySalesRevenue.toLocaleString()} revenue</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Inventory")}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-[#0072C6]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inventory</p>
                  <p className="text-xl font-bold">{products.length} products</p>
                </div>
                <Package className="w-8 h-8 text-[#0072C6]" />
              </div>
              <p className="text-xs text-gray-400 mt-2">{lowStockProducts.length} low stock alerts</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("Transport")}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-[#D4AF37]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Transport</p>
                  <p className="text-xl font-bold">{todayTrips.length} trips</p>
                </div>
                <Truck className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Le {todayTransportRevenue.toLocaleString()} revenue</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl("HR")}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-[#0F1F3C]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">HR</p>
                  <p className="text-xl font-bold">{activeEmployees.length} staff</p>
                </div>
                <Users className="w-8 h-8 text-[#0F1F3C]" />
              </div>
              <p className="text-xs text-gray-400 mt-2">{pendingPayrolls.length} payrolls pending</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <RecentActivity activities={recentActivity} />
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-400">🇸🇱 Proudly serving businesses in Sierra Leone</p>
      </div>
    </div>
  );
}