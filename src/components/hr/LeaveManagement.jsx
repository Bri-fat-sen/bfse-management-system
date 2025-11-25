import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter
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
import { useToast } from "@/components/ui/use-toast";
import LeaveRequestDialog from "./LeaveRequestDialog";
import EmptyState from "@/components/ui/EmptyState";

const LEAVE_TYPE_COLORS = {
  annual: "bg-blue-100 text-blue-700",
  sick: "bg-red-100 text-red-700",
  maternity: "bg-pink-100 text-pink-700",
  paternity: "bg-purple-100 text-purple-700",
  unpaid: "bg-gray-100 text-gray-700",
  compassionate: "bg-amber-100 text-amber-700",
  study: "bg-green-100 text-green-700",
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending" },
  approved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
  cancelled: { icon: AlertCircle, color: "bg-gray-100 text-gray-700", label: "Cancelled" },
};

export default function LeaveManagement({ currentEmployee, orgId, isManager = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['leaveRequests', orgId, isManager],
    queryFn: () => isManager 
      ? base44.entities.LeaveRequest.filter({ organisation_id: orgId }, '-created_date', 100)
      : base44.entities.LeaveRequest.filter({ employee_id: currentEmployee?.id }, '-created_date', 50),
    enabled: !!orgId && !!currentEmployee?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
  });

  const handleApprove = async (request) => {
    await updateMutation.mutateAsync({
      id: request.id,
      data: {
        status: "approved",
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
        approval_date: format(new Date(), "yyyy-MM-dd"),
      }
    });
    toast({ title: "Leave request approved" });
  };

  const handleReject = async () => {
    await updateMutation.mutateAsync({
      id: selectedRequest.id,
      data: {
        status: "rejected",
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
        approval_date: format(new Date(), "yyyy-MM-dd"),
        rejection_reason: rejectionReason,
      }
    });
    toast({ title: "Leave request rejected" });
  };

  const filteredRequests = leaveRequests.filter(r => 
    statusFilter === "all" || r.status === statusFilter
  );

  const pendingCount = leaveRequests.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {isManager && pendingCount > 0 && (
            <Badge className="bg-amber-500">{pendingCount} pending</Badge>
          )}
        </div>
        {!isManager && (
          <Button onClick={() => setShowRequestDialog(true)} className="bg-[#1EB053] hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Leave Requests"
          description={isManager ? "No leave requests to review" : "You haven't submitted any leave requests"}
          action={!isManager ? () => setShowRequestDialog(true) : undefined}
          actionLabel="Request Leave"
        />
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const StatusIcon = STATUS_CONFIG[request.status]?.icon || Clock;
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${STATUS_CONFIG[request.status]?.color}`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        {isManager && (
                          <p className="font-semibold text-lg">{request.employee_name}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge className={LEAVE_TYPE_COLORS[request.leave_type]}>
                            {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)} Leave
                          </Badge>
                          <Badge variant="outline">{request.days_requested} day{request.days_requested !== 1 ? 's' : ''}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(request.start_date), "MMM d")} - {format(new Date(request.end_date), "MMM d, yyyy")}
                        </p>
                        {request.reason && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{request.reason}</p>
                        )}
                        {request.status === "rejected" && request.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">Reason: {request.rejection_reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isManager && request.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-[#1EB053] hover:bg-green-600"
                            onClick={() => handleApprove(request)}
                            disabled={updateMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {!isManager && request.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            updateMutation.mutate({
                              id: request.id,
                              data: { status: "cancelled" }
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Badge className={STATUS_CONFIG[request.status]?.color}>
                        {STATUS_CONFIG[request.status]?.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <LeaveRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        currentEmployee={currentEmployee}
        orgId={orgId}
      />

      {/* Rejection Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this leave request.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason || updateMutation.isPending}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}