import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, Upload, X, Check, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave", icon: "🏖️" },
  { value: "sick", label: "Sick Leave", icon: "🏥" },
  { value: "maternity", label: "Maternity Leave", icon: "👶" },
  { value: "paternity", label: "Paternity Leave", icon: "👨‍👧" },
  { value: "unpaid", label: "Unpaid Leave", icon: "📋" },
  { value: "compassionate", label: "Compassionate Leave", icon: "💐" },
  { value: "study", label: "Study Leave", icon: "📚" },
];

export default function LeaveRequestDialog({ 
  open, 
  onOpenChange, 
  currentEmployee, 
  orgId,
  editingRequest = null,
  organisation
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [leaveType, setLeaveType] = useState(editingRequest?.leave_type || "annual");
  const [startDate, setStartDate] = useState(editingRequest?.start_date ? new Date(editingRequest.start_date) : null);
  const [endDate, setEndDate] = useState(editingRequest?.end_date ? new Date(editingRequest.end_date) : null);
  const [reason, setReason] = useState(editingRequest?.reason || "");
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState(editingRequest?.attachment_url || "");

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  useEffect(() => {
    if (open) {
      setShowAdvanced(!!editingRequest);
    }
  }, [open, editingRequest]);

  const daysRequested = startDate && endDate 
    ? differenceInDays(endDate, startDate) + 1 
    : 0;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast.success("Leave request submitted", "Your leave request has been submitted for approval");
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Create leave request error:', error);
      toast.error("Failed to submit leave request", error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast.success("Leave request updated", "Your leave request has been updated");
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Update leave request error:', error);
      toast.error("Failed to update leave request", error.message);
    }
  });

  const resetForm = () => {
    setLeaveType("annual");
    setStartDate(null);
    setEndDate(null);
    setReason("");
    setAttachmentUrl("");
    setShowAdvanced(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachmentUrl(file_url);
      toast.success("File uploaded", "Document has been attached to your request");
    } catch (error) {
      toast.error("Failed to upload file", error.message);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    const data = {
      organisation_id: orgId,
      employee_id: currentEmployee.id,
      employee_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
      leave_type: leaveType,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      days_requested: daysRequested,
      reason,
      attachment_url: attachmentUrl,
      status: "pending"
    };

    if (editingRequest) {
      updateMutation.mutate({ id: editingRequest.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{editingRequest ? 'Edit Leave' : 'Request Leave'}</h2>
                <p className="text-white/80 text-xs">Press Ctrl+Enter to submit</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div>
              <Label className="font-medium">Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2"><span>{type.icon}</span>{type.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                <Label className="text-[#1EB053] font-medium text-xs">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1.5 justify-start text-sm border-[#1EB053]/30 bg-white">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {startDate ? format(startDate, 'PP') : 'Select'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="p-3 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                <Label className="text-[#0072C6] font-medium text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1.5 justify-start text-sm border-[#0072C6]/30 bg-white">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {endDate ? format(endDate, 'PP') : 'Select'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => date < (startDate || new Date())} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {daysRequested > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border border-[#1EB053]/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total days:</span>
                  <span className="text-2xl font-bold text-[#1EB053]">{daysRequested}</span>
                </div>
              </div>
            )}

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Add'} Details
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-sm">Reason</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you need this leave?" className="mt-1.5" rows={2} />
                </div>

                <div className="p-3 rounded-lg border bg-gray-50">
                  <Label className="text-sm mb-2 block">Document (optional)</Label>
                  {attachmentUrl ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700 flex-1">Attached</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAttachmentUrl("")} className="h-6 text-red-500">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded cursor-pointer hover:border-[#1EB053] bg-white">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{uploading ? "Uploading..." : "Upload"}</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{editingRequest ? 'Update' : 'Submit'}</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}