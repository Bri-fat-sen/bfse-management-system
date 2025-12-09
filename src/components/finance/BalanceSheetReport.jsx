import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Building2, TrendingUp, AlertTriangle } from "lucide-react";

export default function BalanceSheetReport({ 
  assets = [], 
  liabilities = [], 
  revenues = [],
  expenses = [],
  dateRange,
  organisation 
}) {
  // Calculate totals
  const currentAssets = assets.filter(a => a.asset_type === 'current' && a.status === 'active')
    .reduce((sum, a) => sum + (a.value || 0), 0);
  
  const fixedAssets = assets.filter(a => a.asset_type === 'fixed' && a.status === 'active')
    .reduce((sum, a) => sum + (a.value || 0), 0);
  
  const intangibleAssets = assets.filter(a => a.asset_type === 'intangible' && a.status === 'active')
    .reduce((sum, a) => sum + (a.value || 0), 0);
  
  const totalAssets = currentAssets + fixedAssets + intangibleAssets;

  const currentLiabilities = liabilities.filter(l => l.liability_type === 'current' && l.status === 'active')
    .reduce((sum, l) => sum + (l.amount || 0), 0);
  
  const longTermLiabilities = liabilities.filter(l => l.liability_type === 'long_term' && l.status === 'active')
    .reduce((sum, l) => sum + (l.amount || 0), 0);
  
  const totalLiabilities = currentLiabilities + longTermLiabilities;

  // Calculate retained earnings (all-time profit)
  const allTimeRevenue = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
  const allTimeExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const retainedEarnings = allTimeRevenue - allTimeExpenses;

  // Total Equity = Assets - Liabilities (accounting equation)
  const totalEquity = totalAssets - totalLiabilities;
  const calculatedEquity = retainedEarnings;

  // Asset breakdown by category
  const assetsByCategory = {};
  assets.filter(a => a.status === 'active').forEach(a => {
    const cat = a.category || 'other';
    assetsByCategory[cat] = (assetsByCategory[cat] || 0) + (a.value || 0);
  });

  // Liability breakdown by category
  const liabilitiesByCategory = {};
  liabilities.filter(l => l.status === 'active').forEach(l => {
    const cat = l.category || 'other';
    liabilitiesByCategory[cat] = (liabilitiesByCategory[cat] || 0) + (l.amount || 0);
  });

  const balanceCheck = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{organisation?.name || 'Organisation'}</h2>
            <p className="text-lg font-semibold text-gray-700 mt-1">BALANCE SHEET</p>
            <p className="text-sm text-gray-500">As of {dateRange?.label || format(new Date(), 'MMMM dd, yyyy')}</p>
            {!balanceCheck && (
              <Badge className="bg-red-100 text-red-700 mt-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Accounting Equation Imbalanced
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSETS */}
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="w-5 h-5 text-[#1EB053]" />
              ASSETS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Current Assets */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">Current Assets</h3>
              <div className="space-y-2 ml-4">
                {Object.entries(assetsByCategory)
                  .filter(([cat]) => ['cash', 'bank_account', 'inventory', 'accounts_receivable', 'prepaid_expenses'].includes(cat))
                  .map(([cat, val]) => (
                    <div key={cat} className="flex justify-between py-1">
                      <span className="text-gray-600 capitalize">{cat.replace(/_/g, ' ')}</span>
                      <span className="font-medium">Le {val.toLocaleString()}</span>
                    </div>
                  ))}
                <div className="flex justify-between py-2 border-t font-semibold text-[#1EB053]">
                  <span>Total Current Assets</span>
                  <span>Le {currentAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">Fixed Assets</h3>
              <div className="space-y-2 ml-4">
                {Object.entries(assetsByCategory)
                  .filter(([cat]) => ['vehicles', 'equipment', 'buildings', 'land', 'furniture', 'computers'].includes(cat))
                  .map(([cat, val]) => (
                    <div key={cat} className="flex justify-between py-1">
                      <span className="text-gray-600 capitalize">{cat.replace(/_/g, ' ')}</span>
                      <span className="font-medium">Le {val.toLocaleString()}</span>
                    </div>
                  ))}
                <div className="flex justify-between py-2 border-t font-semibold text-[#1EB053]">
                  <span>Total Fixed Assets</span>
                  <span>Le {fixedAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Total Assets */}
            <div className="pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between py-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 rounded-lg">
                <span className="font-bold text-lg text-gray-900">TOTAL ASSETS</span>
                <span className="font-bold text-lg text-[#1EB053]">Le {totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LIABILITIES & EQUITY */}
        <div className="space-y-6">
          {/* Liabilities */}
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                LIABILITIES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Current Liabilities */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">Current Liabilities</h3>
                <div className="space-y-2 ml-4">
                  {Object.entries(liabilitiesByCategory)
                    .filter(([cat]) => ['accounts_payable', 'short_term_loan', 'wages_payable', 'tax_payable', 'nassit_payable', 'credit_card'].includes(cat))
                    .map(([cat, val]) => (
                      <div key={cat} className="flex justify-between py-1">
                        <span className="text-gray-600 capitalize">{cat.replace(/_/g, ' ')}</span>
                        <span className="font-medium">Le {val.toLocaleString()}</span>
                      </div>
                    ))}
                  <div className="flex justify-between py-2 border-t font-semibold text-red-600">
                    <span>Total Current Liabilities</span>
                    <span>Le {currentLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Long-term Liabilities */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">Long-term Liabilities</h3>
                <div className="space-y-2 ml-4">
                  {Object.entries(liabilitiesByCategory)
                    .filter(([cat]) => ['long_term_loan', 'lease_obligation'].includes(cat))
                    .map(([cat, val]) => (
                      <div key={cat} className="flex justify-between py-1">
                        <span className="text-gray-600 capitalize">{cat.replace(/_/g, ' ')}</span>
                        <span className="font-medium">Le {val.toLocaleString()}</span>
                      </div>
                    ))}
                  <div className="flex justify-between py-2 border-t font-semibold text-red-600">
                    <span>Total Long-term Liabilities</span>
                    <span>Le {longTermLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className="pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between py-2 bg-red-100 px-4 rounded-lg">
                  <span className="font-bold text-gray-900">TOTAL LIABILITIES</span>
                  <span className="font-bold text-red-600">Le {totalLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equity */}
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#0072C6] to-[#1EB053]" />
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-5 h-5 text-[#0072C6]" />
                OWNER'S EQUITY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Retained Earnings (All-time)</span>
                  <span className="font-medium">Le {retainedEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                  <span className="text-gray-600">Calculated Equity</span>
                  <span className="font-medium">Le {totalEquity.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between py-2 bg-blue-100 px-4 rounded-lg">
                    <span className="font-bold text-gray-900">TOTAL EQUITY</span>
                    <span className="font-bold text-[#0072C6]">Le {totalEquity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accounting Equation */}
      <Card className={`${balanceCheck ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4 text-lg font-semibold flex-wrap">
            <span>Assets: Le {totalAssets.toLocaleString()}</span>
            <span className="text-gray-400">=</span>
            <span>Liabilities: Le {totalLiabilities.toLocaleString()}</span>
            <span className="text-gray-400">+</span>
            <span>Equity: Le {totalEquity.toLocaleString()}</span>
            {balanceCheck ? (
              <Badge className="bg-green-600">✓ Balanced</Badge>
            ) : (
              <Badge className="bg-red-600">✗ Imbalanced (Δ Le {Math.abs(totalAssets - (totalLiabilities + totalEquity)).toLocaleString()})</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Ratios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">Current Ratio</p>
            <p className="text-2xl font-bold text-[#0072C6]">
              {currentLiabilities > 0 ? (currentAssets / currentLiabilities).toFixed(2) : '∞'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Current Assets / Current Liabilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">Debt-to-Equity</p>
            <p className="text-2xl font-bold text-[#0072C6]">
              {totalEquity > 0 ? (totalLiabilities / totalEquity).toFixed(2) : 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total Debt / Total Equity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">Asset Turnover</p>
            <p className="text-2xl font-bold text-[#0072C6]">
              {totalAssets > 0 ? ((revenues.reduce((s, r) => s + (r.amount || 0), 0)) / totalAssets).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Revenue / Total Assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">Equity Ratio</p>
            <p className="text-2xl font-bold text-[#0072C6]">
              {totalAssets > 0 ? ((totalEquity / totalAssets) * 100).toFixed(1) : '0'}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Equity / Total Assets</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}