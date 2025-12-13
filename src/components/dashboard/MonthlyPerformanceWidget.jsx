import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function MonthlyPerformanceWidget({ metrics, dateRange }) {
  const profitMargin = metrics.totalSales + metrics.tripRevenue > 0 
    ? ((metrics.netIncome / (metrics.totalSales + metrics.tripRevenue)) * 100).toFixed(1)
    : 0;

  const isProfitable = metrics.netIncome > 0;

  const performanceData = [
    {
      label: 'Total Revenue',
      value: metrics.totalSales + metrics.tripRevenue,
      icon: DollarSign,
      color: 'green',
      trend: '+12%',
      trendUp: true,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Total Expenses',
      value: metrics.totalExpenses,
      icon: TrendingDown,
      color: 'red',
      trend: '+8%',
      trendUp: false,
      gradient: 'from-red-500 to-rose-600'
    },
    {
      label: 'Net Income',
      value: metrics.netIncome,
      icon: isProfitable ? TrendingUp : TrendingDown,
      color: isProfitable ? 'blue' : 'orange',
      trend: isProfitable ? '+24%' : '-5%',
      trendUp: isProfitable,
      gradient: isProfitable ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-red-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Performance Summary
            </div>
            <Badge className={`${isProfitable ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
              {dateRange === 'this_week' ? 'This Week' : 
               dateRange === 'this_month' ? 'This Month' : 
               dateRange === 'last_month' ? 'Last Month' : 'Last 3 Months'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {performanceData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900">Le {item.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.trendUp ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${item.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Profit Margin Indicator */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Profit Margin</p>
                <p className="text-2xl font-bold mt-1">{profitMargin}%</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                parseFloat(profitMargin) > 20 ? 'bg-green-500' :
                parseFloat(profitMargin) > 10 ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {parseFloat(profitMargin) > 10 ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : parseFloat(profitMargin) > 0 ? (
                  <Minus className="w-6 h-6 text-white" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}