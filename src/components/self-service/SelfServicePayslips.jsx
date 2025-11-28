import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format, subMonths, startOfYear } from "date-fns";
import { FileText, Download, Printer, DollarSign, TrendingUp, Calendar } from "lucide-react";
import PayslipGenerator from "@/components/hr/PayslipGenerator";
import { formatSLE } from "@/components/hr/PayrollCalculator";
import EmptyState from "@/components/ui/EmptyState";

export default function SelfServicePayslips({ employee, organisation }) {
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['myPayrolls', employee?.id],
    queryFn: () => base44.entities.Payroll.filter({ 
      employee_id: employee?.id 
    }, '-period_end', 24),
    enabled: !!employee?.id,
  });

  const filteredPayrolls = payrolls.filter(p => {
    const year = new Date(p.period_end).getFullYear().toString();
    return year === yearFilter;
  });

  const years = [...new Set(payrolls.map(p => new Date(p.period_end).getFullYear()))].sort((a, b) => b - a);
  if (!years.includes(parseInt(yearFilter))) {
    years.unshift(parseInt(yearFilter));
  }

  // Calculate year-to-date totals
  const ytdTotals = filteredPayrolls.reduce((acc, p) => ({
    gross: acc.gross + (p.gross_pay || 0),
    net: acc.net + (p.net_pay || 0),
    deductions: acc.deductions + (p.total_deductions || 0)
  }), { gross: 0, net: 0, deductions: 0 });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Year-to-Date Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">YTD Gross Pay</p>
                <p className="text-2xl font-bold">{formatSLE(ytdTotals.gross)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">YTD Deductions</p>
                <p className="text-2xl font-bold text-red-600">{formatSLE(ytdTotals.deductions)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">YTD Net Pay</p>
                <p className="text-2xl font-bold text-[#0072C6]">{formatSLE(ytdTotals.net)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#0072C6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payslips List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            My Payslips
          </CardTitle>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredPayrolls.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Payslips Found"
              description={`No payslips available for ${yearFilter}`}
            />
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredPayrolls.map((payroll) => (
                  <div 
                    key={payroll.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold">
                        {format(new Date(payroll.period_end), 'MMM').toUpperCase().slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {format(new Date(payroll.period_start), 'dd MMM')} - {format(new Date(payroll.period_end), 'dd MMM yyyy')}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Gross: {formatSLE(payroll.gross_pay)}</span>
                          <span>•</span>
                          <span className="text-red-500">-{formatSLE(payroll.total_deductions)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-lg text-[#1EB053]">{formatSLE(payroll.net_pay)}</p>
                        <Badge className={getStatusColor(payroll.status)}>
                          {payroll.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {payroll.status === 'paid' && (
                        <PayslipGenerator 
                          payroll={payroll} 
                          employee={employee}
                          organisation={organisation}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}