import React from "react";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from "date-fns";
import { Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ScheduleComplianceCard({ schedule, attendance = [], employee }) {
  if (!schedule) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-4 text-center text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm">No schedule assigned</p>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate this week's expected and actual hours
  const thisWeekAttendance = attendance.filter(a => {
    const date = parseISO(a.date);
    return date >= weekStart && date <= weekEnd;
  });

  const expectedWorkDays = weekDays.filter(d => 
    schedule.work_days?.includes(getDay(d)) && d <= today
  ).length;

  const actualWorkDays = thisWeekAttendance.filter(a => 
    a.clock_in_time && a.status !== 'absent'
  ).length;

  const totalHoursWorked = thisWeekAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const expectedHoursToDate = expectedWorkDays * (schedule.expected_hours_per_day || 8);
  const weeklyTarget = schedule.expected_hours_per_week || 40;

  const hoursProgress = expectedHoursToDate > 0 
    ? Math.min(100, (totalHoursWorked / expectedHoursToDate) * 100)
    : 0;

  const overtimeHours = Math.max(0, totalHoursWorked - expectedHoursToDate);
  const underHours = Math.max(0, expectedHoursToDate - totalHoursWorked);

  // Check late arrivals
  const lateArrivals = thisWeekAttendance.filter(a => {
    if (!a.clock_in_time || !schedule.start_time) return false;
    return a.clock_in_time > schedule.start_time;
  }).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0072C6]" />
            This Week's Progress
          </CardTitle>
          {hoursProgress >= 90 ? (
            <Badge className="bg-green-100 text-green-700">On Track</Badge>
          ) : hoursProgress >= 70 ? (
            <Badge className="bg-amber-100 text-amber-700">Behind</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700">Low</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hours Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Hours Worked</span>
            <span className="font-medium">{totalHoursWorked.toFixed(1)}h / {expectedHoursToDate}h</span>
          </div>
          <Progress value={hoursProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            Weekly target: {weeklyTarget}h
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Days Worked</p>
            <p className="font-semibold">{actualWorkDays} / {expectedWorkDays}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Late Arrivals</p>
            <p className={`font-semibold ${lateArrivals > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {lateArrivals}
            </p>
          </div>
        </div>

        {/* Overtime/Under Hours */}
        {overtimeHours > 0 && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              {overtimeHours.toFixed(1)}h overtime this week
            </span>
          </div>
        )}
        {underHours > 1 && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
            <TrendingDown className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              {underHours.toFixed(1)}h under expected
            </span>
          </div>
        )}

        {/* Schedule Info */}
        <div className="pt-2 border-t text-xs text-gray-500">
          <p>Schedule: {schedule.start_time} - {schedule.end_time}</p>
          <p>{schedule.work_days?.length || 0} work days/week</p>
        </div>
      </CardContent>
    </Card>
  );
}