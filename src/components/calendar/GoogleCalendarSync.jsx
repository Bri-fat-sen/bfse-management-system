import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Calendar,
  ArrowRightLeft,
  Settings,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
];

const MEETING_TYPES = [
  { value: 'in_person', label: 'In Person' },
  { value: 'video', label: 'Video Call' },
  { value: 'audio', label: 'Audio Call' },
];

export default function GoogleCalendarSync({ 
  open, 
  onOpenChange, 
  orgId,
  onSyncComplete 
}) {
  const queryClient = useQueryClient();
  const [selectedCalendar, setSelectedCalendar] = useState('primary');
  const [syncSettings, setSyncSettings] = useState({
    syncTasks: true,
    syncMeetings: true,
    importFromGoogle: true,
    taskPriorities: ['urgent', 'high', 'medium'],
    meetingTypes: ['in_person', 'video', 'audio'],
  });
  const [syncResults, setSyncResults] = useState(null);

  // Fetch available calendars
  const { data: calendarsData, isLoading: loadingCalendars, error: calendarsError } = useQuery({
    queryKey: ['googleCalendars'],
    queryFn: async () => {
      const response = await base44.functions.invoke('googleCalendarSync', {
        action: 'listCalendars'
      });
      return response.data;
    },
    enabled: open,
    retry: 1,
  });

  const calendars = calendarsData?.calendars || [];

  // Full sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('googleCalendarSync', {
        action: 'fullSync',
        data: {
          orgId,
          calendarId: selectedCalendar,
          syncSettings
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSyncResults(data.results);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
      if (data.results.errors?.length > 0) {
        toast.warning(`Sync completed with ${data.results.errors.length} error(s)`);
      } else {
        toast.success(data.message);
      }
      
      onSyncComplete?.();
    },
    onError: (error) => {
      toast.error("Sync failed: " + (error.message || "Unknown error"));
    },
  });

  const togglePriority = (priority) => {
    setSyncSettings(prev => ({
      ...prev,
      taskPriorities: prev.taskPriorities.includes(priority)
        ? prev.taskPriorities.filter(p => p !== priority)
        : [...prev.taskPriorities, priority]
    }));
  };

  const toggleMeetingType = (type) => {
    setSyncSettings(prev => ({
      ...prev,
      meetingTypes: prev.meetingTypes.includes(type)
        ? prev.meetingTypes.filter(t => t !== type)
        : [...prev.meetingTypes, type]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            Google Calendar Sync
          </DialogTitle>
          <DialogDescription>
            Sync your tasks and meetings with Google Calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calendar Selection */}
          <div>
            <Label className="text-sm font-medium">Select Calendar</Label>
            {loadingCalendars ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading calendars...
              </div>
            ) : calendarsError ? (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Failed to load calendars. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map(cal => (
                    <SelectItem key={cal.id} value={cal.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cal.backgroundColor }}
                        />
                        {cal.summary}
                        {cal.primary && <Badge variant="secondary" className="ml-2">Primary</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Sync Direction */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm">Sync Direction</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sync Tasks to Google</p>
                  <p className="text-xs text-gray-500">Export tasks with due dates</p>
                </div>
                <Switch
                  checked={syncSettings.syncTasks}
                  onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, syncTasks: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sync Meetings to Google</p>
                  <p className="text-xs text-gray-500">Export scheduled meetings</p>
                </div>
                <Switch
                  checked={syncSettings.syncMeetings}
                  onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, syncMeetings: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Import from Google</p>
                  <p className="text-xs text-gray-500">Import external events as tasks</p>
                </div>
                <Switch
                  checked={syncSettings.importFromGoogle}
                  onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, importFromGoogle: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Task Filters */}
          {syncSettings.syncTasks && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Task Priority Filter</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Select which task priorities to sync</p>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map(priority => (
                    <button
                      key={priority.value}
                      onClick={() => togglePriority(priority.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        syncSettings.taskPriorities.includes(priority.value)
                          ? priority.color + " ring-2 ring-offset-1 ring-current"
                          : "bg-gray-50 text-gray-400"
                      )}
                    >
                      {syncSettings.taskPriorities.includes(priority.value) && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}
                      {priority.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meeting Filters */}
          {syncSettings.syncMeetings && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Meeting Type Filter</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Select which meeting types to sync</p>
                <div className="flex flex-wrap gap-2">
                  {MEETING_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => toggleMeetingType(type.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        syncSettings.meetingTypes.includes(type.value)
                          ? "bg-purple-100 text-purple-700 ring-2 ring-offset-1 ring-purple-400"
                          : "bg-gray-50 text-gray-400"
                      )}
                    >
                      {syncSettings.meetingTypes.includes(type.value) && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}
                      {type.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sync Results */}
          {syncResults && (
            <Card className={syncResults.errors?.length > 0 ? "border-amber-200" : "border-green-200"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {syncResults.errors?.length > 0 ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  <span className="font-medium text-sm">Sync Results</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{syncResults.exported}</p>
                    <p className="text-xs text-green-700">Exported to Google</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{syncResults.imported}</p>
                    <p className="text-xs text-blue-700">Imported from Google</p>
                  </div>
                </div>

                {syncResults.errors?.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs font-medium text-amber-800 mb-2">
                      {syncResults.errors.length} error(s) occurred:
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1 max-h-24 overflow-y-auto">
                      {syncResults.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{err.title || err.type}: {err.error}</span>
                        </li>
                      ))}
                      {syncResults.errors.length > 5 && (
                        <li className="text-amber-600">...and {syncResults.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || loadingCalendars}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Sync
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}