import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  CheckCircle2, XCircle, Clock, AlertTriangle, Eye, FileText, 
  Send, ThumbsUp, ThumbsDown, Users, DollarSign, Calendar,
  ChevronRight, MoreHorizontal, History
} from "lucide-react";
import { formatSLE } from "./PayrollCalculator";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-500', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'bg-orange-500', icon: AlertTriangle },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-blue-500', icon: Clock },
  paid: { label: 'Paid', color: 'bg-[#1EB053]', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle }
};

export default function PayrollApprovalWorkflow({ orgId, currentEmployee }) {
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: payrollRuns = [], isLoading } = useQuery({
    queryKey: ['payrollRuns', orgId],
    queryFn: () => base44.entities.PayrollRun.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Get payrolls for a specific run
  const getRunPayrolls = (runId) => {
    const run = payrollRuns.find(r => r.id === runId);
    if (!run?.payroll_ids?.length) return [];
    return payrolls.filter(p => run.payroll_ids.includes(p.id));
  };

  const updateRunMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PayrollRun.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      setShowActionDialog(false);
      setActionNotes("");
      toast.success('Payroll run updated');
    }
  });

  const updatePayrollsMutation = useMutation({
    mutationFn: async ({ runId, status }) => {
      const run = payrollRuns.find(r => r.id === runId);
      if (!run?.payroll_ids?.length) return;
      
      // Update all payrolls in this run
      await Promise.all(run.payroll_ids.map(id => 
        base44.entities.Payroll.update(id, { status })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    }
  });

  const handleAction = async (action) => {
    if (!selectedRun) return;

    const now = new Date().toISOString();
    let updateData = {};
    let newPayrollStatus = null;

    switch (action) {
      case 'submit_review':
        updateData = {
          status: 'pending_review',
          submitted_by_id: currentEmployee?.id,
          submitted_by_name: currentEmployee?.full_name,
          submitted_date: now
        };
        newPayrollStatus = 'pending_approval';
        break;
      case 'review':
        updateData = {
          status: 'pending_approval',
          reviewed_by_id: currentEmployee?.id,
          reviewed_by_name: currentEmployee?.full_name,
          reviewed_date: now,
          review_notes: actionNotes
        };
        break;
      case 'approve':
        updateData = {
          status: 'approved',
          approved_by_id: currentEmployee?.id,
          approved_by_name: currentEmployee?.full_name,
          approved_date: now,
          approval_notes: actionNotes
        };
        newPayrollStatus = 'approved';
        break;
      case 'reject':
        updateData = {
          status: 'draft',
          rejected_by_id: currentEmployee?.id,
          rejected_by_name: currentEmployee?.full_name,
          rejection_reason: actionNotes
        };
        newPayrollStatus = 'draft';
        break;
      case 'process':
        updateData = { status: 'processing' };
        break;
      case 'mark_paid':
        updateData = { status: 'paid' };
        newPayrollStatus = 'paid';
        break;
      case 'cancel':
        updateData = { status: 'cancelled' };
        newPayrollStatus = 'cancelled';
        break;
    }

    await updateRunMutation.mutateAsync({ id: selectedRun.id, data: updateData });
    
    if (newPayrollStatus) {
      await updatePayrollsMutation.mutateAsync({ runId: selectedRun.id, status: newPayrollStatus });
    }

    // Create audit log
    await base44.entities.PayrollAudit.create({
      organisation_id: orgId,
      payroll_id: selectedRun.id,
      action: action,
      changed_by_id: currentEmployee?.id,
      changed_by_name: currentEmployee?.full_name,
      new_values: updateData,
      reason: actionNotes || `Payroll run ${action.replace('_', ' ')}`
    });
  };

  const openActionDialog = (run, action) => {
    setSelectedRun(run);
    setActionType(action);
    setActionNotes("");
    setShowActionDialog(true);
  };

  const filteredRuns = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return payrollRuns.filter(r => ['pending_review', 'pending_approval'].includes(r.status));
      case 'approved':
        return payrollRuns.filter(r => ['approved', 'processing', 'paid'].includes(r.status));
      case 'draft':
        return payrollRuns.filter(r => r.status === 'draft');
      default:
        return payrollRuns;
    }
  }, [payrollRuns, activeTab]);

  const pendingCount = payrollRuns.filter(r => ['pending_review', 'pending_approval'].includes(r.status)).length;

  const canPerformAction = (action, run) => {
    const role = currentEmployee?.role;
    const isAdmin = ['super_admin', 'org_admin'].includes(role);
    const isPayrollAdmin = role === 'payroll_admin';
    const isAccountant = role === 'accountant';

    switch (action) {
      case 'submit_review':
        return (isAdmin || isPayrollAdmin) && run.status === 'draft';
      case 'review':
        return (isAdmin || isAccountant) && run.status === 'pending_review';
      case 'approve':
        return isAdmin && run.status === 'pending_approval';
      case 'reject':
        return isAdmin && ['pending_review', 'pending_approval'].includes(run.status);
      case 'process':
        return (isAdmin || isPayrollAdmin) && run.status === 'approved';
      case 'mark_paid':
        return (isAdmin || isAccountant) && run.status === 'processing';
      case 'cancel':
        return isAdmin && !['paid', 'cancelled'].includes(run.status);
      default:
        return false;
    }
  };

  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return (
      <Badge className={`${config.color} text-white gap-1`}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payroll Approval Workflow</h3>
          <p className="text-sm text-gray-500">Review, approve and process payroll runs</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-4 h-4" />
            {pendingCount} Pending Approval
          </Badge>
        )}
      </div>

      {/* Workflow Steps */}
      <Card className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            {['Draft', 'Review', 'Approval', 'Processing', 'Paid'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    i === 0 ? 'bg-gray-200' : i === 4 ? 'bg-[#1EB053]' : 'bg-[#0072C6]'
                  } text-white font-bold`}>
                    {i + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">{step}</span>
                </div>
                {i < 4 && <ChevronRight className="w-5 h-5 text-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved/Paid
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-2">
            <FileText className="w-4 h-4" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="all">All Runs</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run #</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Total Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Action</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.map(run => (
                    <TableRow key={run.id} className={['pending_review', 'pending_approval'].includes(run.status) ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{run.run_number || `PR-${run.id?.slice(-6)}`}</p>
                          <p className="text-xs text-gray-500">{run.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {run.period_start && format(new Date(run.period_start), 'MMM d')} - {run.period_end && format(new Date(run.period_end), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{run.employee_count || run.payroll_ids?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-[#1EB053]">{formatSLE(run.total_net || 0)}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={run.status} />
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-500">
                          {run.approved_by_name && <p>Approved: {run.approved_by_name}</p>}
                          {run.reviewed_by_name && !run.approved_by_name && <p>Reviewed: {run.reviewed_by_name}</p>}
                          {run.submitted_by_name && !run.reviewed_by_name && <p>Submitted: {run.submitted_by_name}</p>}
                          {run.created_by_name && !run.submitted_by_name && <p>Created: {run.created_by_name}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedRun(run); setShowDetailsDialog(true); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canPerformAction('submit_review', run) && (
                                <DropdownMenuItem onClick={() => openActionDialog(run, 'submit_review')}>
                                  <Send className="w-4 h-4 mr-2" /> Submit for Review
                                </DropdownMenuItem>
                              )}
                              {canPerformAction('review', run) && (
                                <DropdownMenuItem onClick={() => openActionDialog(run, 'review')}>
                                  <Eye className="w-4 h-4 mr-2" /> Complete Review
                                </DropdownMenuItem>
                              )}
                              {canPerformAction('approve', run) && (
                                <DropdownMenuItem onClick={() => openActionDialog(run, 'approve')} className="text-green-600">
                                  <ThumbsUp className="w-4 h-4 mr-2" /> Approve
                                </DropdownMenuItem>
                              )}
                              {canPerformAction('reject', run) && (
                                <DropdownMenuItem onClick={() => openActionDialog(run, 'reject')} className="text-red-600">
                                  <ThumbsDown className="w-4 h-4 mr-2" /> Reject
                                </DropdownMenuItem>
                              )}
                              {canPerformAction('process', run) && (
                                <DropdownMenuItem onClick={() => openActionDialog(run, 'process')}>
                                  <Clock className="w-4 h-4 mr-2" /> Start Processing
                                </DropdownMenuItem>
                              )}
                              {canPerformAction('mark_paid', run) && (
                                <DropdownMenuItem onClick={() => openActionDialog(run, 'mark_paid')} className="text-green-600">
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Paid
                                </DropdownMenuItem>
                              )}
                              {canPerformAction('cancel', run) && (
                                <DropdownMenuItem onClick={() => openActionDialog(run, 'cancel')} className="text-red-600">
                                  <XCircle className="w-4 h-4 mr-2" /> Cancel Run
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRuns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No payroll runs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Payroll Run Details</DialogTitle>
          </DialogHeader>
          {selectedRun && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Total Gross</p>
                    <p className="text-xl font-bold">{formatSLE(selectedRun.total_gross || 0)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Total Deductions</p>
                    <p className="text-xl font-bold text-red-600">{formatSLE(selectedRun.total_deductions || 0)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Total Net Pay</p>
                    <p className="text-xl font-bold text-[#1EB053]">{formatSLE(selectedRun.total_net || 0)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Statutory Totals</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>NASSIT (Employee)</span>
                      <span>{formatSLE(selectedRun.total_nassit_employee || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NASSIT (Employer)</span>
                      <span>{formatSLE(selectedRun.total_nassit_employer || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PAYE Tax</span>
                      <span>{formatSLE(selectedRun.total_paye || 0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Approval History</h4>
                  <div className="space-y-2 text-sm">
                    {selectedRun.created_by_name && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>Created by {selectedRun.created_by_name}</span>
                      </div>
                    )}
                    {selectedRun.submitted_by_name && (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-500" />
                        <span>Submitted by {selectedRun.submitted_by_name}</span>
                      </div>
                    )}
                    {selectedRun.reviewed_by_name && (
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-yellow-500" />
                        <span>Reviewed by {selectedRun.reviewed_by_name}</span>
                      </div>
                    )}
                    {selectedRun.approved_by_name && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Approved by {selectedRun.approved_by_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedRun.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedRun.notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Included Payrolls ({selectedRun.payroll_ids?.length || 0})</h4>
                <div className="max-h-48 overflow-y-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Gross</TableHead>
                        <TableHead>Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getRunPayrolls(selectedRun.id).map(p => (
                        <TableRow key={p.id}>
                          <TableCell>{p.employee_name}</TableCell>
                          <TableCell><Badge variant="outline">{p.employee_role?.replace('_', ' ')}</Badge></TableCell>
                          <TableCell>{formatSLE(p.gross_pay)}</TableCell>
                          <TableCell className="font-medium text-[#1EB053]">{formatSLE(p.net_pay)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden [&>button]:hidden">
          {/* Flag Stripe Header */}
          <div className="h-1.5 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <div className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] px-6 py-4 text-white">
            <DialogTitle className="text-white flex items-center gap-2">
              {actionType === 'approve' && <><CheckCircle2 className="w-5 h-5" /> Approve Payroll Run</>}
              {actionType === 'reject' && <><XCircle className="w-5 h-5" /> Reject Payroll Run</>}
              {actionType === 'review' && <><Eye className="w-5 h-5" /> Complete Review</>}
              {actionType === 'submit_review' && <><Send className="w-5 h-5" /> Submit for Review</>}
              {actionType === 'process' && <><Clock className="w-5 h-5" /> Start Processing</>}
              {actionType === 'mark_paid' && <><CheckCircle2 className="w-5 h-5" /> Mark as Paid</>}
              {actionType === 'cancel' && <><XCircle className="w-5 h-5" /> Cancel Payroll Run</>}
            </DialogTitle>
          </div>
          <div className="p-6">
          <div className="space-y-4">
            {selectedRun && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedRun.run_number || `PR-${selectedRun.id?.slice(-6)}`}</p>
                <p className="text-sm text-gray-500">
                  {selectedRun.employee_count || selectedRun.payroll_ids?.length} employees • {formatSLE(selectedRun.total_net || 0)}
                </p>
              </div>
            )}
            
            <div>
              <Label>{actionType === 'reject' ? 'Rejection Reason *' : 'Notes (optional)'}</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={actionType === 'reject' ? 'Please provide a reason for rejection...' : 'Add any notes...'}
                rows={3}
                required={actionType === 'reject'}
              />
            </div>

            {actionType === 'approve' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                This will approve the payroll run and allow it to be processed for payment.
              </div>
            )}

            {actionType === 'reject' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                This will return the payroll run to draft status for corrections.
              </div>
            )}
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => handleAction(actionType)}
              disabled={actionType === 'reject' && !actionNotes.trim()}
              className={
                actionType === 'reject' || actionType === 'cancel'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white'
              }
            >
              Confirm
            </Button>
          </div>
          {/* Bottom flag stripe */}
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}