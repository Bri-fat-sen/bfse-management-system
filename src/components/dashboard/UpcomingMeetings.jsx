import React from "react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Calendar, Clock, Users, Video, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UpcomingMeetings({ meetings = [] }) {
  const upcomingMeetings = meetings
    .filter(m => m.status === 'scheduled' && new Date(m.date) >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const getDateLabel = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'EEE, MMM d');
  };

  const meetingTypeIcons = {
    video: Video,
    in_person: MapPin,
    audio: Users,
  };

  return (
    <Card className="border-t-4 border-t-[#0072C6]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0072C6]" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No upcoming meetings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => {
              const TypeIcon = meetingTypeIcons[meeting.meeting_type] || Users;
              return (
                <div key={meeting.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{meeting.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.start_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {meeting.meeting_type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      isToday(parseISO(meeting.date)) 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }>
                      {getDateLabel(meeting.date)}
                    </Badge>
                  </div>
                  {meeting.attendee_names?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex -space-x-2">
                        {meeting.attendee_names.slice(0, 3).map((name, i) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="text-[10px] bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                              {name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {meeting.attendee_names.length > 3 && (
                        <span className="text-xs text-gray-500 ml-1">
                          +{meeting.attendee_names.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}