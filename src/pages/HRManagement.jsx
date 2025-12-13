import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Plus, Search, Filter, Download, Upload, 
  DollarSign, Calendar, TrendingUp, FileText, Clock,
  UserCheck, AlertCircle, CheckCircle, Award, Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmployeeManagementTab from "@/components/hr/EmployeeManagementTab";
import PayrollProcessingTab from "@/components/hr/PayrollProcessingTab";
import LeaveManagementTab from "@/components/hr/LeaveManagementTab";
import AttendanceOverviewTab from "@/components/hr/AttendanceOverviewTab";
import ReportsAnalyticsTab from "@/components/hr/ReportsAnalyticsTab";
import SierraLeonePayrollSettings from "@/components/hr/SierraLeonePayrollSettings";
import TaxFilingReports from "@/components/hr/TaxFilingReports";

export default function HRManagement() {
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const userRole = currentEmployee?.role || user?.role;

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['leaveRequests', orgId],
    queryFn: () => base44.entities.LeaveRequest.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId,
      date: new Date().toISOString().split('T')[0]
    }),
    enabled: !!orgId,
  });

  const { data: organisationData } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const currentOrg = organisationData?.[0];

  if (!user || !currentEmployee) {
    return <LoadingSpinner message="Loading HR System..." />;
  }

  if (!['super_admin', 'org_admin', 'hr_admin', 'payroll_admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <div className="h-1.5 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">You don't have permission to access HR Management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeEmployees = employees.filter(e => e.status === 'active');
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const presentToday = attendance.filter(a => a.status === 'present').length;
  const thisMonthPayrolls = payrolls.filter(p => {
    const payDate = new Date(p.pay_date);
    const now = new Date();
    return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
  });

  const stats = [
    {
      title: "Active Employees",
      value: activeEmployees.length,
      icon: Users,
      color: "from-[#1EB053] to-[#16803d]",
      bgColor: "bg-[#1EB053]/10",
      iconColor: "text-[#1EB053]",
    },
    {
      title: "Pending Leaves",
      value: pendingLeaves.length,
      icon: Calendar,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: UserCheck,
      color: "from-[#0072C6] to-[#005a9e]",
      bgColor: "bg-[#0072C6]/10",
      iconColor: "text-[#0072C6]",
    },
    {
      title: "Payrolls This Month",
      value: thisMonthPayrolls.length,
      icon: DollarSign,
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sierra Leone Header */}
      <div className="h-1.5 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Page Header */}
      <Card className="border-0 shadow-lg">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">HR & Payroll Management</CardTitle>
                <p className="text-sm text-gray-500 mt-1">🇸🇱 Sierra Leone Compliant System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#1EB053] text-white">NASSIT Integrated</Badge>
              <Badge className="bg-[#0072C6] text-white">Tax Compliant</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Card className="border-0 shadow-lg">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex-wrap h-auto">
              <TabsTrigger value="employees" className="gap-2">
                <Users className="w-4 h-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="payroll" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Payroll
              </TabsTrigger>
              <TabsTrigger value="leave" className="gap-2">
                <Calendar className="w-4 h-4" />
                Leave
              </TabsTrigger>
              <TabsTrigger value="attendance" className="gap-2">
                <Clock className="w-4 h-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="tax-filing" className="gap-2">
                <FileText className="w-4 h-4" />
                Tax Filing
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              <EmployeeManagementTab 
                orgId={orgId} 
                employees={employees}
                currentEmployee={currentEmployee}
                userRole={userRole}
              />
            </TabsContent>

            <TabsContent value="payroll">
              <PayrollProcessingTab 
                orgId={orgId}
                employees={employees}
                payrolls={payrolls}
                currentEmployee={currentEmployee}
              />
            </TabsContent>

            <TabsContent value="leave">
              <LeaveManagementTab 
                orgId={orgId}
                leaveRequests={leaveRequests}
                employees={employees}
                currentEmployee={currentEmployee}
              />
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceOverviewTab 
                orgId={orgId}
                attendance={attendance}
                employees={employees}
              />
            </TabsContent>

            <TabsContent value="tax-filing">
              <TaxFilingReports 
                orgId={orgId}
                organisation={currentOrg}
              />
            </TabsContent>

            <TabsContent value="reports">
              <ReportsAnalyticsTab 
                orgId={orgId}
                employees={employees}
                payrolls={payrolls}
                leaveRequests={leaveRequests}
                attendance={attendance}
              />
            </TabsContent>

            <TabsContent value="settings">
              <SierraLeonePayrollSettings 
                orgId={orgId}
                currentEmployee={currentEmployee}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sierra Leone Footer */}
      <div className="h-1.5 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
    </div>
  );
}