import { } from "react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Calendar, Clock, Users, Video, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UpcomingMeetings({ meetings = [] }) {
  const upcomingMeetings = meetings
    .filter(m => new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const getDateLabel = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <Card className="border-t-4 border-t-[#0072C6]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0072C6]" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No upcoming meetings
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{meeting.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{meeting.start_time}</span>
                      {meeting.meeting_type === 'virtual' && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          <Video className="w-2.5 h-2.5 mr-0.5" /> Virtual
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={isToday(parseISO(meeting.date)) ? "default" : "outline"}
                    className={isToday(parseISO(meeting.date)) ? "bg-[#1EB053]" : ""}
                  >
                    {getDateLabel(meeting.date)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}