import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, CheckCircle2, XCircle, Clock, Mail, User, Briefcase, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OrganisationRequests() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const isAdmin = ['super_admin', 'org_admin'].includes(currentEmployee?.role);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['joinRequests', orgId],
    queryFn: () => base44.entities.OrganisationJoinRequest.filter({ organisation_id: orgId }),
    enabled: !!orgId && isAdmin,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ requestId, approved, reason, empCode }) => {
      await base44.asServiceRole.entities.OrganisationJoinRequest.update(requestId, {
        status: approved ? 'approved' : 'rejected',
        reviewed_by: currentEmployee.id,
        reviewed_by_name: currentEmployee.full_name,
        reviewed_date: new Date().toISOString(),
        rejection_reason: reason || null
      });

      if (approved) {
        const request = requests.find(r => r.id === requestId);
        await base44.asServiceRole.entities.Employee.create({
          organisation_id: request.organisation_id,
          employee_code: empCode,
          user_email: request.user_email,
          first_name: request.user_name.split(' ')[0],
          last_name: request.user_name.split(' ').slice(1).join(' ') || request.user_name.split(' ')[0],
          full_name: request.user_name,
          role: request.requested_role,
          status: 'active'
        });

        await base44.asServiceRole.entities.Notification.create({
          organisation_id: request.organisation_id,
          recipient_email: request.user_email,
          type: 'system',
          title: 'Request Approved',
          message: `Your request to join ${request.organisation_name} has been approved. You can now access the system.`,
          priority: 'high'
        });
      } else {
        const request = requests.find(r => r.id === requestId);
        await base44.asServiceRole.entities.Notification.create({
          organisation_id: request.organisation_id,
          recipient_email: request.user_email,
          type: 'system',
          title: 'Request Rejected',
          message: `Your request to join ${request.organisation_name} was not approved. ${reason || ''}`,
          priority: 'normal'
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['joinRequests'] });
      toast.success(
        variables.approved ? "Request Approved" : "Request Rejected",
        variables.approved ? "Employee profile created and user notified" : "User has been notified"
      );
      setReviewDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
      setEmployeeCode("");
    },
    onError: (error) => {
      toast.error("Action Failed", error.message);
    }
  });

  if (!user || !currentEmployee) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <XCircle className="w-16 h-16 text-red-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only admins can review organisation requests.</p>
      </div>
    );
  }

  const openReview = (request, approveAction) => {
    setSelectedRequest(request);
    setAction(approveAction);
    setEmployeeCode(request.user_email.split('@')[0]);
    setReviewDialog(true);
  };

  const handleReview = () => {
    if (action === 'approve' && !employeeCode) {
      toast.error("Employee Code Required", "Please enter an employee code");
      return;
    }
    if (action === 'reject' && !rejectionReason) {
      toast.error("Reason Required", "Please provide a reason for rejection");
      return;
    }

    reviewMutation.mutate({
      requestId: selectedRequest.id,
      approved: action === 'approve',
      reason: rejectionReason,
      empCode: employeeCode
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return <LoadingSpinner message="Loading requests..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="h-1 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <Card className="border-t-4 border-t-[#1EB053]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1EB053]" />
            Organisation Join Requests
            {pendingRequests.length > 0 && (
              <Badge className="bg-[#1EB053] text-white ml-auto">
                {pendingRequests.length} Pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {pendingRequests.length === 0 && reviewedRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No join requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="p-4 border-2 border-amber-200 bg-amber-50 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1EB053] text-white rounded-full flex items-center justify-center font-bold">
                              {request.user_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{request.user_name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {request.user_email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Requested Role:</span>
                            <Badge className="bg-blue-100 text-blue-700">
                              {request.requested_role}
                            </Badge>
                          </div>
                          {request.message && (
                            <div className="flex gap-2 text-sm">
                              <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700 italic">"{request.message}"</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Requested: {format(new Date(request.created_date), 'PPp')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => openReview(request, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReview(request, 'reject')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reviewedRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {reviewedRequests.map(request => (
                      <div key={request.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{request.user_name}</p>
                              <p className="text-xs text-gray-500">{request.user_email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {request.status === 'approved' ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              by {request.reviewed_by_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedRequest.user_name}</p>
                <p className="text-sm text-gray-600">{selectedRequest.user_email}</p>
                <Badge className="mt-2">{selectedRequest.requested_role}</Badge>
              </div>

              {action === 'approve' ? (
                <div>
                  <Label>Employee Code *</Label>
                  <Input
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="e.g., EMP001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be the employee's unique identifier
                  </p>
                </div>
              ) : (
                <div>
                  <Label>Reason for Rejection *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this request was rejected..."
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReview}
                  disabled={reviewMutation.isPending}
                  className={`flex-1 ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {reviewMutation.isPending ? 'Processing...' : action === 'approve' ? 'Approve & Create Employee' : 'Reject Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}