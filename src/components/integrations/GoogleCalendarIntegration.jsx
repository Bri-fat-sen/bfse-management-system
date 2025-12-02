import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import {
  Calendar,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Zap,
  Bell,
  Trash2,
  Edit,
  Video
} from "lucide-react";
import { format, addDays, startOfDay, endOfDay } from "date-fns";

export default function GoogleCalendarIntegration() {
  const queryClient = useQueryClient();
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [newEvent, setNewEvent] = useState({
    summary: "",
    description: "",
    start: "",
    end: "",
    location: "",
    attendees: ""
  });

  // Fetch calendars
  const { data: calendarData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['googleCalendars'],
    queryFn: async () => {
      const res = await base44.functions.invoke('googleCalendarSync', { action: 'listCalendars' });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch upcoming events - must be before any conditional returns
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['googleEvents', selectedCalendar, calendarData],
    queryFn: async () => {
      const calendars = calendarData?.calendars || [];
      const primaryCalendar = calendars.find(c => c.primary) || calendars[0];
      const calId = selectedCalendar || primaryCalendar?.id;
      if (!calId) return { events: [] };
      const res = await base44.functions.invoke('googleCalendarSync', { 
        action: 'listEvents',
        calendarId: calId,
        timeMin: new Date().toISOString(),
        timeMax: addDays(new Date(), 30).toISOString(),
        maxResults: 20
      });
      return res.data;
    },
    enabled: !!(calendarData?.calendars?.length > 0),
    staleTime: 60 * 1000,
  });

  // Create event mutation - must be before any conditional returns
  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const calendars = calendarData?.calendars || [];
      const primaryCalendar = calendars.find(c => c.primary) || calendars[0];
      const res = await base44.functions.invoke('googleCalendarSync', {
        action: 'createEvent',
        calendarId: selectedCalendar || primaryCalendar?.id,
        event: eventData
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ['googleEvents'] });
      setShowNewEvent(false);
      setNewEvent({ summary: "", description: "", start: "", end: "", location: "", attendees: "" });
    },
    onError: (error) => {
      toast.error("Failed to create event: " + error.message);
    }
  });

  // Derived data - after hooks
  const calendars = calendarData?.calendars || [];
  const primaryCalendar = calendars.find(c => c.primary) || calendars[0];
  const events = eventsData?.events || [];

  const handleCreateEvent = () => {
    if (!newEvent.summary || !newEvent.start || !newEvent.end) {
      toast.error("Please fill in required fields");
      return;
    }

    const eventData = {
      summary: newEvent.summary,
      description: newEvent.description,
      start: { dateTime: new Date(newEvent.start).toISOString() },
      end: { dateTime: new Date(newEvent.end).toISOString() },
      location: newEvent.location,
      attendees: newEvent.attendees ? newEvent.attendees.split(',').map(e => ({ email: e.trim() })) : []
    };

    createEventMutation.mutate(eventData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (calendarData?.error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calendar Not Connected</h3>
          <p className="text-gray-500 mb-4">Connect your Google Calendar to sync events.</p>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Calendar className="w-4 h-4 mr-2" /> Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Google Calendar</h2>
                <p className="text-blue-100">
                  {calendars.length} calendar{calendars.length !== 1 ? 's' : ''} connected
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowNewEvent(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Event
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-gray-500">Upcoming Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{calendars.length}</p>
              <p className="text-xs text-gray-500">Calendars</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{events.filter(e => e.hangoutLink).length}</p>
              <p className="text-xs text-gray-500">Video Meetings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{events.filter(e => new Date(e.start?.dateTime) <= addDays(new Date(), 7)).length}</p>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendars List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Calendars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {calendars.map((cal) => (
              <button
                key={cal.id}
                onClick={() => setSelectedCalendar(cal.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  (selectedCalendar || primaryCalendar?.id) === cal.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cal.backgroundColor || '#4285f4' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cal.summary}</p>
                    <p className="text-xs text-gray-500">{cal.primary ? 'Primary' : 'Secondary'}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Upcoming Events</span>
              <Badge variant="secondary">{events.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{event.summary}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.start?.dateTime 
                              ? format(new Date(event.start.dateTime), 'MMM d, h:mm a')
                              : event.start?.date
                            }
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                          {event.attendees?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.attendees.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {event.hangoutLink && (
                          <a 
                            href={event.hangoutLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}
                        <a 
                          href={event.htmlLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Calendar Sync Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <p className="font-medium">Sync tasks to calendar</p>
                  <p className="text-xs text-gray-500">Auto-create calendar events for due tasks</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><Users className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="font-medium">Sync meetings</p>
                  <p className="text-xs text-gray-500">Keep communication meetings in sync</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><Bell className="w-4 h-4 text-orange-600" /></div>
                <div>
                  <p className="font-medium">Leave request reminders</p>
                  <p className="text-xs text-gray-500">Add employee leave to calendar</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Event Dialog */}
      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Calendar Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={newEvent.summary}
                onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start *</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                />
              </div>
              <div>
                <Label>End *</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.end}
                  onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Event location"
              />
            </div>
            <div>
              <Label>Attendees (comma separated emails)</Label>
              <Input
                value={newEvent.attendees}
                onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEvent(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateEvent} 
              className="bg-blue-500"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}