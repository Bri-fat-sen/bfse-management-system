import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  Plus, DollarSign, Calendar, Download, CheckCircle, Clock,
  TrendingUp, Users, FileText, Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import ProcessPayrollDialog from "@/components/hr/ProcessPayrollDialogNew";
import PayrollDetailDialog from "@/components/hr/PayrollDetailDialog";
import { formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";

export default function PayrollProcessingTab({ orgId, employees, payrolls, currentEmployee }) {
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Payroll.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      toast.success("Payroll Deleted", "Payroll record has been deleted successfully");
      setDeletePayrollId(null);
    },
    onError: (error) => {
      toast.error("Delete Failed", error.message);
    }
  });

  const { data: payCycles = [] } = useQuery({
    queryKey: ['payCycles', orgId],
    queryFn: () => base44.entities.PayCycle.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const sortedPayrolls = [...payrolls].sort((a, b) => {
    try {
      const dateA = new Date(a.pay_date);
      const dateB = new Date(b.pay_date);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return dateB - dateA;
    } catch {
      return 0;
    }
  });

  const thisMonthPayrolls = sortedPayrolls.filter(p => {
    if (!p.pay_date) return false;
    try {
      const payDate = new Date(p.pay_date);
      if (isNaN(payDate.getTime())) return false;
      const now = new Date();
      return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
    } catch {
      return false;
    }
  });

  const totalPayrollThisMonth = thisMonthPayrolls.reduce((sum, p) => {
    const netSalary = parseFloat(p.net_salary) || 0;
    return sum + netSalary;
  }, 0);
  
  const totalNassitThisMonth = thisMonthPayrolls.reduce((sum, p) => {
    const employee = parseFloat(p.nassit_employee) || 0;
    const employer = parseFloat(p.nassit_employer) || 0;
    return sum + employee + employer;
  }, 0);
  
  const totalPAYEThisMonth = thisMonthPayrolls.reduce((sum, p) => {
    const paye = parseFloat(p.paye_tax) || 0;
    return sum + paye;
  }, 0);

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Payroll (Month)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatLeone(totalPayrollThisMonth)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">NASSIT Contributions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatLeone(totalNassitThisMonth)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#1EB053]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">PAYE Tax (Month)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatLeone(totalPAYEThisMonth)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0072C6]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#0072C6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={() => setShowProcessDialog(true)}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Process Payroll
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Payroll
        </Button>
        <Button variant="outline">
          <Calculator className="w-4 h-4 mr-2" />
          Tax Calculator
        </Button>
      </div>

      {/* Payroll List */}
      <div className="space-y-3">
        {sortedPayrolls.map((payroll) => (
          <Card 
            key={payroll.id} 
            className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedPayroll(payroll)}
          >
            <div className="h-0.5 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {payroll.employee_name?.charAt(0) || 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{payroll.employee_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 flex-wrap">
                      {payroll.pay_date && (() => {
                        try {
                          const date = new Date(payroll.pay_date);
                          return !isNaN(date.getTime()) && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(date, 'MMM d, yyyy')}
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                      {payroll.pay_date && payroll.pay_period && <span>•</span>}
                      {payroll.pay_period && <span>{payroll.pay_period}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                 <p className="text-lg font-bold text-[#1EB053]">{formatLeone(payroll.net_salary || 0)}</p>
                 <Badge className={`${statusColors[payroll.status || 'draft']} mt-1`}>
                   {payroll.status || 'draft'}
                 </Badge>
                </div>
              </div>

              {/* Breakdown Summary */}
              <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Gross</p>
                  <p className="font-semibold">{formatLeone(payroll.gross_salary || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">NASSIT</p>
                  <p className="font-semibold">{formatLeone((parseFloat(payroll.nassit_employee) || 0) + (parseFloat(payroll.nassit_employer) || 0))}</p>
                </div>
                <div>
                  <p className="text-gray-600">PAYE</p>
                  <p className="font-semibold">{formatLeone(parseFloat(payroll.paye_tax) || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedPayrolls.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No payroll records yet</p>
            <Button
              onClick={() => setShowProcessDialog(true)}
              className="mt-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Process First Payroll
            </Button>
          </div>
        )}
      </div>

      {/* Process Payroll Dialog */}
      <ProcessPayrollDialog
        open={showProcessDialog}
        onOpenChange={setShowProcessDialog}
        orgId={orgId}
        currentEmployee={currentEmployee}
        employees={employees}
        payCycles={payCycles}
      />

      {/* Payroll Detail Dialog */}
      {selectedPayroll && (
        <PayrollDetailDialog
          open={!!selectedPayroll}
          onOpenChange={() => setSelectedPayroll(null)}
          payroll={selectedPayroll}
          orgId={orgId}
        />
      )}
    </div>
  );
}