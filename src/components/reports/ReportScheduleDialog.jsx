import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Mail, 
  FileText, 
  Send, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }));

export default function ReportScheduleDialog({ open, onOpenChange, report, onUpdate }) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  
  const [schedule, setSchedule] = useState({
    enabled: false,
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    time: '08:00',
    format: 'pdf',
    recipients: [],
    subject: '',
    message: '',
    ...report?.schedule
  });

  useEffect(() => {
    if (report?.schedule) {
      setSchedule({
        enabled: false,
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: 1,
        time: '08:00',
        format: 'pdf',
        recipients: [],
        subject: '',
        message: '',
        ...report.schedule
      });
    }
  }, [report]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      toast.success('Schedule updated successfully');
      onOpenChange(false);
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to update schedule: ' + error.message);
    }
  });

  const handleSave = () => {
    if (schedule.enabled && schedule.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    // Calculate next run time
    const nextRun = calculateNextRun(schedule);

    updateMutation.mutate({
      id: report.id,
      data: {
        schedule: {
          ...schedule,
          next_run: nextRun
        }
      }
    });
  };

  const handleSendNow = async () => {
    if (schedule.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    setIsSending(true);
    try {
      // First save the current schedule
      await base44.entities.SavedReport.update(report.id, { schedule });
      
      // Then trigger the send
      const response = await base44.functions.invoke('sendScheduledReport', {
        reportId: report.id,
        manual: true
      });

      if (response.data?.success) {
        toast.success('Report sent successfully!');
        queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      } else {
        toast.error('Failed to send report: ' + (response.data?.error || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Failed to send report: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const addRecipient = () => {
    const email = newRecipient.trim().toLowerCase();
    if (!email) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (schedule.recipients.includes(email)) {
      toast.error('Email already added');
      return;
    }

    setSchedule(prev => ({
      ...prev,
      recipients: [...prev.recipients, email]
    }));
    setNewRecipient("");
  };

  const removeRecipient = (email) => {
    setSchedule(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const calculateNextRun = (sched) => {
    const now = new Date();
    const [hours, minutes] = (sched.time || '08:00').split(':').map(Number);
    let next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    switch (sched.frequency) {
      case 'daily':
        if (next <= now) next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        const targetDay = sched.day_of_week || 1;
        let daysUntil = targetDay - now.getDay();
        if (daysUntil <= 0 || (daysUntil === 0 && next <= now)) daysUntil += 7;
        next.setDate(next.getDate() + daysUntil);
        break;
      case 'monthly':
        next.setDate(sched.day_of_month || 1);
        if (next <= now) next.setMonth(next.getMonth() + 1);
        break;
    }
    return next.toISOString();
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            Schedule Report
          </DialogTitle>
          <DialogDescription>
            Configure automatic delivery for "{report.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Automated Delivery</p>
                <p className="text-sm text-gray-500">Send report automatically</p>
              </div>
            </div>
            <Switch
              checked={schedule.enabled}
              onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {/* Last Status */}
          {schedule.last_sent && (
            <div className={`flex items-center gap-3 p-3 rounded-lg ${schedule.last_status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              {schedule.last_status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium">Last sent: {format(new Date(schedule.last_sent), 'MMM d, yyyy h:mm a')}</p>
                {schedule.last_error && <p className="text-xs text-red-600">{schedule.last_error}</p>}
              </div>
            </div>
          )}

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={schedule.frequency}
              onValueChange={(value) => setSchedule(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day Selection */}
          {schedule.frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={String(schedule.day_of_week)}
                onValueChange={(value) => setSchedule(prev => ({ ...prev, day_of_week: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {schedule.frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>Day of Month</Label>
              <Select
                value={String(schedule.day_of_month)}
                onValueChange={(value) => setSchedule(prev => ({ ...prev, day_of_month: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_MONTH.map(day => (
                    <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time */}
          <div className="space-y-2">
            <Label>Time (24-hour format)</Label>
            <Input
              type="time"
              value={schedule.time}
              onChange={(e) => setSchedule(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Report Format</Label>
            <Select
              value={schedule.format}
              onValueChange={(value) => setSchedule(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="both">Both PDF & CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
              />
              <Button type="button" variant="outline" onClick={addRecipient}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {schedule.recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {schedule.recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1 py-1">
                    <Mail className="w-3 h-3" />
                    {email}
                    <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Custom Subject */}
          <div className="space-y-2">
            <Label>Email Subject (Optional)</Label>
            <Input
              placeholder={`${report.name} - Scheduled Report`}
              value={schedule.subject}
              onChange={(e) => setSchedule(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label>Email Message (Optional)</Label>
            <Textarea
              placeholder="Please find attached your scheduled report..."
              value={schedule.message}
              onChange={(e) => setSchedule(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Next Run Preview */}
          {schedule.enabled && schedule.recipients.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Next Scheduled Run</p>
              <p className="text-sm text-blue-600">
                {format(new Date(calculateNextRun(schedule)), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSendNow}
            disabled={isSending || schedule.recipients.length === 0}
            className="w-full sm:w-auto"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}