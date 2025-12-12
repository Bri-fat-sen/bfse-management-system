import React from "react";
import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function TodayAttendance({ attendance = [], employees = [] }) {
  const activeEmployees = employees.filter(e => e.status === 'active');
  const clockedIn = attendance.filter(a => a.clock_in_time).length;
  const clockedOut = attendance.filter(a => a.clock_in_time && a.clock_out_time).length;
  const stillWorking = clockedIn - clockedOut;
  const attendanceRate = activeEmployees.length > 0 
    ? Math.round((clockedIn / activeEmployees.length) * 100) 
    : 0;

  return (
    <Card className="border-t-4 border-t-[#1EB053]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1EB053]" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Attendance Rate</span>
              <span className="font-bold text-[#1EB053]">{attendanceRate}%</span>
            </div>
            <Progress value={attendanceRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">{stillWorking}</p>
              <p className="text-[10px] text-green-600">Working</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">{clockedIn}</p>
              <p className="text-[10px] text-blue-600">Clocked In</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <UserX className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-600">{activeEmployees.length - clockedIn}</p>
              <p className="text-[10px] text-gray-500">Absent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}