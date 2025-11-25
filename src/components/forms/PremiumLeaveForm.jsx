import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { differenceInBusinessDays, format, addDays } from "date-fns";
import {
  CalendarDays,
  Palmtree,
  Stethoscope,
  Baby,
  Heart,
  GraduationCap,
  Wallet,
  Upload,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave", icon: Palmtree, color: "bg-green-500", description: "Vacation time off", maxDays: 21 },
  { value: "sick", label: "Sick Leave", icon: Stethoscope, color: "bg-red-500", description: "Medical reasons", maxDays: 14 },
  { value: "maternity", label: "Maternity", icon: Baby, color: "bg-pink-500", description: "Childbirth leave", maxDays: 90 },
  { value: "paternity", label: "Paternity", icon: Baby, color: "bg-blue-500", description: "New father leave", maxDays: 14 },
  { value: "compassionate", label: "Compassionate", icon: Heart, color: "bg-purple-500", description: "Family emergency", maxDays: 5 },
  { value: "study", label: "Study Leave", icon: GraduationCap, color: "bg-amber-500", description: "Educational purposes", maxDays: 10 },
  { value: "unpaid", label: "Unpaid Leave", icon: Wallet, color: "bg-gray-500", description: "Leave without pay", maxDays: 30 },
];

export default function PremiumLeaveForm({ open, onOpenChange, orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    attachment_url: "",
  });

  const [errors, setErrors] = useState({});

  const selectedLeaveType = LEAVE_TYPES.find(lt => lt.value === formData.leave_type);

  const daysRequested = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (end < start) return 0;
    return differenceInBusinessDays(end, start) + 1;
  }, [formData.start_date, formData.end_date]);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create({
      organisation_id: orgId,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      days_requested: daysRequested,
      reason: data.reason,
      attachment_url: data.attachment_url,
      status: "pending"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast({ 
        title: "Leave Request Submitted",
        description: `Your ${selectedLeaveType?.label} request for ${daysRequested} day(s) has been submitted.`
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      leave_type: "", start_date: "", end_date: "", reason: "", attachment_url: ""
    });
    setErrors({});
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, attachment_url: file_url });
      toast({ title: "File uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.leave_type) newErrors.leave_type = "Please select a leave type";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }
    if (!formData.reason.trim()) newErrors.reason = "Please provide a reason";
    
    // Check max days
    if (selectedLeaveType && daysRequested > selectedLeaveType.maxDays) {
      newErrors.end_date = `Maximum ${selectedLeaveType.maxDays} days allowed for ${selectedLeaveType.label}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      mutation.mutate(formData);
    }
  };

  const setQuickDates = (days) => {
    const start = new Date();
    const end = addDays(start, days - 1);
    setFormData({
      ...formData,
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd')
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1EB053] to-[#0072C6]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          <DialogHeader className="relative p-6 text-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              Request Leave
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1">
              Submit your time-off request for approval
            </p>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[450px] space-y-6">
          {/* Leave Type Selection */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Leave Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              {LEAVE_TYPES.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, leave_type: type.value })}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all text-left ${
                    formData.leave_type === type.value
                      ? 'border-[#1EB053] bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center flex-shrink-0`}>
                    <type.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-gray-500 truncate">{type.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            {errors.leave_type && <p className="text-red-500 text-xs mt-2">{errors.leave_type}</p>}
          </div>

          {/* Selected Leave Info */}
          {selectedLeaveType && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3"
            >
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800">
                  <strong>{selectedLeaveType.label}</strong> allows up to <strong>{selectedLeaveType.maxDays} days</strong>
                </p>
              </div>
            </motion.div>
          )}

          {/* Quick Date Selection */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Quick Select</Label>
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 5, 7, 14].map((days) => (
                <Button
                  key={days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDates(days)}
                  className="hover:bg-[#1EB053]/10 hover:border-[#1EB053]"
                >
                  {days} {days === 1 ? 'day' : 'days'}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Start Date *</Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.start_date}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={`pl-10 h-11 ${errors.start_date ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">End Date *</Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.end_date}
                  min={formData.start_date || format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={`pl-10 h-11 ${errors.end_date ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Days Summary */}
          {daysRequested > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl border-2 text-center ${
                selectedLeaveType && daysRequested > selectedLeaveType.maxDays
                  ? 'bg-red-50 border-red-300'
                  : 'bg-green-50 border-green-300'
              }`}
            >
              <p className="text-3xl font-bold text-gray-900">{daysRequested}</p>
              <p className="text-sm text-gray-600">Working {daysRequested === 1 ? 'Day' : 'Days'} Requested</p>
              {formData.start_date && formData.end_date && (
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(formData.start_date), 'MMM d')} - {format(new Date(formData.end_date), 'MMM d, yyyy')}
                </p>
              )}
            </motion.div>
          )}

          {/* Reason */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Reason *</Label>
            <div className="relative mt-1.5">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please explain the reason for your leave request..."
                className={`pl-10 min-h-[100px] ${errors.reason ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Supporting Document */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Supporting Document
              {formData.leave_type === 'sick' && <span className="text-red-500 ml-1">(Recommended)</span>}
            </Label>
            {formData.attachment_url ? (
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">Document uploaded</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, attachment_url: "" })}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1EB053] hover:bg-green-50 transition-all">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-[#1EB053] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload medical certificate or document</span>
                  </>
                )}
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] px-6"
          >
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Submit Request</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}