import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "@/components/ui/StatCard";

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

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activity', orgId],
    queryFn: () => base44.entities.ActivityLog.filter({ organisation_id: orgId }, '-created_date', 10),
    enabled: !!orgId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId, 
      date: format(new Date(), 'yyyy-MM-dd') 
    }),
    enabled: !!orgId,
  });

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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1EB053] to-[#1D5FC3] rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-white/80 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Sales")}>
              <Button variant="secondary" className="bg-white text-[#1D5FC3] hover:bg-white/90">
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`Le ${totalRevenue.toLocaleString()}`}
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
          value={`Le ${transportRevenue.toLocaleString()}`}
          icon={Truck}
          color="gold"
          subtitle={`${todayTrips.length} trips today`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card className="lg:col-span-2">
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
                      <p className="font-semibold text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
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
          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{product.name}</span>
                      <Badge variant="destructive" className="ml-2">
                        {product.stock_quantity} left
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl("Inventory")}>
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#1D5FC3]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-center py-4 text-gray-500 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#1EB053] mt-2" />
                      <div className="flex-1">
                        <p className="text-gray-700">{log.description}</p>
                        <p className="text-xs text-gray-400">
                          {log.employee_name} • {format(new Date(log.created_date), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to={createPageUrl("ActivityLog")}>
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Point of Sale", icon: ShoppingCart, page: "Sales", color: "from-[#1EB053] to-emerald-600" },
              { name: "Inventory", icon: Package, page: "Inventory", color: "from-[#1D5FC3] to-blue-600" },
              { name: "HR & Staff", icon: Users, page: "HR", color: "from-purple-500 to-purple-600" },
              { name: "Transport", icon: Truck, page: "Transport", color: "from-amber-500 to-amber-600" },
              { name: "Finance", icon: DollarSign, page: "Finance", color: "from-emerald-500 to-emerald-600" },
              { name: "Clock In/Out", icon: Clock, page: "Attendance", color: "from-rose-500 to-rose-600" },
            ].map((item) => (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all hover:shadow-md cursor-pointer group text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-sm text-gray-700">{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}