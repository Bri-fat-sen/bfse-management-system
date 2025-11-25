import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Target,
  ArrowRight,
  Clock,
  Award,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StatCard from "@/components/ui/StatCard";
import QuickClockIn from "@/components/mobile/QuickClockIn";

export default function SalesDashboard({ user, currentEmployee, orgId }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance', currentEmployee?.id],
    queryFn: async () => {
      const records = await base44.entities.Attendance.filter({ 
        employee_id: currentEmployee?.id,
        date: today
      });
      return records[0];
    },
    enabled: !!currentEmployee?.id,
  });

  const { data: mySales = [] } = useQuery({
    queryKey: ['mySales', currentEmployee?.id],
    queryFn: () => base44.entities.Sale.filter({ 
      employee_id: currentEmployee?.id
    }, '-created_date', 100),
    enabled: !!currentEmployee?.id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  // Calculate stats
  const todaySales = mySales.filter(s => s.created_date?.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const monthSales = mySales.filter(s => s.created_date >= monthStart);
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  // Sales target (example: 5,000,000 Le per month)
  const monthlyTarget = 5000000;
  const targetProgress = Math.min((monthRevenue / monthlyTarget) * 100, 100);

  // Top selling products from my sales
  const productSales = {};
  mySales.forEach(sale => {
    (sale.items || []).forEach(item => {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = { quantity: 0, revenue: 0 };
      }
      productSales[item.product_name].quantity += item.quantity || 0;
      productSales[item.product_name].revenue += item.total || 0;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10)).slice(0, 5);

  const isClockedIn = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="sl-hero-pattern rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">🇸🇱 Sales Dashboard</p>
            <h1 className="text-2xl font-bold">Hello, {currentEmployee?.first_name || 'Sales Rep'}!</h1>
            <p className="text-white/80 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <Link to={createPageUrl("Sales")}>
            <Button className="bg-white text-[#0072C6] hover:bg-white/90">
              <ShoppingCart className="w-4 h-4 mr-2" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Clock In */}
      <QuickClockIn 
        currentEmployee={currentEmployee}
        orgId={orgId}
        todayAttendance={todayAttendance}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`Le ${todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle={`${todaySales.length} transactions`}
        />
        <StatCard
          title="Month Sales"
          value={`Le ${monthRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
          subtitle={`${monthSales.length} transactions`}
        />
        <StatCard
          title="Today's Orders"
          value={todaySales.length}
          icon={ShoppingCart}
          color="gold"
        />
        <StatCard
          title="Avg. Order Value"
          value={`Le ${todaySales.length > 0 ? Math.round(todayRevenue / todaySales.length).toLocaleString() : 0}`}
          icon={BarChart3}
          color="navy"
        />
      </div>

      {/* Monthly Target */}
      <Card className="border-t-4 border-t-[#1EB053]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Monthly Sales Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{targetProgress.toFixed(1)}%</span>
            </div>
            <Progress value={targetProgress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Le {monthRevenue.toLocaleString()}</span>
              <span className="font-medium text-[#1EB053]">Target: Le {monthlyTarget.toLocaleString()}</span>
            </div>
            {targetProgress >= 100 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                <Award className="w-5 h-5" />
                <span className="font-medium">Congratulations! You've hit your target! 🎉</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              My Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map(([name, data], index) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-gray-500">{data.quantity} sold</p>
                      </div>
                    </div>
                    <p className="font-bold text-[#1EB053]">Le {data.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>All products well stocked</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium truncate flex-1">{product.name}</span>
                    <Badge variant="destructive">{product.stock_quantity} left</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Sales
          </CardTitle>
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
              <p>No sales today yet</p>
              <Link to={createPageUrl("Sales")}>
                <Button className="mt-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                  Make a Sale
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{sale.sale_number || `#${sale.id.slice(-6)}`}</p>
                      <p className="text-sm text-gray-500">{sale.items?.length || 0} items • {sale.payment_method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-xs">{sale.payment_status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}