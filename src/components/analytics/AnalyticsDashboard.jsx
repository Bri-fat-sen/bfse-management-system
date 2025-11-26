import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, Users, Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  MultiAreaChart,
  DonutChart,
  GradientBarChart,
  ProgressRing,
  SparklineChart,
  SL_COLORS
} from "@/components/charts/AdvancedCharts";

const COLORS = SL_COLORS.chart;

export default function AnalyticsDashboard({ sales = [], expenses = [], products = [], employees = [], trips = [], truckContracts = [], maintenanceRecords = [] }) {
  const [timeRange, setTimeRange] = useState("7days");

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    let start;
    switch (timeRange) {
      case "7days": start = subDays(end, 7); break;
      case "30days": start = subDays(end, 30); break;
      case "90days": start = subDays(end, 90); break;
      default: start = subDays(end, 7);
    }
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Filter data by date range
  const filteredSales = sales.filter(s => {
    const date = new Date(s.created_date);
    return date >= start && date <= end;
  });

  const filteredExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= start && date <= end;
  });

  const filteredTrips = trips.filter(t => {
    const date = new Date(t.date);
    return date >= start && date <= end;
  });

  const filteredContracts = (truckContracts || []).filter(c => {
    const date = new Date(c.contract_date);
    return date >= start && date <= end;
  });

  const filteredMaintenance = (maintenanceRecords || []).filter(m => {
    const date = new Date(m.date_performed);
    return date >= start && date <= end;
  });

  // Revenue over time - includes ALL revenue sources
  const revenueByDay = eachDayOfInterval({ start, end }).map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySales = filteredSales.filter(s => s.created_date?.startsWith(dayStr));
    const dayTrips = filteredTrips.filter(t => t.date === dayStr);
    const dayContracts = filteredContracts.filter(c => c.contract_date === dayStr && c.status === 'completed');
    
    // All revenue sources
    const salesRevenue = daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const tripRevenue = dayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const contractRevenue = dayContracts.reduce((sum, c) => sum + (c.contract_amount || 0), 0);
    const totalDayRevenue = salesRevenue + tripRevenue + contractRevenue;
    
    // All expense sources
    const dayExpenses = filteredExpenses.filter(e => e.date === dayStr);
    const dayMaintenance = filteredMaintenance.filter(m => m.date_performed === dayStr);
    const recordedExpenses = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const tripExpenses = dayTrips.reduce((sum, t) => sum + (t.fuel_cost || 0) + (t.other_expenses || 0), 0);
    const contractExpenses = filteredContracts.filter(c => c.contract_date === dayStr).reduce((sum, c) => sum + (c.total_expenses || 0), 0);
    const maintenanceExpenses = dayMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
    const totalDayExpenses = recordedExpenses + tripExpenses + contractExpenses + maintenanceExpenses;
    
    return {
      date: format(day, 'MMM d'),
      revenue: totalDayRevenue,
      expenses: totalDayExpenses,
      profit: totalDayRevenue - totalDayExpenses
    };
  });

  // Sales by category
  const salesByType = filteredSales.reduce((acc, sale) => {
    const type = sale.sale_type || 'other';
    acc[type] = (acc[type] || 0) + (sale.total_amount || 0);
    return acc;
  }, {});

  const salesTypeData = Object.entries(salesByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Payment methods distribution
  const paymentMethods = filteredSales.reduce((acc, sale) => {
    const method = sale.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
    name: name.replace('_', ' ').charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Top products by sales
  const productSales = {};
  filteredSales.forEach(sale => {
    sale.items?.forEach(item => {
      const name = item.product_name || 'Unknown';
      productSales[name] = (productSales[name] || 0) + (item.total || 0);
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Calculate totals and trends - ALL sources
  const salesRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const tripRevenue = filteredTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const contractRevenue = filteredContracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.contract_amount || 0), 0);
  const totalRevenue = salesRevenue + tripRevenue + contractRevenue;
  
  const recordedExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const tripExpenses = filteredTrips.reduce((sum, t) => sum + (t.fuel_cost || 0) + (t.other_expenses || 0), 0);
  const contractExpenses = filteredContracts.reduce((sum, c) => sum + (c.total_expenses || 0), 0);
  const maintenanceExpenses = filteredMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalExpenses = recordedExpenses + tripExpenses + contractExpenses + maintenanceExpenses;
  
  const totalProfit = totalRevenue - totalExpenses;
  const avgOrderValue = filteredSales.length > 0 ? salesRevenue / filteredSales.length : 0;

  // Compare with previous period
  const prevStart = subDays(start, (end - start) / (1000 * 60 * 60 * 24));
  const prevSales = sales.filter(s => {
    const date = new Date(s.created_date);
    return date >= prevStart && date < start;
  });
  const prevRevenue = prevSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Business Analytics</h2>
          <p className="text-sm text-gray-500">Track your performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold">Le {totalRevenue.toLocaleString()}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-2xl font-bold">Le {totalExpenses.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Le {totalProfit.toLocaleString()}
                </p>
              </div>
              {totalProfit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500 opacity-50" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold">Le {avgOrderValue.toLocaleString()}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Expenses Trend */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <MultiAreaChart 
              data={revenueByDay}
              xKey="date"
              height={300}
              lines={[
                { dataKey: "revenue", name: "Revenue", color: "#1EB053" },
                { dataKey: "expenses", name: "Expenses", color: "#EF4444" }
              ]}
              formatter={(v) => `Le ${v.toLocaleString()}`}
            />
          </CardContent>
        </Card>

        {/* Sales by Type */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#D4AF37]/5 to-[#F59E0B]/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F59E0B]">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              Sales by Channel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DonutChart 
              data={salesTypeData}
              height={300}
              innerRadius={70}
              outerRadius={110}
              formatter={(v) => `Le ${v.toLocaleString()}`}
              centerValue={filteredSales.length}
              centerLabel="Sales"
            />
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#6366F1]/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#6366F1]">
                <Package className="w-4 h-4 text-white" />
              </div>
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <GradientBarChart 
              data={topProducts}
              dataKey="value"
              xKey="name"
              height={300}
              horizontal={true}
              formatter={(v) => `Le ${v.toLocaleString()}`}
              barSize={20}
            />
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#9333EA]/5 to-[#EC4899]/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#9333EA] to-[#EC4899]">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DonutChart 
              data={paymentData}
              height={300}
              innerRadius={60}
              outerRadius={100}
              formatter={(v) => `${v} transactions`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}