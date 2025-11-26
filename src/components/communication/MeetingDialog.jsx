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
import { toast } from "sonner";
import { Calendar, Clock, Video, Phone, Users, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MeetingDialog({ 
  open, 
  onOpenChange, 
  employees = [],
  orgId,
  currentEmployee 
}) {
  const queryClient = useQueryClient();
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [meetingType, setMeetingType] = useState("in_person");

  const createMeetingMutation = useMutation({
    mutationFn: (data) => base44.entities.Meeting.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onOpenChange(false);
      setSelectedAttendees([]);
      toast({ title: "Meeting scheduled successfully" });
    },
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
    };

    createMeetingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0072C6]" />
            Schedule Meeting
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Meeting Title</Label>
            <Input name="title" placeholder="Weekly Team Sync" required className="mt-1" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea name="description" placeholder="Meeting agenda and notes..." className="mt-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Date</Label>
              <Input 
                name="date" 
                type="date" 
                defaultValue={format(new Date(), 'yyyy-MM-dd')}
                required 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input name="start_time" type="time" defaultValue="09:00" required className="mt-1" />
            </div>
            <div>
              <Label>End Time</Label>
              <Input name="end_time" type="time" defaultValue="10:00" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Meeting Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: 'in_person', icon: Users, label: 'In Person' },
                { value: 'video', icon: Video, label: 'Video' },
                { value: 'audio', icon: Phone, label: 'Audio' },
              ].map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={meetingType === type.value ? "default" : "outline"}
                  className={`${meetingType === type.value ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6]" : ""} text-xs sm:text-sm px-2 sm:px-4`}
                  onClick={() => setMeetingType(type.value)}
                >
                  <type.icon className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {meetingType === 'in_person' ? (
            <div>
              <Label>Location</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input name="location" placeholder="Conference Room A" className="pl-10" />
              </div>
            </div>
          ) : (
            <div>
              <Label>Meeting Link</Label>
              <Input name="meeting_link" placeholder="https://meet.google.com/..." className="mt-1" />
            </div>
          )}

          <div>
            <Label>Attendees</Label>
            <ScrollArea className="h-40 mt-2 border rounded-lg p-2">
              <div className="space-y-2">
                {employees
                  .filter(e => e.id !== currentEmployee?.id)
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleAttendee(emp.id)}
                    >
                      <Checkbox checked={selectedAttendees.includes(emp.id)} />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={emp.profile_photo} />
                        <AvatarFallback className="bg-[#1EB053] text-white text-xs">
                          {emp.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{emp.full_name}</p>
                        <p className="text-xs text-gray-500">{emp.position || emp.department}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
            {selectedAttendees.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedAttendees.length} attendee(s) selected
              </p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto" disabled={createMeetingMutation.isPending}>
              {createMeetingMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}