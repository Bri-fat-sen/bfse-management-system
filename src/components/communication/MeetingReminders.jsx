import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, differenceInMinutes, isToday } from "date-fns";
import {
  Bell,
  Clock,
  Video,
  Phone,
  Users,
  X,
  ExternalLink,
  Calendar,
  Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function MeetingReminders({ meetings = [], currentEmployeeId }) {
  const queryClient = useQueryClient();
  const [showReminder, setShowReminder] = useState(false);
  const [upcomingMeeting, setUpcomingMeeting] = useState(null);
  const [dismissedMeetings, setDismissedMeetings] = useState(new Set());

  // Check for upcoming meetings every minute
  useEffect(() => {
    const checkMeetings = () => {
      const now = new Date();
      
      for (const meeting of meetings) {
        if (!meeting.date || !meeting.start_time) continue;
        if (dismissedMeetings.has(meeting.id)) continue;
        
        const meetingDate = parseISO(meeting.date);
        if (!isToday(meetingDate)) continue;
        
        const [hours, minutes] = meeting.start_time.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const minutesUntil = differenceInMinutes(meetingDate, now);
        
        // Show reminder 15 minutes before
        if (minutesUntil > 0 && minutesUntil <= 15 && !showReminder) {
          setUpcomingMeeting({ ...meeting, minutesUntil });
          setShowReminder(true);
          break;
        }
      }
    };

    checkMeetings();
    const interval = setInterval(checkMeetings, 60000);
    return () => clearInterval(interval);
  }, [meetings, dismissedMeetings, showReminder]);

  const handleDismiss = () => {
    if (upcomingMeeting) {
      setDismissedMeetings(prev => new Set([...prev, upcomingMeeting.id]));
    }
    setShowReminder(false);
    setUpcomingMeeting(null);
  };

  const handleSnooze = (minutes) => {
    handleDismiss();
    setTimeout(() => {
      if (upcomingMeeting) {
        setUpcomingMeeting({ ...upcomingMeeting, minutesUntil: minutes });
        setShowReminder(true);
      }
    }, minutes * 60 * 1000);
    toast.success(`Reminder snoozed for ${minutes} minutes`);
  };

  const typeConfig = {
    video: { icon: Video, color: 'text-blue-600', label: 'Video Call' },
    audio: { icon: Phone, color: 'text-green-600', label: 'Audio Call' },
    in_person: { icon: Users, color: 'text-purple-600', label: 'In Person' },
  };

  if (!showReminder || !upcomingMeeting) return null;

  const config = typeConfig[upcomingMeeting.meeting_type] || typeConfig.in_person;
  const Icon = config.icon;

  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Meeting Reminder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-white ${config.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{upcomingMeeting.title}</h3>
                <p className="text-sm text-gray-600">{config.label}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {upcomingMeeting.start_time}
              </span>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                In {upcomingMeeting.minutesUntil} min
              </Badge>
            </div>

            {upcomingMeeting.location && (
              <p className="text-sm text-gray-600 mt-2">
                📍 {upcomingMeeting.location}
              </p>
            )}
          </div>

          {upcomingMeeting.meeting_link && (
            <a
              href={upcomingMeeting.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              Join Meeting
            </a>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => handleSnooze(5)} className="flex-1">
            Snooze 5 min
          </Button>
          <Button variant="outline" onClick={() => handleSnooze(10)} className="flex-1">
            Snooze 10 min
          </Button>
          <Button variant="ghost" onClick={handleDismiss}>
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RecurringMeetingOptions({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Repeat className="w-4 h-4" />
          Recurring Meeting
        </Label>
        <Switch
          checked={value?.enabled}
          onCheckedChange={(checked) => onChange({ ...value, enabled: checked })}
        />
      </div>
      
      {value?.enabled && (
        <Select
          value={value?.frequency || 'weekly'}
          onValueChange={(freq) => onChange({ ...value, frequency: freq })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}