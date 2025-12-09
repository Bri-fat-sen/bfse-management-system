import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Package, 
  DollarSign, 
  CreditCard,
  TrendingUp,
  Wallet,
  Landmark
} from "lucide-react";

export default function BalanceSheetGenerator({ 
  sales = [],
  expenses = [],
  revenues = [],
  bankDeposits = [],
  products = [],
  dateRange 
}) {
  const balanceSheet = useMemo(() => {
    // ASSETS
    // Current Assets
    const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const totalBankDeposits = bankDeposits
      .filter(d => d.status === 'confirmed')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    const cashOnHand = totalSalesRevenue - totalBankDeposits;
    
    // Accounts Receivable (credit sales not yet paid)
    const accountsReceivable = sales
      .filter(s => s.payment_status === 'pending' || s.payment_status === 'partial')
      .reduce((sum, s) => sum + (s.total_amount || 0), 0);
    
    // Inventory value (based on stock quantity * cost price)
    const inventoryValue = products.reduce((sum, p) => 
      sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0
    );
    
    const totalCurrentAssets = cashOnHand + totalBankDeposits + accountsReceivable + inventoryValue;
    
    // Fixed Assets (estimated - would need to be tracked separately in real system)
    const fixedAssets = 0; // Vehicles, equipment, property - to be added
    
    const totalAssets = totalCurrentAssets + fixedAssets;
    
    // LIABILITIES
    // Current Liabilities
    const accountsPayable = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const totalCurrentLiabilities = accountsPayable;
    
    // Long-term Liabilities (would need loan tracking)
    const longTermLiabilities = 0;
    
    const totalLiabilities = totalCurrentLiabilities + longTermLiabilities;
    
    // EQUITY
    const ownerContributions = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const retainedEarnings = totalSalesRevenue - expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalEquity = ownerContributions + retainedEarnings;
    
    // Balance check
    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;
    
    return {
      assets: {
        current: {
          cash: cashOnHand,
          bank: totalBankDeposits,
          receivables: accountsReceivable,
          inventory: inventoryValue,
          total: totalCurrentAssets
        },
        fixed: fixedAssets,
        total: totalAssets
      },
      liabilities: {
        current: {
          payables: accountsPayable,
          total: totalCurrentLiabilities
        },
        longTerm: longTermLiabilities,
        total: totalLiabilities
      },
      equity: {
        contributions: ownerContributions,
        retained: retainedEarnings,
        total: totalEquity
      },
      isBalanced
    };
  }, [sales, expenses, revenues, bankDeposits, products]);

  return (
    <Card className="overflow-hidden">
      <div className="h-2 flex">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0072C6]" />
              Balance Sheet
            </CardTitle>
            <CardDescription>{dateRange.label}</CardDescription>
          </div>
          <Badge className={balanceSheet.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
            {balanceSheet.isBalanced ? '✓ Balanced' : '⚠ Not Balanced'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ASSETS */}
        <div>
          <div className="flex items-center justify-between py-2 border-b-2 border-[#1EB053] bg-green-50 px-3 rounded-t-lg mb-3">
            <span className="font-bold text-green-800 flex items-center gap-2">
              <Package className="w-4 h-4" />
              ASSETS
            </span>
            <span className="font-bold text-green-800">Le {balanceSheet.assets.total.toLocaleString()}</span>
          </div>
          
          {/* Current Assets */}
          <div className="ml-4 space-y-2">
            <p className="font-semibold text-gray-700 mb-2">Current Assets</p>
            <div className="ml-4 space-y-2">
              <div className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-600" />
                  Cash on Hand
                </span>
                <span className="font-medium">Le {balanceSheet.assets.current.cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  Bank Accounts
                </span>
                <span className="font-medium">Le {balanceSheet.assets.current.bank.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Accounts Receivable
                </span>
                <span className="font-medium">Le {balanceSheet.assets.current.receivables.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2 bg-gray-50 rounded">
                <span className="text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-teal-600" />
                  Inventory
                </span>
                <span className="font-medium">Le {balanceSheet.assets.current.inventory.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2 bg-green-100 rounded-lg font-semibold">
                <span className="text-green-800">Total Current Assets</span>
                <span className="text-green-800">Le {balanceSheet.assets.current.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* LIABILITIES */}
        <div>
          <div className="flex items-center justify-between py-2 border-b-2 border-red-500 bg-red-50 px-3 rounded-t-lg mb-3">
            <span className="font-bold text-red-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              LIABILITIES
            </span>
            <span className="font-bold text-red-800">Le {balanceSheet.liabilities.total.toLocaleString()}</span>
          </div>
          
          <div className="ml-4 space-y-2">
            <p className="font-semibold text-gray-700 mb-2">Current Liabilities</p>
            <div className="ml-4 space-y-2">
              <div className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
                <span className="text-gray-600">Accounts Payable</span>
                <span className="font-medium">Le {balanceSheet.liabilities.current.payables.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-3 py-2 bg-red-100 rounded-lg font-semibold">
                <span className="text-red-800">Total Current Liabilities</span>
                <span className="text-red-800">Le {balanceSheet.liabilities.current.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* EQUITY */}
        <div>
          <div className="flex items-center justify-between py-2 border-b-2 border-[#0072C6] bg-blue-50 px-3 rounded-t-lg mb-3">
            <span className="font-bold text-blue-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              EQUITY
            </span>
            <span className="font-bold text-blue-800">Le {balanceSheet.equity.total.toLocaleString()}</span>
          </div>
          
          <div className="ml-4 space-y-2">
            <div className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
              <span className="text-gray-600">Owner Contributions</span>
              <span className="font-medium">Le {balanceSheet.equity.contributions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span className="text-gray-600">Retained Earnings</span>
              <span className="font-medium">Le {balanceSheet.equity.retained.toLocaleString()}</span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-blue-100 rounded-lg font-semibold">
              <span className="text-blue-800">Total Equity</span>
              <span className="text-blue-800">Le {balanceSheet.equity.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Balance */}
        <div className="pt-4 border-t-2">
          <div className="flex justify-between px-4 py-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">Le {balanceSheet.assets.total.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">=</p>
              <p className="text-lg font-bold text-gray-700">{balanceSheet.isBalanced ? '✓' : '≠'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Liabilities + Equity</p>
              <p className="text-2xl font-bold text-gray-900">
                Le {(balanceSheet.liabilities.total + balanceSheet.equity.total).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}