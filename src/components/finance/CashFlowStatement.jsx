import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  TrendingUp,
  Activity,
  Wallet
} from "lucide-react";

export default function CashFlowStatement({ 
  sales = [],
  expenses = [],
  revenues = [],
  bankDeposits = [],
  trips = [],
  dateRange 
}) {
  const cashFlow = useMemo(() => {
    // OPERATING ACTIVITIES
    const cashFromSales = sales
      .filter(s => s.payment_method !== 'credit')
      .reduce((sum, s) => sum + (s.total_amount || 0), 0);
    
    const cashFromTransport = trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    
    const cashPaidToSuppliers = expenses
      .filter(e => e.payment_method === 'cash' || e.payment_method === 'mobile_money')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const netCashFromOperating = cashFromSales + cashFromTransport - cashPaidToSuppliers;
    
    // FINANCING ACTIVITIES
    const ownerInvestments = revenues
      .filter(r => ['owner_contribution', 'ceo_contribution', 'investor_funding'].includes(r.source))
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const loans = revenues
      .filter(r => r.source === 'loan')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const netCashFromFinancing = ownerInvestments + loans;
    
    // NET CHANGE IN CASH
    const netCashChange = netCashFromOperating + netCashFromFinancing;
    
    // Cash at beginning (approximation)
    const cashBeginning = 0; // Would need historical tracking
    const cashEnding = cashBeginning + netCashChange;
    
    return {
      operating: {
        inflows: {
          sales: cashFromSales,
          transport: cashFromTransport,
          total: cashFromSales + cashFromTransport
        },
        outflows: {
          suppliers: cashPaidToSuppliers,
          total: cashPaidToSuppliers
        },
        net: netCashFromOperating
      },
      financing: {
        inflows: {
          investments: ownerInvestments,
          loans: loans,
          total: ownerInvestments + loans
        },
        net: netCashFromFinancing
      },
      summary: {
        beginning: cashBeginning,
        netChange: netCashChange,
        ending: cashEnding
      }
    };
  }, [sales, expenses, revenues, bankDeposits, trips]);

  return (
    <Card className="overflow-hidden">
      <div className="h-2 flex">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0072C6]" />
          Cash Flow Statement
        </CardTitle>
        <CardDescription>{dateRange.label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Operating Activities */}
        <div>
          <div className="flex items-center justify-between py-2 border-b-2 border-green-200 bg-green-50 px-3 rounded-t-lg">
            <span className="font-bold text-green-800">CASH FROM OPERATING ACTIVITIES</span>
          </div>
          <div className="mt-2 space-y-2">
            <p className="font-semibold text-gray-700 px-3 py-1">Cash Inflows:</p>
            <div className="ml-4 space-y-2">
              <div className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  Cash from Sales
                </span>
                <span className="font-medium text-green-600">Le {cashFlow.operating.inflows.sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  Cash from Transport
                </span>
                <span className="font-medium text-green-600">Le {cashFlow.operating.inflows.transport.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="font-semibold text-gray-700 px-3 py-1 mt-3">Cash Outflows:</p>
            <div className="ml-4 space-y-2">
              <div className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  Payments to Suppliers
                </span>
                <span className="font-medium text-red-600">Le {cashFlow.operating.outflows.suppliers.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between px-3 py-3 bg-green-100 rounded-lg font-bold mt-3">
              <span className="text-green-800">Net Cash from Operating</span>
              <span className={cashFlow.operating.net >= 0 ? 'text-green-800' : 'text-red-800'}>
                Le {cashFlow.operating.net.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Financing Activities */}
        <div>
          <div className="flex items-center justify-between py-2 border-b-2 border-[#0072C6] bg-blue-50 px-3 rounded-t-lg">
            <span className="font-bold text-blue-800">CASH FROM FINANCING ACTIVITIES</span>
          </div>
          <div className="mt-2 space-y-2">
            <p className="font-semibold text-gray-700 px-3 py-1">Cash Inflows:</p>
            <div className="ml-4 space-y-2">
              <div className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  Owner/CEO Investments
                </span>
                <span className="font-medium text-green-600">Le {cashFlow.financing.inflows.investments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  Loans Received
                </span>
                <span className="font-medium text-green-600">Le {cashFlow.financing.inflows.loans.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between px-3 py-3 bg-blue-100 rounded-lg font-bold mt-3">
              <span className="text-blue-800">Net Cash from Financing</span>
              <span className="text-blue-800">Le {cashFlow.financing.net.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t-2">
          <div className="space-y-3">
            <div className="flex justify-between px-4 py-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Cash at Beginning of Period</span>
              <span className="font-bold">Le {cashFlow.summary.beginning.toLocaleString()}</span>
            </div>
            <div className="flex justify-between px-4 py-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Net Change in Cash</span>
              <span className={`font-bold ${cashFlow.summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Le {cashFlow.summary.netChange.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between px-4 py-4 bg-gradient-to-r from-[#1EB053]/20 to-[#0072C6]/20 rounded-xl">
              <span className="font-bold text-gray-900 text-lg">Cash at End of Period</span>
              <span className="font-bold text-gray-900 text-lg">Le {cashFlow.summary.ending.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}