import React from "react";
import { BarChart3, Download, TrendingUp, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";

export default function ReportsAnalyticsTab({ orgId, employees, payrolls, leaveRequests, attendance }) {
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalPayrollCost = payrolls.reduce((sum, p) => sum + (p.gross_salary || 0), 0);
  const totalNASSIT = payrolls.reduce((sum, p) => 
    sum + (p.nassit_employee || 0) + (p.nassit_employer || 0), 0
  );
  const totalPAYE = payrolls.reduce((sum, p) => sum + (p.paye_tax || 0), 0);

  const departmentGroups = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeEmployees}</p>
              </div>
              <Users className="w-10 h-10 text-[#1EB053]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatLeone(totalPayrollCost)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NASSIT Total</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatLeone(totalNASSIT)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-[#0072C6]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PAYE Tax</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatLeone(totalPAYE)}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(departmentGroups).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-gray-700">{dept}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] h-2 rounded-full"
                      style={{ width: `${(count / activeEmployees) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export Payroll Report
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export NASSIT Report
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export Tax Report
        </Button>
      </div>
    </div>
  );
}