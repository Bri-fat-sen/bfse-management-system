import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit3,
  Calendar,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/Toast";

export default function WageEmployeeTimesheetApproval({ 
  periodStart, 
  periodEnd, 
  orgId, 
  currentEmployee 
}) {
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvedHours, setApprovedHours] = useState(0);
  const [approvalNotes, setApprovalNotes] = useState("");
  
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch wage employees
  const { data: employees = [] } = useQuery({
    queryKey: ['wageEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ 
      organisation_id: orgId, 
      employment_type: 'wage',
      status: 'active'
    }),
    enabled: !!orgId,
  });

  // Fetch attendance for wage employees in the period
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['wageAttendance', orgId, periodStart, periodEnd],
    queryFn: async () => {
      const allAttendance = await base44.entities.Attendance.filter({ 
        organisation_id: orgId 
      });
      
      return allAttendance.filter(a => {
        const date = new Date(a.date);
        return date >= new Date(periodStart) && date <= new Date(periodEnd) &&
               employees.some(e => e.id === a.employee_id);
      });
    },
    enabled: !!orgId && !!periodStart && !!periodEnd && employees.length > 0,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ attendanceId, hours, notes, action }) => {
      return base44.entities.Attendance.update(attendanceId, {
        timesheet_status: action === 'approve' ? 'approved' : 'overridden',
        approved_hours: hours,
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name,
        approval_date: new Date().toISOString(),
        approval_notes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wageAttendance']);
      toast.success("Timesheet Updated");
      setApprovalDialogOpen(false);
      setSelectedAttendance(null);
      setApprovalNotes("");
    },
    onError: (error) => {
      toast.error("Failed to update timesheet", error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ attendanceId, notes }) => {
      return base44.entities.Attendance.update(attendanceId, {
        timesheet_status: 'rejected',
        approved_by: currentEmployee.id,
        approved_by_name: currentEmployee.full_name,
        approval_date: new Date().toISOString(),
        approval_notes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wageAttendance']);
      toast.success("Timesheet Rejected");
    },
    onError: (error) => {
      toast.error("Failed to reject timesheet", error.message);
    },
  });

  const handleOpenApproval = (attendance, action) => {
    setSelectedAttendance({ ...attendance, action });
    setApprovedHours(attendance.total_hours || 0);
    setApprovalNotes("");
    setApprovalDialogOpen(true);
  };

  const handleSubmitApproval = () => {
    if (!selectedAttendance) return;
    
    approveMutation.mutate({
      attendanceId: selectedAttendance.id,
      hours: approvedHours,
      notes: approvalNotes,
      action: selectedAttendance.action,
    });
  };

  const handleReject = (attendance) => {
    const notes = prompt("Reason for rejection:");
    if (!notes) return;
    
    rejectMutation.mutate({
      attendanceId: attendance.id,
      notes,
    });
  };

  // Group attendance by employee
  const attendanceByEmployee = employees.map(emp => {
    const records = attendanceRecords.filter(a => a.employee_id === emp.id);
    const totalHours = records.reduce((sum, a) => sum + (a.total_hours || 0), 0);
    const pendingCount = records.filter(a => a.timesheet_status === 'pending').length;
    const approvedCount = records.filter(a => a.timesheet_status === 'approved' || a.timesheet_status === 'overridden').length;
    
    return {
      employee: emp,
      records,
      totalHours,
      pendingCount,
      approvedCount,
    };
  }).filter(item => item.records.length > 0);

  const canApprove = ['super_admin', 'org_admin'].includes(currentEmployee?.role);

  if (!canApprove) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-600">Only Super Admin and Org Admin can approve timesheets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1EB053]" />
          Wage Employee Timesheets
        </h3>
        <Badge variant="outline">
          {periodStart && periodEnd && `${format(new Date(periodStart), 'MMM d')} - ${format(new Date(periodEnd), 'MMM d, yyyy')}`}
        </Badge>
      </div>

      {attendanceByEmployee.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No wage employee attendance for this period</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attendanceByEmployee.map(({ employee, records, totalHours, pendingCount, approvedCount }) => (
            <Card key={employee.id} className="border-l-4 border-l-[#0072C6]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold">
                      {employee.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{employee.full_name}</p>
                      <p className="text-sm text-gray-500">{employee.employee_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#1EB053]">{totalHours.toFixed(1)}h</p>
                    <p className="text-xs text-gray-500">Total Hours</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Badge className="bg-amber-100 text-amber-700">
                    {pendingCount} Pending
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    {approvedCount} Approved
                  </Badge>
                </div>

                <div className="space-y-2">
                  {records.map(record => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{format(new Date(record.date), 'EEE, MMM d')}</span>
                          {record.timesheet_status === 'pending' && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Pending
                            </Badge>
                          )}
                          {record.timesheet_status === 'approved' && (
                            <Badge className="bg-green-100 text-green-700">Approved</Badge>
                          )}
                          {record.timesheet_status === 'overridden' && (
                            <Badge className="bg-blue-100 text-blue-700">Overridden</Badge>
                          )}
                          {record.timesheet_status === 'rejected' && (
                            <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{record.clock_in_time} - {record.clock_out_time || 'N/A'}</span>
                          <span className="font-semibold text-gray-900">
                            {record.approved_hours || record.total_hours || 0}h
                            {record.approved_hours && record.approved_hours !== record.total_hours && (
                              <span className="text-amber-600 ml-1">(adjusted)</span>
                            )}
                          </span>
                        </div>
                        {record.approval_notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{record.approval_notes}</p>
                        )}
                      </div>

                      {record.timesheet_status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenApproval(record, 'approve')}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenApproval(record, 'override')}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Override
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(record)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {record.timesheet_status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenApproval(record, 'override')}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAttendance?.action === 'approve' ? 'Approve Timesheet' : 'Override Hours'}
            </DialogTitle>
          </DialogHeader>

          {selectedAttendance && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">{format(new Date(selectedAttendance.date), 'EEEE, MMMM d, yyyy')}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>Clock In: {selectedAttendance.clock_in_time}</span>
                  <span>Clock Out: {selectedAttendance.clock_out_time || 'N/A'}</span>
                </div>
                <p className="mt-2 text-sm">
                  Recorded Hours: <span className="font-semibold">{selectedAttendance.total_hours || 0}h</span>
                </p>
              </div>

              <div>
                <Label>Approved Hours *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={approvedHours}
                  onChange={(e) => setApprovedHours(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the actual hours to be paid (can differ from recorded hours)
                </p>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add notes about this approval/override..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApproval}
              disabled={approveMutation.isPending}
              className="bg-[#1EB053] hover:bg-[#178f43]"
            >
              {approveMutation.isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}