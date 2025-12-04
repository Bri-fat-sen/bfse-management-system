import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Eye, FileText,
  Send, Users, DollarSign, Calendar, Loader2, ChevronRight,
  Shield, History, Printer
} from "lucide-react";
import { formatSLE } from "./PayrollCalculator";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-500', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'bg-orange-500', icon: AlertTriangle },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-blue-500', icon: Loader2 },
  paid: { label: 'Paid', color: 'bg-emerald-600', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle }
};

export default function PayrollApprovalWorkflow({ orgId, currentEmployee }) {
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalAction, setApprovalAction] = useState('approve');
  const [statusFilter, setStatusFilter] = useState('all');

  const userRole = currentEmployee?.role;
  const canReview = ['super_admin', 'org_admin', 'hr_admin'].includes(userRole);
  const canApprove = ['super_admin', 'org_admin'].includes(userRole);
  const canProcess = ['super_admin', 'org_admin', 'payroll_admin'].includes(userRole);

  const { data: payrollRuns = [], isLoading } = useQuery({
    queryKey: ['payrollRuns', orgId],
    queryFn: () => base44.entities.PayrollRun.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const { data: pendingPayrolls = [] } = useQuery({
    queryKey: ['pendingPayrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ 
      organisation_id: orgId, 
      status: 'pending_approval' 
    }),
    enabled: !!orgId,
  });

  const updateRunMutation = useMutation({
    mutationFn: async ({ runId, data, payrollIds, payrollStatus }) => {
      // Update the payroll run
      await base44.entities.PayrollRun.update(runId, data);
      
      // Update all payrolls in the run if needed
      if (payrollIds?.length && payrollStatus) {
        await Promise.all(payrollIds.map(id => 
          base44.entities.Payroll.update(id, { status: payrollStatus })
        ));
      }

      // Create audit log
      await base44.entities.PayrollAudit.create({
        organisation_id: orgId,
        payroll_id: runId,
        action: data.status === 'approved' ? 'approved' : data.status === 'cancelled' ? 'cancelled' : 'updated',
        changed_by_id: currentEmployee?.id,
        changed_by_name: currentEmployee?.full_name,
        new_values: data,
        reason: data.approval_notes || data.rejection_reason || 'Status update'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayrolls'] });
      toast.success('Payroll run updated');
      setShowApprovalDialog(false);
      setApprovalNotes('');
    },
    onError: (error) => {
      toast.error('Failed to update payroll run', { description: error.message });
    }
  });

  const handleApprovalAction = () => {
    if (!selectedRun) return;

    let updateData = {};
    let payrollStatus = null;

    if (approvalAction === 'approve') {
      updateData = {
        status: 'approved',
        approved_by_id: currentEmployee?.id,
        approved_by_name: currentEmployee?.full_name,
        approved_date: new Date().toISOString(),
        approval_notes: approvalNotes
      };
      payrollStatus = 'approved';
    } else if (approvalAction === 'reject') {
      updateData = {
        status: 'cancelled',
        rejected_by_id: currentEmployee?.id,
        rejected_by_name: currentEmployee?.full_name,
        rejection_reason: approvalNotes
      };
      payrollStatus = 'cancelled';
    } else if (approvalAction === 'review') {
      updateData = {
        status: 'pending_approval',
        reviewed_by_id: currentEmployee?.id,
        reviewed_by_name: currentEmployee?.full_name,
        reviewed_date: new Date().toISOString(),
        review_notes: approvalNotes
      };
    } else if (approvalAction === 'pay') {
      updateData = {
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0]
      };
      payrollStatus = 'paid';
    }

    updateRunMutation.mutate({
      runId: selectedRun.id,
      data: updateData,
      payrollIds: selectedRun.payroll_ids,
      payrollStatus
    });
  };

  const submitForReviewMutation = useMutation({
    mutationFn: async (run) => {
      await base44.entities.PayrollRun.update(run.id, {
        status: 'pending_review',
        submitted_by_id: currentEmployee?.id,
        submitted_by_name: currentEmployee?.full_name,
        submitted_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      toast.success('Submitted for review');
    }
  });

  const filteredRuns = useMemo(() => {
    if (statusFilter === 'all') return payrollRuns;
    return payrollRuns.filter(r => r.status === statusFilter);
  }, [payrollRuns, statusFilter]);

  const stats = useMemo(() => ({
    pending_review: payrollRuns.filter(r => r.status === 'pending_review').length,
    pending_approval: payrollRuns.filter(r => r.status === 'pending_approval').length,
    approved: payrollRuns.filter(r => r.status === 'approved').length,
    paid: payrollRuns.filter(r => r.status === 'paid').length,
  }), [payrollRuns]);

  const openApprovalDialog = (run, action) => {
    setSelectedRun(run);
    setApprovalAction(action);
    setApprovalNotes('');
    setShowApprovalDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending_review}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending_approval}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Individual Payrolls Alert */}
      {pendingPayrolls.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  {pendingPayrolls.length} individual payroll(s) pending approval
                </p>
                <p className="text-sm text-orange-600">
                  These are not part of a payroll run. Consider creating a bulk payroll run for better tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payroll Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0072C6]" />
            Payroll Runs & Approvals
          </CardTitle>
          <CardDescription>
            Manage payroll approval workflow - review, approve, or reject payroll runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredRuns.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Payroll Runs"
              description="Create a bulk payroll run to see it here for approval"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Total Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => {
                  const config = STATUS_CONFIG[run.status] || STATUS_CONFIG.draft;
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={run.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{run.run_number || run.name || 'Payroll Run'}</p>
                          <p className="text-xs text-gray-500">
                            Created {run.created_date ? format(new Date(run.created_date), 'MMM d, yyyy') : ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {run.period_start && run.period_end ? (
                            `${format(new Date(run.period_start), 'MMM d')} - ${format(new Date(run.period_end), 'MMM d, yyyy')}`
                          ) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          {run.employee_count || run.payroll_ids?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-[#1EB053]">
                          {formatSLE(run.total_net || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        {run.approved_by_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {run.approved_by_name}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setSelectedRun(run);
                            setShowDetailsDialog(true);
                          }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {run.status === 'draft' && canProcess && (
                            <Button size="sm" variant="outline" onClick={() => submitForReviewMutation.mutate(run)}>
                              <Send className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          )}
                          
                          {run.status === 'pending_review' && canReview && (
                            <Button size="sm" variant="outline" className="text-blue-600"
                              onClick={() => openApprovalDialog(run, 'review')}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          )}
                          
                          {run.status === 'pending_approval' && canApprove && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                onClick={() => openApprovalDialog(run, 'approve')}>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive"
                                onClick={() => openApprovalDialog(run, 'reject')}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {run.status === 'approved' && canProcess && (
                            <Button size="sm" className="bg-[#1EB053] hover:bg-[#178f43]"
                              onClick={() => openApprovalDialog(run, 'pay')}>
                              <DollarSign className="w-4 h-4 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approvalAction === 'approve' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {approvalAction === 'reject' && <XCircle className="w-5 h-5 text-red-600" />}
              {approvalAction === 'review' && <Eye className="w-5 h-5 text-blue-600" />}
              {approvalAction === 'pay' && <DollarSign className="w-5 h-5 text-emerald-600" />}
              {approvalAction === 'approve' && 'Approve Payroll Run'}
              {approvalAction === 'reject' && 'Reject Payroll Run'}
              {approvalAction === 'review' && 'Complete Review'}
              {approvalAction === 'pay' && 'Mark as Paid'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRun && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedRun.name || selectedRun.run_number}</p>
                <p className="text-sm text-gray-500">
                  {selectedRun.employee_count || selectedRun.payroll_ids?.length || 0} employees
                </p>
                <p className="text-lg font-bold text-[#1EB053] mt-2">
                  Total: {formatSLE(selectedRun.total_net || 0)}
                </p>
              </div>

              {approvalAction !== 'pay' && (
                <div>
                  <Label>
                    {approvalAction === 'reject' ? 'Rejection Reason *' : 'Notes (optional)'}
                  </Label>
                  <Textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder={approvalAction === 'reject' 
                      ? 'Please provide a reason for rejection...' 
                      : 'Add any notes...'}
                    rows={3}
                    required={approvalAction === 'reject'}
                  />
                </div>
              )}

              {approvalAction === 'pay' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    This will mark all payrolls in this run as paid. 
                    Make sure payment has been processed.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprovalAction}
              disabled={updateRunMutation.isPending || (approvalAction === 'reject' && !approvalNotes)}
              className={
                approvalAction === 'approve' || approvalAction === 'pay' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : approvalAction === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {updateRunMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {approvalAction === 'approve' && 'Approve'}
              {approvalAction === 'reject' && 'Reject'}
              {approvalAction === 'review' && 'Complete Review'}
              {approvalAction === 'pay' && 'Confirm Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Payroll Run Details</DialogTitle>
          </DialogHeader>
          
          {selectedRun && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Run Number</p>
                  <p className="font-medium">{selectedRun.run_number || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={`${STATUS_CONFIG[selectedRun.status]?.color} text-white mt-1`}>
                    {STATUS_CONFIG[selectedRun.status]?.label}
                  </Badge>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-medium">
                    {selectedRun.period_start && selectedRun.period_end
                      ? `${format(new Date(selectedRun.period_start), 'MMM d')} - ${format(new Date(selectedRun.period_end), 'MMM d, yyyy')}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="font-medium">{selectedRun.employee_count || selectedRun.payroll_ids?.length || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500">Total Gross</p>
                  <p className="font-bold">{formatSLE(selectedRun.total_gross || 0)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500">Total Deductions</p>
                  <p className="font-bold text-red-600">{formatSLE(selectedRun.total_deductions || 0)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500">Total Net</p>
                  <p className="font-bold text-[#1EB053]">{formatSLE(selectedRun.total_net || 0)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500">Employer Cost</p>
                  <p className="font-bold">{formatSLE(selectedRun.total_employer_cost || 0)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Workflow History
                </h4>
                <div className="border rounded-lg divide-y">
                  {selectedRun.created_by_name && (
                    <div className="p-3 flex justify-between text-sm">
                      <span>Created by {selectedRun.created_by_name}</span>
                      <span className="text-gray-500">{selectedRun.created_date ? format(new Date(selectedRun.created_date), 'MMM d, yyyy h:mm a') : ''}</span>
                    </div>
                  )}
                  {selectedRun.submitted_by_name && (
                    <div className="p-3 flex justify-between text-sm">
                      <span>Submitted by {selectedRun.submitted_by_name}</span>
                      <span className="text-gray-500">{selectedRun.submitted_date ? format(new Date(selectedRun.submitted_date), 'MMM d, yyyy h:mm a') : ''}</span>
                    </div>
                  )}
                  {selectedRun.reviewed_by_name && (
                    <div className="p-3 flex justify-between text-sm">
                      <span>Reviewed by {selectedRun.reviewed_by_name}</span>
                      <span className="text-gray-500">{selectedRun.reviewed_date ? format(new Date(selectedRun.reviewed_date), 'MMM d, yyyy h:mm a') : ''}</span>
                    </div>
                  )}
                  {selectedRun.approved_by_name && (
                    <div className="p-3 flex justify-between text-sm bg-green-50">
                      <span className="text-green-700">Approved by {selectedRun.approved_by_name}</span>
                      <span className="text-green-600">{selectedRun.approved_date ? format(new Date(selectedRun.approved_date), 'MMM d, yyyy h:mm a') : ''}</span>
                    </div>
                  )}
                  {selectedRun.rejected_by_name && (
                    <div className="p-3 bg-red-50">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700">Rejected by {selectedRun.rejected_by_name}</span>
                      </div>
                      {selectedRun.rejection_reason && (
                        <p className="text-sm text-red-600 mt-1">Reason: {selectedRun.rejection_reason}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedRun.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">{selectedRun.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}