import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw, Building2, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function CashFlowStatement({ 
  sales = [],
  expenses = [],
  trips = [],
  revenues = [],
  assets = [],
  liabilities = [],
  payrolls = [],
  dateRange,
  organisation 
}) {
  const cashFlow = useMemo(() => {
    // Operating Activities
    const salesRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const transportRevenue = trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const operatingExpenses = expenses.filter(e => !['equipment', 'vehicles', 'buildings'].includes(e.category))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const payrollExpenses = payrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0);
    const fuelCosts = trips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
    
    const cashFromOperations = salesRevenue + transportRevenue - operatingExpenses - payrollExpenses - fuelCosts;

    // Investing Activities
    const assetPurchases = assets.filter(a => {
      const d = new Date(a.purchase_date || a.created_date);
      return dateRange && d >= dateRange.start && d <= dateRange.end;
    }).reduce((sum, a) => sum + (a.purchase_price || 0), 0);
    
    const assetSales = assets.filter(a => a.status === 'disposed').reduce((sum, a) => sum + (a.value || 0), 0);
    
    const capitalExpenses = expenses.filter(e => ['equipment', 'vehicles', 'buildings'].includes(e.category))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const cashFromInvesting = assetSales - assetPurchases - capitalExpenses;

    // Financing Activities
    const ownerContributions = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const loanProceeds = liabilities.filter(l => l.category.includes('loan')).reduce((sum, l) => sum + (l.original_amount || 0), 0);
    const loanRepayments = liabilities.filter(l => l.status === 'paid' && l.category.includes('loan'))
      .reduce((sum, l) => sum + ((l.original_amount || 0) - (l.amount || 0)), 0);
    
    const cashFromFinancing = ownerContributions + loanProceeds - loanRepayments;

    // Net Change in Cash
    const netCashChange = cashFromOperations + cashFromInvesting + cashFromFinancing;

    return {
      operating: {
        salesRevenue,
        transportRevenue,
        operatingExpenses,
        payrollExpenses,
        fuelCosts,
        total: cashFromOperations
      },
      investing: {
        assetPurchases,
        assetSales,
        capitalExpenses,
        total: cashFromInvesting
      },
      financing: {
        ownerContributions,
        loanProceeds,
        loanRepayments,
        total: cashFromFinancing
      },
      netCashChange
    };
  }, [sales, expenses, trips, revenues, assets, liabilities, payrolls, dateRange]);

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
            <p className="text-lg font-semibold text-gray-700 mt-1">CASH FLOW STATEMENT</p>
            <p className="text-sm text-gray-500">For the period: {dateRange?.label || 'Current Period'}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-l-4 ${cashFlow.operating.total >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-8 h-8 ${cashFlow.operating.total >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Operating</p>
                <p className={`text-xl font-bold ${cashFlow.operating.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Le {cashFlow.operating.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${cashFlow.investing.total >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className={`w-8 h-8 ${cashFlow.investing.total >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Investing</p>
                <p className={`text-xl font-bold ${cashFlow.investing.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Le {cashFlow.investing.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${cashFlow.financing.total >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className={`w-8 h-8 ${cashFlow.financing.total >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Financing</p>
                <p className={`text-xl font-bold ${cashFlow.financing.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Le {cashFlow.financing.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statement */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Operating Activities */}
            <div>
              <div className="flex items-center gap-2 py-2 border-b-2 border-green-200 bg-green-50 px-3 rounded-t-lg mb-3">
                <RefreshCw className="w-5 h-5 text-green-700" />
                <span className="font-bold text-green-800">CASH FLOW FROM OPERATING ACTIVITIES</span>
              </div>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Sales Revenue</span>
                  <span className="font-medium text-green-600">+Le {cashFlow.operating.salesRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Transport Revenue</span>
                  <span className="font-medium text-green-600">+Le {cashFlow.operating.transportRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Operating Expenses</span>
                  <span className="font-medium text-red-600">-Le {cashFlow.operating.operatingExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Payroll Expenses</span>
                  <span className="font-medium text-red-600">-Le {cashFlow.operating.payrollExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Fuel Costs</span>
                  <span className="font-medium text-red-600">-Le {cashFlow.operating.fuelCosts.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between py-3 px-3 rounded-lg font-bold mt-2 ${
                  cashFlow.operating.total >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <span>Net Cash from Operations</span>
                  <span>Le {cashFlow.operating.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <div className="flex items-center gap-2 py-2 border-b-2 border-blue-200 bg-blue-50 px-3 rounded-t-lg mb-3">
                <Building2 className="w-5 h-5 text-blue-700" />
                <span className="font-bold text-blue-800">CASH FLOW FROM INVESTING ACTIVITIES</span>
              </div>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Asset Purchases</span>
                  <span className="font-medium text-red-600">-Le {cashFlow.investing.assetPurchases.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Capital Expenditures</span>
                  <span className="font-medium text-red-600">-Le {cashFlow.investing.capitalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Asset Sales</span>
                  <span className="font-medium text-green-600">+Le {cashFlow.investing.assetSales.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between py-3 px-3 rounded-lg font-bold mt-2 ${
                  cashFlow.investing.total >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <span>Net Cash from Investing</span>
                  <span>Le {cashFlow.investing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <div className="flex items-center gap-2 py-2 border-b-2 border-purple-200 bg-purple-50 px-3 rounded-t-lg mb-3">
                <DollarSign className="w-5 h-5 text-purple-700" />
                <span className="font-bold text-purple-800">CASH FLOW FROM FINANCING ACTIVITIES</span>
              </div>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Owner Contributions</span>
                  <span className="font-medium text-green-600">+Le {cashFlow.financing.ownerContributions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Loan Proceeds</span>
                  <span className="font-medium text-green-600">+Le {cashFlow.financing.loanProceeds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Loan Repayments</span>
                  <span className="font-medium text-red-600">-Le {cashFlow.financing.loanRepayments.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between py-3 px-3 rounded-lg font-bold mt-2 ${
                  cashFlow.financing.total >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <span>Net Cash from Financing</span>
                  <span>Le {cashFlow.financing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Change in Cash */}
            <div className="pt-6 border-t-2 border-gray-300">
              <div className={`flex justify-between py-4 px-4 rounded-xl font-bold text-lg ${
                cashFlow.netCashChange >= 0 
                  ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800' 
                  : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800'
              }`}>
                <span className="flex items-center gap-2">
                  {cashFlow.netCashChange >= 0 ? (
                    <TrendingUp className="w-6 h-6" />
                  ) : (
                    <TrendingDown className="w-6 h-6" />
                  )}
                  NET CHANGE IN CASH
                </span>
                <span>Le {cashFlow.netCashChange.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cashFlow.operating.total >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">Operating Cash Health</h4>
            <Badge className={cashFlow.operating.total >= 0 ? 'bg-green-600' : 'bg-red-600'}>
              {cashFlow.operating.total >= 0 ? 'Positive' : 'Negative'}
            </Badge>
            <p className="text-xs text-gray-600 mt-2">
              {cashFlow.operating.total >= 0 
                ? 'Business operations are generating cash'
                : 'Operations consuming more cash than generating'
              }
            </p>
          </CardContent>
        </Card>

        <Card className={cashFlow.investing.total <= 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">Investment Activity</h4>
            <Badge className={cashFlow.investing.total <= 0 ? 'bg-blue-600' : 'bg-amber-600'}>
              {cashFlow.investing.total <= 0 ? 'Investing' : 'Divesting'}
            </Badge>
            <p className="text-xs text-gray-600 mt-2">
              {cashFlow.investing.total <= 0 
                ? 'Investing in business growth'
                : 'Selling assets or reducing investments'
              }
            </p>
          </CardContent>
        </Card>

        <Card className={cashFlow.financing.total >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-gray-100 border-gray-300'}>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">Financing Position</h4>
            <Badge className={cashFlow.financing.total >= 0 ? 'bg-purple-600' : 'bg-gray-600'}>
              {cashFlow.financing.total >= 0 ? 'Raising Capital' : 'Paying Down Debt'}
            </Badge>
            <p className="text-xs text-gray-600 mt-2">
              {cashFlow.financing.total >= 0 
                ? 'Receiving capital from owners/lenders'
                : 'Repaying loans and obligations'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}