import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, MapPin, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/Toast";

export default function QuickClockIn({ currentEmployee, orgId, todayAttendance }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isClockedIn = todayAttendance?.clock_in_time && !todayAttendance?.clock_out_time;
  const isClockedOut = todayAttendance?.clock_out_time;

  const getLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        () => {
          setLocation("Location unavailable");
          setIsLocating(false);
        }
      );
    } else {
      setLocation("Geolocation not supported");
      setIsLocating(false);
    }
  };

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      return base44.entities.Attendance.create({
        organisation_id: orgId,
        employee_id: currentEmployee?.id,
        employee_name: currentEmployee?.full_name,
        date: format(now, 'yyyy-MM-dd'),
        clock_in_time: format(now, 'HH:mm'),
        clock_in_location: location || 'Unknown',
        clock_in_device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        status: 'present'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['allAttendance'] });
      toast.success("Clocked In", `Welcome, ${currentEmployee?.first_name}!`);
    },
    onError: (error) => {
      console.error('Clock in error:', error);
      toast.error("Clock in failed", error.message || "Please try again");
    }
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const clockInTime = todayAttendance?.clock_in_time;
      const [inHours, inMins] = clockInTime.split(':').map(Number);
      const clockInDate = new Date();
      clockInDate.setHours(inHours, inMins, 0);
      const totalHours = (now - clockInDate) / (1000 * 60 * 60);
      
      // Calculate overtime (over 8 hours is considered overtime)
      const regularHours = 8;
      const overtimeHours = Math.max(0, totalHours - regularHours);

      return base44.entities.Attendance.update(todayAttendance?.id, {
        clock_out_time: format(now, 'HH:mm'),
        clock_out_location: location || 'Unknown',
        clock_out_device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        total_hours: Math.round(totalHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        overtime_approved: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['allAttendance'] });
      toast.success("Clocked Out", "Have a great day!");
    },
    onError: (error) => {
      console.error('Clock out error:', error);
      toast.error("Clock out failed", error.message || "Please try again");
    }
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getLocation();
  }, []);

  // Guard against missing data - must be after all hooks
  if (!currentEmployee || !orgId) {
    return null;
  }

  return (
    <Card className="border-2 border-[#1EB053]/20 bg-gradient-to-br from-[#1EB053]/5 to-[#0072C6]/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Quick Clock</h3>
            <p className="text-sm text-gray-500">{format(currentTime, 'EEEE, MMM d')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#0F1F3C]">{format(currentTime, 'HH:mm:ss')}</p>
          </div>
        </div>

        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {isClockedOut ? (
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium">Day Complete</p>
              <p className="text-sm text-gray-500">
                {todayAttendance.clock_in_time} - {todayAttendance.clock_out_time} ({todayAttendance.total_hours?.toFixed(1)}h)
              </p>
            </div>
          </div>
        ) : isClockedIn ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="font-medium text-green-700">Currently Working</p>
                <p className="text-sm text-green-600">Clocked in at {todayAttendance.clock_in_time}</p>
              </div>
            </div>
            <Button 
              onClick={() => clockOutMutation.mutate()}
              disabled={clockOutMutation.isPending}
              className="w-full bg-red-500 hover:bg-red-600 text-white h-14 text-lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => clockInMutation.mutate()}
            disabled={clockInMutation.isPending || isLocating}
            className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white h-14 text-lg"
          >
            <Clock className="w-5 h-5 mr-2" />
            {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}