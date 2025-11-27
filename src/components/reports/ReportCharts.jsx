import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  PieChart,
  BarChart3,
  LineChart,
  Package
} from "lucide-react";
import {
  GradientAreaChart,
  GradientBarChart,
  DonutChart,
  ColorfulBarChart,
  MultiAreaChart,
  ProgressRing
} from "@/components/charts/AdvancedCharts";

export function SalesCharts({ salesAnalytics }) {
  if (!salesAnalytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <GradientAreaChart 
            data={salesAnalytics.trendData}
            dataKey="revenue"
            xKey="date"
            height={250}
            formatter={(v) => `Le ${v.toLocaleString()}`}
          />
        </CardContent>
      </Card>

      {/* Payment Methods Distribution */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#9333EA]/5 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#9333EA]">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <DonutChart 
            data={salesAnalytics.byPayment}
            height={250}
            innerRadius={60}
            outerRadius={90}
            formatter={(v) => `Le ${v.toLocaleString()}`}
            centerValue={salesAnalytics.totalTransactions}
            centerLabel="Sales"
          />
        </CardContent>
      </Card>

      {/* Sale Types */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#D4AF37]/5 to-[#F59E0B]/5 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F59E0B]">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            Sales by Type
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ColorfulBarChart 
            data={salesAnalytics.bySaleType}
            dataKey="value"
            xKey="name"
            height={250}
            formatter={(v) => `Le ${v.toLocaleString()}`}
          />
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#10B981]/5 to-[#06B6D4]/5 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#10B981] to-[#06B6D4]">
              <Package className="w-4 h-4 text-white" />
            </div>
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <GradientBarChart 
            data={salesAnalytics.topProducts?.slice(0, 5)}
            dataKey="value"
            xKey="name"
            height={250}
            horizontal={true}
            formatter={(v) => `Le ${v.toLocaleString()}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function ExpenseCharts({ expenseAnalytics }) {
  if (!expenseAnalytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <Card className="overflow-hidden lg:col-span-1">
        <CardHeader className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ColorfulBarChart 
            data={expenseAnalytics.byCategory}
            dataKey="value"
            xKey="name"
            height={300}
            formatter={(v) => `Le ${v.toLocaleString()}`}
            colors={['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6']}
          />
        </CardContent>
      </Card>

      {/* Distribution Donut */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            Expense Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <DonutChart 
            data={expenseAnalytics.byCategory}
            height={300}
            innerRadius={60}
            outerRadius={90}
            formatter={(v) => `Le ${v.toLocaleString()}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function TransportCharts({ transportAnalytics }) {
  if (!transportAnalytics) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards with Progress Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `Le ${transportAnalytics.totalRevenue?.toLocaleString()}`, color: "#1EB053", percent: 100 },
          { label: "Total Trips", value: transportAnalytics.totalTrips, color: "#0072C6", percent: 75 },
          { label: "Passengers", value: transportAnalytics.totalPassengers, color: "#D4AF37", percent: 85 },
          { label: "Net Revenue", value: `Le ${transportAnalytics.netRevenue?.toLocaleString()}`, color: "#9333EA", percent: transportAnalytics.totalRevenue > 0 ? Math.round((transportAnalytics.netRevenue / transportAnalytics.totalRevenue) * 100) : 0 }
        ].map((stat, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-lg font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                </div>
                <ProgressRing value={stat.percent} size={45} strokeWidth={4} color={stat.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue by Route */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            Revenue by Route
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <GradientBarChart 
            data={transportAnalytics.byRoute}
            dataKey="value"
            xKey="name"
            height={250}
            formatter={(v) => `Le ${v.toLocaleString()}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function ProfitLossChart({ profitLoss }) {
  if (!profitLoss) return null;

  const data = [
    { name: 'Revenue', value: profitLoss.revenue, fill: '#1EB053' },
    { name: 'Expenses', value: profitLoss.expenses, fill: '#EF4444' },
    { name: 'Profit', value: Math.max(0, profitLoss.profit), fill: profitLoss.profit >= 0 ? '#0072C6' : '#EF4444' }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 via-white to-[#EF4444]/5 border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          Profit & Loss Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Revenue</p>
            <p className="text-2xl font-bold text-[#1EB053]">Le {profitLoss.revenue?.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Expenses</p>
            <p className="text-2xl font-bold text-red-500">Le {profitLoss.expenses?.toLocaleString()}</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${profitLoss.profit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
            <p className="text-xs text-gray-500 uppercase">Net Profit</p>
            <p className={`text-2xl font-bold ${profitLoss.profit >= 0 ? 'text-[#0072C6]' : 'text-red-500'}`}>
              Le {profitLoss.profit?.toLocaleString()}
            </p>
          </div>
        </div>
        <ColorfulBarChart 
          data={data}
          dataKey="value"
          xKey="name"
          height={200}
          formatter={(v) => `Le ${v.toLocaleString()}`}
        />
      </CardContent>
    </Card>
  );
}