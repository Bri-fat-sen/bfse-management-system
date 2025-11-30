import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  Clock, 
  Mail, 
  Plus, 
  X, 
  FileText, 
  Table2,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function ReportScheduleDialog({ open, onOpenChange, report, onSave }) {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState({
    enabled: false,
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    time: '08:00',
    format: 'pdf',
    recipients: []
  });
  const [newRecipient, setNewRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (report?.schedule) {
      setSchedule({
        enabled: report.schedule.enabled || false,
        frequency: report.schedule.frequency || 'weekly',
        day_of_week: report.schedule.day_of_week ?? 1,
        day_of_month: report.schedule.day_of_month ?? 1,
        time: report.schedule.time || '08:00',
        format: report.schedule.format || 'pdf',
        recipients: report.schedule.recipients || []
      });
    }
  }, [report]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedReport.update(report.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      toast.success('Schedule saved successfully');
      onSave?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to save schedule: ' + error.message);
    }
  });

  const handleAddRecipient = () => {
    const email = newRecipient.trim().toLowerCase();
    if (!email) return;
    
    // Basic email validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
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
    setNewRecipient('');
  };

  const handleRemoveRecipient = (email) => {
    setSchedule(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleSave = () => {
    if (schedule.enabled && schedule.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    // Calculate next run time
    const nextRun = calculateNextRun(schedule);

    updateMutation.mutate({
      schedule: {
        ...schedule,
        next_run: nextRun.toISOString()
      }
    });
  };

  const calculateNextRun = (sched) => {
    const now = new Date();
    const next = new Date();
    const [hours, minutes] = (sched.time || '08:00').split(':');
    
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (sched.frequency === 'daily') {
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    } else if (sched.frequency === 'weekly') {
      const targetDay = sched.day_of_week ?? 1;
      const currentDay = next.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0 || (daysUntil === 0 && next <= now)) {
        daysUntil += 7;
      }
      next.setDate(next.getDate() + daysUntil);
    } else if (sched.frequency === 'monthly') {
      const targetDate = sched.day_of_month ?? 1;
      next.setDate(targetDate);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
    }

    return next;
  };

  const handleSendNow = async () => {
    if (schedule.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    setIsSending(true);
    try {
      // First save the schedule
      await base44.entities.SavedReport.update(report.id, { schedule });
      
      // Then send the report
      const response = await base44.functions.invoke('sendScheduledReport', {
        report_id: report.id,
        test_mode: true
      });

      if (response.data?.success) {
        toast.success(`Report sent to ${response.data.recipients_count} recipient(s)`);
      } else {
        toast.error(response.data?.error || 'Failed to send report');
      }
    } catch (error) {
      toast.error('Failed to send report: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const nextRun = schedule.enabled ? calculateNextRun(schedule) : null;

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
            Configure automatic report generation and email delivery for "{report?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#0072C6]" />
              <div>
                <p className="font-medium">Enable Scheduled Reports</p>
                <p className="text-sm text-gray-500">Automatically send reports to recipients</p>
              </div>
            </div>
            <Switch
              checked={schedule.enabled}
              onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {schedule.enabled && (
            <>
              <Separator />

              {/* Frequency Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Frequency</Label>
                <Select 
                  value={schedule.frequency} 
                  onValueChange={(v) => setSchedule(prev => ({ ...prev, frequency: v }))}
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

                {schedule.frequency === 'weekly' && (
                  <div>
                    <Label className="text-sm font-medium">Day of Week</Label>
                    <Select 
                      value={String(schedule.day_of_week)} 
                      onValueChange={(v) => setSchedule(prev => ({ ...prev, day_of_week: parseInt(v) }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map(day => (
                          <SelectItem key={day.value} value={String(day.value)}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {schedule.frequency === 'monthly' && (
                  <div>
                    <Label className="text-sm font-medium">Day of Month</Label>
                    <Select 
                      value={String(schedule.day_of_month)} 
                      onValueChange={(v) => setSchedule(prev => ({ ...prev, day_of_month: parseInt(v) }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(28)].map((_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <Input 
                    type="time" 
                    value={schedule.time}
                    onChange={(e) => setSchedule(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Report Format */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Report Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Card 
                    className={`cursor-pointer transition-all ${schedule.format === 'pdf' ? 'ring-2 ring-[#1EB053] bg-green-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSchedule(prev => ({ ...prev, format: 'pdf' }))}
                  >
                    <CardContent className="p-3 flex flex-col items-center gap-2">
                      <FileText className={`w-5 h-5 ${schedule.format === 'pdf' ? 'text-[#1EB053]' : 'text-gray-400'}`} />
                      <span className="text-xs font-medium">PDF</span>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${schedule.format === 'csv' ? 'ring-2 ring-[#1EB053] bg-green-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSchedule(prev => ({ ...prev, format: 'csv' }))}
                  >
                    <CardContent className="p-3 flex flex-col items-center gap-2">
                      <Table2 className={`w-5 h-5 ${schedule.format === 'csv' ? 'text-[#1EB053]' : 'text-gray-400'}`} />
                      <span className="text-xs font-medium">CSV</span>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${schedule.format === 'both' ? 'ring-2 ring-[#1EB053] bg-green-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSchedule(prev => ({ ...prev, format: 'both' }))}
                  >
                    <CardContent className="p-3 flex flex-col items-center gap-2">
                      <div className="flex">
                        <FileText className={`w-4 h-4 ${schedule.format === 'both' ? 'text-[#1EB053]' : 'text-gray-400'}`} />
                        <Table2 className={`w-4 h-4 -ml-1 ${schedule.format === 'both' ? 'text-[#0072C6]' : 'text-gray-400'}`} />
                      </div>
                      <span className="text-xs font-medium">Both</span>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Recipients */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Recipients
                </Label>
                
                <div className="flex gap-2">
                  <Input 
                    type="email"
                    placeholder="Enter email address"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecipient())}
                  />
                  <Button type="button" onClick={handleAddRecipient} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {schedule.recipients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {schedule.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                        {email}
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:bg-red-100"
                          onClick={() => handleRemoveRecipient(email)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No recipients added yet</p>
                )}
              </div>

              {/* Next Run Info */}
              {nextRun && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#0072C6]" />
                    <div>
                      <p className="text-sm font-medium text-[#0072C6]">Next scheduled run</p>
                      <p className="text-xs text-blue-700">
                        {format(nextRun, 'EEEE, MMMM d, yyyy')} at {format(nextRun, 'h:mm a')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report?.schedule?.last_sent && (
                <p className="text-xs text-gray-500">
                  Last sent: {format(new Date(report.schedule.last_sent), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {schedule.enabled && schedule.recipients.length > 0 && (
            <Button 
              type="button"
              variant="outline"
              onClick={handleSendNow}
              disabled={isSending}
              className="w-full sm:w-auto gap-2 border-[#0072C6] text-[#0072C6] hover:bg-[#0072C6]/10"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Now
            </Button>
          )}
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}