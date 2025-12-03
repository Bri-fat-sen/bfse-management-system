import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Landmark, ChevronDown, ChevronRight, Printer, Download, Eye, Building2, Calendar } from "lucide-react";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

export default function BankAccountsSummary({ bankDeposits, organisation, dateRange }) {
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportAccount, setReportAccount] = useState(null);

  // Group deposits by bank account (bank_name + account_number)
  const accountsData = useMemo(() => {
    const accounts = {};
    
    bankDeposits.forEach(deposit => {
      const accountKey = `${deposit.bank_name}${deposit.account_number ? ` - ${deposit.account_number}` : ''}`;
      
      if (!accounts[accountKey]) {
        accounts[accountKey] = {
          bank_name: deposit.bank_name,
          account_number: deposit.account_number || '',
          deposits: [],
          totalConfirmed: 0,
          totalPending: 0,
          totalRejected: 0,
          depositCount: 0
        };
      }
      
      accounts[accountKey].deposits.push(deposit);
      accounts[accountKey].depositCount++;
      
      if (deposit.status === 'confirmed') {
        accounts[accountKey].totalConfirmed += deposit.amount || 0;
      } else if (deposit.status === 'pending') {
        accounts[accountKey].totalPending += deposit.amount || 0;
      } else if (deposit.status === 'rejected') {
        accounts[accountKey].totalRejected += deposit.amount || 0;
      }
    });

    // Sort deposits within each account by date
    Object.values(accounts).forEach(account => {
      account.deposits.sort((a, b) => new Date(b.date || b.created_date) - new Date(a.date || a.created_date));
    });

    return accounts;
  }, [bankDeposits]);

  const accountsList = Object.entries(accountsData);
  const totalAllAccounts = accountsList.reduce((sum, [_, acc]) => sum + acc.totalConfirmed, 0);
  const totalPendingAll = accountsList.reduce((sum, [_, acc]) => sum + acc.totalPending, 0);

  const toggleAccount = (accountKey) => {
    setExpandedAccount(expandedAccount === accountKey ? null : accountKey);
  };

  const handlePrintReport = (accountKey = null) => {
    const depositsToReport = accountKey 
      ? accountsData[accountKey]?.deposits || []
      : bankDeposits;
    
    const accountInfo = accountKey ? accountsData[accountKey] : null;
    const title = accountKey ? `Bank Deposits - ${accountKey}` : 'All Bank Deposits Report';
    
    const confirmedDeposits = depositsToReport.filter(d => d.status === 'confirmed');
    const pendingDeposits = depositsToReport.filter(d => d.status === 'pending');
    const totalConfirmed = confirmedDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalPending = pendingDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: 'Bank Deposits Report',
      docNumber: `BDR-${Date.now().toString(36).toUpperCase()}`,
      docDate: format(new Date(), 'MMMM d, yyyy'),
      organisation,
      infoBar: [
        { label: 'Period', value: dateRange || 'All Time' },
        { label: 'Account', value: accountKey || 'All Accounts' },
        { label: 'Generated', value: format(new Date(), 'MMM d, yyyy h:mm a') }
      ],
      summaryCards: [
        { label: 'Total Confirmed', value: `Le ${totalConfirmed.toLocaleString()}`, highlight: 'green' },
        { label: 'Total Pending', value: `Le ${totalPending.toLocaleString()}`, highlight: 'gold' },
        { label: 'Total Deposits', value: depositsToReport.length.toString(), highlight: 'blue' },
        ...(accountKey ? [] : [{ label: 'Bank Accounts', value: accountsList.length.toString(), highlight: 'blue' }])
      ],
      sections: [
        ...(accountKey ? [] : [{
          title: '🏦 Accounts Summary',
          table: {
            columns: ['Bank / Account', 'Deposits', 'Confirmed', 'Pending'],
            rows: accountsList.map(([key, acc]) => [
              key,
              acc.depositCount,
              `Le ${acc.totalConfirmed.toLocaleString()}`,
              `Le ${acc.totalPending.toLocaleString()}`
            ])
          }
        }]),
        {
          title: '📋 Deposit Details',
          table: {
            columns: ['Date', 'Bank', 'Type', 'Source', 'Reference', 'Status', 'Amount'],
            rows: depositsToReport.map(d => [
              d.date ? format(new Date(d.date), 'MMM d, yyyy') : '-',
              d.bank_name,
              d.deposit_type?.replace(/_/g, ' ') || '-',
              d.source?.replace(/_/g, ' ') || '-',
              d.reference_number || '-',
              d.status,
              `Le ${(d.amount || 0).toLocaleString()}`
            ])
          }
        },
        {
          title: '',
          content: `
            <div class="totals-box" style="margin-top: 20px;">
              <div class="totals-row">
                <span>Confirmed Deposits</span>
                <span>Le ${totalConfirmed.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>Pending Deposits</span>
                <span>Le ${totalPending.toLocaleString()}</span>
              </div>
              <div class="totals-row grand">
                <span>Total All Deposits</span>
                <span>Le ${(totalConfirmed + totalPending).toLocaleString()}</span>
              </div>
            </div>
          `
        }
      ],
      notes: 'This report shows all bank deposits recorded in the system. Pending deposits are awaiting confirmation.',
      showFooter: true
    });

    printUnifiedPDF(html, `bank-deposits-report-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const filteredAccounts = selectedAccount === "all" 
    ? accountsList 
    : accountsList.filter(([key]) => key === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Accounts Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountsList.map(([accountKey, account]) => (
          <Card 
            key={accountKey} 
            className={`cursor-pointer transition-all hover:shadow-lg ${expandedAccount === accountKey ? 'ring-2 ring-[#0072C6]' : ''}`}
            onClick={() => toggleAccount(accountKey)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-[#0072C6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.bank_name}</h3>
                    {account.account_number && (
                      <p className="text-xs text-gray-500">Acc: {account.account_number}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{account.depositCount} deposits</p>
                  </div>
                </div>
                {expandedAccount === accountKey ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Confirmed</span>
                  <span className="font-bold text-[#1EB053]">Le {account.totalConfirmed.toLocaleString()}</span>
                </div>
                {account.totalPending > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Pending</span>
                    <span className="font-medium text-amber-600">Le {account.totalPending.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Progress bar showing confirmed vs pending */}
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                  style={{ width: `${((account.totalConfirmed / (account.totalConfirmed + account.totalPending)) * 100) || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expanded Account Details */}
      {expandedAccount && accountsData[expandedAccount] && (
        <Card className="border-2 border-[#0072C6]/20">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0072C6]" />
                {accountsData[expandedAccount].bank_name}
                {accountsData[expandedAccount].account_number && (
                  <Badge variant="outline" className="ml-2">{accountsData[expandedAccount].account_number}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Total: Le {accountsData[expandedAccount].totalConfirmed.toLocaleString()} confirmed
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePrintReport(expandedAccount);
              }}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {accountsData[expandedAccount].deposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        deposit.status === 'confirmed' ? 'bg-green-500' :
                        deposit.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">
                          {deposit.date ? format(new Date(deposit.date), 'MMM d, yyyy') : '-'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{deposit.deposit_type?.replace(/_/g, ' ')}</span>
                          {deposit.reference_number && (
                            <>
                              <span>•</span>
                              <span>Ref: {deposit.reference_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        deposit.status === 'confirmed' ? 'text-[#1EB053]' :
                        deposit.status === 'rejected' ? 'text-red-500' : 'text-amber-600'
                      }`}>
                        Le {deposit.amount?.toLocaleString()}
                      </p>
                      <Badge variant="outline" className={`text-xs ${
                        deposit.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                        deposit.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {deposit.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Print All Reports Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#0072C6]" />
              Generate Reports
            </CardTitle>
            <CardDescription>Print deposit reports by account or all accounts</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handlePrintReport(null)} 
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print All Accounts Report
            </Button>
            
            <div className="flex items-center gap-2">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accountsList.map(([key]) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAccount !== "all" && (
                <Button 
                  variant="outline"
                  onClick={() => handlePrintReport(selectedAccount)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Selected
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Total Confirmed</p>
              <p className="text-xl font-bold text-green-700">Le {totalAllAccounts.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-600 font-medium">Total Pending</p>
              <p className="text-xl font-bold text-amber-700">Le {totalPendingAll.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Bank Accounts</p>
              <p className="text-xl font-bold text-blue-700">{accountsList.length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Total Deposits</p>
              <p className="text-xl font-bold text-purple-700">{bankDeposits.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}