import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Calendar,
  Check,
  X,
  Clock,
  AlertCircle,
  Filter,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";
import LeaveRequestForm from "@/components/employee/LeaveRequestForm";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700"
};

const LEAVE_TYPE_LABELS = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  unpaid: "Unpaid Leave",
  compassionate: "Compassionate Leave",
  study: "Study Leave"
};

export default function LeaveManagement({ orgId, currentEmployee }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  const canApprove = ['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role);

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['leaveRequests', orgId],
    queryFn: () => base44.entities.LeaveRequest.filter({ organisation_id: orgId }, '-created_date'),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, employee }) => {
      await base44.entities.LeaveRequest.update(id, data);
      
      // If approved, deduct from employee leave balance and send notifications
      if (data.status === 'approved' && employee) {
        const leaveType = employee.leave_type;
        const daysRequested = employee.days_requested;
        const currentEmployee = employees.find(e => e.id === employee.employee_id);
        
        if (currentEmployee) {
          const balances = currentEmployee.leave_balances || {
            annual_days: 21,
            sick_days: 10,
            maternity_days: 90,
            paternity_days: 5
          };

          const balanceKey = `${leaveType}_days`;
          if (balances[balanceKey] !== undefined) {
            balances[balanceKey] = Math.max(0, (balances[balanceKey] || 0) - daysRequested);
            
            await base44.entities.Employee.update(currentEmployee.id, {
              leave_balances: balances
            });
          }
        }

        // Notify employee of approval
        await base44.entities.Notification.create({
          organisation_id: orgId,
          recipient_id: employee.employee_id,
          recipient_email: currentEmployee?.email || currentEmployee?.user_email,
          type: 'hr',
          title: 'Leave Request Approved',
          message: `Your ${employee.leave_type} leave request for ${employee.days_requested} days has been approved.`,
          priority: 'normal'
        });
      }

      // If rejected, notify employee
      if (data.status === 'rejected' && employee) {
        const currentEmployee = employees.find(e => e.id === employee.employee_id);
        await base44.entities.Notification.create({
          organisation_id: orgId,
          recipient_id: employee.employee_id,
          recipient_email: currentEmployee?.email || currentEmployee?.user_email,
          type: 'hr',
          title: 'Leave Request Rejected',
          message: `Your ${employee.leave_type} leave request has been rejected. Reason: ${data.rejection_reason || 'Not specified'}`,
          priority: 'high'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: "Leave request updated" });
    },
  });

  const handleApprove = async (request) => {
    // Notify manager/HR before approval
    const hrAdmins = employees.filter(e => ['super_admin', 'org_admin', 'hr_admin'].includes(e.role));
    
    updateMutation.mutate({
      id: request.id,
      data: {
        status: "approved",
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
        approval_date: format(new Date(), 'yyyy-MM-dd')
      },
      employee: request
    });
  };

  const handleReject = () => {
    if (!rejectionReason) {
      toast({ title: "Please provide a reason", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      id: selectedRequest.id,
      data: {
        status: "rejected",
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
        rejection_reason: rejectionReason
      },
      employee: selectedRequest
    });
    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectionReason("");
  };

  const filteredRequests = leaveRequests.filter(r => 
    statusFilter === "all" || r.status === statusFilter
  );

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0072C6]" />
          Leave Requests
          {pendingCount > 0 && (
            <Badge className="bg-amber-500">{pendingCount} pending</Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowRequestForm(true)} className="bg-[#1EB053]">
            <Plus className="w-4 h-4 mr-1" />
            New Request
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Leave Requests"
            description="Leave requests will appear here"
          />
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      request.status === 'pending' ? 'bg-amber-100' :
                      request.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {request.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-amber-600" />
                      ) : request.status === 'approved' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{request.employee_name}</p>
                      <p className="text-sm text-gray-600">
                        {LEAVE_TYPE_LABELS[request.leave_type]} • {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {format(new Date(request.start_date), 'PP')} - {format(new Date(request.end_date), 'PP')}
                      </p>
                      {request.reason && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">"{request.reason}"</p>
                      )}
                      {request.rejection_reason && (
                        <p className="text-sm text-red-500 mt-1">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {request.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <Badge className={STATUS_COLORS[request.status]}>
                      {request.status}
                    </Badge>
                    {canApprove && request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApprove(request)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rejection</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>

    <LeaveRequestForm
      open={showRequestForm}
      onOpenChange={setShowRequestForm}
      employee={currentEmployee}
      orgId={orgId}
    />
    </>
  );
}