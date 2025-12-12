import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import { Calendar, AlertCircle, Loader2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave", balanceKey: "annual_days" },
  { value: "sick", label: "Sick Leave", balanceKey: "sick_days", requiresAttachment: true },
  { value: "maternity", label: "Maternity Leave", balanceKey: "maternity_days", requiresAttachment: true },
  { value: "paternity", label: "Paternity Leave", balanceKey: "paternity_days" },
  { value: "unpaid", label: "Unpaid Leave", balanceKey: null },
  { value: "compassionate", label: "Compassionate Leave", balanceKey: null },
  { value: "study", label: "Study Leave", balanceKey: null }
];

export default function LeaveRequestForm({ open, onOpenChange, employee, orgId }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    leave_type: "annual",
    start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    reason: "",
    attachment_url: ""
  });
  const [uploading, setUploading] = useState(false);

  const { data: managers = [] } = useQuery({
    queryKey: ['hrManagers', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const selectedLeaveType = LEAVE_TYPES.find(t => t.value === formData.leave_type);
  const daysRequested = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    return differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1;
  }, [formData.start_date, formData.end_date]);

  const leaveBalance = useMemo(() => {
    if (!selectedLeaveType?.balanceKey || !employee?.leave_balances) return null;
    return employee.leave_balances[selectedLeaveType.balanceKey] ?? 0;
  }, [selectedLeaveType, employee]);

  const hasInsufficientBalance = leaveBalance !== null && daysRequested > leaveBalance;

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const leaveRequest = await base44.entities.LeaveRequest.create(data);

      // Notify manager and HR admins
      const hrAdmins = managers.filter(m => 
        ['super_admin', 'org_admin', 'hr_admin'].includes(m.role) || m.id === employee.manager_id
      );

      for (const admin of hrAdmins) {
        await base44.entities.Notification.create({
          organisation_id: orgId,
          recipient_id: admin.id,
          recipient_email: admin.email || admin.user_email,
          type: 'approval',
          title: 'New Leave Request',
          message: `${employee.full_name} requested ${daysRequested} days of ${selectedLeaveType.label} from ${format(new Date(data.start_date), 'MMM d')} to ${format(new Date(data.end_date), 'MMM d, yyyy')}`,
          priority: 'normal'
        });
      }

      return leaveRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Leave request submitted", "Your request has been sent for approval");
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to submit request", error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      leave_type: "annual",
      start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      reason: "",
      attachment_url: ""
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, attachment_url: file_url });
      toast.success("File uploaded");
    } catch (error) {
      toast.error("Upload failed", error.message);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedLeaveType?.requiresAttachment && !formData.attachment_url) {
      toast.error("Attachment required", `Please upload supporting documents for ${selectedLeaveType.label}`);
      return;
    }

    if (hasInsufficientBalance) {
      toast.error("Insufficient leave balance", `You only have ${leaveBalance} days remaining`);
      return;
    }

    createMutation.mutate({
      organisation_id: orgId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      days_requested: daysRequested,
      reason: formData.reason,
      attachment_url: formData.attachment_url,
      status: 'pending'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg [&>button]:hidden">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            Request Leave
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Leave Type</Label>
            <Select 
              value={formData.leave_type} 
              onValueChange={(v) => setFormData({ ...formData, leave_type: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      {type.balanceKey && employee?.leave_balances?.[type.balanceKey] !== undefined && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {employee.leave_balances[type.balanceKey]} days left
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {leaveBalance !== null && (
              <p className="text-xs text-gray-500 mt-1">
                Available balance: {leaveBalance} days
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
                className="mt-1"
                required
              />
            </div>
          </div>

          {daysRequested > 0 && (
            <div className={`p-3 rounded-lg ${hasInsufficientBalance ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm font-medium ${hasInsufficientBalance ? 'text-red-700' : 'text-blue-700'}`}>
                Total Days: {daysRequested}
              </p>
              {hasInsufficientBalance && (
                <div className="flex items-center gap-1 mt-1 text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <p className="text-xs">Insufficient balance ({leaveBalance} days available)</p>
                </div>
              )}
            </div>
          )}

          <div>
            <Label>Reason</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave request..."
              className="mt-1"
              rows={3}
              required
            />
          </div>

          {selectedLeaveType?.requiresAttachment && (
            <div>
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Supporting Document {selectedLeaveType.requiresAttachment && '*'}
              </Label>
              <div className="mt-1 flex gap-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={uploading}
                />
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              {formData.attachment_url && (
                <p className="text-xs text-green-600 mt-1">Document uploaded ✓</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1EB053]"
              disabled={createMutation.isPending || hasInsufficientBalance}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}