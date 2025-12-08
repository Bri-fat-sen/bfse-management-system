import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Zap, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function PerformanceIndicators({ 
  sales = [], 
  expenses = [], 
  products = [], 
  attendance = [], 
  employees = [],
  trips = []
}) {
  // Sales performance targets
  const dailyTarget = 50000; // Le 50,000 daily target
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.created_date?.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const salesProgress = Math.min((todayRevenue / dailyTarget) * 100, 100);
  
  // Inventory turnover (simplified)
  const avgInventoryValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price), 0);
  const monthSales = sales.filter(s => {
    const month = new Date().toISOString().split('T')[0].slice(0, 7);
    return s.created_date?.startsWith(month);
  });
  const costOfGoodsSold = monthSales.reduce((sum, s) => {
    const itemCosts = (s.items || []).reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + ((product?.cost_price || 0) * (item.quantity || 0));
    }, 0);
    return sum + itemCosts;
  }, 0);
  const inventoryTurnover = avgInventoryValue > 0 ? (costOfGoodsSold / avgInventoryValue).toFixed(2) : 0;

  // Attendance performance
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const presentToday = attendance.filter(a => a.clock_in_time).length;
  const attendanceScore = activeEmployees > 0 ? (presentToday / activeEmployees * 100) : 0;

  // Fleet utilization
  const activeVehicles = trips.filter(t => t.date === today).length;
  const totalVehicles = 10; // You can get this from vehicles
  const fleetUtilization = totalVehicles > 0 ? (activeVehicles / totalVehicles * 100) : 0;

  // Profit margin
  const monthExpenses = expenses.filter(e => {
    const month = new Date().toISOString().split('T')[0].slice(0, 7);
    return e.date?.startsWith(month);
  });
  const totalExpense = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const profitMargin = monthRevenue > 0 ? ((monthRevenue - totalExpense) / monthRevenue * 100) : 0;

  const indicators = [
    {
      title: "Daily Sales Target",
      icon: Target,
      value: `Le ${todayRevenue.toLocaleString()}`,
      target: `Le ${dailyTarget.toLocaleString()}`,
      progress: salesProgress,
      color: salesProgress >= 100 ? "green" : salesProgress >= 70 ? "blue" : "orange",
      trend: salesProgress >= 100 ? "Exceeded" : "In Progress"
    },
    {
      title: "Attendance Rate",
      icon: Award,
      value: `${Math.round(attendanceScore)}%`,
      target: "95% Target",
      progress: attendanceScore,
      color: attendanceScore >= 95 ? "green" : attendanceScore >= 80 ? "blue" : "orange",
      trend: `${presentToday}/${activeEmployees} Present`
    },
    {
      title: "Profit Margin",
      icon: TrendingUp,
      value: `${profitMargin.toFixed(1)}%`,
      target: "30% Target",
      progress: Math.min((profitMargin / 30) * 100, 100),
      color: profitMargin >= 30 ? "green" : profitMargin >= 20 ? "blue" : "orange",
      trend: profitMargin >= 0 ? "Profitable" : "Loss"
    },
    {
      title: "Inventory Turnover",
      icon: Zap,
      value: inventoryTurnover,
      target: "2.0 Target",
      progress: Math.min((parseFloat(inventoryTurnover) / 2) * 100, 100),
      color: inventoryTurnover >= 2 ? "green" : inventoryTurnover >= 1.5 ? "blue" : "orange",
      trend: inventoryTurnover >= 2 ? "Excellent" : "Good"
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {indicators.map((indicator, idx) => {
        const colors = getColorClasses(indicator.color);
        return (
          <Card key={idx} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-1.5 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.light} flex items-center justify-center`}>
                  <indicator.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <Badge className={`${colors.light} ${colors.text} border-0 text-xs`}>
                  {indicator.trend}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{indicator.title}</p>
              <p className={`text-2xl font-bold ${colors.text} mb-2`}>{indicator.value}</p>
              
              <div className="space-y-2">
                <Progress value={indicator.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{indicator.target}</span>
                  <span className={`font-semibold ${colors.text}`}>
                    {indicator.progress.toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}