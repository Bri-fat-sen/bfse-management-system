import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
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
import { 
  Clock, TrendingUp, AlertTriangle, Users, Calendar, 
  ArrowUp, ArrowDown, Minus, Zap, BarChart3
} from "lucide-react";
import { formatSLE, OVERTIME_MULTIPLIERS, calculateRates } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function OvertimePrediction({ orgId, employees = [] }) {
  // Fetch attendance data for the last 3 months
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendanceHistory', orgId],
    queryFn: async () => {
      const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      return base44.entities.Attendance.filter({ organisation_id: orgId });
    },
    enabled: !!orgId,
  });

  // Fetch work schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ['workSchedules', orgId],
    queryFn: () => base44.entities.WorkSchedule.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Calculate overtime statistics per employee
  const overtimeStats = useMemo(() => {
    if (!attendanceRecords.length || !employees.length) return [];

    const threeMonthsAgo = subMonths(new Date(), 3);
    
    return employees
      .filter(emp => emp.status === 'active')
      .map(employee => {
        // Get attendance records for this employee
        const empRecords = attendanceRecords.filter(r => 
          r.employee_id === employee.id && 
          new Date(r.date) >= threeMonthsAgo
        );

        // Calculate monthly overtime
        const monthlyData = [];
        for (let i = 2; i >= 0; i--) {
          const monthStart = startOfMonth(subMonths(new Date(), i));
          const monthEnd = endOfMonth(subMonths(new Date(), i));
          
          const monthRecords = empRecords.filter(r => {
            const date = new Date(r.date);
            return date >= monthStart && date <= monthEnd;
          });

          const totalOvertime = monthRecords.reduce((sum, r) => sum + safeNumber(r.overtime_hours), 0);
          const workingDays = monthRecords.filter(r => r.status === 'present' || r.status === 'late').length;
          
          monthlyData.push({
            month: format(monthStart, 'MMM'),
            overtime: totalOvertime,
            days: workingDays
          });
        }

        // Calculate averages and predictions
        const totalOvertime = monthlyData.reduce((sum, m) => sum + m.overtime, 0);
        const avgMonthlyOvertime = totalOvertime / 3;
        const lastMonthOvertime = monthlyData[2]?.overtime || 0;
        const previousMonthOvertime = monthlyData[1]?.overtime || 0;
        
        // Trend calculation
        const trend = lastMonthOvertime - previousMonthOvertime;
        const trendPercent = previousMonthOvertime > 0 
          ? ((trend / previousMonthOvertime) * 100).toFixed(1) 
          : 0;

        // Predicted overtime for current month (weighted average with recent months having more weight)
        const predictedOvertime = Math.round(
          (monthlyData[0]?.overtime * 0.2) + 
          (monthlyData[1]?.overtime * 0.3) + 
          (monthlyData[2]?.overtime * 0.5)
        );

        // Calculate costs
        const rates = calculateRates(employee.base_salary, employee.salary_type);
        const regularOTCost = Math.round(predictedOvertime * rates.hourlyRate * OVERTIME_MULTIPLIERS.regular);
        const weekendOTCost = Math.round((predictedOvertime * 0.2) * rates.hourlyRate * OVERTIME_MULTIPLIERS.weekend);
        const totalPredictedCost = regularOTCost + weekendOTCost;

        // Risk level
        let riskLevel = 'low';
        if (avgMonthlyOvertime > 20) riskLevel = 'high';
        else if (avgMonthlyOvertime > 10) riskLevel = 'medium';

        return {
          employee,
          monthlyData,
          totalOvertime,
          avgMonthlyOvertime: Math.round(avgMonthlyOvertime * 10) / 10,
          lastMonthOvertime,
          trend,
          trendPercent,
          predictedOvertime,
          predictedCost: totalPredictedCost,
          hourlyRate: rates.hourlyRate,
          riskLevel
        };
      })
      .filter(stat => stat.totalOvertime > 0 || stat.predictedOvertime > 0)
      .sort((a, b) => b.predictedCost - a.predictedCost);
  }, [attendanceRecords, employees]);

  // Summary statistics
  const summary = useMemo(() => {
    const totalPredictedCost = overtimeStats.reduce((sum, s) => sum + s.predictedCost, 0);
    const totalPredictedHours = overtimeStats.reduce((sum, s) => sum + s.predictedOvertime, 0);
    const highRiskCount = overtimeStats.filter(s => s.riskLevel === 'high').length;
    const avgOvertime = overtimeStats.length > 0 
      ? overtimeStats.reduce((sum, s) => sum + s.avgMonthlyOvertime, 0) / overtimeStats.length 
      : 0;

    return {
      totalPredictedCost,
      totalPredictedHours,
      highRiskCount,
      avgOvertime: Math.round(avgOvertime * 10) / 10,
      employeesWithOT: overtimeStats.length
    };
  }, [overtimeStats]);

  // Chart data
  const chartData = useMemo(() => {
    if (!overtimeStats.length) return [];
    
    const months = ['Month 1', 'Month 2', 'Month 3'];
    return months.map((_, i) => ({
      name: overtimeStats[0]?.monthlyData[i]?.month || `M${i+1}`,
      total: overtimeStats.reduce((sum, s) => sum + (s.monthlyData[i]?.overtime || 0), 0)
    }));
  }, [overtimeStats]);

  const TrendIndicator = ({ trend, percent }) => {
    if (trend > 0) {
      return (
        <span className="flex items-center text-red-600 text-xs">
          <ArrowUp className="w-3 h-3" />
          +{percent}%
        </span>
      );
    } else if (trend < 0) {
      return (
        <span className="flex items-center text-green-600 text-xs">
          <ArrowDown className="w-3 h-3" />
          {percent}%
        </span>
      );
    }
    return <span className="flex items-center text-gray-400 text-xs"><Minus className="w-3 h-3" />0%</span>;
  };

  const RiskBadge = ({ level }) => {
    const config = {
      low: { color: 'bg-green-100 text-green-800', label: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      high: { color: 'bg-red-100 text-red-800', label: 'High' }
    };
    return <Badge className={config[level]?.color}>{config[level]?.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Overtime Prediction & Analysis
        </h3>
        <p className="text-sm text-gray-500">Based on historical attendance data (last 3 months)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Predicted Hours</span>
            </div>
            <p className="text-2xl font-bold">{summary.totalPredictedHours}h</p>
            <p className="text-xs text-gray-500">this month</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Predicted Cost</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{formatSLE(summary.totalPredictedCost)}</p>
            <p className="text-xs text-gray-500">overtime budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Employees with OT</span>
            </div>
            <p className="text-2xl font-bold">{summary.employeesWithOT}</p>
            <p className="text-xs text-gray-500">avg {summary.avgOvertime}h/month</p>
          </CardContent>
        </Card>
        <Card className={summary.highRiskCount > 0 ? 'border-l-4 border-l-red-500' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">High OT Risk</span>
            </div>
            <p className={`text-2xl font-bold ${summary.highRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.highRiskCount}
            </p>
            <p className="text-xs text-gray-500">employees &gt;20h/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Monthly Overtime Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Total OT Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employee Overtime Analysis</CardTitle>
          <CardDescription>Predicted overtime and costs for current pay period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>3-Month Avg</TableHead>
                <TableHead>Last Month</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Predicted</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overtimeStats.slice(0, 10).map(stat => (
                <TableRow key={stat.employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{stat.employee.full_name}</p>
                      <p className="text-xs text-gray-500">{stat.employee.role?.replace('_', ' ')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{stat.avgMonthlyOvertime}h</span>
                  </TableCell>
                  <TableCell>{stat.lastMonthOvertime}h</TableCell>
                  <TableCell>
                    <TrendIndicator trend={stat.trend} percent={stat.trendPercent} />
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="font-medium text-amber-600">{stat.predictedOvertime}h</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">@ {formatSLE(stat.hourlyRate)}/hr × {OVERTIME_MULTIPLIERS.regular}x</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatSLE(stat.predictedCost)}</span>
                  </TableCell>
                  <TableCell>
                    <RiskBadge level={stat.riskLevel} />
                  </TableCell>
                </TableRow>
              ))}
              {overtimeStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No overtime data available</p>
                    <p className="text-xs">Overtime will be calculated from attendance records</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* High Risk Alert */}
      {summary.highRiskCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">High Overtime Alert</h4>
                <p className="text-sm text-red-700 mt-1">
                  {summary.highRiskCount} employee(s) are averaging more than 20 hours of overtime per month. 
                  Consider reviewing workloads or hiring additional staff.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {overtimeStats.filter(s => s.riskLevel === 'high').slice(0, 5).map(s => (
                    <Badge key={s.employee.id} variant="outline" className="bg-white">
                      {s.employee.full_name} ({s.avgMonthlyOvertime}h avg)
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}