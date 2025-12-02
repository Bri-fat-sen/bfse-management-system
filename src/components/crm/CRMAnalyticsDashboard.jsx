import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Users, TrendingUp, TrendingDown, DollarSign, UserPlus, UserMinus,
  Star, ShoppingCart, Calendar, BarChart3, PieChart as PieChartIcon,
  Award, Target, RefreshCw
} from "lucide-react";
import moment from "moment";

const COLORS = ['#1EB053', '#0072C6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];
const SEGMENT_COLORS = {
  vip: '#f59e0b',
  regular: '#0072C6',
  new: '#1EB053',
  at_risk: '#f97316',
  churned: '#6b7280'
};

export default function CRMAnalyticsDashboard({ customers = [], sales = [], interactions = [], employees = [] }) {
  const [dateRange, setDateRange] = useState('30');
  const [segmentFilter, setSegmentFilter] = useState('all');

  // Date filtering
  const startDate = useMemo(() => {
    if (dateRange === 'all') return null;
    return moment().subtract(parseInt(dateRange), 'days').startOf('day');
  }, [dateRange]);

  // Filtered data
  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (segmentFilter !== 'all') {
      result = result.filter(c => c.segment === segmentFilter);
    }
    return result;
  }, [customers, segmentFilter]);

  const filteredSales = useMemo(() => {
    let result = sales;
    if (startDate) {
      result = result.filter(s => moment(s.created_date).isAfter(startDate));
    }
    if (segmentFilter !== 'all') {
      const customerIds = filteredCustomers.map(c => c.id);
      result = result.filter(s => customerIds.includes(s.customer_id));
    }
    return result;
  }, [sales, startDate, segmentFilter, filteredCustomers]);

  // Customer Acquisition Trends
  const acquisitionData = useMemo(() => {
    const days = dateRange === 'all' ? 365 : parseInt(dateRange);
    const grouped = {};
    
    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      grouped[date] = { date, new_customers: 0, churned: 0 };
    }

    customers.forEach(c => {
      const date = moment(c.created_date).format('YYYY-MM-DD');
      if (grouped[date]) {
        grouped[date].new_customers++;
      }
      if (c.segment === 'churned') {
        const churnDate = moment(c.updated_date).format('YYYY-MM-DD');
        if (grouped[churnDate]) {
          grouped[churnDate].churned++;
        }
      }
    });

    const data = Object.values(grouped);
    // Aggregate by week if more than 30 days
    if (days > 30) {
      const weeklyData = [];
      for (let i = 0; i < data.length; i += 7) {
        const week = data.slice(i, i + 7);
        weeklyData.push({
          date: moment(week[0].date).format('MMM D'),
          new_customers: week.reduce((sum, d) => sum + d.new_customers, 0),
          churned: week.reduce((sum, d) => sum + d.churned, 0)
        });
      }
      return weeklyData;
    }
    return data.map(d => ({ ...d, date: moment(d.date).format('MMM D') }));
  }, [customers, dateRange]);

  // Segment Distribution
  const segmentDistribution = useMemo(() => {
    const distribution = {};
    customers.forEach(c => {
      const segment = c.segment || 'new';
      distribution[segment] = (distribution[segment] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
      color: SEGMENT_COLORS[name] || '#6b7280'
    }));
  }, [customers]);

  // Sales by Employee
  const salesByEmployee = useMemo(() => {
    const grouped = {};
    filteredSales.forEach(s => {
      const empName = s.employee_name || 'Unknown';
      if (!grouped[empName]) {
        grouped[empName] = { name: empName, revenue: 0, orders: 0 };
      }
      grouped[empName].revenue += s.total_amount || 0;
      grouped[empName].orders++;
    });
    return Object.values(grouped).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredSales]);

  // Sales by Segment
  const salesBySegment = useMemo(() => {
    const segmentSales = {};
    filteredSales.forEach(sale => {
      const customer = customers.find(c => c.id === sale.customer_id);
      const segment = customer?.segment || 'unknown';
      if (!segmentSales[segment]) {
        segmentSales[segment] = { name: segment, revenue: 0, orders: 0 };
      }
      segmentSales[segment].revenue += sale.total_amount || 0;
      segmentSales[segment].orders++;
    });
    return Object.values(segmentSales).map(s => ({
      ...s,
      name: s.name.charAt(0).toUpperCase() + s.name.slice(1).replace('_', ' '),
      color: SEGMENT_COLORS[s.name] || '#6b7280'
    }));
  }, [filteredSales, customers]);

  // Customer Lifetime Value (CLV)
  const clvData = useMemo(() => {
    return filteredCustomers
      .map(c => ({
        name: c.name?.substring(0, 15) || 'Unknown',
        ltv: c.total_spent || 0,
        orders: c.total_purchases || 0,
        avgOrder: c.average_order_value || 0,
        segment: c.segment
      }))
      .sort((a, b) => b.ltv - a.ltv)
      .slice(0, 15);
  }, [filteredCustomers]);

  // Monthly Revenue Trend
  const monthlyRevenue = useMemo(() => {
    const months = {};
    const monthsBack = dateRange === 'all' ? 12 : Math.min(parseInt(dateRange) / 30, 12);
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthKey = moment().subtract(i, 'months').format('YYYY-MM');
      months[monthKey] = { month: moment().subtract(i, 'months').format('MMM'), revenue: 0, orders: 0 };
    }

    sales.forEach(s => {
      const monthKey = moment(s.created_date).format('YYYY-MM');
      if (months[monthKey]) {
        months[monthKey].revenue += s.total_amount || 0;
        months[monthKey].orders++;
      }
    });

    return Object.values(months);
  }, [sales, dateRange]);

  // Key Metrics
  const metrics = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const newCustomers = customers.filter(c => 
      startDate ? moment(c.created_date).isAfter(startDate) : c.segment === 'new'
    ).length;
    const churnedCustomers = customers.filter(c => c.segment === 'churned').length;
    const churnRate = totalCustomers > 0 ? ((churnedCustomers / totalCustomers) * 100).toFixed(1) : 0;
    
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const avgLTV = totalCustomers > 0 
      ? filteredCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / totalCustomers 
      : 0;

    const vipCustomers = filteredCustomers.filter(c => c.segment === 'vip').length;
    const atRiskCustomers = filteredCustomers.filter(c => c.segment === 'at_risk').length;

    return {
      totalCustomers,
      newCustomers,
      churnedCustomers,
      churnRate,
      totalRevenue,
      avgOrderValue,
      avgLTV,
      vipCustomers,
      atRiskCustomers,
      totalOrders: filteredSales.length
    };
  }, [filteredCustomers, filteredSales, customers, startDate]);

  const MetricCard = ({ title, value, icon: Icon, trend, color = "green", subtitle }) => (
    <Card className={`border-l-4 border-l-${color === 'green' ? '[#1EB053]' : color === 'blue' ? '[#0072C6]' : color === 'amber' ? '[#f59e0b]' : color === 'red' ? 'red-500' : '[#8b5cf6]'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            color === 'green' ? 'bg-green-100' : 
            color === 'blue' ? 'bg-blue-100' : 
            color === 'amber' ? 'bg-amber-100' : 
            color === 'red' ? 'bg-red-100' : 'bg-purple-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              color === 'green' ? 'text-[#1EB053]' : 
              color === 'blue' ? 'text-[#0072C6]' : 
              color === 'amber' ? 'text-[#f59e0b]' : 
              color === 'red' ? 'text-red-500' : 'text-purple-500'
            }`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}% vs previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1EB053]" />
              <h2 className="font-semibold text-lg">CRM Analytics Dashboard</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Segments" />
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
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Total Customers" 
          value={metrics.totalCustomers.toLocaleString()} 
          icon={Users} 
          color="green" 
        />
        <MetricCard 
          title="New Customers" 
          value={metrics.newCustomers.toLocaleString()} 
          icon={UserPlus} 
          color="blue"
          subtitle={`In selected period`}
        />
        <MetricCard 
          title="Churn Rate" 
          value={`${metrics.churnRate}%`} 
          icon={UserMinus} 
          color="red"
          subtitle={`${metrics.churnedCustomers} churned`}
        />
        <MetricCard 
          title="Avg. LTV" 
          value={`Le ${Math.round(metrics.avgLTV).toLocaleString()}`} 
          icon={DollarSign} 
          color="purple" 
        />
        <MetricCard 
          title="VIP Customers" 
          value={metrics.vipCustomers.toLocaleString()} 
          icon={Star} 
          color="amber"
          subtitle={`${metrics.atRiskCustomers} at risk`}
        />
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value={`Le ${metrics.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="green" 
        />
        <MetricCard 
          title="Total Orders" 
          value={metrics.totalOrders.toLocaleString()} 
          icon={ShoppingCart} 
          color="blue" 
        />
        <MetricCard 
          title="Avg. Order Value" 
          value={`Le ${Math.round(metrics.avgOrderValue).toLocaleString()}`} 
          icon={Target} 
          color="amber" 
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="acquisition" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1 bg-gray-100">
          <TabsTrigger value="acquisition" className="gap-2">
            <UserPlus className="w-4 h-4" /> Acquisition
          </TabsTrigger>
          <TabsTrigger value="segments" className="gap-2">
            <PieChartIcon className="w-4 h-4" /> Segments
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Performance
          </TabsTrigger>
          <TabsTrigger value="ltv" className="gap-2">
            <Award className="w-4 h-4" /> Customer LTV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acquisition" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#1EB053]" />
                  Customer Acquisition Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={acquisitionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="new_customers" 
                      name="New Customers"
                      stroke="#1EB053" 
                      fill="#1EB053" 
                      fillOpacity={0.3} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="churned" 
                      name="Churned"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#0072C6]" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue"
                      stroke="#0072C6" 
                      strokeWidth={2}
                      dot={{ fill: '#0072C6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#f59e0b]" />
                  Customer Segment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {segmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#1EB053]" />
                  Revenue by Segment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesBySegment} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                      {salesBySegment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0072C6]" />
                Sales Performance by Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesByEmployee}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `Le ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#1EB053" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" name="Orders" fill="#0072C6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#f59e0b]" />
                Top Customers by Lifetime Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={clvData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="ltv" name="Lifetime Value" fill="#1EB053" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* LTV Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Value Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium">Customer</th>
                      <th className="text-left p-3 font-medium">Segment</th>
                      <th className="text-right p-3 font-medium">Total Spent</th>
                      <th className="text-right p-3 font-medium">Orders</th>
                      <th className="text-right p-3 font-medium">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clvData.slice(0, 10).map((customer, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{customer.name}</td>
                        <td className="p-3">
                          <Badge 
                            style={{ backgroundColor: SEGMENT_COLORS[customer.segment] + '20', color: SEGMENT_COLORS[customer.segment] }}
                          >
                            {customer.segment}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-semibold text-[#1EB053]">
                          Le {customer.ltv.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">{customer.orders}</td>
                        <td className="p-3 text-right">Le {Math.round(customer.avgOrder).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}