import React from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SalesSummaryCard({ sales = [] }) {
  const today = new Date();
  
  // Today's sales
  const todaySales = sales.filter(s => 
    s.created_date?.startsWith(format(today, 'yyyy-MM-dd'))
  );
  const todayTotal = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  // This week's sales
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekSales = sales.filter(s => {
    const saleDate = new Date(s.created_date);
    return isWithinInterval(saleDate, { start: weekStart, end: weekEnd });
  });
  const weekTotal = weekSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  // This month's sales
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthSales = sales.filter(s => {
    const saleDate = new Date(s.created_date);
    return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
  });
  const monthTotal = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  // Payment method breakdown
  const paymentBreakdown = todaySales.reduce((acc, sale) => {
    const method = sale.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + (sale.total_amount || 0);
    return acc;
  }, {});

  const paymentIcons = {
    cash: Wallet,
    card: CreditCard,
    mobile_money: DollarSign,
  };

  return (
    <Card className="border-t-4 border-t-[#1EB053]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#1EB053]" />
          Sales Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">Today</p>
            <p className="text-xl font-bold text-[#1EB053]">SLE {todayTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{todaySales.length} sales</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">This Week</p>
            <p className="text-xl font-bold text-[#0072C6]">SLE {weekTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{weekSales.length} sales</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase">This Month</p>
            <p className="text-xl font-bold text-purple-600">SLE {monthTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{monthSales.length} sales</p>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">Today by Payment Method</p>
          <div className="space-y-2">
            {Object.entries(paymentBreakdown).map(([method, amount]) => {
              const Icon = paymentIcons[method] || DollarSign;
              return (
                <div key={method} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="capitalize text-sm">{method.replace('_', ' ')}</span>
                  </div>
                  <span className="font-medium text-sm">SLE {amount.toLocaleString()}</span>
                </div>
              );
            })}
            {Object.keys(paymentBreakdown).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-2">No sales yet today</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}