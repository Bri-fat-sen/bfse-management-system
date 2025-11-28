import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, isWeekend, isSameDay } from "date-fns";
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SelfServiceAttendance({ employee }) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
  const monthEnd = endOfMonth(monthStart);

  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['myAttendance', employee?.id, selectedMonth],
    queryFn: () => base44.entities.Attendance.filter({ 
      employee_id: employee?.id 
    }, '-date', 100),
    enabled: !!employee?.id,
  });

  // Filter to selected month
  const monthRecords = attendanceRecords.filter(r => {
    const date = r.date?.split('T')[0];
    return date >= format(monthStart, 'yyyy-MM-dd') && date <= format(monthEnd, 'yyyy-MM-dd');
  });

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  // Calculate stats
  const stats = {
    present: monthRecords.filter(r => r.status === 'present').length,
    late: monthRecords.filter(r => r.status === 'late').length,
    absent: monthRecords.filter(r => r.status === 'absent').length,
    totalHours: monthRecords.reduce((sum, r) => sum + (r.hours_worked || 0), 0),
    overtimeHours: monthRecords.reduce((sum, r) => sum + (r.overtime_hours || 0), 0)
  };

  // Generate calendar days
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDay = (date) => {
    return monthRecords.find(r => isSameDay(new Date(r.date), date));
  };

  const getDayColor = (date) => {
    if (isWeekend(date)) return 'bg-gray-100 text-gray-400';
    const record = getAttendanceForDay(date);
    if (!record) return 'bg-white text-gray-300';
    if (record.status === 'present') return 'bg-green-100 text-green-700';
    if (record.status === 'late') return 'bg-yellow-100 text-yellow-700';
    if (record.status === 'absent') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="pt-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.present}</p>
            <p className="text-xs text-gray-500">Present</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardContent className="pt-4 text-center">
            <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.late}</p>
            <p className="text-xs text-gray-500">Late</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4 text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.absent}</p>
            <p className="text-xs text-gray-500">Absent</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4 text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Hours Worked</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="pt-4 text-center">
            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.overtimeHours.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Overtime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1EB053]" />
              Attendance Calendar
            </CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for start of month */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {calendarDays.map(day => (
                <div
                  key={day.toISOString()}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${getDayColor(day)}`}
                  title={getAttendanceForDay(day)?.status || (isWeekend(day) ? 'Weekend' : 'No record')}
                >
                  {format(day, 'd')}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-100" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-100" />
                <span>Late</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-100" />
                <span>Absent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0072C6]" />
              Recent Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {monthRecords.slice(0, 15).map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {format(new Date(record.date), 'EEEE, dd MMM')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.clock_in_time || '--:--'} - {record.clock_out_time || '--:--'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          record.status === 'present' ? 'default' :
                          record.status === 'late' ? 'secondary' : 'destructive'
                        }>
                          {record.status}
                        </Badge>
                        {record.hours_worked && (
                          <p className="text-xs text-gray-500 mt-1">{record.hours_worked.toFixed(1)} hrs</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}