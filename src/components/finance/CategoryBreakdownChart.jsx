import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";

// Generate consistent colors for categories
const generateColors = (count) => {
  const baseColors = [
    '#1EB053', '#0072C6', '#D4AF37', '#9333ea', '#f59e0b', '#ef4444', 
    '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6',
    '#06b6d4', '#84cc16', '#a855f7', '#22c55e', '#3b82f6', '#eab308'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generate additional colors
  const colors = [...baseColors];
  while (colors.length < count) {
    const hue = (colors.length * 137.508) % 360;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

export default function CategoryBreakdownChart({ 
  data, 
  title = "Category Breakdown",
  valueFormatter = (val) => `Le ${val.toLocaleString()}`,
  icon: Icon = PieIcon,
  iconColor = "text-[#1EB053]"
}) {
  const [chartType, setChartType] = useState("pie");
  
  // Sort and prepare data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);
  
  const colors = useMemo(() => generateColors(chartData.length), [chartData.length]);
  
  const totalValue = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0), 
    [chartData]
  );
  
  const hasManyCategories = chartData.length > 6;
  
  if (chartData.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-gray-500">
            No data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="h-1 flex">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            {title}
          </CardTitle>
          {hasManyCategories && (
            <Tabs value={chartType} onValueChange={setChartType}>
              <TabsList className="h-8">
                <TabsTrigger value="pie" className="text-xs px-2">
                  <PieIcon className="w-3 h-3 mr-1" />
                  Pie
                </TabsTrigger>
                <TabsTrigger value="bar" className="text-xs px-2">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Bar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid ${hasManyCategories ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* Chart */}
          <div className="flex items-center justify-center">
            {chartType === "pie" ? (
              <ResponsiveContainer width="100%" height={hasManyCategories ? 280 : 300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={hasManyCategories ? 50 : 60}
                    outerRadius={hasManyCategories ? 90 : 100}
                    dataKey="value"
                    label={!hasManyCategories ? ({ name, percent }) => `${(percent * 100).toFixed(0)}%` : false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => valueFormatter(value)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={hasManyCategories ? 500 : 350}>
                <BarChart 
                  data={chartData} 
                  layout="vertical"
                  margin={{ top: 15, right: 40, left: 5, bottom: 15 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    stroke="#9ca3af"
                    style={{ fontSize: '11px' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={140}
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    stroke="#9ca3af"
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => valueFormatter(value)}
                    cursor={{ fill: 'rgba(30, 176, 83, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #1EB053',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#0F1F3C', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 8, 8, 0]}
                    animationDuration={800}
                    maxBarSize={40}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#bar-gradient-${index})`}
                      />
                    ))}
                  </Bar>
                  <defs>
                    {chartData.map((entry, index) => (
                      <linearGradient key={`bar-gradient-${index}`} id={`bar-gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={colors[index]} stopOpacity={0.7} />
                        <stop offset="100%" stopColor={colors[index]} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Legend / List */}
          <div>
            <div className="mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-800">{valueFormatter(totalValue)}</p>
            </div>
            
            <ScrollArea className={hasManyCategories ? "h-[280px] pr-3" : "h-auto"}>
              <div className="space-y-2">
                {chartData.map((item, index) => {
                  const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[index] }}
                        />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {percentage}%
                        </Badge>
                        <span className="text-sm font-bold text-gray-800 min-w-[80px] text-right">
                          {valueFormatter(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}