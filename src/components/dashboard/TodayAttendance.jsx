import React from "react";
import { format } from "date-fns";
import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function TodayAttendance({ attendance = [], employees = [] }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = attendance.filter(a => a.date === today);
  
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.clock_in_time).length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = employees.length - presentCount;
  const attendanceRate = employees.length > 0 ? (presentCount / employees.length) * 100 : 0;

  const recentClockIns = todayAttendance
    .filter(a => a.clock_in_time)
    .sort((a, b) => b.clock_in_time?.localeCompare(a.clock_in_time))
    .slice(0, 4);

  return (
    <Card className="border-t-4 border-t-[#1EB053]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1EB053]" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <UserCheck className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <p className="text-lg font-bold text-green-700">{presentCount}</p>
            <p className="text-[10px] text-green-600 uppercase">Present</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <Clock className="w-4 h-4 mx-auto text-amber-600 mb-1" />
            <p className="text-lg font-bold text-amber-700">{lateCount}</p>
            <p className="text-[10px] text-amber-600 uppercase">Late</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <UserX className="w-4 h-4 mx-auto text-red-600 mb-1" />
            <p className="text-lg font-bold text-red-700">{absentCount}</p>
            <p className="text-[10px] text-red-600 uppercase">Absent</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Attendance Rate</span>
            <span className="font-medium">{attendanceRate.toFixed(0)}%</span>
          </div>
          <Progress value={attendanceRate} className="h-2 [&>div]:bg-[#1EB053]" />
        </div>

        {/* Recent Clock-ins */}
        {recentClockIns.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Recent Clock-ins</p>
            <div className="space-y-2">
              {recentClockIns.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                        {record.employee_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {record.employee_name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {record.clock_in_time}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {employees.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No employees yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}