import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, Star, AlertCircle, TrendingUp, UserPlus,
  Heart, UserMinus, Target, DollarSign, ShoppingCart
} from "lucide-react";
import { DonutChart, GradientBarChart, SL_COLORS } from "@/components/charts/AdvancedCharts";

export default function CustomerSegments({ customers = [], orgId }) {
  const segments = useMemo(() => {
    const segmentData = {
      new: { count: 0, revenue: 0, icon: UserPlus, color: "blue", label: "New Customers", description: "Recently acquired customers" },
      regular: { count: 0, revenue: 0, icon: Users, color: "green", label: "Regular", description: "Consistent purchasers" },
      loyal: { count: 0, revenue: 0, icon: Heart, color: "purple", label: "Loyal", description: "Long-term customers" },
      vip: { count: 0, revenue: 0, icon: Star, color: "amber", label: "VIP", description: "High-value customers" },
      at_risk: { count: 0, revenue: 0, icon: AlertCircle, color: "red", label: "At Risk", description: "May churn soon" },
      churned: { count: 0, revenue: 0, icon: UserMinus, color: "gray", label: "Churned", description: "Inactive customers" }
    };

    customers.forEach(customer => {
      const segment = customer.segment || 'new';
      if (segmentData[segment]) {
        segmentData[segment].count++;
        segmentData[segment].revenue += customer.total_spent || 0;
      }
    });

    return segmentData;
  }, [customers]);

  const segmentChartData = Object.entries(segments).map(([key, data]) => ({
    name: data.label,
    value: data.count
  }));

  const revenueChartData = Object.entries(segments)
    .filter(([_, data]) => data.revenue > 0)
    .map(([key, data]) => ({
      name: data.label,
      value: data.revenue
    }));

  const totalCustomers = customers.length;

  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-500 to-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200", gradient: "from-green-500 to-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200", gradient: "from-purple-500 to-purple-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200", gradient: "from-amber-500 to-amber-600" },
    red: { bg: "bg-red-100", text: "text-red-600", border: "border-red-200", gradient: "from-red-500 to-red-600" },
    gray: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", gradient: "from-gray-500 to-gray-600" }
  };

  return (
    <div className="space-y-6">
      {/* Segment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(segments).map(([key, data]) => {
          const colors = colorMap[data.color];
          const percentage = totalCustomers > 0 ? (data.count / totalCustomers) * 100 : 0;
          
          return (
            <Card key={key} className={`border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer`}>
              <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                  <data.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <h3 className="font-semibold text-gray-900">{data.label}</h3>
                <p className="text-2xl font-bold mt-1">{data.count}</p>
                <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                <Progress value={percentage} className="mt-2 h-1" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1EB053]" />
              Customer Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart 
              data={segmentChartData}
              height={300}
              innerRadius={60}
              outerRadius={100}
              centerValue={totalCustomers}
              centerLabel="Customers"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B]" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              Revenue by Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GradientBarChart 
              data={revenueChartData}
              height={300}
              horizontal={true}
              formatter={(v) => `Le ${(v / 1000).toFixed(0)}k`}
              barSize={25}
            />
          </CardContent>
        </Card>
      </div>

      {/* Segment Details */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0072C6]" />
            Segment Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(segments).map(([key, data]) => {
              const colors = colorMap[data.color];
              const avgValue = data.count > 0 ? data.revenue / data.count : 0;
              
              return (
                <div key={key} className={`p-4 rounded-xl border ${colors.border} ${colors.bg} bg-opacity-30`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.gradient}`}>
                      <data.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{data.label}</h4>
                      <p className="text-xs text-gray-500">{data.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Customers</p>
                      <p className="font-bold">{data.count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Revenue</p>
                      <p className="font-bold">Le {(data.revenue / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Avg Customer Value</p>
                      <p className="font-bold text-[#1EB053]">Le {avgValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}