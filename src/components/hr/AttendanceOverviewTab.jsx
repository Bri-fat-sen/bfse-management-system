import React from "react";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AttendanceOverviewTab({ orgId, attendance, employees }) {
  const present = attendance.filter(a => a.status === 'present');
  const absent = attendance.filter(a => a.status === 'absent');
  const late = attendance.filter(a => a.status === 'late');
  const onLeave = attendance.filter(a => a.status === 'leave');

  const statusColors = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-amber-100 text-amber-800",
    leave: "bg-blue-100 text-blue-800",
  };

  const stats = [
    { label: "Present", value: present.length, icon: CheckCircle, color: "text-green-600" },
    { label: "Absent", value: absent.length, icon: XCircle, color: "text-red-600" },
    { label: "Late", value: late.length, icon: Clock, color: "text-amber-600" },
    { label: "On Leave", value: onLeave.length, icon: AlertCircle, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardContent className="p-5 text-center">
              <stat.icon className={`w-8 h-8 mx-auto ${stat.color}`} />
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {attendance.map((record) => (
          <Card key={record.id} className="border shadow-sm">
            <div className="h-0.5 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{record.employee_name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    {record.clock_in_time && (
                      <span>In: {record.clock_in_time}</span>
                    )}
                    {record.clock_out_time && (
                      <span>Out: {record.clock_out_time}</span>
                    )}
                    {record.total_hours > 0 && (
                      <span>Total: {record.total_hours.toFixed(1)}h</span>
                    )}
                  </div>
                </div>
                <Badge className={statusColors[record.status]}>
                  {record.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {attendance.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No attendance records for today</p>
          </div>
        )}
      </div>
    </div>
  );
}