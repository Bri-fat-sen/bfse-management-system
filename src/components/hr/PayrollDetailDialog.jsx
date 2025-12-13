import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Download, Check, FileText, DollarSign, TrendingUp, Calendar, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function PayrollDetailDialog({ open, onOpenChange, payroll, orgId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: (status) => base44.entities.Payroll.update(payroll.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      toast.success("Status Updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Payroll.delete(payroll.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      toast.success("Payroll Deleted", "Payroll record has been deleted successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Delete Failed", error.message);
    }
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="h-1 flex -mx-6 -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1EB053]" />
              Payroll Details
            </div>
            <Badge className={statusColors[payroll.status]}>{payroll.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
            <h3 className="font-semibold text-lg">{payroll.employee_name}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {payroll.employee_code && <span>{payroll.employee_code}</span>}
              {payroll.employee_code && payroll.pay_date && <span>•</span>}
              {payroll.pay_date && (() => {
                try {
                  const date = new Date(payroll.pay_date);
                  return !isNaN(date.getTime()) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(date, 'MMMM d, yyyy')}
                    </span>
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
            <p className="text-sm text-gray-600 mt-1">{payroll.pay_period}</p>
          </div>

          {/* Earnings */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Earnings
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Basic Salary</span>
                <span className="font-semibold">{formatLeone(payroll.basic_salary || 0)}</span>
              </div>
              {(payroll.allowances || 0) > 0 && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Allowances</span>
                  <span className="font-semibold">{formatLeone(payroll.allowances || 0)}</span>
                </div>
              )}
              <div className="flex justify-between p-2 bg-green-50 rounded font-semibold">
                <span>Gross Salary</span>
                <span className="text-green-700">{formatLeone(payroll.gross_salary || 0)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0072C6]" />
              Deductions (Sierra Leone)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-[#1EB053]/5 rounded">
                <span>NASSIT Employee (5%)</span>
                <span className="font-semibold">{formatLeone(payroll.nassit_employee || 0)}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#1EB053]/5 rounded">
                <span>NASSIT Employer (10%)</span>
                <span className="font-semibold">{formatLeone(payroll.nassit_employer || 0)}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0072C6]/5 rounded">
                <span>PAYE Tax</span>
                <span className="font-semibold">{formatLeone(payroll.paye_tax || 0)}</span>
              </div>
              {(payroll.other_deductions || 0) > 0 && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Other Deductions</span>
                  <span className="font-semibold">{formatLeone(payroll.other_deductions || 0)}</span>
                </div>
              )}
              <div className="flex justify-between p-2 bg-red-50 rounded font-semibold">
                <span>Total Deductions</span>
                <span className="text-red-700">{formatLeone(payroll.total_deductions || 0)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="p-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] rounded-lg text-white">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Salary</span>
              <span className="text-3xl font-bold">{formatLeone(payroll.net_salary || 0)}</span>
            </div>
          </div>

          {/* Employer Cost */}
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Total Employer Cost (incl. NASSIT)</span>
              <span className="font-bold text-amber-700">{formatLeone(payroll.employer_cost || 0)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {payroll.status === 'draft' && (
              <Button
                onClick={() => updateStatusMutation.mutate('approved')}
                className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
            {payroll.status === 'approved' && (
              <Button
                onClick={() => updateStatusMutation.mutate('paid')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Payslip
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

      </DialogContent>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Payroll?"
        description="Are you sure you want to delete this payroll record? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </Dialog>
  );
}