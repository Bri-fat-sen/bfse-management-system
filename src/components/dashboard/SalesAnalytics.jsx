import { } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ShoppingCart, CreditCard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export default function SalesAnalytics({ sales = [], organisation }) {
  const primaryColor = organisation?.primary_color || '#1EB053';
  
  // Today's sales
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySales = sales.filter(s => s.created_date?.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  
  // This week's sales
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const weeklyData = weekDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySales = sales.filter(s => s.created_date?.startsWith(dateStr));
    const revenue = daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    return {
      day: format(date, 'EEE'),
      revenue,
      count: daySales.length
    };
  });

  // Payment method breakdown
  const paymentBreakdown = ['cash', 'card', 'mobile_money', 'credit'].map(method => ({
    method: method.replace('_', ' '),
    count: sales.filter(s => s.payment_method === method).length,
    amount: sales.filter(s => s.payment_method === method).reduce((sum, s) => sum + (s.total_amount || 0), 0)
  })).filter(m => m.count > 0);

  // Sale type breakdown
  const saleTypeBreakdown = sales.reduce((acc, sale) => {
    const type = sale.sale_type || 'retail';
    if (!acc[type]) acc[type] = { count: 0, revenue: 0 };
    acc[type].count += 1;
    acc[type].revenue += sale.total_amount || 0;
    return acc;
  }, {});

  // Average transaction
  const avgTransaction = sales.length > 0 
    ? sales.reduce((sum, s) => sum + (s.total_amount || 0), 0) / sales.length 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sales Trend Chart */}
      <Card className="lg:col-span-2 border-l-4 border-l-[#1EB053]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1EB053]" />
            Weekly Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1EB053" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1EB053" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [`Le ${value.toLocaleString()}`, 'Revenue']}
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

      {/* Quick Stats */}
      <Card className="border-l-4 border-l-[#0072C6]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#0072C6]" />
            Sales Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-[#1EB053]">Le {todayRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{todaySales.length} transactions</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Average Transaction</p>
              <p className="text-xl font-bold text-[#0072C6]">Le {Math.round(avgTransaction).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Payment Methods</p>
              <div className="space-y-2">
                {paymentBreakdown.map((pm, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3 h-3 text-gray-400" />
                      <span className="capitalize">{pm.method}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{pm.count}</Badge>
                      <span className="font-semibold">Le {pm.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">By Type</p>
              <div className="space-y-1.5">
                {Object.entries(saleTypeBreakdown).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <span className="capitalize font-medium">{type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{data.count}</Badge>
                      <span className="font-semibold text-[#1EB053]">Le {data.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}