import React, { useMemo } from "react";
import { format, subDays, addDays, parseISO, differenceInDays } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Lightbulb,
  ArrowRight,
  Package,
  DollarSign,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

// Simple linear regression for trend prediction
const linearRegression = (data) => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  data.forEach((point, i) => {
    sumX += i;
    sumY += point.value;
    sumXY += i * point.value;
    sumXX += i * i;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

// Moving average calculation
const movingAverage = (data, window = 7) => {
  return data.map((_, i, arr) => {
    const start = Math.max(0, i - window + 1);
    const subset = arr.slice(start, i + 1);
    const avg = subset.reduce((sum, d) => sum + d.value, 0) / subset.length;
    return { ...arr[i], ma: avg };
  });
};

export default function PredictiveAnalytics({ sales = [], products = [], expenses = [] }) {
  // Sales Prediction
  const salesPrediction = useMemo(() => {
    // Group sales by day
    const dailySales = {};
    sales.forEach(s => {
      const date = s.created_date?.split('T')[0];
      if (date) {
        dailySales[date] = (dailySales[date] || 0) + (s.total_amount || 0);
      }
    });

    // Create time series
    const sortedDates = Object.keys(dailySales).sort();
    const historicalData = sortedDates.map((date, i) => ({
      date,
      value: dailySales[date],
      index: i
    }));

    if (historicalData.length < 7) {
      return { trend: 'insufficient', forecast: [], confidence: 0 };
    }

    // Calculate regression
    const { slope, intercept } = linearRegression(historicalData);
    
    // Calculate 7-day forecast
    const lastIndex = historicalData.length - 1;
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const predictedValue = Math.max(0, intercept + slope * (lastIndex + i));
      forecast.push({
        date: format(addDays(parseISO(sortedDates[sortedDates.length - 1]), i), 'MMM d'),
        predicted: Math.round(predictedValue),
        isForecasted: true
      });
    }

    // Calculate average and trend
    const recentAvg = historicalData.slice(-7).reduce((sum, d) => sum + d.value, 0) / 7;
    const olderAvg = historicalData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0) / Math.min(7, historicalData.slice(-14, -7).length);
    const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100) : 0;

    // Add moving average to historical data
    const withMA = movingAverage(historicalData);
    const chartData = [
      ...withMA.slice(-14).map(d => ({
        date: format(parseISO(d.date), 'MMM d'),
        actual: d.value,
        ma: Math.round(d.ma)
      })),
      ...forecast
    ];

    return {
      trend: slope > 0 ? 'up' : slope < 0 ? 'down' : 'stable',
      growthRate: growthRate.toFixed(1),
      forecast,
      chartData,
      nextWeekTotal: forecast.reduce((sum, f) => sum + f.predicted, 0),
      avgDaily: Math.round(recentAvg),
      confidence: Math.min(95, 60 + (historicalData.length * 0.5))
    };
  }, [sales]);

  // Inventory Predictions
  const inventoryPredictions = useMemo(() => {
    const predictions = products.map(product => {
      // Calculate daily consumption from sales
      const productSales = [];
      sales.forEach(s => {
        s.items?.forEach(item => {
          if (item.product_id === product.id || item.product_name === product.name) {
            const date = s.created_date?.split('T')[0];
            productSales.push({ date, quantity: item.quantity });
          }
        });
      });

      // Group by day
      const dailyConsumption = {};
      productSales.forEach(ps => {
        dailyConsumption[ps.date] = (dailyConsumption[ps.date] || 0) + ps.quantity;
      });

      const days = Object.keys(dailyConsumption).length;
      const totalConsumed = Object.values(dailyConsumption).reduce((sum, q) => sum + q, 0);
      const avgDailyConsumption = days > 0 ? totalConsumed / days : 0;
      
      const currentStock = product.stock_quantity || 0;
      const daysUntilStockout = avgDailyConsumption > 0 
        ? Math.floor(currentStock / avgDailyConsumption)
        : Infinity;

      const threshold = product.low_stock_threshold || 10;
      const daysUntilLowStock = avgDailyConsumption > 0 
        ? Math.floor((currentStock - threshold) / avgDailyConsumption)
        : Infinity;

      return {
        id: product.id,
        name: product.name,
        currentStock,
        avgDailyConsumption: avgDailyConsumption.toFixed(1),
        daysUntilStockout: daysUntilStockout === Infinity ? 'N/A' : daysUntilStockout,
        daysUntilLowStock: daysUntilLowStock === Infinity ? 'N/A' : Math.max(0, daysUntilLowStock),
        reorderSuggestion: avgDailyConsumption > 0 ? Math.ceil(avgDailyConsumption * 14) : 0,
        risk: daysUntilLowStock <= 7 ? 'high' : daysUntilLowStock <= 14 ? 'medium' : 'low'
      };
    }).filter(p => p.avgDailyConsumption > 0);

    return predictions.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.risk] - riskOrder[b.risk];
    }).slice(0, 10);
  }, [products, sales]);

  // Expense Forecasting
  const expenseForecast = useMemo(() => {
    const monthlyExpenses = {};
    expenses.forEach(e => {
      const month = e.date?.slice(0, 7);
      if (month) {
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + (e.amount || 0);
      }
    });

    const months = Object.keys(monthlyExpenses).sort();
    if (months.length < 2) return null;

    const data = months.map((m, i) => ({ month: m, value: monthlyExpenses[m], index: i }));
    const { slope, intercept } = linearRegression(data);
    
    const nextMonthPrediction = Math.max(0, intercept + slope * months.length);
    const avgMonthly = data.reduce((sum, d) => sum + d.value, 0) / data.length;

    return {
      nextMonth: Math.round(nextMonthPrediction),
      avgMonthly: Math.round(avgMonthly),
      trend: slope > 0 ? 'increasing' : 'decreasing',
      changePercent: ((nextMonthPrediction - avgMonthly) / avgMonthly * 100).toFixed(1)
    };
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Sales Forecast */}
      <Card className="border-t-4 border-t-[#1EB053]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1EB053]" />
            Sales Forecast (7-Day Prediction)
            <Badge 
              variant="outline" 
              className={salesPrediction.trend === 'up' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
            >
              {salesPrediction.growthRate > 0 ? '+' : ''}{salesPrediction.growthRate}% week-over-week
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Predicted Next 7 Days</p>
              <p className="text-2xl font-bold text-[#1EB053]">Le {salesPrediction.nextWeekTotal?.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Avg. Daily Revenue</p>
              <p className="text-2xl font-bold text-[#0072C6]">Le {salesPrediction.avgDaily?.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Trend Direction</p>
              <p className="text-2xl font-bold capitalize flex items-center gap-2">
                {salesPrediction.trend === 'up' ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
                {salesPrediction.trend}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Forecast Confidence</p>
              <p className="text-2xl font-bold text-purple-600">{salesPrediction.confidence?.toFixed(0)}%</p>
              <Progress value={salesPrediction.confidence} className="mt-2 h-2" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesPrediction.chartData}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1EB053" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1EB053" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0072C6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0072C6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value, name) => [`Le ${value?.toLocaleString()}`, name === 'actual' ? 'Actual' : name === 'predicted' ? 'Predicted' : 'Moving Avg']}
              />
              <Area type="monotone" dataKey="actual" stroke="#1EB053" fill="url(#actualGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="predicted" stroke="#0072C6" fill="url(#predictedGradient)" strokeWidth={2} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="ma" stroke="#D4AF37" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#1EB053] rounded" />
              <span>Actual Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0072C6] rounded" style={{ opacity: 0.5 }} />
              <span>Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#D4AF37] rounded" />
              <span>7-Day Moving Avg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Risk Predictions */}
      <Card className="border-t-4 border-t-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            Inventory Risk Analysis
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryPredictions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Not enough sales data for inventory predictions</p>
          ) : (
            <div className="space-y-3">
              {inventoryPredictions.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    item.risk === 'high' ? 'bg-red-50 border border-red-200' :
                    item.risk === 'medium' ? 'bg-amber-50 border border-amber-200' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.risk === 'high' ? 'bg-red-100' :
                      item.risk === 'medium' ? 'bg-amber-100' :
                      'bg-green-100'
                    }`}>
                      {item.risk === 'high' ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.avgDailyConsumption} units/day avg consumption
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-500">Current Stock</p>
                      <p className="font-bold">{item.currentStock}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Days to Low Stock</p>
                      <p className={`font-bold ${item.risk === 'high' ? 'text-red-600' : item.risk === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>
                        {item.daysUntilLowStock}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Reorder Suggestion</p>
                      <p className="font-bold text-[#0072C6]">{item.reorderSuggestion} units</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Forecast */}
      {expenseForecast && (
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#0072C6]" />
              Expense Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Next Month Prediction</p>
                <p className="text-2xl font-bold text-[#0072C6]">Le {expenseForecast.nextMonth.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Average Monthly</p>
                <p className="text-2xl font-bold">Le {expenseForecast.avgMonthly.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Expected Change</p>
                <p className={`text-2xl font-bold flex items-center gap-2 ${expenseForecast.changePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {expenseForecast.trend === 'increasing' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {expenseForecast.changePercent > 0 ? '+' : ''}{expenseForecast.changePercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesPrediction.trend === 'up' && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-700">Sales are trending upward</p>
                  <p className="text-sm text-gray-600">Consider increasing inventory levels for high-demand products to avoid stockouts.</p>
                </div>
              </div>
            )}
            {inventoryPredictions.filter(p => p.risk === 'high').length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-700">
                    {inventoryPredictions.filter(p => p.risk === 'high').length} products at risk of stockout
                  </p>
                  <p className="text-sm text-gray-600">
                    {inventoryPredictions.filter(p => p.risk === 'high').map(p => p.name).join(', ')} need immediate reordering.
                  </p>
                </div>
              </div>
            )}
            {expenseForecast?.trend === 'increasing' && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-700">Expenses are increasing</p>
                  <p className="text-sm text-gray-600">Review expense categories for potential cost optimization opportunities.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}