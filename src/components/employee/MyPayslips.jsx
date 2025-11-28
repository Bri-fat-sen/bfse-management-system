import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, Calendar, Download, Eye, Printer, 
  TrendingUp, TrendingDown, FileText, ChevronRight
} from "lucide-react";
import PayslipGenerator from "@/components/hr/PayslipGenerator";
import { formatSLE } from "@/components/hr/PayrollCalculator";

export default function MyPayslips({ employeeId, employee, organisation }) {
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['myPayrolls', employeeId],
    queryFn: () => base44.entities.Payroll.filter({ employee_id: employeeId }, '-period_end', 12),
    enabled: !!employeeId,
  });

  const paidPayrolls = payrolls.filter(p => p.status === 'paid' || p.status === 'approved');

  // Calculate year-to-date totals
  const currentYear = new Date().getFullYear();
  const ytdPayrolls = payrolls.filter(p => 
    new Date(p.period_end).getFullYear() === currentYear &&
    (p.status === 'paid' || p.status === 'approved')
  );
  
  const ytdTotals = ytdPayrolls.reduce((acc, p) => ({
    gross: acc.gross + (p.gross_pay || 0),
    deductions: acc.deductions + (p.total_deductions || 0),
    net: acc.net + (p.net_pay || 0)
  }), { gross: 0, deductions: 0, net: 0 });

  const statusColors = {
    paid: "bg-green-100 text-green-800",
    approved: "bg-blue-100 text-blue-800",
    pending_approval: "bg-amber-100 text-amber-800",
    draft: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      {/* YTD Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">YTD Gross Earnings</p>
                <p className="text-2xl font-bold text-green-800">{formatSLE(ytdTotals.gross)}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">YTD Deductions</p>
                <p className="text-2xl font-bold text-red-800">{formatSLE(ytdTotals.deductions)}</p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 border-[#1EB053]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1EB053] font-medium">YTD Net Pay</p>
                <p className="text-2xl font-bold text-[#1EB053]">{formatSLE(ytdTotals.net)}</p>
              </div>
              <div className="w-12 h-12 bg-[#1EB053]/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payslips List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0072C6]" />
            My Payslips ({currentYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading payslips...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No payslips available</p>
              <p className="text-sm">Your payslips will appear here once processed</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {payrolls.map((payroll) => (
                  <div 
                    key={payroll.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {format(new Date(payroll.period_start), 'MMMM yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(payroll.period_start), 'MMM d')} - {format(new Date(payroll.period_end), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-bold text-[#1EB053]">{formatSLE(payroll.net_pay)}</p>
                        <Badge className={statusColors[payroll.status]}>
                          {payroll.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedPayslip(payroll)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {(payroll.status === 'paid' || payroll.status === 'approved') && (
                          <PayslipGenerator 
                            payroll={payroll}
                            employee={employee}
                            organisation={organisation}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Payslip Detail Modal */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#1EB053]" />
              Payslip Details - {selectedPayslip && format(new Date(selectedPayslip.period_start), 'MMMM yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayslip && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Period</p>
                    <p className="font-medium">
                      {format(new Date(selectedPayslip.period_start), 'MMM d')} - {format(new Date(selectedPayslip.period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge className={statusColors[selectedPayslip.status]}>
                      {selectedPayslip.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Earnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Salary</span>
                    <span className="font-medium">{formatSLE(selectedPayslip.base_salary)}</span>
                  </div>
                  {selectedPayslip.overtime_pay > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Overtime ({selectedPayslip.overtime_hours}h)</span>
                      <span className="font-medium">{formatSLE(selectedPayslip.overtime_pay)}</span>
                    </div>
                  )}
                  {selectedPayslip.allowances?.map((a, i) => (
                    <div key={i} className="flex justify-between text-green-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatSLE(a.amount)}</span>
                    </div>
                  ))}
                  {selectedPayslip.bonuses?.map((b, i) => (
                    <div key={i} className="flex justify-between text-purple-600">
                      <span>{b.name}</span>
                      <span className="font-medium">{formatSLE(b.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Gross Pay</span>
                    <span className="text-green-600">{formatSLE(selectedPayslip.gross_pay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Deductions</h4>
                <div className="space-y-2 text-sm">
                  {selectedPayslip.nassit_employee > 0 && (
                    <div className="flex justify-between">
                      <span>NASSIT (5%)</span>
                      <span className="font-medium text-red-500">-{formatSLE(selectedPayslip.nassit_employee)}</span>
                    </div>
                  )}
                  {selectedPayslip.paye_tax > 0 && (
                    <div className="flex justify-between">
                      <span>PAYE Tax</span>
                      <span className="font-medium text-red-500">-{formatSLE(selectedPayslip.paye_tax)}</span>
                    </div>
                  )}
                  {selectedPayslip.deductions?.filter(d => d.type !== 'statutory').map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{d.name}</span>
                      <span className="font-medium text-red-500">-{formatSLE(d.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Deductions</span>
                    <span className="text-red-600">-{formatSLE(selectedPayslip.total_deductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Net Pay</span>
                  <span className="text-2xl font-bold text-[#1EB053]">{formatSLE(selectedPayslip.net_pay)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <PayslipGenerator 
                  payroll={selectedPayslip}
                  employee={employee}
                  organisation={organisation}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}