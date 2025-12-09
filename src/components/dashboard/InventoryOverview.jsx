import { } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const COLORS = ['#1EB053', '#0072C6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function InventoryOverview({ products = [], stockMovements = [], categories = [] }) {
  // Calculate metrics
  const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price), 0);
  const lowStockCount = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
  const avgStockLevel = products.length > 0 
    ? products.reduce((sum, p) => sum + p.stock_quantity, 0) / products.length 
    : 0;

  // Category breakdown
  const categoryData = categories.slice(0, 5).map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).length,
    stock: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.stock_quantity, 0)
  }));

  // Recent stock movements trend (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const movementTrend = last7Days.map(date => {
    const dayMovements = stockMovements.filter(m => m.created_date?.startsWith(date));
    const inCount = dayMovements.filter(m => m.movement_type === 'in').reduce((sum, m) => sum + m.quantity, 0);
    const outCount = dayMovements.filter(m => m.movement_type === 'out').reduce((sum, m) => sum + m.quantity, 0);
    return {
      date: date.split('-')[2],
      in: inCount,
      out: outCount
    };
  });

  const topProducts = [...products]
    .sort((a, b) => (b.stock_quantity * b.unit_price) - (a.stock_quantity * a.unit_price))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Inventory Value & Stats */}
      <Card className="border-l-4 border-l-[#1EB053]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1EB053]" />
            Inventory Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total Value</p>
              <p className="text-xl font-bold text-[#1EB053]">Le {totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Avg Stock</p>
              <p className="text-xl font-bold text-[#0072C6]">{Math.round(avgStockLevel)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                <p className="text-xs text-orange-600 font-medium">Low Stock</p>
              </div>
              <p className="text-xl font-bold text-orange-600">{lowStockCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-1 mb-1">
                <Package className="w-3 h-3 text-red-600" />
                <p className="text-xs text-red-600 font-medium">Out of Stock</p>
              </div>
              <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
          </div>

          {/* Top 5 by Value */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Top Products by Value</p>
            <div className="space-y-1.5">
              {topProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400">#{idx + 1}</span>
                    <span className="truncate font-medium">{product.name}</span>
                  </div>
                  <span className="text-[#1EB053] font-semibold">Le {(product.stock_quantity * product.unit_price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="border-l-4 border-l-[#0072C6]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-[#0072C6]" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No category data</p>
          )}
          
          <div className="mt-4 space-y-1">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <span className="text-gray-500">{cat.value} items • {cat.stock} stock</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Movement Trend */}
      <Card className="lg:col-span-2 border-l-4 border-l-[#8b5cf6]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
              Stock Movement (Last 7 Days)
            </CardTitle>
            <Link to={createPageUrl("Inventory")}>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="in" fill="#1EB053" name="Stock In" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" fill="#ef4444" name="Stock Out" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}