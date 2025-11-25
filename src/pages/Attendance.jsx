import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Timer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import AttendanceReportExport from "@/components/attendance/AttendanceReportExport";

export default function Attendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: todayAttendance, refetch: refetchToday } = useQuery({
    queryKey: ['todayAttendance', currentEmployee?.id],
    queryFn: () => base44.entities.Attendance.filter({ 
      employee_id: currentEmployee?.id,
      date: format(new Date(), 'yyyy-MM-dd')
    }),
    enabled: !!currentEmployee?.id,
  });

  const { data: monthlyAttendance = [] } = useQuery({
    queryKey: ['monthlyAttendance', currentEmployee?.id],
    queryFn: () => base44.entities.Attendance.filter({ 
      employee_id: currentEmployee?.id
    }, '-date', 30),
    enabled: !!currentEmployee?.id,
  });

  const todayRecord = todayAttendance?.[0];
  const isClockedIn = todayRecord?.clock_in_time && !todayRecord?.clock_out_time;

  const clockInMutation = useMutation({
    mutationFn: () => base44.entities.Attendance.create({
      organisation_id: orgId,
      employee_id: currentEmployee?.id,
      employee_name: currentEmployee?.full_name,
      date: format(new Date(), 'yyyy-MM-dd'),
      clock_in_time: format(new Date(), 'HH:mm:ss'),
      status: 'present',
      clock_in_device: navigator.userAgent.slice(0, 100),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      // Log activity
      base44.entities.ActivityLog.create({
        organisation_id: orgId,
        employee_id: currentEmployee?.id,
        employee_name: currentEmployee?.full_name,
        action_type: 'clock_in',
        module: 'Attendance',
        description: `Clocked in at ${format(new Date(), 'HH:mm')}`,
      });
      toast({ title: "Clocked In", description: `Welcome! You clocked in at ${format(new Date(), 'HH:mm')}` });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: () => {
      const clockInTime = new Date(`${todayRecord.date}T${todayRecord.clock_in_time}`);
      const clockOutTime = new Date();
      const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);
      
      return base44.entities.Attendance.update(todayRecord.id, {
        clock_out_time: format(clockOutTime, 'HH:mm:ss'),
        total_hours: parseFloat(hoursWorked.toFixed(2)),
        clock_out_device: navigator.userAgent.slice(0, 100),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      // Log activity
      base44.entities.ActivityLog.create({
        organisation_id: orgId,
        employee_id: currentEmployee?.id,
        employee_name: currentEmployee?.full_name,
        action_type: 'clock_out',
        module: 'Attendance',
        description: `Clocked out at ${format(new Date(), 'HH:mm')}`,
      });
      toast({ title: "Clocked Out", description: `Goodbye! You clocked out at ${format(new Date(), 'HH:mm')}` });
    },
  });

  const handleClockAction = () => {
    if (isClockedIn) {
      clockOutMutation.mutate();
    } else if (!todayRecord) {
      clockInMutation.mutate();
    }
  };

  // Calculate stats
  const presentDays = monthlyAttendance.filter(a => a.status === 'present').length;
  const totalHours = monthlyAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const avgHours = monthlyAttendance.length > 0 ? (totalHours / monthlyAttendance.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clock In / Out"
        subtitle="Track your attendance and working hours"
      />

      {/* Live Clock */}
      <Card className="bg-gradient-to-r from-[#0F1F3C] to-[#1D5FC3] text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/70 mb-2">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
              <div className="text-6xl md:text-7xl font-bold tracking-tight">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${isClockedIn ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-lg">
                  {isClockedIn ? 'Currently Clocked In' : todayRecord?.clock_out_time ? 'Clocked Out for Today' : 'Not Clocked In'}
                </span>
              </div>
              {todayRecord?.clock_in_time && (
                <p className="text-white/70 mt-2">
                  Clocked in at: {todayRecord.clock_in_time}
                  {todayRecord.clock_out_time && ` • Out at: ${todayRecord.clock_out_time}`}
                </p>
              )}
            </div>
            
            <Button
              size="lg"
              onClick={handleClockAction}
              disabled={todayRecord?.clock_out_time || clockInMutation.isPending || clockOutMutation.isPending}
              className={`h-32 w-32 rounded-full text-lg font-bold transition-all ${
                isClockedIn 
                  ? 'bg-red-500 hover:bg-red-600 hover:scale-105' 
                  : 'bg-[#1EB053] hover:bg-green-600 hover:scale-105'
              } ${todayRecord?.clock_out_time ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isClockedIn ? (
                <div className="flex flex-col items-center">
                  <LogOut className="w-8 h-8 mb-1" />
                  Clock Out
                </div>
              ) : todayRecord?.clock_out_time ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-8 h-8 mb-1" />
                  Done
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <LogIn className="w-8 h-8 mb-1" />
                  Clock In
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Days Present (This Month)"
          value={presentDays}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Total Hours (This Month)"
          value={`${totalHours.toFixed(1)} hrs`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Average Hours/Day"
          value={`${avgHours} hrs`}
          icon={Timer}
          color="gold"
        />
        <StatCard
          title="Today's Hours"
          value={todayRecord?.total_hours ? `${todayRecord.total_hours.toFixed(1)} hrs` : '-'}
          icon={CheckCircle}
          color="navy"
        />
      </div>

      {/* Recent Attendance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Attendance
          </CardTitle>
          <AttendanceReportExport 
            attendance={monthlyAttendance}
            employee={currentEmployee}
            organisation={organisation?.[0]}
          />
        </CardHeader>
        <CardContent>
          {monthlyAttendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyAttendance.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.status === 'present' ? 'bg-green-100' :
                      record.status === 'late' ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      {record.status === 'present' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : record.status === 'late' ? (
                        <Clock className="w-5 h-5 text-amber-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{format(new Date(record.date), 'EEEE, MMMM d')}</p>
                      <p className="text-sm text-gray-500">
                        {record.clock_in_time || '--:--'} - {record.clock_out_time || '--:--'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      record.status === 'present' ? 'secondary' :
                      record.status === 'late' ? 'outline' : 'destructive'
                    }>
                      {record.status}
                    </Badge>
                    {record.total_hours && (
                      <p className="text-sm text-gray-500 mt-1">{record.total_hours.toFixed(1)} hours</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}