import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Clock, User, Mail, Briefcase, Building2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";

export default function PendingJoinRequests() {
  const [activeTab, setActiveTab] = useState("pending");
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [assignedRole, setAssignedRole] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
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
  const userRole = currentEmployee?.role || user?.role;

  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ['joinRequests', orgId],
    queryFn: async () => {
      if (userRole === 'admin') {
        return base44.asServiceRole.entities.OrganisationJoinRequest.list();
      }
      return base44.entities.OrganisationJoinRequest.filter({ organisation_id: orgId });
    },
    enabled: !!orgId && ['super_admin', 'org_admin', 'admin'].includes(userRole),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, employeeData }) => {
      // Create employee
      const newEmployee = await base44.asServiceRole.entities.Employee.create(employeeData);
      
      // Update request
      await base44.asServiceRole.entities.OrganisationJoinRequest.update(requestId, {
        status: 'approved',
        approved_by: currentEmployee?.id,
        approved_by_name: currentEmployee?.full_name,
        approval_date: new Date().toISOString(),
        employee_id: newEmployee.id,
      });

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        organisation_id: employeeData.organisation_id,
        recipient_email: employeeData.user_email,
        type: 'system',
        title: 'Join Request Approved',
        message: `Your request to join ${reviewingRequest?.organisation_name} has been approved!`,
        priority: 'high',
      });

      return newEmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joinRequests'] });
      toast.success("Request Approved", "Employee profile created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Approval Failed", error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }) => {
      await base44.asServiceRole.entities.OrganisationJoinRequest.update(requestId, {
        status: 'rejected',
        approved_by: currentEmployee?.id,
        approved_by_name: currentEmployee?.full_name,
        approval_date: new Date().toISOString(),
        rejection_reason: reason,
      });

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        organisation_id: reviewingRequest.organisation_id,
        recipient_email: reviewingRequest.user_email,
        type: 'system',
        title: 'Join Request Update',
        message: `Your request to join ${reviewingRequest?.organisation_name} was not approved.`,
        priority: 'normal',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joinRequests'] });
      toast.success("Request Rejected");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Rejection Failed", error.message);
    },
  });

  const handleOpenApproval = (request) => {
    setReviewingRequest(request);
    setAssignedRole(request.requested_role || 'read_only');
    setEmployeeCode(`EMP${Date.now().toString().slice(-6)}`);
    const nameParts = request.user_name?.split(' ') || ['', ''];
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
  };

  const handleApprove = () => {
    if (!firstName || !lastName || !employeeCode) {
      toast.error("Missing Fields", "Please fill all required fields");
      return;
    }

    approveMutation.mutate({
      requestId: reviewingRequest.id,
      employeeData: {
        organisation_id: reviewingRequest.organisation_id,
        user_email: reviewingRequest.user_email,
        employee_code: employeeCode,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: assignedRole,
        status: 'active',
      },
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Reason Required", "Please provide a rejection reason");
      return;
    }

    rejectMutation.mutate({
      requestId: reviewingRequest.id,
      reason: rejectionReason,
    });
  };

  const handleCloseDialog = () => {
    setReviewingRequest(null);
    setRejectionReason("");
  };

  if (!user || !currentEmployee) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!['super_admin', 'org_admin', 'admin'].includes(userRole)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const approvedRequests = allRequests.filter(r => r.status === 'approved');
  const rejectedRequests = allRequests.filter(r => r.status === 'rejected');

  const roleOptions = [
    { value: "read_only", label: "Read Only" },
    { value: "support_staff", label: "Support Staff" },
    { value: "retail_cashier", label: "Retail Cashier" },
    { value: "vehicle_sales", label: "Vehicle Sales" },
    { value: "driver", label: "Driver" },
    { value: "warehouse_manager", label: "Warehouse Manager" },
    { value: "accountant", label: "Accountant" },
    { value: "hr_admin", label: "HR Admin" },
    { value: "payroll_admin", label: "Payroll Admin" },
    { value: "org_admin", label: "Org Admin" },
  ];

  const RequestCard = ({ request }) => (
    <Card key={request.id} className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold flex-shrink-0">
              {request.user_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{request.user_name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{request.user_email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Building2 className="w-3 h-3" />
                <span>{request.organisation_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Briefcase className="w-3 h-3" />
                <span className="capitalize">{request.requested_role?.replace(/_/g, ' ')}</span>
              </div>
              {request.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  {request.notes}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {format(new Date(request.created_date), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {request.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => handleOpenApproval(request)}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    setReviewingRequest(request);
                    setRejectionReason("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
            {request.status === 'approved' && (
              <Badge className="bg-green-100 text-green-800">Approved</Badge>
            )}
            {request.status === 'rejected' && (
              <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex h-1 rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <Card className="border-0 shadow-lg">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Join Requests</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Review and approve organisation join requests</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {pendingRequests.length} Pending
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading requests...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending requests</p>
                </div>
              ) : (
                pendingRequests.map(request => <RequestCard key={request.id} request={request} />)
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-3">
              {approvedRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Check className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No approved requests</p>
                </div>
              ) : (
                approvedRequests.map(request => <RequestCard key={request.id} request={request} />)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-3">
              {rejectedRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <X className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No rejected requests</p>
                </div>
              ) : (
                rejectedRequests.map(request => <RequestCard key={request.id} request={request} />)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      {reviewingRequest && assignedRole && (
        <Dialog open={true} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Approve Join Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
                <p className="font-semibold text-gray-900">{reviewingRequest.user_name}</p>
                <p className="text-sm text-gray-600">{reviewingRequest.user_email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Employee Code *</Label>
                <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} />
              </div>

              <div>
                <Label>Assigned Role *</Label>
                <Select value={assignedRole} onValueChange={setAssignedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
              >
                {approveMutation.isPending ? "Approving..." : "Approve & Create Employee"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      {reviewingRequest && !assignedRole && (
        <Dialog open={true} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Reject Join Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="font-semibold text-gray-900">{reviewingRequest.user_name}</p>
                <p className="text-sm text-gray-600">{reviewingRequest.user_email}</p>
              </div>

              <div>
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Explain why this request is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="h-24"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}