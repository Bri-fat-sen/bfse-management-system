import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, DollarSign, TrendingUp, Navigation, Fuel } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function TransportMetrics({ trips = [], vehicles = [], routes = [], truckContracts = [] }) {
  // Today's trips
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTrips = trips.filter(t => t.date === today);
  const todayRevenue = todayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const todayExpenses = todayTrips.reduce((sum, t) => sum + ((t.fuel_cost || 0) + (t.other_expenses || 0)), 0);
  const todayNet = todayRevenue - todayExpenses;

  // Vehicle status
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;

  // Last 7 days trips trend
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const tripsTrend = last7Days.map(date => {
    const dayTrips = trips.filter(t => t.date === date);
    const revenue = dayTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const count = dayTrips.length;
    return {
      date: date.split('-')[2],
      trips: count,
      revenue
    };
  });

  // Top routes by revenue
  const routeRevenue = routes.map(route => {
    const routeTrips = trips.filter(t => t.route_id === route.id);
    const revenue = routeTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    return {
      name: route.name,
      revenue,
      trips: routeTrips.length
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Truck contracts summary
  const activeContracts = truckContracts.filter(c => c.status === 'in_progress' || c.status === 'pending').length;
  const contractRevenue = truckContracts
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + (c.net_revenue || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Revenue Trend */}
      <Card className="lg:col-span-2 border-l-4 border-l-[#f59e0b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
            Transport Revenue (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tripsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value, name) => [
                    name === 'revenue' ? `Le ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Trips'
                  ]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                <Line type="monotone" dataKey="trips" stroke="#0072C6" strokeWidth={2} dot={{ fill: '#0072C6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Status */}
      <Card className="border-l-4 border-l-[#0072C6]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#0072C6]" />
            Fleet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeVehicles}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-600 font-medium mb-1">Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{maintenanceVehicles}</p>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-[#f59e0b]/10 to-[#0072C6]/10 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Today's Net Revenue</p>
            <p className="text-2xl font-bold text-[#1EB053]">Le {todayNet.toLocaleString()}</p>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-gray-500">Revenue: Le {todayRevenue.toLocaleString()}</span>
              <span className="text-red-600">Costs: Le {todayExpenses.toLocaleString()}</span>
            </div>
          </div>

          {activeContracts > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Active Truck Contracts</p>
              <p className="text-xl font-bold text-blue-600">{activeContracts}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Routes */}
      <Card className="lg:col-span-3 border-l-4 border-l-[#8b5cf6]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#8b5cf6]" />
            Top Routes by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {routeRevenue.length > 0 ? (
            <div className="space-y-2">
              {routeRevenue.map((route, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#0072C6] flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{route.name}</p>
                      <p className="text-xs text-gray-500">{route.trips} trips</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#1EB053]">Le {route.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No route data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}