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
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

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
  
  const [formData, setFormData] = useState({
    leave_type: editingRequest?.leave_type || "annual",
    start_date: editingRequest?.start_date || "",
    end_date: editingRequest?.end_date || "",
    reason: editingRequest?.reason || "",
  });
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState(editingRequest?.attachment_url || "");

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast({ title: "Leave request submitted successfully" });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LeaveRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast({ title: "Leave request updated successfully" });
      onOpenChange(false);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAttachmentUrl(file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const daysRequested = formData.start_date && formData.end_date 
      ? differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1
      : 1;

    const data = {
      organisation_id: orgId,
      employee_id: currentEmployee.id,
      employee_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      days_requested: daysRequested,
      reason: formData.reason,
      attachment_url: attachmentUrl,
      status: "pending",
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
          <DialogTitle>{editingRequest ? "Edit Leave Request" : "Request Leave"}</DialogTitle>
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
                {LEAVE_TYPES.map((type) => (
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
                    {formData.start_date ? format(new Date(formData.start_date), "PP") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? new Date(formData.start_date) : undefined}
                    onSelect={(date) => setFormData({ 
                      ...formData, 
                      start_date: date ? format(date, "yyyy-MM-dd") : "",
                      end_date: formData.end_date && new Date(formData.end_date) < date 
                        ? format(date, "yyyy-MM-dd") 
                        : formData.end_date
                    })}
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
                    {formData.end_date ? format(new Date(formData.end_date), "PP") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date ? new Date(formData.end_date) : undefined}
                    onSelect={(date) => setFormData({ 
                      ...formData, 
                      end_date: date ? format(date, "yyyy-MM-dd") : "" 
                    })}
                    disabled={(date) => formData.start_date && date < new Date(formData.start_date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {formData.start_date && formData.end_date && (
            <p className="text-sm text-gray-500">
              Total days: {differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1}
            </p>
          )}

          <div>
            <Label>Reason</Label>
            <Textarea 
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave request"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Attachment (Optional)</Label>
            <div className="mt-1">
              <Input 
                type="file" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {attachmentUrl && (
                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 mt-1 block">
                  View uploaded file
                </a>
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
              disabled={!formData.start_date || !formData.end_date || createMutation.isPending || updateMutation.isPending}
            >
              {editingRequest ? "Update" : "Submit"} Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}