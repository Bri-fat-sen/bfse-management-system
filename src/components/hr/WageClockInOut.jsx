import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, LogIn, LogOut, MapPin, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";

export default function WageClockInOut({ employee, orgId }) {
  const [location, setLocation] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const today = new Date().toISOString().split('T')[0];

  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance', employee?.id, today],
    queryFn: async () => {
      const records = await base44.entities.Attendance.filter({ 
        employee_id: employee.id,
        date: today
      });
      return records[0];
    },
    enabled: !!employee?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: schedule } = useQuery({
    queryKey: ['mySchedule', employee?.id],
    queryFn: async () => {
      const schedules = await base44.entities.WorkSchedule.filter({ 
        employee_id: employee.id,
        is_active: true
      });
      return schedules[0];
    },
    enabled: !!employee?.id,
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      
      return base44.entities.Attendance.create({
        organisation_id: orgId,
        employee_id: employee.id,
        employee_name: employee.full_name,
        date: today,
        clock_in_time: timeString,
        clock_in_location: location || 'Not specified',
        clock_in_device: navigator.userAgent,
        status: 'present',
        timesheet_status: 'pending',
        scheduled_hours: schedule?.expected_hours_per_day || 8,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todayAttendance']);
      toast.success("Clocked In", `Time: ${new Date().toLocaleTimeString()}`);
      setLocation("");
    },
    onError: (error) => {
      toast.error("Clock In Failed", error.message);
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      
      const clockInTime = todayAttendance.clock_in_time;
      const [inHours, inMinutes] = clockInTime.split(':').map(Number);
      const clockInDate = new Date();
      clockInDate.setHours(inHours, inMinutes, 0);
      
      const totalMinutes = (now - clockInDate) / 1000 / 60;
      const totalHours = Math.max(0, totalMinutes / 60);
      
      const scheduledHours = todayAttendance.scheduled_hours || 8;
      const overtimeHours = Math.max(0, totalHours - scheduledHours);
      
      return base44.entities.Attendance.update(todayAttendance.id, {
        clock_out_time: timeString,
        clock_out_location: location || 'Not specified',
        clock_out_device: navigator.userAgent,
        total_hours: totalHours,
        overtime_hours: overtimeHours,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todayAttendance']);
      toast.success("Clocked Out", `Total hours: ${todayAttendance?.total_hours?.toFixed(2) || 0}`);
      setLocation("");
    },
    onError: (error) => {
      toast.error("Clock Out Failed", error.message);
    },
  });

  const isClockedIn = todayAttendance && todayAttendance.clock_in_time && !todayAttendance.clock_out_time;
  const hasFinishedToday = todayAttendance && todayAttendance.clock_out_time;

  if (employee?.employment_type !== 'wage') {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-[#1EB053]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1EB053]" />
            Clock In/Out
          </div>
          <Badge variant={isClockedIn ? "default" : "outline"} className={isClockedIn ? "bg-green-500" : ""}>
            {isClockedIn ? "Clocked In" : hasFinishedToday ? "Completed" : "Not Clocked In"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Today</p>
            <p className="text-lg font-bold">{format(new Date(), 'EEEE, MMMM d')}</p>
            <p className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</p>
          </div>
          {schedule && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="font-semibold">{schedule.start_time} - {schedule.end_time}</p>
              <p className="text-xs text-gray-500">{schedule.expected_hours_per_day}h</p>
            </div>
          )}
        </div>

        {todayAttendance && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Clock In</p>
              <p className="font-semibold text-lg">{todayAttendance.clock_in_time}</p>
              {todayAttendance.clock_in_location && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {todayAttendance.clock_in_location}
                </p>
              )}
            </div>
            {todayAttendance.clock_out_time && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 mb-1">Clock Out</p>
                <p className="font-semibold text-lg">{todayAttendance.clock_out_time}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  {todayAttendance.total_hours?.toFixed(2)}h worked
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Location (Optional)</label>
            <div className="flex gap-2 mt-1">
              <MapPin className="w-5 h-5 text-gray-400 mt-2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {!hasFinishedToday && (
            <Button
              onClick={() => isClockedIn ? clockOutMutation.mutate() : clockInMutation.mutate()}
              disabled={clockInMutation.isPending || clockOutMutation.isPending}
              className={`w-full ${isClockedIn ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#1EB053] hover:bg-[#178f43]'}`}
              size="lg"
            >
              {isClockedIn ? (
                <>
                  <LogOut className="w-5 h-5 mr-2" />
                  Clock Out
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Clock In
                </>
              )}
            </Button>
          )}

          {hasFinishedToday && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-700">Day Complete</p>
              <p className="text-sm text-gray-600">Total: {todayAttendance.total_hours?.toFixed(2)}h</p>
              {todayAttendance.timesheet_status === 'pending' && (
                <Badge variant="outline" className="mt-2">Awaiting Approval</Badge>
              )}
              {todayAttendance.timesheet_status === 'approved' && (
                <Badge className="mt-2 bg-green-600">Approved</Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}