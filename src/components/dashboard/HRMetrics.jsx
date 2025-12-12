import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar, TrendingUp, UserCheck, UserX, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

const ROLE_COLORS = {
  'driver': '#3b82f6',
  'warehouse_manager': '#8b5cf6',
  'retail_cashier': '#ec4899',
  'accountant': '#f59e0b',
  'hr_admin': '#10b981',
  'other': '#6b7280'
};

export default function HRMetrics({ employees = [], attendance = [], leaveRequests = [] }) {
  // Employee breakdown by role
  const roleBreakdown = employees.reduce((acc, emp) => {
    const role = emp.role || 'other';
    if (!acc[role]) acc[role] = 0;
    acc[role] += 1;
    return acc;
  }, {});

  const roleData = Object.entries(roleBreakdown).map(([role, count]) => ({
    name: role.replace(/_/g, ' '),
    value: count,
    color: ROLE_COLORS[role] || ROLE_COLORS.other
  }));

  // Attendance stats
  const totalEmployees = employees.filter(e => e.status === 'active').length;
  const presentToday = attendance.filter(a => a.clock_in_time).length;
  const absentToday = totalEmployees - presentToday;
  const lateToday = attendance.filter(a => a.status === 'late').length;
  const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees * 100).toFixed(1) : 0;

  // Department breakdown
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
  const deptData = departments.slice(0, 6).map(dept => ({
    name: dept,
    count: employees.filter(e => e.department === dept && e.status === 'active').length
  }));

  // Leave statistics
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved').length;
  const onLeaveToday = leaveRequests.filter(l => {
    if (l.status !== 'approved') return false;
    const today = new Date();
    const start = new Date(l.start_date);
    const end = new Date(l.end_date);
    return today >= start && today <= end;
  }).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Attendance Overview */}
      <Card className="border-l-4 border-l-[#1EB053]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1EB053]" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-600 font-medium">Present</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{presentToday}</p>
              <p className="text-xs text-gray-500 mt-1">{attendanceRate}% rate</p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <UserX className="w-4 h-4 text-red-600" />
                <p className="text-xs text-red-600 font-medium">Absent</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{absentToday}</p>
              <p className="text-xs text-gray-500 mt-1">{onLeaveToday} on leave</p>
            </div>
          </div>

          {lateToday > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-600 font-medium mb-1">⚠️ Late Arrivals</p>
              <p className="text-xl font-bold text-orange-600">{lateToday} employees</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Leave Requests</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex-1 justify-center py-2">
                Pending: {pendingLeaves}
              </Badge>
              <Badge variant="outline" className="flex-1 justify-center py-2 border-green-500 text-green-600">
                Approved: {approvedLeaves}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card className="border-l-4 border-l-[#0072C6]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0072C6]" />
            Department Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deptData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0072C6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No department data</p>
          )}
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card className="lg:col-span-2 border-l-4 border-l-[#8b5cf6]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-[#8b5cf6]" />
            Employee Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roleData.map((role) => (
              <div key={role.name} className="p-3 rounded-lg border" style={{ borderColor: role.color + '40', backgroundColor: role.color + '10' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                  <p className="text-xs font-medium capitalize truncate">{role.name}</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: role.color }}>{role.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}