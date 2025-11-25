import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/ui/StatCard";
import {
  ShoppingCart,
  Users,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Activity,
  MessageSquare,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

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

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-date', 50),
    enabled: !!orgId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', orgId],
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
    s.created_date && format(new Date(s.created_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  
  const lowStockProducts = products.filter(p => 
    p.stock_quantity <= (p.low_stock_threshold || 10)
  );

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const presentToday = attendance.filter(a => a.status === 'present' || a.clock_in_time).length;

  const transportRevenue = trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);

  // Chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return format(date, 'yyyy-MM-dd');
  });

  const salesChartData = last7Days.map(date => {
    const daySales = sales.filter(s => 
      s.created_date && format(new Date(s.created_date), 'yyyy-MM-dd') === date
    );
    return {
      date: format(new Date(date), 'EEE'),
      revenue: daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0),
      transactions: daySales.length
    };
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0F1F3C] to-[#1D5FC3] rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting()}, {user?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-white/80 mt-2">
              Here's what's happening with your business today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-sm text-white/70">Today's Date</p>
              <p className="font-semibold">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`Le ${todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="+12% from yesterday"
        />
        <StatCard
          title="Total Sales"
          value={todaySales.length}
          icon={ShoppingCart}
          color="blue"
          subtitle="transactions today"
        />
        <StatCard
          title="Active Staff"
          value={`${presentToday}/${activeEmployees}`}
          icon={Users}
          color="navy"
          subtitle="clocked in today"
        />
        <StatCard
          title="Transport Revenue"
          value={`Le ${transportRevenue.toLocaleString()}`}
          icon={Truck}
          color="gold"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1EB053" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1EB053" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1EB053" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={createPageUrl("Sales")}>
              <Button variant="outline" className="w-full justify-between group hover:border-[#1EB053]">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#1EB053]" />
                  New Sale
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to={createPageUrl("HR")}>
              <Button variant="outline" className="w-full justify-between group hover:border-[#1D5FC3]">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1D5FC3]" />
                  Clock In/Out
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to={createPageUrl("Inventory")}>
              <Button variant="outline" className="w-full justify-between group hover:border-[#D4AF37]">
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#D4AF37]" />
                  Check Inventory
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to={createPageUrl("Communication")}>
              <Button variant="outline" className="w-full justify-between group hover:border-purple-500">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  Messages
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Link to={createPageUrl("ActivityLog")}>
              <Button variant="ghost" size="sm" className="text-[#1D5FC3]">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053]/10 to-[#1D5FC3]/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-[#1D5FC3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {activity.employee_name} • {activity.module}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {activity.created_date && format(new Date(activity.created_date), 'HH:mm')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-amber-600">Low stock: {product.stock_quantity} left</p>
                  </div>
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    Low
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600">All systems running smoothly!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}