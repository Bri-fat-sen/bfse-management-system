import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AttendanceOverviewTab({ orgId, attendance, employees }) {
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-green-600">{present}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absent}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Late</p>
                <p className="text-2xl font-bold text-amber-600">{late}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records for today</p>
          ) : (
            <div className="space-y-2">
              {attendance.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{record.employee_name}</p>
                    <p className="text-sm text-gray-500">
                      {record.clock_in_time && `In: ${record.clock_in_time}`}
                      {record.clock_out_time && ` • Out: ${record.clock_out_time}`}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.status === 'present' ? 'bg-green-100 text-green-700' :
                    record.status === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {record.status}
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