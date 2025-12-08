import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/Toast";
import { Calendar, Clock, Video, Phone, Users, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import RecurringMeetingForm from "./RecurringMeetingForm";
import MeetingReminders from "./MeetingReminders";

export default function MeetingDialog({ 
  open, 
  onOpenChange, 
  employees = [],
  orgId,
  currentEmployee 
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [meetingType, setMeetingType] = useState("in_person");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState({ frequency: 'weekly', days: [], endType: 'never' });
  const [reminders, setReminders] = useState(['15']);

  const createMeetingMutation = useMutation({
    mutationFn: (data) => base44.entities.Meeting.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onOpenChange(false);
      setSelectedAttendees([]);
      toast.success("Meeting scheduled", "Meeting has been scheduled and attendees notified");
    },
    onError: (error) => {
      console.error('Create meeting error:', error);
      toast.error("Failed to schedule meeting", error.message);
    }
  });

  const toggleAttendee = (empId) => {
    setSelectedAttendees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const attendeeNames = selectedAttendees.map(id => 
      employees.find(e => e.id === id)?.full_name
    ).filter(Boolean);

    const data = {
      organisation_id: orgId,
      title: formData.get('title'),
      description: formData.get('description'),
      organizer_id: currentEmployee?.id,
      organizer_name: currentEmployee?.full_name,
      date: formData.get('date'),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
      meeting_type: meetingType,
      location: formData.get('location'),
      meeting_link: formData.get('meeting_link'),
      attendees: selectedAttendees,
      attendee_names: attendeeNames,
      status: 'scheduled',
      is_recurring: isRecurring,
      recurrence: isRecurring ? recurrence : null,
      reminders: reminders.map(r => parseInt(r)),
    };

    createMeetingMutation.mutate(data);
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: 'linear-gradient(135deg, #1EB053 0%, #0072C6 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Quick Meeting</h2>
                <p className="text-white/80 text-xs">Press Ctrl+Enter to save</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div>
              <Label className="font-medium">Meeting Title *</Label>
              <Input name="title" placeholder="Weekly Team Sync" required autoFocus className="mt-1.5" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 sm:col-span-1">
                <Label className="text-sm">Date *</Label>
                <Input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Start *</Label>
                <Input name="start_time" type="time" defaultValue="09:00" required className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">End</Label>
                <Input name="end_time" type="time" defaultValue="10:00" className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'in_person', icon: Users, label: 'In Person' },
                  { value: 'video', icon: Video, label: 'Video' },
                  { value: 'audio', icon: Phone, label: 'Phone' },
                ].map((type) => (
                  <Button key={type.value} type="button" variant={meetingType === type.value ? "default" : "outline"} className={meetingType === type.value ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6]" : ""} onClick={() => setMeetingType(type.value)} size="sm">
                    <type.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            {meetingType === 'in_person' ? (
              <div>
                <Label className="text-sm">Location</Label>
                <Input name="location" placeholder="Conference Room" className="mt-1.5" />
              </div>
            ) : (
              <div>
                <Label className="text-sm">Meeting Link</Label>
                <Input name="meeting_link" placeholder="https://..." className="mt-1.5" />
              </div>
            )}

            <div>
              <Label className="text-sm">Attendees ({selectedAttendees.length})</Label>
              <ScrollArea className="h-32 mt-1.5 border rounded-lg p-2">
                <div className="space-y-1">
                  {employees.filter(e => e.id !== currentEmployee?.id).map((emp) => (
                    <div key={emp.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer" onClick={() => toggleAttendee(emp.id)}>
                      <Checkbox checked={selectedAttendees.includes(emp.id)} />
                      <span className="text-sm flex-1">{emp.full_name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Show'} More Options
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-sm">Description</Label>
                  <Textarea name="description" placeholder="Agenda and notes..." className="mt-1.5" rows={2} />
                </div>
                <RecurringMeetingForm isRecurring={isRecurring} setIsRecurring={setIsRecurring} recurrence={recurrence} setRecurrence={setRecurrence} />
                <MeetingReminders reminders={reminders} setReminders={setReminders} />
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={createMeetingMutation.isPending} className="flex-1 text-white bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
              {createMeetingMutation.isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />Schedule</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}