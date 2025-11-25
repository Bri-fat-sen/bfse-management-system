import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, Users, Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react";

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#0F1F3C', '#9333ea', '#ec4899'];

export default function AnalyticsDashboard({ sales = [], expenses = [], products = [], employees = [], trips = [] }) {
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

  // Revenue over time
  const revenueByDay = eachDayOfInterval({ start, end }).map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySales = filteredSales.filter(s => s.created_date?.startsWith(dayStr));
    const dayExpenses = filteredExpenses.filter(e => e.date === dayStr);
    return {
      date: format(day, 'MMM d'),
      revenue: daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0),
      expenses: dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      profit: daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0) - 
              dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
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

  // Calculate totals and trends
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

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
                <p className="text-2xl font-bold">SLE {totalRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">SLE {totalExpenses.toLocaleString()}</p>
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
                  SLE {totalProfit.toLocaleString()}
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
                <p className="text-2xl font-bold">SLE {avgOrderValue.toLocaleString()}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `SLE ${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1EB053" fill="#1EB053" fillOpacity={0.6} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `SLE ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `SLE ${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#0072C6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}