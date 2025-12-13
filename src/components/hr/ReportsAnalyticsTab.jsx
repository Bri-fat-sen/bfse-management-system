import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function ReportsAnalyticsTab({ orgId, employees, payrolls, leaveRequests, attendance }) {
  const totalPayroll = payrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0);
  const avgSalary = employees.length > 0 ? employees.reduce((sum, e) => sum + (e.base_salary || 0), 0) / employees.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Payroll</p>
                <p className="text-xl font-bold text-green-600">Le {totalPayroll.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Salary</p>
                <p className="text-xl font-bold">Le {avgSalary.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Leave Requests</p>
                <p className="text-2xl font-bold">{leaveRequests.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HR Reports & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Detailed analytics and reporting features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}