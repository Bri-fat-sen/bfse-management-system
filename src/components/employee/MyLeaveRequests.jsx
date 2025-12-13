import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, CalendarDays, Clock, FileText, AlertCircle, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LeaveRequestForm from "./LeaveRequestForm";

const LEAVE_TYPE_LABELS = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  unpaid: "Unpaid Leave",
  compassionate: "Compassionate Leave",
  study: "Study Leave"
};

const STATUS_CONFIG = {
  pending: { 
    color: "bg-amber-50 border-amber-500", 
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
    iconColor: "text-amber-600"
  },
  approved: { 
    color: "bg-green-50 border-green-500", 
    badge: "bg-green-100 text-green-700",
    icon: Check,
    iconColor: "text-green-600"
  },
  rejected: { 
    color: "bg-red-50 border-red-500", 
    badge: "bg-red-100 text-red-700",
    icon: X,
    iconColor: "text-red-600"
  },
  cancelled: { 
    color: "bg-gray-50 border-gray-500", 
    badge: "bg-gray-100 text-gray-700",
    icon: X,
    iconColor: "text-gray-600"
  }
};

export default function MyLeaveRequests({ employee, orgId, onRequestLeave }) {
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['myLeaveRequests', employee?.id],
    queryFn: () => base44.entities.LeaveRequest.filter({ employee_id: employee?.id }, '-created_date'),
    enabled: !!employee?.id,
  });

  const { data: upcomingLeave = [] } = useQuery({
    queryKey: ['upcomingLeave', employee?.id],
    queryFn: async () => {
      const all = await base44.entities.LeaveRequest.filter({ 
        employee_id: employee?.id, 
        status: 'approved'
      }, '-start_date');
      const today = new Date();
      return all.filter(l => new Date(l.start_date) >= today);
    },
    enabled: !!employee?.id,
  });

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Leave Balances Card */}
      <Card className="border-0 shadow-lg">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            My Leave Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
              <Calendar className="w-6 h-6 text-[#1EB053] mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Annual Leave</p>
              <p className="text-3xl font-bold text-[#1EB053]">
                {employee?.leave_balances?.annual_days ?? 21}
              </p>
              <p className="text-xs text-gray-500">days remaining</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <FileText className="w-6 h-6 text-[#0072C6] mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Sick Leave</p>
              <p className="text-3xl font-bold text-[#0072C6]">
                {employee?.leave_balances?.sick_days ?? 10}
              </p>
              <p className="text-xs text-gray-500">days remaining</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-100 text-center">
              <CalendarDays className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Maternity</p>
              <p className="text-3xl font-bold text-pink-600">
                {employee?.leave_balances?.maternity_days ?? 90}
              </p>
              <p className="text-xs text-gray-500">days remaining</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-center">
              <CalendarDays className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Paternity</p>
              <p className="text-3xl font-bold text-purple-600">
                {employee?.leave_balances?.paternity_days ?? 5}
              </p>
              <p className="text-xs text-gray-500">days remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Leave */}
      {upcomingLeave.length > 0 && (
        <Card className="border-0 shadow-lg">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#1EB053]" />
              Upcoming Approved Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingLeave.map((leave) => (
                <div key={leave.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {LEAVE_TYPE_LABELS[leave.leave_type]}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {leave.days_requested} days
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Requests Card */}
      <Card className="border-0 shadow-lg">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#0072C6]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#1EB053]" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#0072C6]" />
            My Leave Requests
            {pendingLeaves > 0 && (
              <Badge className="bg-amber-500">{pendingLeaves} pending</Badge>
            )}
          </CardTitle>
          <Button 
            size="sm" 
            className="bg-[#1EB053] hover:bg-[#178f43]"
            onClick={() => onRequestLeave ? onRequestLeave() : setShowLeaveForm(true)}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-10 h-10 text-[#1EB053]" />
              </div>
              <p className="text-gray-500 mb-4">No leave requests yet</p>
              <Button 
                size="sm"
                onClick={() => onRequestLeave ? onRequestLeave() : setShowLeaveForm(true)}
                className="bg-[#1EB053] hover:bg-[#178f43]"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Request Your First Leave
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map((leave) => {
                const config = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
                const StatusIcon = config.icon;
                
                return (
                  <div 
                    key={leave.id} 
                    className={`p-4 rounded-lg border-l-4 ${config.color}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
                          <p className="font-semibold text-gray-900">
                            {LEAVE_TYPE_LABELS[leave.leave_type]}
                          </p>
                          <Badge className={config.badge}>
                            {leave.status}
                          </Badge>
                        </div>
                        <div className="space-y-1.5 ml-7">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(leave.start_date), 'MMM d, yyyy')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {leave.days_requested} day{leave.days_requested !== 1 ? 's' : ''}
                          </p>
                          {leave.reason && (
                            <p className="text-sm text-gray-500 mt-2 italic">"{leave.reason}"</p>
                          )}
                          {leave.rejection_reason && (
                            <div className="mt-2 p-3 bg-red-100 rounded-lg border border-red-200">
                              <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Rejection Reason:
                              </p>
                              <p className="text-sm text-red-600 mt-1">{leave.rejection_reason}</p>
                            </div>
                          )}
                          {leave.approved_by_name && leave.status === 'approved' && (
                            <p className="text-xs text-gray-500 mt-2">
                              ✓ Approved by {leave.approved_by_name} on {format(new Date(leave.approval_date), 'MMM d, yyyy')}
                            </p>
                          )}
                          {leave.approved_by_name && leave.status === 'rejected' && (
                            <p className="text-xs text-gray-500 mt-2">
                              Rejected by {leave.approved_by_name}
                            </p>
                          )}
                        </div>
                      </div>
                      {leave.attachment_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(leave.attachment_url, '_blank')}
                          className="flex-shrink-0"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Document
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {!onRequestLeave && (
        <LeaveRequestForm
          open={showLeaveForm}
          onOpenChange={setShowLeaveForm}
          employee={employee}
          orgId={orgId}
        />
      )}
    </div>
  );
}