import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, FileText, Calendar, DollarSign, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";

export default function QuickExpenseApproval({ expense, open, onOpenChange }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const approvalMutation = useMutation({
    mutationFn: async ({ action, reason }) => {
      const response = await base44.functions.invoke('handleExpenseApproval', {
        expense_id: expense.id,
        action,
        rejection_reason: reason,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['allExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['constructionExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      toast.success(
        `Expense ${variables.action}d`,
        `Successfully ${variables.action}d expense of Le ${expense.amount.toLocaleString()}`
      );
      
      onOpenChange(false);
      setShowRejectDialog(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error("Action failed", error.message || "Failed to process expense approval");
    },
  });

  const handleApprove = () => {
    approvalMutation.mutate({ action: 'approve' });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.warning("Reason required", "Please provide a reason for rejection");
      return;
    }
    approvalMutation.mutate({ action: 'reject', reason: rejectionReason });
  };

  if (!expense) return null;

  return (
    <>
      <Dialog open={open && !showRejectDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl [&>button]:hidden">
          {/* Sierra Leone Flag Header */}
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p>Expense Approval</p>
                <p className="text-sm font-normal text-gray-500 mt-1">Review and approve or reject this expense</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Expense Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Submitted By
                </p>
                <p className="font-semibold">{expense.recorded_by_name || 'Unknown'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date
                </p>
                <p className="font-semibold">
                  {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Amount
                </p>
                <p className="text-2xl font-bold text-[#1EB053]">
                  Le {expense.amount?.toLocaleString() || 0}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Category</p>
                <Badge className="bg-[#0072C6] text-white">{expense.category}</Badge>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm">{expense.description || 'No description provided'}</p>
              </div>

              {expense.vendor && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Vendor</p>
                  <p className="text-sm font-medium">{expense.vendor}</p>
                </div>
              )}

              {expense.payment_method && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <Badge variant="outline">{expense.payment_method}</Badge>
                </div>
              )}

              {expense.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 italic">{expense.notes}</p>
                </div>
              )}

              {expense.receipt_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Receipt</p>
                  <a
                    href={expense.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#0072C6] hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    View Receipt
                  </a>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={approvalMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              disabled={approvalMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approvalMutation.isPending}
              className="bg-[#1EB053] hover:bg-[#178f43]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {approvalMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>

          {/* Bottom flag stripe */}
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md [&>button]:hidden">
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Reject Expense
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-3">
              Please provide a reason for rejecting this expense. This will be sent to the employee.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              disabled={approvalMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={approvalMutation.isPending || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {approvalMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>

          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}