import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";
import { format } from "date-fns";
import { Check, X, Download } from "lucide-react";

export default function PayrollDetailDialog({ open, onOpenChange, payroll, orgId }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: (status) => base44.entities.Payroll.update(payroll.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      toast.success("Status Updated");
      onOpenChange(false);
    },
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="h-1 flex -mt-6 -mx-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <DialogHeader>
          <DialogTitle>Payroll Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">{payroll.employee_name}</h3>
              <p className="text-sm text-gray-600">{payroll.pay_period}</p>
              <p className="text-xs text-gray-500">{format(new Date(payroll.pay_date), 'MMMM d, yyyy')}</p>
            </div>
            <Badge className={statusColors[payroll.status]}>{payroll.status}</Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Basic Salary</span>
              <span className="font-semibold">{formatLeone(payroll.basic_salary)}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded">
              <span className="text-gray-600">Gross Salary</span>
              <span className="font-semibold text-green-700">{formatLeone(payroll.gross_salary)}</span>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-gray-500 mb-2">DEDUCTIONS</p>
              <div className="flex justify-between p-3 bg-red-50 rounded mb-2">
                <span className="text-gray-600">NASSIT (Employee 5%)</span>
                <span className="font-semibold text-red-600">-{formatLeone(payroll.nassit_employee)}</span>
              </div>
              <div className="flex justify-between p-3 bg-red-50 rounded">
                <span className="text-gray-600">PAYE Tax</span>
                <span className="font-semibold text-red-600">-{formatLeone(payroll.paye_tax || 0)}</span>
              </div>
            </div>

            <div className="flex justify-between p-4 bg-[#1EB053]/10 rounded-lg text-lg border-2 border-[#1EB053]">
              <span className="font-bold text-gray-900">Net Salary</span>
              <span className="font-bold text-[#1EB053]">{formatLeone(payroll.net_salary)}</span>
            </div>

            <div className="flex justify-between p-3 bg-amber-50 rounded text-xs">
              <span className="text-gray-600">Employer NASSIT (10%)</span>
              <span className="font-semibold text-amber-600">{formatLeone(payroll.nassit_employer)}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-wrap gap-2">
          {payroll.status === 'pending' && (
            <>
              <Button
                variant="outline"
                className="text-green-600 border-green-600"
                onClick={() => updateStatusMutation.mutate('approved')}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600"
                onClick={() => updateStatusMutation.mutate('rejected')}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {payroll.status === 'approved' && (
            <Button
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
              onClick={() => updateStatusMutation.mutate('paid')}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Payslip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}