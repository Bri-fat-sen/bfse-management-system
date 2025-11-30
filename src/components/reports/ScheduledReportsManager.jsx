import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, addDays, addWeeks, addMonths, setHours, setMinutes } from "date-fns";
import {
  Clock,
  Mail,
  Calendar,
  Play,
  Pause,
  Trash2,
  Edit,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly"
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduledReportsManager({ orgId, currentEmployee, onEditReport, onRunReport }) {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const { data: scheduledReports = [], isLoading } = useQuery({
    queryKey: ['scheduledReports', orgId],
    queryFn: async () => {
      const reports = await base44.entities.SavedReport.filter({ organisation_id: orgId });
      return reports.filter(r => r.schedule?.enabled);
    },
    enabled: !!orgId,
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: async ({ id, enabled }) => {
      const report = scheduledReports.find(r => r.id === id);
      if (!report) return;
      return base44.entities.SavedReport.update(id, {
        schedule: { ...report.schedule, enabled }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast.success("Schedule updated");
    }
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      toast.success("Report deleted");
      setDeleteId(null);
    }
  });

  const sendReportNow = async (report) => {
    setSendingId(report.id);
    try {
      const recipients = report.schedule?.recipients || [];
      if (recipients.length === 0) {
        toast.error("No recipients configured for this report");
        return;
      }

      // Generate report HTML
      const emailBody = `
        <h2>${report.name}</h2>
        <p>${report.description || ''}</p>
        <p><strong>Report Type:</strong> ${report.report_type}</p>
        <p><strong>Date Range:</strong> ${report.filters?.start_date || 'N/A'} to ${report.filters?.end_date || 'N/A'}</p>
        <p><strong>Generated:</strong> ${format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
        <hr />
        <p>This is an automated report from your business management system. Please log in to the dashboard to view the full report with detailed data and charts.</p>
      `;

      await base44.integrations.Core.SendEmail({
        to: recipients[0],
        subject: `Scheduled Report: ${report.name}`,
        body: emailBody
      });

      // Update last_sent
      const nextRun = calculateNextRun(report.schedule);
      await base44.entities.SavedReport.update(report.id, {
        schedule: {
          ...report.schedule,
          last_sent: new Date().toISOString(),
          next_run: nextRun.toISOString()
        }
      });

      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast.success(`Report sent to ${recipients.length} recipient(s)`);
    } catch (error) {
      toast.error("Failed to send report");
    } finally {
      setSendingId(null);
    }
  };

  const calculateNextRun = (schedule) => {
    const now = new Date();
    const [hours, minutes] = (schedule.time || '09:00').split(':').map(Number);
    let nextRun = setMinutes(setHours(now, hours), minutes);

    switch (schedule.frequency) {
      case 'daily':
        if (nextRun <= now) nextRun = addDays(nextRun, 1);
        break;
      case 'weekly':
        while (nextRun.getDay() !== schedule.day_of_week || nextRun <= now) {
          nextRun = addDays(nextRun, 1);
        }
        break;
      case 'monthly':
        nextRun.setDate(schedule.day_of_month || 1);
        if (nextRun <= now) nextRun = addMonths(nextRun, 1);
        break;
    }
    return nextRun;
  };

  const getScheduleDescription = (schedule) => {
    if (!schedule) return "Not scheduled";
    
    const time = schedule.time || '09:00';
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${time}`;
      case 'weekly':
        return `Every ${DAY_LABELS[schedule.day_of_week || 1]} at ${time}`;
      case 'monthly':
        return `Monthly on day ${schedule.day_of_month || 1} at ${time}`;
      default:
        return "Unknown schedule";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1EB053]" />
            Scheduled Reports
            <Badge variant="outline" className="ml-2">
              {scheduledReports.length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {scheduledReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mb-4 text-gray-300" />
              <p className="font-medium">No scheduled reports</p>
              <p className="text-sm">Create a report and enable scheduling to automate delivery</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{report.name}</p>
                          {report.description && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">{report.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.report_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{getScheduleDescription(report.schedule)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{report.schedule?.recipients?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.schedule?.last_sent ? (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          {format(parseISO(report.schedule.last_sent), 'MMM d, h:mm a')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={report.schedule?.enabled}
                        onCheckedChange={(enabled) => 
                          toggleScheduleMutation.mutate({ id: report.id, enabled })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sendReportNow(report)}
                          disabled={sendingId === report.id}
                        >
                          {sendingId === report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRunReport?.(report)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditReport?.(report)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setDeleteId(report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduled Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report and its schedule. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReportMutation.mutate(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}