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
  Award,
  Clock,
  CreditCard,
  Banknote,
  ArrowRight,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StatCard from "@/components/ui/StatCard";

export default function SalesDashboard({ currentEmployee, orgId }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: todayAttendance } = useQuery({
    queryKey: ['salesAttendance', currentEmployee?.id, today],
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

  const isClockedIn = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;
  
  const todaySales = mySales.filter(s => s.created_date?.startsWith(today));
  const monthSales = mySales.filter(s => s.created_date >= monthStart);
  
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  // Breakdown by sale type (with null safety)
  const todayRetailSales = todaySales.filter(s => s?.sale_type === 'retail');
  const todayWarehouseSales = todaySales.filter(s => s?.sale_type === 'warehouse');
  const todayVehicleSales = todaySales.filter(s => s?.sale_type === 'vehicle');
  
  const todayRetailRevenue = todayRetailSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const todayWarehouseRevenue = todayWarehouseSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const todayVehicleRevenue = todayVehicleSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  
  // Monthly target (example: Le 5,000,000)
  const monthlyTarget = 5000000;
  const targetProgress = Math.min(100, (monthRevenue / monthlyTarget) * 100);

  // Calculate top selling products from sales
  const productSales = {};
  mySales.forEach(sale => {
    (sale.items || []).forEach(item => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { name: item.product_name, quantity: 0, revenue: 0 };
      }
      productSales[item.product_id].quantity += item.quantity;
      productSales[item.product_id].revenue += item.total;
    });
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link to={createPageUrl("Sales")} className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white h-full">
            <CardContent className="p-4 flex items-center justify-between h-full">
              <div>
                <p className="font-semibold text-lg">Start New Sale</p>
                <p className="text-sm text-white/80">Open POS Terminal</p>
              </div>
              <ShoppingCart className="w-10 h-10 opacity-80" />
            </CardContent>
          </Card>
        </Link>

        <Card className="border-t-4 border-t-[#D4AF37]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Target</p>
                <p className="text-xl font-bold">Le {monthlyTarget.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <Progress value={targetProgress} className="mt-2 h-2" />
            <p className="text-xs text-gray-500 mt-1">{targetProgress.toFixed(0)}% achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Total Sales"
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
          title="Avg Transaction"
          value={`Le ${todaySales.length > 0 ? Math.round(todayRevenue / todaySales.length).toLocaleString() : 0}`}
          icon={CreditCard}
          color="gold"
        />
        <StatCard
          title="Products Available"
          value={products.filter(p => p.stock_quantity > 0).length}
          icon={Package}
          color="navy"
          subtitle={`${lowStockProducts.length} low stock`}
        />
      </div>

      {/* My Sales Breakdown by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="w-5 h-5 text-green-600" />
            Today's Sales by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Retail Sales</span>
              </div>
              <p className="text-2xl font-bold text-green-700">Le {todayRetailRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">{todayRetailSales.length} transactions</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Warehouse Sales</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">Le {todayWarehouseRevenue.toLocaleString()}</p>
              <p className="text-sm text-amber-600">{todayWarehouseSales.length} transactions</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Vehicle Sales</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">Le {todayVehicleRevenue.toLocaleString()}</p>
              <p className="text-sm text-purple-600">{todayVehicleSales.length} transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-[#1EB053]" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                        idx === 1 ? 'bg-gray-200 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1EB053]">Le {product.revenue?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5 text-[#0072C6]" />
              Recent Sales
            </CardTitle>
            <Link to={createPageUrl("Sales")}>
              <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todaySales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sales today</p>
            ) : (
              <div className="space-y-3">
                {todaySales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{sale.sale_number || `#${sale.id.slice(-6)}`}</p>
                      <p className="text-xs text-gray-500">
                        {sale.items?.length || 0} items • {sale.payment_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1EB053]">Le {sale.total_amount?.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">{sale.payment_status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700">
              <Package className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((product) => (
                <Badge key={product.id} variant="outline" className="bg-white">
                  {product.name}: {product.stock_quantity} left
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}