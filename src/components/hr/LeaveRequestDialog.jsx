import React, { useState, useEffect } from "react";
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
  const [activeSection, setActiveSection] = useState('type');
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");

  useEffect(() => {
    if (open) {
      if (editingRequest) {
        setLeaveType(editingRequest.leave_type || "annual");
        setStartDate(editingRequest.start_date ? new Date(editingRequest.start_date) : null);
        setEndDate(editingRequest.end_date ? new Date(editingRequest.end_date) : null);
        setReason(editingRequest.reason || "");
        setAttachmentUrl(editingRequest.attachment_url || "");
      } else {
        resetForm();
      }
      setActiveSection('type');
    }
  }, [open, editingRequest]);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

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
    setActiveSection('type');
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

  const sections = [
    { id: 'type', label: 'Leave Type', icon: CalendarIcon },
    { id: 'details', label: 'Details', icon: FileText },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingRequest ? 'Edit Leave Request' : 'Request Leave'}
                </h2>
                <p className="text-white/80 text-sm">Submit your leave application</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6">
            
            {/* Type Section */}
            {activeSection === 'type' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <CalendarIcon className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Leave Type & Dates</h3>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger className="mt-1.5 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-2 justify-start text-sm border-[#1EB053]/30 bg-white">
                          <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{startDate ? format(startDate, 'PP') : 'Select'}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-[#0072C6]/30 bg-[#0072C6]/5">
                    <Label className="text-[#0072C6] font-medium">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-2 justify-start text-sm border-[#0072C6]/30 bg-white">
                          <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{endDate ? format(endDate, 'PP') : 'Select'}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border border-[#1EB053]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total days requested:</span>
                      <span className="text-2xl font-bold text-[#1EB053]">{daysRequested}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <FileText className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Additional Details</h3>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Reason</Label>
                  <Textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for your leave request..."
                    className="mt-1.5 border-gray-200"
                    rows={4}
                  />
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <Label className="text-gray-700 font-medium flex items-center gap-2 mb-3">
                    <Upload className="w-4 h-4" /> Supporting Document (Optional)
                  </Label>
                  {attachmentUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-700">Document attached</p>
                        <p className="text-xs text-green-600">File uploaded successfully</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setAttachmentUrl("")}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#1EB053] transition-colors bg-white">
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
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{editingRequest ? 'Update Request' : 'Submit Request'}</>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}