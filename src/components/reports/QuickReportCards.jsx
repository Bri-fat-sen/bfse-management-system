import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, subMonths, parseISO } from "date-fns";
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package, Truck, 
  Download, Printer, BarChart3, PieChart, ArrowRight, Clock
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { printSalesReport, printExpenseReport, printInventoryReport, printProfitLossReport, printTransportReport } from "@/components/reports/ReportPrintExport";

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#0F1F3C', '#ef4444', '#8b5cf6'];

export default function QuickReportCards({ 
  organisation,
  sales = [],
  expenses = [],
  payrolls = [],
  trips = [],
  products = [],
  employees = [],
  dateRange = "this_month",
  customDateStart,
  customDateEnd
}) {
  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { startDate: now, endDate: now };
      case 'this_week':
        return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
      case 'this_month':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
      case 'this_quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { startDate: quarterStart, endDate: now };
      case 'this_year':
        return { startDate: startOfYear(now), endDate: now };
      case 'custom':
        return { 
          startDate: customDateStart ? parseISO(customDateStart) : startOfMonth(now),
          endDate: customDateEnd ? parseISO(customDateEnd) : endOfMonth(now)
        };
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  }, [dateRange, customDateStart, customDateEnd]);

  // Filter data by date range
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const date = new Date(s.created_date);
      return date >= startDate && date <= endDate;
    });
  }, [sales, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const date = new Date(e.date || e.created_date);
      return date >= startDate && date <= endDate;
    });
  }, [expenses, startDate, endDate]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const date = new Date(t.date || t.created_date);
      return date >= startDate && date <= endDate;
    });
  }, [trips, startDate, endDate]);

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const date = new Date(p.period_end);
      return date >= startDate && date <= endDate;
    });
  }, [payrolls, startDate, endDate]);

  // Calculate analytics
  const salesAnalytics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const byPayment = filteredSales.reduce((acc, s) => {
      const method = s.payment_method || 'cash';
      acc[method] = (acc[method] || 0) + (s.total_amount || 0);
      return acc;
    }, {});
    const byChannel = filteredSales.reduce((acc, s) => {
      const type = s.sale_type || 'retail';
      acc[type] = (acc[type] || 0) + (s.total_amount || 0);
      return acc;
    }, {});

    return {
      totalRevenue,
      totalTransactions: filteredSales.length,
      avgTransaction: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0,
      byPayment: Object.entries(byPayment).map(([name, value]) => ({ name, value })),
      byChannel: Object.entries(byChannel).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    };
  }, [filteredSales]);

  const expenseAnalytics = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const byCategory = filteredExpenses.reduce((acc, e) => {
      const cat = e.category || 'other';
      acc[cat] = (acc[cat] || 0) + (e.amount || 0);
      return acc;
    }, {});

    return {
      totalExpenses,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    };
  }, [filteredExpenses]);

  const transportAnalytics = useMemo(() => {
    const totalRevenue = filteredTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const totalFuelCost = filteredTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
    const totalPassengers = filteredTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);

    return {
      totalRevenue,
      totalFuelCost,
      netRevenue: totalRevenue - totalFuelCost,
      totalTrips: filteredTrips.length,
      totalPassengers
    };
  }, [filteredTrips]);

  const inventoryStats = useMemo(() => {
    const activeProducts = products.filter(p => p.is_active !== false);
    const lowStock = activeProducts.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10));
    const outOfStock = activeProducts.filter(p => (p.stock_quantity || 0) === 0);
    const totalValue = activeProducts.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);

    return {
      totalProducts: activeProducts.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue
    };
  }, [products]);

  const profitLoss = useMemo(() => {
    const revenue = salesAnalytics.totalRevenue + transportAnalytics.totalRevenue;
    const expensesTotal = expenseAnalytics.totalExpenses + transportAnalytics.totalFuelCost;
    const profit = revenue - expensesTotal;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    return {
      revenue,
      expenses: expensesTotal,
      profit,
      margin
    };
  }, [salesAnalytics, transportAnalytics, expenseAnalytics]);

  const dateRangeLabel = useMemo(() => {
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  }, [startDate, endDate]);

  const filters = { start_date: format(startDate, 'yyyy-MM-dd'), end_date: format(endDate, 'yyyy-MM-dd') };

  return (
    <div className="space-y-6">
      {/* Sales Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1EB053]" />
                Sales Overview
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => printSalesReport({ 
                  salesAnalytics, 
                  filters, 
                  organisation, 
                  filteredSales 
                })}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
            <p className="text-xs text-gray-500">{dateRangeLabel}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-[#1EB053]">SLE {salesAnalytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Transactions</p>
                <p className="text-lg font-bold">{salesAnalytics.totalTransactions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg. Value</p>
                <p className="text-lg font-bold">SLE {Math.round(salesAnalytics.avgTransaction).toLocaleString()}</p>
              </div>
            </div>
            {salesAnalytics.byChannel.length > 0 && (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={salesAnalytics.byChannel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `SLE ${v.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#1EB053" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-500" />
                Expenses Overview
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => printExpenseReport({ 
                  expenseAnalytics, 
                  filters, 
                  organisation, 
                  filteredExpenses 
                })}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
            <p className="text-xs text-gray-500">{dateRangeLabel}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-xs text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-500">SLE {expenseAnalytics.totalExpenses.toLocaleString()}</p>
            </div>
            {expenseAnalytics.byCategory.length > 0 && (
              <ResponsiveContainer width="100%" height={150}>
                <RePieChart>
                  <Pie
                    data={expenseAnalytics.byCategory.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) => `${name.slice(0, 8)}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseAnalytics.byCategory.slice(0, 5).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `SLE ${v.toLocaleString()}`} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profit & Loss and Inventory */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={profitLoss.profit >= 0 ? 'border-t-4 border-t-[#1EB053]' : 'border-t-4 border-t-red-500'}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                Profit & Loss
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => printProfitLossReport({ 
                  profitLoss, 
                  salesAnalytics, 
                  transportAnalytics, 
                  expenseAnalytics, 
                  filters, 
                  organisation 
                })}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-[#1EB053]">SLE {profitLoss.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Expenses</p>
                <p className="text-lg font-bold text-red-500">SLE {profitLoss.expenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Net {profitLoss.profit >= 0 ? 'Profit' : 'Loss'}</p>
                <p className={`text-xl font-bold ${profitLoss.profit >= 0 ? 'text-[#1EB053]' : 'text-red-500'}`}>
                  SLE {Math.abs(profitLoss.profit).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Profit Margin</p>
                <p className="text-lg font-bold">{profitLoss.margin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Inventory Status
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => printInventoryReport({ products, organisation })}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="text-lg font-bold">{inventoryStats.totalProducts}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Stock Value</p>
                <p className="text-lg font-bold text-[#0072C6]">SLE {inventoryStats.totalValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Low Stock</p>
                <p className={`text-lg font-bold ${inventoryStats.lowStock > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                  {inventoryStats.lowStock}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Out of Stock</p>
                <p className={`text-lg font-bold ${inventoryStats.outOfStock > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {inventoryStats.outOfStock}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transport */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-600" />
              Transport Summary
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => printTransportReport({ 
                transportAnalytics, 
                filters, 
                organisation, 
                filteredTrips 
              })}
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
          <p className="text-xs text-gray-500">{dateRangeLabel}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Trips</p>
              <p className="text-lg font-bold">{transportAnalytics.totalTrips}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Passengers</p>
              <p className="text-lg font-bold">{transportAnalytics.totalPassengers}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-lg font-bold text-[#1EB053]">SLE {transportAnalytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fuel Costs</p>
              <p className="text-lg font-bold text-red-500">SLE {transportAnalytics.totalFuelCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Revenue</p>
              <p className={`text-lg font-bold ${transportAnalytics.netRevenue >= 0 ? 'text-[#1EB053]' : 'text-red-500'}`}>
                SLE {transportAnalytics.netRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}