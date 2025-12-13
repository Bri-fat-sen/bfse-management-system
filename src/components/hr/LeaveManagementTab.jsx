import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, X, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import LeaveRequestDialog from "@/components/hr/LeaveRequestDialog";

export default function LeaveManagementTab({ orgId, leaveRequests, employees, currentEmployee }) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [filter, setFilter] = useState("pending");
  const queryClient = useQueryClient();
  const toast = useToast();

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, employeeId, leaveType, daysRequested }) => {
      await base44.entities.LeaveRequest.update(requestId, {
        status: 'approved',
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name,
        approval_date: new Date().toISOString(),
      });

      const emp = employees.find(e => e.id === employeeId);
      if (emp?.leave_balances) {
        const balanceKey = `${leaveType}_days`;
        const newBalance = Math.max(0, (emp.leave_balances[balanceKey] || 0) - daysRequested);
        
        await base44.entities.Employee.update(employeeId, {
          leave_balances: {
            ...emp.leave_balances,
            [balanceKey]: newBalance,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leaveRequests']);
      queryClient.invalidateQueries(['employees']);
      toast.success("Leave Approved");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) =>
      base44.entities.LeaveRequest.update(requestId, {
        status: 'rejected',
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name,
        approval_date: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leaveRequests']);
      toast.success("Leave Rejected");
    },
  });

  const filteredRequests = leaveRequests.filter(r => r.status === filter);

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const leaveTypeColors = {
    annual: "bg-blue-100 text-blue-800",
    sick: "bg-red-100 text-red-800",
    maternity: "bg-pink-100 text-pink-800",
    paternity: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={filter === status ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white" : ""}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => setShowRequestDialog(true)}
          className="ml-auto bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Leave Request
        </Button>
      </div>

      <div className="space-y-3">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="border shadow-sm">
            <div className="h-0.5 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{request.employee_name}</h3>
                    <Badge className={leaveTypeColors[request.leave_type]}>
                      {request.leave_type}
                    </Badge>
                    <Badge className={statusColors[request.status]}>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-gray-500">({request.days_requested} days)</span>
                    </div>
                    {request.reason && (
                      <p className="text-gray-600 mt-2">{request.reason}</p>
                    )}
                  </div>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600"
                      onClick={() => approveMutation.mutate({
                        requestId: request.id,
                        employeeId: request.employee_id,
                        leaveType: request.leave_type,
                        daysRequested: request.days_requested,
                      })}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600"
                      onClick={() => rejectMutation.mutate(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No {filter} leave requests</p>
          </div>
        )}
      </div>

      <LeaveRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        orgId={orgId}
        employees={employees}
      />
    </div>
  );
}