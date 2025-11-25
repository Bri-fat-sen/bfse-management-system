import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInBusinessDays, format, addDays } from "date-fns";
import {
  Calendar, Umbrella, Heart, Baby, BookOpen, Clock, FileText, AlertCircle, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave", icon: Umbrella, color: "bg-blue-500", description: "Vacation / Personal time", maxDays: 21 },
  { value: "sick", label: "Sick Leave", icon: Heart, color: "bg-red-500", description: "Health related absence", maxDays: 10 },
  { value: "maternity", label: "Maternity", icon: Baby, color: "bg-pink-500", description: "Maternity leave", maxDays: 90 },
  { value: "paternity", label: "Paternity", icon: Baby, color: "bg-purple-500", description: "Paternity leave", maxDays: 14 },
  { value: "study", label: "Study Leave", icon: BookOpen, color: "bg-amber-500", description: "Educational purposes", maxDays: 5 },
  { value: "compassionate", label: "Compassionate", icon: Heart, color: "bg-gray-500", description: "Family emergencies", maxDays: 5 },
  { value: "unpaid", label: "Unpaid Leave", icon: Clock, color: "bg-slate-500", description: "Leave without pay", maxDays: 30 },
];

export default function LeaveApplicationForm({ orgId, currentEmployee, onSuccess, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LeaveRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast({ title: "Leave Request Submitted!", description: "Your request is pending approval" });
      onSuccess?.();
    },
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedLeaveType = LEAVE_TYPES.find(t => t.value === formData.leave_type);

  const daysRequested = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (end < start) return 0;
    return differenceInBusinessDays(addDays(end, 1), start);
  }, [formData.start_date, formData.end_date]);

  const isOverLimit = selectedLeaveType && daysRequested > selectedLeaveType.maxDays;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.leave_type || !formData.start_date || !formData.end_date) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (isOverLimit) {
      toast({ title: `Maximum ${selectedLeaveType.maxDays} days allowed for ${selectedLeaveType.label}`, variant: "destructive" });
      return;
    }

    createMutation.mutate({
      organisation_id: orgId,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      days_requested: daysRequested,
      reason: formData.reason,
      status: "pending",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-2xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
      
      <CardHeader className="bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] text-white pb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Leave Application</CardTitle>
            <p className="text-white/70 text-sm mt-0.5">Request time off from work</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 -mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type Selection */}
          <div>
            <Label className="text-gray-700 font-medium mb-3 block">Type of Leave</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LEAVE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField('leave_type', type.value)}
                  className={`relative p-4 rounded-xl text-left transition-all border-2 ${
                    formData.leave_type === type.value 
                      ? 'border-[#1EB053] bg-[#1EB053]/5 shadow-lg' 
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  {formData.leave_type === type.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#1EB053] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center mb-2`}>
                    <type.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Max {type.maxDays} days</p>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Type Info */}
          {selectedLeaveType && (
            <div className={`p-4 rounded-xl ${selectedLeaveType.color.replace('bg-', 'bg-').replace('-500', '-50')} border ${selectedLeaveType.color.replace('bg-', 'border-').replace('-500', '-200')}`}>
              <div className="flex items-center gap-2">
                <selectedLeaveType.icon className={`w-5 h-5 ${selectedLeaveType.color.replace('bg-', 'text-')}`} />
                <span className="font-medium">{selectedLeaveType.label}</span>
                <Badge variant="secondary" className="ml-auto">Up to {selectedLeaveType.maxDays} days</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{selectedLeaveType.description}</p>
            </div>
          )}

          {/* Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1.5 h-12"
              />
            </div>
            <div>
              <Label className="text-gray-700 font-medium">End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className="mt-1.5 h-12"
              />
            </div>
          </div>

          {/* Days Summary */}
          {daysRequested > 0 && (
            <div className={`p-4 rounded-xl flex items-center justify-between ${isOverLimit ? 'bg-red-50 border border-red-200' : 'bg-[#1EB053]/10 border border-[#1EB053]/20'}`}>
              <div className="flex items-center gap-3">
                <Calendar className={`w-5 h-5 ${isOverLimit ? 'text-red-500' : 'text-[#1EB053]'}`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(formData.start_date), 'MMM d')} - {format(new Date(formData.end_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">Working days only</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${isOverLimit ? 'text-red-500' : 'text-[#1EB053]'}`}>
                {daysRequested} {daysRequested === 1 ? 'day' : 'days'}
              </div>
            </div>
          )}

          {isOverLimit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Exceeds maximum of {selectedLeaveType.maxDays} days for {selectedLeaveType.label}</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <Label className="text-gray-700 font-medium">Reason for Leave</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => updateField('reason', e.target.value)}
              placeholder="Please provide details about your leave request..."
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !formData.leave_type || !daysRequested || isOverLimit}
              className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90"
            >
              {createMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}