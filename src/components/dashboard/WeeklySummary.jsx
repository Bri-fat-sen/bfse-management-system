import { } from "react";
import { format, subDays, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function WeeklySummary({ sales = [], trips = [], expenses = [] }) {
  // Get last 7 days data
  const today = new Date();
  const weekAgo = subDays(today, 7);
  
  const weeklySales = sales.filter(s => {
    const date = new Date(s.created_date);
    return date >= weekAgo && date <= today;
  });
  
  const weeklyTrips = trips.filter(t => {
    const date = new Date(t.date);
    return date >= weekAgo && date <= today;
  });
  
  const weeklyExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= weekAgo && date <= today;
  });
  
  const salesRevenue = weeklySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const transportRevenue = weeklyTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalExpenses = weeklyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalRevenue = salesRevenue + transportRevenue;
  const profit = totalRevenue - totalExpenses;

  // Daily breakdown for the week
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySales = weeklySales.filter(s => s.created_date?.startsWith(dateStr))
      .reduce((sum, s) => sum + (s.total_amount || 0), 0);
    dailyData.push({
      day: format(date, 'EEE'),
      sales: daySales
    });
  }
  
  const maxSales = Math.max(...dailyData.map(d => d.sales), 1);

  return (
    <Card className="border-t-4 border-t-[#D4AF37]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          This Week's Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 text-xs font-medium">
              <DollarSign className="w-3 h-3" />
              Revenue
            </div>
            <p className="text-lg font-bold text-green-800 mt-1">
              Le {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 text-xs font-medium">
              <TrendingDown className="w-3 h-3" />
              Expenses
            </div>
            <p className="text-lg font-bold text-red-800 mt-1">
              Le {totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Net Profit
            </span>
            <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Le {profit.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Daily Sales</p>
          <div className="flex items-end justify-between gap-1 h-16">
            {dailyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-gradient-to-t from-[#1EB053] to-[#0072C6] rounded-t transition-all"
                  style={{ height: `${(day.sales / maxSales) * 100}%`, minHeight: day.sales > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Sales</p>
              <p className="font-semibold text-sm">{weeklySales.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Trips</p>
              <p className="font-semibold text-sm">{weeklyTrips.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}