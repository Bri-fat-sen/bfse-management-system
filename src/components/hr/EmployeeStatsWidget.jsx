import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown, DollarSign, Calendar, Award } from "lucide-react";

export default function EmployeeStatsWidget({ employees = [] }) {
  const stats = React.useMemo(() => {
    const activeCount = employees.filter(e => e.status === 'active').length;
    const totalSalary = employees.reduce((sum, e) => sum + (e.base_salary || 0), 0);
    const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0;
    
    const departmentBreakdown = employees.reduce((acc, e) => {
      const dept = e.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const topDepartment = Object.entries(departmentBreakdown)
      .sort((a, b) => b[1] - a[1])[0];

    const roleBreakdown = employees.reduce((acc, e) => {
      const role = e.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const thisMonth = new Date();
    const recentHires = employees.filter(e => {
      if (!e.hire_date) return false;
      const hireDate = new Date(e.hire_date);
      return hireDate.getMonth() === thisMonth.getMonth() && 
             hireDate.getFullYear() === thisMonth.getFullYear();
    }).length;

    return {
      total: employees.length,
      active: activeCount,
      inactive: employees.length - activeCount,
      totalSalary,
      avgSalary,
      topDepartment: topDepartment?.[0] || 'N/A',
      topDepartmentCount: topDepartment?.[1] || 0,
      departmentCount: Object.keys(departmentBreakdown).length,
      roleCount: Object.keys(roleBreakdown).length,
      recentHires
    };
  }, [employees]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="border-l-4 border-l-[#1EB053]">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#1EB053]" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
          <p className="text-xs text-gray-500">Active Employees</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.total} total</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#0072C6]">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-[#0072C6]" />
            <Badge className="bg-[#0072C6]/10 text-[#0072C6] text-[10px]">Avg</Badge>
          </div>
          <p className="text-xl sm:text-2xl font-bold">Le {(stats.avgSalary / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-500">Average Salary</p>
          <p className="text-[10px] text-gray-400 mt-1">Le {(stats.totalSalary / 1000000).toFixed(1)}M total</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            <Badge className="bg-purple-100 text-purple-700 text-[10px]">{stats.departmentCount}</Badge>
          </div>
          <p className="text-sm sm:text-base font-bold truncate">{stats.topDepartment}</p>
          <p className="text-xs text-gray-500">Top Department</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.topDepartmentCount} employees</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
            {stats.recentHires > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.recentHires}</p>
          <p className="text-xs text-gray-500">New This Month</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.roleCount} roles</p>
        </CardContent>
      </Card>
    </div>
  );
}