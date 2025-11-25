import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, addDays } from "date-fns";
import { Calendar as CalendarIcon, Upload } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "compassionate", label: "Compassionate Leave" },
  { value: "study", label: "Study Leave" },
];

export default function LeaveRequestDialog({ 
  open, 
  onOpenChange, 
  currentEmployee, 
  orgId,
  editingRequest = null 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [leaveType, setLeaveType] = useState(editingRequest?.leave_type || "annual");
  const [startDate, setStartDate] = useState(editingRequest?.start_date ? new Date(editingRequest.start_date) : null);
  const [endDate, setEndDate] = useState(editingRequest?.end_date ? new Date(editingRequest.end_date) : null);
  const [reason, setReason] = useState(editingRequest?.reason || "");
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState(editingRequest?.attachment_url || "");

  const daysRequested = startDate && endDate 
    ? differenceInDays(endDate, startDate) + 1 
    : 0;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast({ title: "Leave request submitted successfully" });
      onOpenChange(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast({ title: "Leave request updated successfully" });
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setLeaveType("annual");
    setStartDate(null);
    setEndDate(null);
    setReason("");
    setAttachmentUrl("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachmentUrl(file_url);
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload file", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast({ title: "Please select start and end dates", variant: "destructive" });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingRequest ? 'Edit Leave Request' : 'Request Leave'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Leave Type</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-1 justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {startDate ? format(startDate, 'PP') : 'Select'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-1 justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {endDate ? format(endDate, 'PP') : 'Select'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < (startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {daysRequested > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              Total days requested: <strong>{daysRequested}</strong>
            </div>
          )}

          <div>
            <Label>Reason</Label>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for your leave request..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Supporting Document (Optional)</Label>
            <div className="mt-1">
              {attachmentUrl ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700 flex-1 truncate">Document attached</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAttachmentUrl("")}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#1EB053] transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {uploading ? "Uploading..." : "Click to upload"}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1EB053] hover:bg-green-600"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingRequest ? 'Update Request' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}