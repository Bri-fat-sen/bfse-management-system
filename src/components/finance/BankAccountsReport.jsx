import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Landmark, Printer, Building2 } from "lucide-react";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

export default function BankAccountsReport({ open, onOpenChange, bankDeposits, organisation, dateRange }) {
  const [selectedAccount, setSelectedAccount] = useState("all");

  // Group deposits by bank account
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

    Object.values(accounts).forEach(account => {
      account.deposits.sort((a, b) => new Date(b.date || b.created_date) - new Date(a.date || a.created_date));
    });

    return accounts;
  }, [bankDeposits]);

  const accountsList = Object.entries(accountsData);
  const totalAllAccounts = accountsList.reduce((sum, [_, acc]) => sum + acc.totalConfirmed, 0);
  const totalPendingAll = accountsList.reduce((sum, [_, acc]) => sum + acc.totalPending, 0);

  const handlePrintReport = (accountKey = null) => {
    const depositsToReport = accountKey 
      ? accountsData[accountKey]?.deposits || []
      : bankDeposits;
    
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0072C6]" />
            Bank Deposits by Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Selection and Print */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accountsList.map(([key]) => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => handlePrintReport(selectedAccount === "all" ? null : selectedAccount)}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print {selectedAccount === "all" ? "All Accounts" : "Selected Account"}
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Total Confirmed</p>
              <p className="text-lg font-bold text-green-700">Le {totalAllAccounts.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-600 font-medium">Total Pending</p>
              <p className="text-lg font-bold text-amber-700">Le {totalPendingAll.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Bank Accounts</p>
              <p className="text-lg font-bold text-blue-700">{accountsList.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Total Deposits</p>
              <p className="text-lg font-bold text-purple-700">{bankDeposits.length}</p>
            </div>
          </div>

          {/* Accounts List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {(selectedAccount === "all" ? accountsList : accountsList.filter(([key]) => key === selectedAccount)).map(([accountKey, account]) => (
                <div key={accountKey} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-[#0072C6]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{account.bank_name}</h3>
                        {account.account_number && (
                          <p className="text-xs text-gray-500">Acc: {account.account_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1EB053]">Le {account.totalConfirmed.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{account.depositCount} deposits</p>
                    </div>
                  </div>
                  
                  <div className="divide-y max-h-[200px] overflow-auto">
                    {account.deposits.slice(0, 5).map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-3 text-sm hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            deposit.status === 'confirmed' ? 'bg-green-500' :
                            deposit.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          <span>{deposit.date ? format(new Date(deposit.date), 'MMM d, yyyy') : '-'}</span>
                          <Badge variant="outline" className="text-xs">{deposit.source?.replace(/_/g, ' ')}</Badge>
                        </div>
                        <span className={`font-medium ${
                          deposit.status === 'confirmed' ? 'text-green-600' :
                          deposit.status === 'rejected' ? 'text-red-500' : 'text-amber-600'
                        }`}>
                          Le {deposit.amount?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {account.deposits.length > 5 && (
                      <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                        +{account.deposits.length - 5} more deposits
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}