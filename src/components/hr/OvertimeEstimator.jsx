import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, TrendingUp, AlertTriangle, Calendar, Users, DollarSign, Loader2 } from "lucide-react";
import { formatSLE, calculateRates, OVERTIME_MULTIPLIERS } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";

export default function OvertimeEstimator({ orgId, employees = [] }) {
  // Get last 3 months of attendance data
  const threeMonthsAgo = startOfMonth(subMonths(new Date(), 3));
  const today = new Date();

  const { data: attendanceData = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['overtimeAttendance', orgId, format(threeMonthsAgo, 'yyyy-MM-dd')],
    queryFn: () => base44.entities.Attendance.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['workSchedules', orgId],
    queryFn: () => base44.entities.WorkSchedule.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  // Calculate overtime statistics per employee
  const overtimeStats = useMemo(() => {
    const stats = {};
    const activeEmployees = employees.filter(e => e.status === 'active');

    activeEmployees.forEach(emp => {
      const empAttendance = attendanceData.filter(a => {
        const date = a.date ? parseISO(a.date) : null;
        return a.employee_id === emp.id && date && date >= threeMonthsAgo;
      });

      const monthlyBreakdown = {};
      let totalOvertimeHours = 0;
      let totalWeekendHours = 0;
      let totalHolidayHours = 0;
      let totalDaysWithOvertime = 0;

      empAttendance.forEach(record => {
        const date = record.date;
        const month = date?.substring(0, 7); // YYYY-MM
        
        if (!monthlyBreakdown[month]) {
          monthlyBreakdown[month] = { overtime: 0, weekend: 0, holiday: 0, days: 0 };
        }

        const ot = safeNumber(record.overtime_hours);
        if (ot > 0) {
          monthlyBreakdown[month].overtime += ot;
          totalOvertimeHours += ot;
          totalDaysWithOvertime++;
        }

        // Check if weekend
        const dayOfWeek = new Date(date).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          const hours = safeNumber(record.total_hours);
          monthlyBreakdown[month].weekend += hours;
          totalWeekendHours += hours;
        }

        monthlyBreakdown[month].days++;
      });

      // Calculate rates
      const rates = calculateRates(emp.base_salary, emp.salary_type);
      
      // Calculate estimated overtime pay for next period
      const monthsOfData = Object.keys(monthlyBreakdown).length || 1;
      const avgMonthlyOvertime = totalOvertimeHours / monthsOfData;
      const avgMonthlyWeekend = totalWeekendHours / monthsOfData;
      
      const estimatedOvertimePay = avgMonthlyOvertime * rates.hourlyRate * OVERTIME_MULTIPLIERS.regular;
      const estimatedWeekendPay = avgMonthlyWeekend * rates.hourlyRate * OVERTIME_MULTIPLIERS.weekend;

      stats[emp.id] = {
        employee: emp,
        totalOvertimeHours,
        totalWeekendHours,
        totalHolidayHours,
        totalDaysWithOvertime,
        monthlyBreakdown,
        avgMonthlyOvertime,
        avgMonthlyWeekend,
        estimatedOvertimePay,
        estimatedWeekendPay,
        totalEstimatedExtra: estimatedOvertimePay + estimatedWeekendPay,
        hourlyRate: rates.hourlyRate
      };
    });

    return stats;
  }, [employees, attendanceData, threeMonthsAgo]);

  // Summary statistics
  const summary = useMemo(() => {
    const values = Object.values(overtimeStats);
    const totalEstimated = values.reduce((sum, s) => sum + s.totalEstimatedExtra, 0);
    const totalOTHours = values.reduce((sum, s) => sum + s.totalOvertimeHours, 0);
    const employeesWithOT = values.filter(s => s.totalOvertimeHours > 0).length;
    const avgOTPerEmployee = employeesWithOT > 0 ? totalOTHours / employeesWithOT : 0;
    
    // Top overtime employees
    const topOvertimeEmployees = values
      .filter(s => s.totalOvertimeHours > 0)
      .sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours)
      .slice(0, 5);

    return {
      totalEstimated,
      totalOTHours,
      employeesWithOT,
      avgOTPerEmployee,
      topOvertimeEmployees
    };
  }, [overtimeStats]);

  if (loadingAttendance) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total OT Hours (3 mo)</p>
                <p className="text-2xl font-bold">{summary.totalOTHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Est. Monthly OT Cost</p>
                <p className="text-2xl font-bold text-green-600">{formatSLE(summary.totalEstimated)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Employees with OT</p>
                <p className="text-2xl font-bold">{summary.employeesWithOT}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg OT per Employee</p>
                <p className="text-2xl font-bold">{summary.avgOTPerEmployee.toFixed(1)} hrs</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Overtime Employees */}
      {summary.topOvertimeEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Top Overtime Employees (Last 3 Months)
            </CardTitle>
            <CardDescription>
              Employees with the most overtime hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.topOvertimeEmployees.map((stat, idx) => {
                const maxHours = summary.topOvertimeEmployees[0]?.totalOvertimeHours || 1;
                const percentage = (stat.totalOvertimeHours / maxHours) * 100;
                
                return (
                  <div key={stat.employee.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{stat.employee.full_name}</p>
                          <p className="text-xs text-gray-500">{stat.employee.role?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{stat.totalOvertimeHours.toFixed(1)} hrs</p>
                        <p className="text-xs text-green-600">{formatSLE(stat.totalEstimatedExtra)}/mo est.</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0072C6]" />
            Overtime Estimation Details
          </CardTitle>
          <CardDescription>
            Based on historical data, estimated overtime pay for next payroll period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Avg Monthly OT</TableHead>
                <TableHead>Est. OT Pay</TableHead>
                <TableHead>Est. Weekend Pay</TableHead>
                <TableHead>Total Extra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(overtimeStats)
                .filter(s => s.totalOvertimeHours > 0 || s.totalWeekendHours > 0)
                .sort((a, b) => b.totalEstimatedExtra - a.totalEstimatedExtra)
                .map((stat) => (
                  <TableRow key={stat.employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{stat.employee.full_name}</p>
                        <p className="text-xs text-gray-500">{stat.employee.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {stat.employee.role?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatSLE(stat.hourlyRate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {stat.avgMonthlyOvertime.toFixed(1)} hrs
                      </div>
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {formatSLE(stat.estimatedOvertimePay)}
                    </TableCell>
                    <TableCell className="text-purple-600 font-medium">
                      {formatSLE(stat.estimatedWeekendPay)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">
                        {formatSLE(stat.totalEstimatedExtra)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              {Object.values(overtimeStats).filter(s => s.totalOvertimeHours > 0 || s.totalWeekendHours > 0).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No overtime data found in the last 3 months
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert for high overtime */}
      {summary.avgOTPerEmployee > 20 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">High Overtime Alert</p>
                <p className="text-sm text-orange-600">
                  Average overtime per employee is {summary.avgOTPerEmployee.toFixed(1)} hours. 
                  Consider reviewing workload distribution or hiring additional staff.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}