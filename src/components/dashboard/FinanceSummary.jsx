import React from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { DollarSign, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FinanceSummary({ sales = [], expenses = [], trips = [], truckContracts = [], revenues = [], maintenanceRecords = [] }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Helper to safely check if date is in month
  const isInMonth = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  };

  // This month's data - ALL REVENUE SOURCES
  const monthSales = sales.filter(s => isInMonth(s.created_date));
  const salesRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  
  const monthTrips = trips.filter(t => isInMonth(t.date));
  const tripRevenue = monthTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  
  const monthContracts = truckContracts.filter(c => isInMonth(c.contract_date) && c.status === 'completed');
  const contractRevenue = monthContracts.reduce((sum, c) => sum + (c.contract_amount || 0), 0);
  
  const monthRevenues = revenues.filter(r => isInMonth(r.date || r.created_date));
  const otherRevenue = monthRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  const totalRevenue = salesRevenue + tripRevenue + contractRevenue + otherRevenue;

  // This month's data - ALL EXPENSE SOURCES
  const monthExpenses = expenses.filter(e => isInMonth(e.date || e.created_date));
  const recordedExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const tripExpenses = monthTrips.reduce((sum, t) => sum + (t.fuel_cost || 0) + (t.other_expenses || 0), 0);
  
  const contractExpenses = monthContracts.reduce((sum, c) => sum + (c.total_expenses || 0), 0);
  
  const monthMaintenance = maintenanceRecords.filter(m => isInMonth(m.date_performed));
  const maintenanceExpenses = monthMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  
  const totalExpenses = recordedExpenses + tripExpenses + contractExpenses + maintenanceExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Expense breakdown by category
  const expenseByCategory = monthExpenses.reduce((acc, exp) => {
    const cat = exp.category || 'other';
    acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
    return acc;
  }, {});

  const topExpenses = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const categoryColors = {
    fuel: 'bg-red-100 text-red-700',
    maintenance: 'bg-orange-100 text-orange-700',
    utilities: 'bg-yellow-100 text-yellow-700',
    supplies: 'bg-blue-100 text-blue-700',
    rent: 'bg-purple-100 text-purple-700',
    salaries: 'bg-green-100 text-green-700',
    transport: 'bg-indigo-100 text-indigo-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <Card className="border-t-4 border-t-[#D4AF37]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#D4AF37]" />
          Financial Summary
          <Badge variant="outline" className="ml-auto text-xs">
            {format(today, 'MMMM yyyy')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 bg-green-50 rounded-lg text-center">
            <ArrowUpRight className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <p className="text-xs text-green-600 uppercase">Revenue</p>
            <p className="text-sm font-bold text-green-700">SLE {(totalRevenue / 1000).toFixed(0)}K</p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg text-center">
            <ArrowDownRight className="w-4 h-4 mx-auto text-red-600 mb-1" />
            <p className="text-xs text-red-600 uppercase">Expenses</p>
            <p className="text-sm font-bold text-red-700">SLE {(totalExpenses / 1000).toFixed(0)}K</p>
          </div>
          <div className={`p-2 rounded-lg text-center ${netProfit >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
            <PieChart className={`w-4 h-4 mx-auto mb-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
            <p className={`text-xs uppercase ${netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>Profit</p>
            <p className={`text-sm font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
              SLE {(netProfit / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {/* Profit Indicator */}
        <div className={`p-3 rounded-lg mb-4 ${netProfit >= 0 ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gradient-to-r from-amber-50 to-red-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Profit Margin</span>
            <div className="flex items-center gap-1">
              {netProfit >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profitMargin}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Expenses */}
        {topExpenses.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Top Expense Categories</p>
            <div className="space-y-2">
              {topExpenses.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <Badge className={`capitalize ${categoryColors[category] || categoryColors.other}`}>
                    {category.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm font-medium">SLE {amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}