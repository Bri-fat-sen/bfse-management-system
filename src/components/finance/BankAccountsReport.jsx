import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Download, Landmark, Building2, CreditCard, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

export default function BankAccountsReport({ 
  bankDeposits = [], 
  organisation, 
  dateRange,
  open,
  onOpenChange 
}) {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [expandedAccounts, setExpandedAccounts] = useState({});

  // Group deposits by bank account (bank_name + account_number)
  const accountsData = useMemo(() => {
    const accounts = {};
    
    bankDeposits.forEach(deposit => {
      const accountKey = `${deposit.bank_name || 'Unknown Bank'}${deposit.account_number ? ` - ${deposit.account_number}` : ''}`;
      
      if (!accounts[accountKey]) {
        accounts[accountKey] = {
          bank_name: deposit.bank_name || 'Unknown Bank',
          account_number: deposit.account_number || '',
          deposits: [],
          totalConfirmed: 0,
          totalPending: 0,
          totalRejected: 0
        };
      }
      
      accounts[accountKey].deposits.push(deposit);
      
      if (deposit.status === 'confirmed') {
        accounts[accountKey].totalConfirmed += deposit.amount || 0;
      } else if (deposit.status === 'pending') {
        accounts[accountKey].totalPending += deposit.amount || 0;
      } else {
        accounts[accountKey].totalRejected += deposit.amount || 0;
      }
    });
    
    return accounts;
  }, [bankDeposits]);

  const accountKeys = Object.keys(accountsData);
  
  const totals = useMemo(() => {
    return {
      confirmed: Object.values(accountsData).reduce((sum, acc) => sum + acc.totalConfirmed, 0),
      pending: Object.values(accountsData).reduce((sum, acc) => sum + acc.totalPending, 0),
      rejected: Object.values(accountsData).reduce((sum, acc) => sum + acc.totalRejected, 0),
      depositCount: bankDeposits.length,
      accountCount: accountKeys.length
    };
  }, [accountsData, bankDeposits, accountKeys]);

  const toggleAccount = (key) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredAccounts = selectedAccount === "all" 
    ? accountsData 
    : { [selectedAccount]: accountsData[selectedAccount] };

  const generateReportHTML = () => {
    const accountsToShow = selectedAccount === "all" ? accountsData : { [selectedAccount]: accountsData[selectedAccount] };
    
    const sections = Object.entries(accountsToShow).map(([accountKey, account]) => ({
      title: `🏦 ${accountKey}`,
      icon: '🏦',
      table: {
        columns: ['Date', 'Reference', 'Source', 'Type', 'Status', 'Amount (Le)'],
        rows: [
          ...account.deposits.map(d => [
            d.date ? format(new Date(d.date), 'MMM d, yyyy') : '-',
            d.reference_number || d.deposit_number || '-',
            (d.source || '').replace(/_/g, ' '),
            d.deposit_type || 'cash',
            d.status || 'pending',
            (d.amount || 0).toLocaleString()
          ]),
          ['', '', '', '', 'Confirmed Total:', account.totalConfirmed.toLocaleString()],
          ['', '', '', '', 'Pending Total:', account.totalPending.toLocaleString()]
        ]
      }
    }));

    return generateUnifiedPDF({
      documentType: 'report',
      title: 'Bank Deposits Report',
      docNumber: `BDR-${Date.now().toString(36).toUpperCase()}`,
      docDate: format(new Date(), 'MMM d, yyyy h:mm a'),
      organisation,
      infoBar: [
        { label: 'Period', value: dateRange || 'All Time' },
        { label: 'Accounts', value: totals.accountCount.toString() },
        { label: 'Total Deposits', value: totals.depositCount.toString() }
      ],
      summaryCards: [
        { label: 'Confirmed in Bank', value: `Le ${totals.confirmed.toLocaleString()}`, highlight: 'green' },
        { label: 'Pending Confirmation', value: `Le ${totals.pending.toLocaleString()}`, highlight: 'gold' },
        { label: 'Rejected', value: `Le ${totals.rejected.toLocaleString()}`, highlight: 'red' },
        { label: 'Total Accounts', value: totals.accountCount.toString(), highlight: 'blue' }
      ],
      sections,
      notes: selectedAccount !== 'all' ? `This report shows deposits for ${selectedAccount} only.` : null,
      showFooter: true
    });
  };

  const handlePrint = () => {
    const html = generateReportHTML();
    printUnifiedPDF(html);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#0072C6]" />
                Bank Accounts Report
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">View deposits by account and print reports</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Filter */}
        <div className="flex items-center gap-3 py-3 border-b">
          <span className="text-sm text-gray-500">Filter by account:</span>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts ({accountKeys.length})</SelectItem>
              {accountKeys.map(key => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <p className="text-xs text-green-700">Confirmed</p>
              <p className="text-lg font-bold text-green-700">Le {totals.confirmed.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3">
              <p className="text-xs text-amber-700">Pending</p>
              <p className="text-lg font-bold text-amber-700">Le {totals.pending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <p className="text-xs text-red-700">Rejected</p>
              <p className="text-lg font-bold text-red-700">Le {totals.rejected.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-xs text-blue-700">Accounts</p>
              <p className="text-lg font-bold text-blue-700">{totals.accountCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {Object.entries(filteredAccounts).map(([accountKey, account]) => (
              <Card key={accountKey} className="overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleAccount(accountKey)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{account.bank_name}</p>
                      {account.account_number && (
                        <p className="text-sm text-gray-500">Account: {account.account_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-green-600">Le {account.totalConfirmed.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{account.deposits.length} deposits</p>
                    </div>
                    {expandedAccounts[accountKey] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedAccounts[accountKey] && (
                  <div className="border-t bg-gray-50">
                    <div className="p-3 grid grid-cols-3 gap-2 text-center border-b bg-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Confirmed</p>
                        <p className="font-semibold text-green-600">Le {account.totalConfirmed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="font-semibold text-amber-600">Le {account.totalPending.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rejected</p>
                        <p className="font-semibold text-red-600">Le {account.totalRejected.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="divide-y">
                      {account.deposits.map((deposit, idx) => (
                        <div key={deposit.id || idx} className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              deposit.status === 'confirmed' ? 'bg-green-100' :
                              deposit.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                            }`}>
                              <CreditCard className={`w-4 h-4 ${
                                deposit.status === 'confirmed' ? 'text-green-600' :
                                deposit.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {deposit.reference_number || deposit.deposit_number || 'Deposit'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{deposit.date ? format(new Date(deposit.date), 'MMM d, yyyy') : '-'}</span>
                                <span>•</span>
                                <span className="capitalize">{(deposit.source || '').replace(/_/g, ' ')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Le {(deposit.amount || 0).toLocaleString()}</p>
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
                  </div>
                )}
              </Card>
            ))}

            {accountKeys.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Landmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No bank deposits recorded yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}