import React, { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Package, 
  DollarSign, 
  CreditCard,
  TrendingUp,
  Wallet,
  Landmark,
  Download
} from "lucide-react";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";

export default function BalanceSheetGenerator({ 
  sales = [],
  expenses = [],
  revenues = [],
  bankDeposits = [],
  products = [],
  dateRange,
  organisation
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

  const exportToPDF = () => {
    const styles = getUnifiedPDFStyles();
    const header = getUnifiedHeader(organisation, 'Balance Sheet');
    const footer = getUnifiedFooter(organisation);

    const content = `
      <div class="statement-section">
        <h2 class="section-title">As of ${dateRange.label}</h2>
        <p class="text-muted text-center mb-4">Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      <div class="statement-section">
        <div class="summary-grid">
          <div class="summary-card" style="border-left: 4px solid var(--primary);">
            <div class="summary-label">Total Assets</div>
            <div class="summary-value">Le ${balanceSheet.assets.total.toLocaleString()}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid #ef4444;">
            <div class="summary-label">Total Liabilities</div>
            <div class="summary-value">Le ${balanceSheet.liabilities.total.toLocaleString()}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid #0072C6;">
            <div class="summary-label">Total Equity</div>
            <div class="summary-value">Le ${balanceSheet.equity.total.toLocaleString()}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid ${balanceSheet.isBalanced ? '#10b981' : '#ef4444'};">
            <div class="summary-label">Balance Status</div>
            <div class="summary-value">${balanceSheet.isBalanced ? '✓ Balanced' : '⚠ Unbalanced'}</div>
          </div>
        </div>
      </div>

      <div class="statement-section">
        <table class="data-table">
          <thead>
            <tr>
              <th colspan="2" class="bg-success text-white">ASSETS</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-gray-50">
              <td class="font-bold" colspan="2">Current Assets</td>
            </tr>
            <tr>
              <td class="pl-6">Cash on Hand</td>
              <td class="text-right font-bold">Le ${balanceSheet.assets.current.cash.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="pl-6">Bank Accounts</td>
              <td class="text-right font-bold">Le ${balanceSheet.assets.current.bank.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="pl-6">Accounts Receivable</td>
              <td class="text-right font-bold">Le ${balanceSheet.assets.current.receivables.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="pl-6">Inventory</td>
              <td class="text-right font-bold">Le ${balanceSheet.assets.current.inventory.toLocaleString()}</td>
            </tr>
            <tr class="bg-success-light">
              <td class="font-bold">TOTAL ASSETS</td>
              <td class="text-right font-bold text-success">Le ${balanceSheet.assets.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="statement-section">
        <table class="data-table">
          <thead>
            <tr>
              <th colspan="2" class="bg-danger text-white">LIABILITIES</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-gray-50">
              <td class="font-bold" colspan="2">Current Liabilities</td>
            </tr>
            <tr>
              <td class="pl-6">Accounts Payable</td>
              <td class="text-right font-bold">Le ${balanceSheet.liabilities.current.payables.toLocaleString()}</td>
            </tr>
            <tr class="bg-danger-light">
              <td class="font-bold">TOTAL LIABILITIES</td>
              <td class="text-right font-bold text-danger">Le ${balanceSheet.liabilities.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="statement-section">
        <table class="data-table">
          <thead>
            <tr>
              <th colspan="2" class="bg-primary text-white">EQUITY</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Owner Contributions</td>
              <td class="text-right font-bold">Le ${balanceSheet.equity.contributions.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Retained Earnings</td>
              <td class="text-right font-bold">Le ${balanceSheet.equity.retained.toLocaleString()}</td>
            </tr>
            <tr class="bg-blue-light">
              <td class="font-bold">TOTAL EQUITY</td>
              <td class="text-right font-bold" style="color: #0072C6;">Le ${balanceSheet.equity.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="statement-section">
        <div class="summary-box ${balanceSheet.isBalanced ? 'profit' : 'loss'}">
          <div class="balance-equation">
            <div class="balance-side">
              <div class="balance-label">Total Assets</div>
              <div class="balance-value">Le ${balanceSheet.assets.total.toLocaleString()}</div>
            </div>
            <div class="balance-equals">${balanceSheet.isBalanced ? '=' : '≠'}</div>
            <div class="balance-side">
              <div class="balance-label">Liabilities + Equity</div>
              <div class="balance-value">Le ${(balanceSheet.liabilities.total + balanceSheet.equity.total).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Balance Sheet - ${organisation?.name || 'Organisation'}</title>
  <style>
    ${styles}
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
    .summary-card { padding: 16px; border-radius: 8px; background: var(--gray-50); border-left: 4px solid var(--primary); }
    .summary-label { font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
    .summary-value { font-size: 20px; font-weight: bold; color: var(--gray-900); }
    .summary-box { padding: 32px; background: var(--gray-50); border-radius: 12px; margin: 24px 0; }
    .summary-box.profit { background: linear-gradient(135deg, rgba(30, 176, 83, 0.1), rgba(0, 114, 198, 0.1)); border: 2px solid var(--primary); }
    .summary-box.loss { background: rgba(249, 115, 22, 0.1); border: 2px solid #f97316; }
    .balance-equation { display: flex; align-items: center; justify-content: space-around; }
    .balance-side { text-align: center; }
    .balance-label { font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
    .balance-value { font-size: 24px; font-weight: bold; }
    .balance-equals { font-size: 32px; font-weight: bold; color: var(--primary); }
    .pl-6 { padding-left: 24px; }
    @media print {
      .summary-grid { grid-template-columns: repeat(2, 1fr); page-break-inside: avoid; }
      .statement-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="document">
    ${header}
    <div class="content">
      ${content}
    </div>
    ${footer}
  </div>
</body>
</html>`;

    printUnifiedPDF(html, `balance-sheet-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

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
          <div className="flex items-center gap-2">
            <Badge className={balanceSheet.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {balanceSheet.isBalanced ? '✓ Balanced' : '⚠ Not Balanced'}
            </Badge>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
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