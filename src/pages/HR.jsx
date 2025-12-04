import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import { format } from "date-fns";
import {
  Users,
  Plus,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  Building2,
  FileText,
  Star,
  UserPlus,
  RotateCcw,
  MoreVertical,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import PayrollProcessDialog from "@/components/hr/PayrollProcessDialog";
import PayslipGenerator from "@/components/hr/PayslipGenerator";
import LeaveRequestDialog from "@/components/hr/LeaveRequestDialog";
import LeaveManagement from "@/components/hr/LeaveManagement";
import PerformanceReviewDialog from "@/components/hr/PerformanceReviewDialog";
import PerformanceOverview from "@/components/hr/PerformanceOverview";
import BulkPayrollDialog from "@/components/hr/BulkPayrollDialog";
import BenefitsDeductionsManager from "@/components/hr/BenefitsDeductionsManager";
import PayrollAuditLog from "@/components/hr/PayrollAuditLog";
import TaxCalculatorInfo from "@/components/hr/TaxCalculatorInfo";
import RemunerationPackageManager from "@/components/hr/RemunerationPackageManager";
import PayrollReportingModule from "@/components/hr/PayrollReportingModule";
import AIReportSummary from "@/components/ai/AIReportSummary";
import PayComponentManager from "@/components/hr/PayComponentManager";
import StatutoryRateManager from "@/components/hr/StatutoryRateManager";
import PayrollApprovalWorkflow from "@/components/hr/PayrollApprovalWorkflow";
import OvertimePrediction from "@/components/hr/OvertimePrediction";

export default function HR() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("attendance");
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [selectedEmployeeForReview, setSelectedEmployeeForReview] = useState(null);
  const [showBulkPayrollDialog, setShowBulkPayrollDialog] = useState(false);
  const [payrollSubTab, setPayrollSubTab] = useState("records");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['todayAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId,
      date: format(new Date(), 'yyyy-MM-dd')
    }),
    enabled: !!orgId,
  });

  const deletePayrollMutation = useMutation({
    mutationFn: async (payroll) => {
      // Create audit log
      await base44.entities.PayrollAudit.create({
        organisation_id: orgId,
        payroll_id: payroll.id,
        employee_id: payroll.employee_id,
        employee_name: payroll.employee_name,
        action: 'cancelled',
        changed_by_id: currentEmployee.id,
        changed_by_name: currentEmployee.full_name,
        previous_values: { net_pay: payroll.net_pay, status: payroll.status },
        reason: 'Payroll deleted by admin',
      });
      // Delete payroll
      await base44.entities.Payroll.delete(payroll.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast.success("Payroll deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete payroll");
    },
  });

  const reversePayrollMutation = useMutation({
    mutationFn: async (payroll) => {
      // Create audit log
      await base44.entities.PayrollAudit.create({
        organisation_id: orgId,
        payroll_id: payroll.id,
        employee_id: payroll.employee_id,
        employee_name: payroll.employee_name,
        action: 'cancelled',
        changed_by_id: currentEmployee.id,
        changed_by_name: currentEmployee.full_name,
        previous_values: { net_pay: payroll.net_pay, status: payroll.status },
        new_values: { status: 'cancelled' },
        reason: 'Payroll reversed by admin',
      });
      // Update payroll status to cancelled
      await base44.entities.Payroll.update(payroll.id, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast.success("Payroll reversed successfully");
    },
    onError: () => {
      toast.error("Failed to reverse payroll");
    },
  });

  const activeEmployees = employees.filter(e => e.status === 'active');
  const presentToday = attendance.filter(a => a.clock_in_time);

  if (!user) {
    return <LoadingSpinner message="Loading HR..." subtitle="Fetching employee data" fullScreen={true} />;
  }

  // Allow platform admins to access even without employee record
  if (!currentEmployee && user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading HR..." subtitle="Fetching employee data" fullScreen={true} />;
  }

  return (
    <ProtectedPage module="hr">
    <div className="space-y-6">
      <PageHeader
        title="HR & Payroll"
        subtitle="Manage attendance, payroll, leave and performance"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={employees.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Staff"
          value={activeEmployees.length}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Present Today"
          value={presentToday.length}
          icon={Clock}
          color="gold"
        />
        <StatCard
          title="Pending Payrolls"
          value={payrolls.filter(p => p.status === 'pending_approval').length}
          icon={DollarSign}
          color="navy"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="attendance" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Payroll
          </TabsTrigger>
          <TabsTrigger value="leave" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Leave</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Perf.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance - {format(new Date(), 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No Attendance Records"
                  description="Attendance records will appear here when employees clock in"
                />
              ) : (
                <div className="space-y-3">
                  {attendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          record.clock_out_time ? 'bg-gray-400' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{record.employee_name}</p>
                          <p className="text-sm text-gray-500">
                            In: {record.clock_in_time || '--:--'} | Out: {record.clock_out_time || '--:--'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                          {record.status}
                        </Badge>
                        {record.total_hours && (
                          <p className="text-sm text-gray-500 mt-1">{record.total_hours.toFixed(1)} hrs</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          {/* Payroll Sub-Navigation */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-6">
            {[
              { id: 'records', label: 'Records', fullLabel: 'Payroll Records', icon: FileText },
              { id: 'approval', label: 'Approval', fullLabel: 'Approval Workflow', icon: UserCheck },
              { id: 'components', label: 'Components', fullLabel: 'Pay Components', icon: DollarSign },
              { id: 'packages', label: 'Packages', fullLabel: 'Packages', icon: Users },
              { id: 'statutory', label: 'Statutory', fullLabel: 'Statutory Rates', icon: Building2 },
              { id: 'overtime', label: 'Overtime', fullLabel: 'Overtime Analysis', icon: Clock },
              { id: 'reports', label: 'Reports', fullLabel: 'Reports', icon: FileText },
              { id: 'audit', label: 'Audit', fullLabel: 'Audit Trail', icon: Clock }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={payrollSubTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPayrollSubTab(tab.id)}
                className={`text-xs sm:text-sm ${payrollSubTab === tab.id ? 'bg-[#1EB053] hover:bg-[#178f43]' : ''}`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden">{tab.label}</span>
              </Button>
            ))}
          </div>

          {payrollSubTab === 'records' && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle>Payroll Records</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline"
                    onClick={() => setShowBulkPayrollDialog(true)} 
                    className="flex-1 sm:flex-none"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Process
                  </Button>
                  <Button 
                    onClick={() => setShowPayrollDialog(true)} 
                    className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Process Payroll
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payrolls.length === 0 ? (
                  <EmptyState
                    icon={DollarSign}
                    title="No Payroll Records"
                    description="Payroll records will appear here once processed"
                  />
                ) : (
                  <div className="space-y-3">
                    {payrolls.map((payroll) => (
                      <div key={payroll.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{payroll.employee_name}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(payroll.period_start), 'MMM d')} - {format(new Date(payroll.period_end), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-bold text-[#1EB053]">Le {payroll.net_pay?.toLocaleString()}</p>
                            <Badge variant={
                              payroll.status === 'paid' ? 'secondary' :
                              payroll.status === 'approved' ? 'default' : 
                              payroll.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {payroll.status}
                            </Badge>
                          </div>
                          <PayslipGenerator 
                            payroll={payroll} 
                            employee={employees.find(e => e.id === payroll.employee_id)}
                            organisation={organisation}
                          />
                          {['super_admin', 'org_admin', 'payroll_admin'].includes(currentEmployee?.role) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {payroll.status !== 'cancelled' && (
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      if (window.confirm(`Reverse payroll for ${payroll.employee_name}? This will mark it as cancelled.`)) {
                                        reversePayrollMutation.mutate(payroll);
                                      }
                                    }}
                                    className="text-amber-600 cursor-pointer"
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reverse Payroll
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    if (window.confirm(`Delete payroll for ${payroll.employee_name}? This cannot be undone.`)) {
                                      deletePayrollMutation.mutate(payroll);
                                    }
                                  }}
                                  className="text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Payroll
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {payrollSubTab === 'approval' && (
            <PayrollApprovalWorkflow orgId={orgId} currentEmployee={currentEmployee} />
          )}

          {payrollSubTab === 'components' && (
            <PayComponentManager orgId={orgId} employees={employees} />
          )}

          {payrollSubTab === 'packages' && (
            <RemunerationPackageManager orgId={orgId} />
          )}

          {payrollSubTab === 'statutory' && (
            <StatutoryRateManager orgId={orgId} />
          )}

          {payrollSubTab === 'overtime' && (
            <OvertimePrediction orgId={orgId} employees={employees} />
          )}

          {payrollSubTab === 'reports' && (
            <PayrollReportingModule 
              orgId={orgId} 
              employees={employees} 
              organisation={organisation?.[0]} 
            />
          )}

          {payrollSubTab === 'audit' && (
            <PayrollAuditLog orgId={orgId} />
          )}
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              className="bg-[#1EB053] hover:bg-green-600"
              onClick={() => setShowLeaveDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
          </div>
          <LeaveManagement orgId={orgId} currentEmployee={currentEmployee} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6 space-y-6">
          <AIReportSummary
            reportData={{
              employees: employees.filter(e => e.status === 'active').slice(0, 30),
              payrolls: payrolls.slice(0, 20),
              attendance: attendance.slice(0, 50)
            }}
            reportType="performance"
            title="AI Employee Performance Summary"
          />
          <PerformanceOverview 
            orgId={orgId} 
            onViewReview={(review) => {
              const emp = employees.find(e => e.id === review.employee_id);
              if (emp) {
                setSelectedEmployeeForReview(emp);
                setShowPerformanceDialog(true);
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Payroll Process Dialog */}
      <PayrollProcessDialog
        open={showPayrollDialog}
        onOpenChange={setShowPayrollDialog}
        employees={employees}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Bulk Payroll Dialog */}
      <BulkPayrollDialog
        open={showBulkPayrollDialog}
        onOpenChange={setShowBulkPayrollDialog}
        employees={employees}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Leave Request Dialog */}
      <LeaveRequestDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        currentEmployee={currentEmployee}
        orgId={orgId}
      />

      {/* Performance Review Dialog */}
      {selectedEmployeeForReview && (
        <PerformanceReviewDialog
          open={showPerformanceDialog}
          onOpenChange={(open) => {
            setShowPerformanceDialog(open);
            if (!open) setSelectedEmployeeForReview(null);
          }}
          employee={selectedEmployeeForReview}
          currentEmployee={currentEmployee}
          orgId={orgId}
        />
      )}

    </div>
    </ProtectedPage>
  );
}