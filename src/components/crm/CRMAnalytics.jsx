import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users, TrendingUp, TrendingDown, DollarSign, UserPlus, UserMinus,
  Calendar, BarChart3, PieChart, Activity, Star, ArrowUp, ArrowDown
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO, isWithinInterval } from "date-fns";

const COLORS = ['#1EB053', '#0072C6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];
const SEGMENT_COLORS = {
  vip: '#f59e0b',
  regular: '#0072C6',
  new: '#1EB053',
  at_risk: '#f97316',
  churned: '#6b7280'
};

export default function CRMAnalytics({ customers = [], sales = [], interactions = [], employees = [] }) {
  const [dateRange, setDateRange] = useState('30');
  const [segmentFilter, setSegmentFilter] = useState('all');

  // Calculate date range
  const dateRangeStart = useMemo(() => {
    const days = parseInt(dateRange);
    if (days === 365) return subMonths(new Date(), 12);
    return subDays(new Date(), days);
  }, [dateRange]);

  // Filter customers by segment
  const filteredCustomers = useMemo(() => {
    if (segmentFilter === 'all') return customers;
    return customers.filter(c => c.segment === segmentFilter);
  }, [customers, segmentFilter]);

  // Customer Acquisition Trend
  const acquisitionTrend = useMemo(() => {
    const days = parseInt(dateRange);
    let intervals;
    
    if (days <= 30) {
      intervals = eachDayOfInterval({ start: dateRangeStart, end: new Date() });
      return intervals.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const newCustomers = filteredCustomers.filter(c => {
          const created = c.created_date?.split('T')[0];
          return created === dateStr;
        }).length;
        return {
          date: format(date, 'MMM dd'),
          customers: newCustomers,
          cumulative: 0
        };
      });
    } else {
      intervals = eachMonthOfInterval({ start: dateRangeStart, end: new Date() });
      return intervals.map(date => {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const newCustomers = filteredCustomers.filter(c => {
          if (!c.created_date) return false;
          const created = parseISO(c.created_date);
          return isWithinInterval(created, { start: monthStart, end: monthEnd });
        }).length;
        return {
          date: format(date, 'MMM yyyy'),
          customers: newCustomers,
          cumulative: 0
        };
      });
    }
  }, [filteredCustomers, dateRange, dateRangeStart]);

  // Add cumulative count
  let cumulative = 0;
  acquisitionTrend.forEach(item => {
    cumulative += item.customers;
    item.cumulative = cumulative;
  });

  // Sales by Employee
  const salesByEmployee = useMemo(() => {
    const employeeSales = {};
    
    sales.forEach(sale => {
      if (!sale.created_date) return;
      const saleDate = parseISO(sale.created_date);
      if (saleDate < dateRangeStart) return;
      
      const empName = sale.employee_name || 'Unknown';
      if (!employeeSales[empName]) {
        employeeSales[empName] = { name: empName, revenue: 0, count: 0 };
      }
      employeeSales[empName].revenue += sale.total_amount || 0;
      employeeSales[empName].count += 1;
    });

    return Object.values(employeeSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [sales, dateRangeStart]);

  // Sales by Segment
  const salesBySegment = useMemo(() => {
    const segmentSales = {};
    
    sales.forEach(sale => {
      if (!sale.created_date) return;
      const saleDate = parseISO(sale.created_date);
      if (saleDate < dateRangeStart) return;
      
      // Find customer segment
      const customer = customers.find(c => c.id === sale.customer_id || c.name === sale.customer_name);
      const segment = customer?.segment || 'unknown';
      
      if (!segmentSales[segment]) {
        segmentSales[segment] = { name: segment, value: 0, count: 0 };
      }
      segmentSales[segment].value += sale.total_amount || 0;
      segmentSales[segment].count += 1;
    });

    return Object.values(segmentSales).filter(s => s.value > 0);
  }, [sales, customers, dateRangeStart]);

  // Customer Lifetime Value (CLV)
  const customerLTV = useMemo(() => {
    return filteredCustomers
      .map(c => ({
        name: c.name,
        segment: c.segment,
        ltv: c.total_spent || 0,
        purchases: c.total_purchases || 0,
        avgOrder: c.total_purchases > 0 ? (c.total_spent || 0) / c.total_purchases : 0
      }))
      .sort((a, b) => b.ltv - a.ltv)
      .slice(0, 10);
  }, [filteredCustomers]);

  // Segment Distribution
  const segmentDistribution = useMemo(() => {
    const distribution = {};
    customers.forEach(c => {
      const segment = c.segment || 'unknown';
      distribution[segment] = (distribution[segment] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
      color: SEGMENT_COLORS[name] || '#6b7280'
    }));
  }, [customers]);

  // Churn Analysis
  const churnAnalysis = useMemo(() => {
    const churned = customers.filter(c => c.segment === 'churned').length;
    const atRisk = customers.filter(c => c.segment === 'at_risk').length;
    const total = customers.length;
    const churnRate = total > 0 ? ((churned / total) * 100).toFixed(1) : 0;
    const atRiskRate = total > 0 ? ((atRisk / total) * 100).toFixed(1) : 0;
    
    // Calculate retention rate
    const retained = customers.filter(c => !['churned', 'at_risk'].includes(c.segment)).length;
    const retentionRate = total > 0 ? ((retained / total) * 100).toFixed(1) : 0;

    return { churned, atRisk, churnRate, atRiskRate, retentionRate, total };
  }, [customers]);

  // Monthly Revenue Trend
  const revenueTrend = useMemo(() => {
    const months = eachMonthOfInterval({ 
      start: subMonths(new Date(), 11), 
      end: new Date() 
    });
    
    return months.map(date => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthSales = sales.filter(s => {
        if (!s.created_date) return false;
        const saleDate = parseISO(s.created_date);
        return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
      });

      const revenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const orders = monthSales.length;
      
      return {
        month: format(date, 'MMM'),
        revenue,
        orders
      };
    });
  }, [sales]);

  // Key Metrics
  const metrics = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const newCustomers = filteredCustomers.filter(c => {
      if (!c.created_date) return false;
      return parseISO(c.created_date) >= dateRangeStart;
    }).length;
    
    const totalRevenue = filteredCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    const previousPeriodStart = subDays(dateRangeStart, parseInt(dateRange));
    const previousCustomers = filteredCustomers.filter(c => {
      if (!c.created_date) return false;
      const created = parseISO(c.created_date);
      return created >= previousPeriodStart && created < dateRangeStart;
    }).length;
    
    const growthRate = previousCustomers > 0 
      ? (((newCustomers - previousCustomers) / previousCustomers) * 100).toFixed(1)
      : newCustomers > 0 ? 100 : 0;

    return { totalCustomers, newCustomers, totalRevenue, avgLTV, growthRate };
  }, [filteredCustomers, dateRangeStart, dateRange]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-[#1EB053]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Customers</p>
                <p className="text-xl font-bold">{metrics.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-[#0072C6]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">New Customers</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{metrics.newCustomers}</p>
                  {metrics.growthRate > 0 ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <ArrowUp className="w-3 h-3 mr-1" />{metrics.growthRate}%
                    </Badge>
                  ) : metrics.growthRate < 0 ? (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      <ArrowDown className="w-3 h-3 mr-1" />{Math.abs(metrics.growthRate)}%
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-[#f59e0b]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold">Le {metrics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-[#8b5cf6]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg. LTV</p>
                <p className="text-xl font-bold">Le {metrics.avgLTV.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-[#10b981]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Activity className="w-5 h-5 text-[#10b981]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Retention Rate</p>
                <p className="text-xl font-bold">{churnAnalysis.retentionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Acquisition Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#1EB053]" />
              Customer Acquisition Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={acquisitionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value, name) => [value, name === 'customers' ? 'New Customers' : 'Cumulative']}
                />
                <Legend />
                <Area type="monotone" dataKey="customers" name="New Customers" stroke="#1EB053" fill="#1EB053" fillOpacity={0.3} />
                <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="#0072C6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#f59e0b]" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value) => [`Le ${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#1EB053" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#0072C6]" />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={segmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {segmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Customers']} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Segment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
              Sales by Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesBySegment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value) => [`Le ${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="value" name="Revenue" radius={[0, 4, 4, 0]}>
                  {salesBySegment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Churn Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-red-500" />
              Churn Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-red-600">{churnAnalysis.churnRate}%</p>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-xs text-gray-500">{churnAnalysis.churned} customers</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-orange-600">{churnAnalysis.atRiskRate}%</p>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-xs text-gray-500">{churnAnalysis.atRisk} customers</p>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-green-600">{churnAnalysis.retentionRate}%</p>
              <p className="text-sm text-gray-600">Retention Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Employee */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1EB053]" />
              Sales Performance by Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesByEmployee.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No sales data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByEmployee}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `Le ${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#1EB053" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="count" name="Orders" fill="#0072C6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Customers by LTV */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-[#f59e0b]" />
              Top Customers by Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customerLTV.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No customer data available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {customerLTV.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        idx === 0 ? 'bg-[#f59e0b]' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-gray-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs" style={{ backgroundColor: SEGMENT_COLORS[customer.segment] + '20', color: SEGMENT_COLORS[customer.segment] }}>
                            {customer.segment}
                          </Badge>
                          <span className="text-xs text-gray-500">{customer.purchases} orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1EB053]">Le {customer.ltv.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Avg: Le {customer.avgOrder.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}