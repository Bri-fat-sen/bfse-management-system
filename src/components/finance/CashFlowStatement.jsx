import React, { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  TrendingUp,
  Activity,
  Wallet,
  Download
} from "lucide-react";
import { printUnifiedPDF, getUnifiedPDFStyles, getUnifiedHeader, getUnifiedFooter } from "@/components/exports/UnifiedPDFStyles";
import { useToast } from "@/components/ui/Toast";

export default function CashFlowStatement({ 
  sales = [],
  expenses = [],
  revenues = [],
  bankDeposits = [],
  trips = [],
  dateRange,
  organisation
}) {
  const toast = useToast();
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

  const exportToPDF = () => {
    const styles = getUnifiedPDFStyles();
    const header = getUnifiedHeader(organisation, 'Cash Flow Statement');
    const footer = getUnifiedFooter(organisation);

    const content = `
      <div class="statement-section">
        <h2 class="section-title">For Period ${dateRange.label}</h2>
        <p class="text-muted text-center mb-4">Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      <div class="statement-section">
        <div class="summary-grid">
          <div class="summary-card" style="border-left: 4px solid var(--primary);">
            <div class="summary-label">Operating Cash</div>
            <div class="summary-value">${cashFlow.operating.net >= 0 ? '+' : ''}Le ${cashFlow.operating.net.toLocaleString()}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid #0072C6;">
            <div class="summary-label">Financing Cash</div>
            <div class="summary-value">+Le ${cashFlow.financing.net.toLocaleString()}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid ${cashFlow.summary.netChange >= 0 ? '#10b981' : '#ef4444'};">
            <div class="summary-label">Net Change</div>
            <div class="summary-value">${cashFlow.summary.netChange >= 0 ? '+' : ''}Le ${cashFlow.summary.netChange.toLocaleString()}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid #D4AF37;">
            <div class="summary-label">Ending Cash</div>
            <div class="summary-value">Le ${cashFlow.summary.ending.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div class="statement-section">
        <table class="data-table">
          <thead>
            <tr>
              <th colspan="2" class="bg-success text-white">CASH FROM OPERATING ACTIVITIES</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-gray-50">
              <td class="font-bold" colspan="2">Cash Inflows</td>
            </tr>
            <tr>
              <td class="pl-6">Cash from Sales</td>
              <td class="text-right font-bold text-success">+Le ${cashFlow.operating.inflows.sales.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="pl-6">Cash from Transport</td>
              <td class="text-right font-bold text-success">+Le ${cashFlow.operating.inflows.transport.toLocaleString()}</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="font-bold" colspan="2">Cash Outflows</td>
            </tr>
            <tr>
              <td class="pl-6">Payments to Suppliers</td>
              <td class="text-right font-bold text-danger">-Le ${cashFlow.operating.outflows.suppliers.toLocaleString()}</td>
            </tr>
            <tr class="bg-success-light">
              <td class="font-bold">Net Cash from Operating</td>
              <td class="text-right font-bold ${cashFlow.operating.net >= 0 ? 'text-success' : 'text-danger'}">${cashFlow.operating.net >= 0 ? '+' : ''}Le ${cashFlow.operating.net.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="statement-section">
        <table class="data-table">
          <thead>
            <tr>
              <th colspan="2" class="bg-primary text-white">CASH FROM FINANCING ACTIVITIES</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-gray-50">
              <td class="font-bold" colspan="2">Cash Inflows</td>
            </tr>
            <tr>
              <td class="pl-6">Owner/CEO Investments</td>
              <td class="text-right font-bold text-success">+Le ${cashFlow.financing.inflows.investments.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="pl-6">Loans Received</td>
              <td class="text-right font-bold text-success">+Le ${cashFlow.financing.inflows.loans.toLocaleString()}</td>
            </tr>
            <tr class="bg-blue-light">
              <td class="font-bold">Net Cash from Financing</td>
              <td class="text-right font-bold" style="color: #0072C6;">+Le ${cashFlow.financing.net.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="statement-section">
        <table class="data-table">
          <thead>
            <tr>
              <th colspan="2" style="background: linear-gradient(135deg, #1EB053, #0072C6); color: white;">CASH SUMMARY</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cash at Beginning of Period</td>
              <td class="text-right font-bold">Le ${cashFlow.summary.beginning.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Net Change in Cash</td>
              <td class="text-right font-bold ${cashFlow.summary.netChange >= 0 ? 'text-success' : 'text-danger'}">${cashFlow.summary.netChange >= 0 ? '+' : ''}Le ${cashFlow.summary.netChange.toLocaleString()}</td>
            </tr>
            <tr class="bg-success-light">
              <td class="font-bold">Cash at End of Period</td>
              <td class="text-right font-bold text-success">Le ${cashFlow.summary.ending.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cash Flow Statement - ${organisation?.name || 'Organisation'}</title>
  <style>
    ${styles}
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
    .summary-card { padding: 16px; border-radius: 8px; background: var(--gray-50); border-left: 4px solid var(--primary); }
    .summary-label { font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
    .summary-value { font-size: 20px; font-weight: bold; color: var(--gray-900); }
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

    printUnifiedPDF(html, `cash-flow-statement-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success("PDF Generated", "Downloading cash flow statement");
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
              <Activity className="w-5 h-5 text-[#0072C6]" />
              Cash Flow Statement
            </CardTitle>
            <CardDescription>{dateRange.label}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
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