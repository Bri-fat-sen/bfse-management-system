import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import { format } from "date-fns";
import {
  Users,
  Search,
  Plus,
  Edit,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Building2,
  Filter,
  FileText,
  Star,
  FolderOpen,
  Lock,
  Trash2,
  AlertTriangle,
  UserPlus
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import PayrollProcessDialog from "@/components/hr/PayrollProcessDialog";
import PayslipGenerator from "@/components/hr/PayslipGenerator";
import AddEmployeeDialog from "@/components/hr/AddEmployeeDialog";
import LeaveRequestDialog from "@/components/hr/LeaveRequestDialog";
import LeaveManagement from "@/components/hr/LeaveManagement";
import PerformanceReviewDialog from "@/components/hr/PerformanceReviewDialog";
import PerformanceOverview from "@/components/hr/PerformanceOverview";
import EmployeeDocuments from "@/components/hr/EmployeeDocuments";
import SetPinDialog from "@/components/auth/SetPinDialog";
import SendInviteEmailDialog from "@/components/email/SendInviteEmailDialog";
import BulkPayrollDialog from "@/components/hr/BulkPayrollDialog";
import BenefitsDeductionsManager from "@/components/hr/BenefitsDeductionsManager";
import PayrollAuditLog from "@/components/hr/PayrollAuditLog";
import TaxCalculatorInfo from "@/components/hr/TaxCalculatorInfo";
import RemunerationPackageManager from "@/components/hr/RemunerationPackageManager";

const roles = [
  "org_admin", "hr_admin", "payroll_admin", "warehouse_manager",
  "retail_cashier", "vehicle_sales", "driver", "accountant",
  "support_staff", "read_only"
];

const departments = ["Management", "Sales", "Operations", "Finance", "Transport", "Support"];

export default function HR() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("employees");
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [selectedEmployeeForReview, setSelectedEmployeeForReview] = useState(null);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [selectedEmployeeForDocs, setSelectedEmployeeForDocs] = useState(null);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [selectedEmployeeForPin, setSelectedEmployeeForPin] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
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

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowEmployeeDialog(false);
      setEditingEmployee(null);
      toast.success("Employee updated successfully");
    },
  });

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    setIsDeleting(true);
    try {
      await base44.entities.Employee.delete(employeeToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`${employeeToDelete.full_name} has been removed`);
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    } catch (error) {
      toast.error("Failed to delete employee: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeEmployees = employees.filter(e => e.status === 'active');
  const presentToday = attendance.filter(a => a.clock_in_time);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      full_name: `${formData.get('first_name')} ${formData.get('last_name')}`,
      role: formData.get('role'),
      department: formData.get('department'),
      position: formData.get('position'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      salary_type: formData.get('salary_type'),
      base_salary: parseFloat(formData.get('base_salary')) || 0,
      status: formData.get('status'),
    };

    updateEmployeeMutation.mutate({ id: editingEmployee.id, data });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !currentEmployee || !orgId || isLoading) {
    return <LoadingSpinner message="Loading HR..." subtitle="Fetching employee data" fullScreen={true} />;
  }

  return (
    <ProtectedPage module="hr">
    <div className="space-y-6">
      <PageHeader
        title="HR & Payroll"
        subtitle="Manage employees, attendance, and payroll"
        action={() => setShowAddEmployeeDialog(true)}
        actionLabel="Add Employee"
      >
        <Button
          variant="outline"
          onClick={() => setShowInviteDialog(true)}
          className="border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/10 hover:text-[#0072C6]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Send Invite</span>
        </Button>
      </PageHeader>

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
        <TabsList className="bg-gray-100 p-1 flex-wrap">
          <TabsTrigger value="employees" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Employees
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Payroll
          </TabsTrigger>
          <TabsTrigger value="leave" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-1" />
            Leave
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Star className="w-4 h-4 mr-1" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Employees Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Employees Found"
              description="Employees are created by Super Admin"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <Card key={emp.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="sl-gradient text-white">
                            {emp.full_name?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{emp.full_name}</h3>
                          <p className="text-sm text-gray-500">{emp.employee_code}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(emp.status)}>
                        {emp.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{emp.department || 'No department'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{emp.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{emp.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <Badge variant="secondary">
                        {emp.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEmployeeForPin(emp);
                              setShowSetPinDialog(true);
                            }}
                            title={emp.pin_hash ? "Change PIN" : "Set PIN"}
                            className={!emp.pin_hash ? "text-amber-600" : ""}
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEmployeeForDocs(emp);
                            setShowDocumentsDialog(true);
                          }}
                          title="Documents"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEmployeeForReview(emp);
                            setShowPerformanceDialog(true);
                          }}
                          title="Performance Review"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEmployee(emp);
                            setShowEmployeeDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {['super_admin', 'org_admin'].includes(currentEmployee?.role) && emp.id !== currentEmployee?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEmployeeToDelete(emp);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

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
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'records', label: 'Payroll Records', icon: FileText },
              { id: 'packages', label: 'Packages', icon: Users },
              { id: 'benefits', label: 'Benefits & Deductions', icon: DollarSign },
              { id: 'audit', label: 'Audit Trail', icon: Clock },
              { id: 'tax', label: 'Tax Info', icon: Building2 }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={payrollSubTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPayrollSubTab(tab.id)}
                className={payrollSubTab === tab.id ? 'bg-[#1EB053] hover:bg-[#178f43]' : ''}
              >
                <tab.icon className="w-4 h-4 mr-1" />
                {tab.label}
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
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-[#1EB053]">Le {payroll.net_pay?.toLocaleString()}</p>
                            <Badge variant={
                              payroll.status === 'paid' ? 'secondary' :
                              payroll.status === 'approved' ? 'default' : 'outline'
                            }>
                              {payroll.status}
                            </Badge>
                          </div>
                          <PayslipGenerator 
                            payroll={payroll} 
                            employee={employees.find(e => e.id === payroll.employee_id)}
                            organisation={organisation?.[0]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {payrollSubTab === 'packages' && (
            <RemunerationPackageManager orgId={orgId} />
          )}

          {payrollSubTab === 'benefits' && (
            <BenefitsDeductionsManager orgId={orgId} employees={employees} />
          )}

          {payrollSubTab === 'audit' && (
            <PayrollAuditLog orgId={orgId} />
          )}

          {payrollSubTab === 'tax' && (
            <TaxCalculatorInfo />
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
        <TabsContent value="performance" className="mt-6">
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

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={showAddEmployeeDialog}
        onOpenChange={setShowAddEmployeeDialog}
        orgId={orgId}
        employeeCount={employees.length}
        organisation={organisation?.[0]}
        inviterName={currentEmployee?.full_name}
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

      {/* Employee Documents Dialog */}
      {selectedEmployeeForDocs && (
        <EmployeeDocuments
          open={showDocumentsDialog}
          onOpenChange={(open) => {
            setShowDocumentsDialog(open);
            if (!open) setSelectedEmployeeForDocs(null);
          }}
          employee={selectedEmployeeForDocs}
          currentEmployee={currentEmployee}
          orgId={orgId}
        />
      )}

      {/* Set PIN Dialog */}
      {selectedEmployeeForPin && (
        <SetPinDialog
          open={showSetPinDialog}
          onOpenChange={(open) => {
            setShowSetPinDialog(open);
            if (!open) setSelectedEmployeeForPin(null);
          }}
          employee={selectedEmployeeForPin}
          isAdmin={true}
        />
      )}

      {/* Delete Employee Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Employee
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove <strong>{employeeToDelete?.full_name}</strong> from the organisation?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete the employee record. 
                Associated data like attendance, payroll, and leave records will remain but may be orphaned.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setEmployeeToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployee}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Invite Email Dialog */}
      <SendInviteEmailDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organisation={organisation?.[0]}
        inviterName={currentEmployee?.full_name}
      />

      {/* Edit Employee Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input name="first_name" defaultValue={editingEmployee.first_name} required className="mt-1" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input name="last_name" defaultValue={editingEmployee.last_name} required className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={editingEmployee.email} className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" defaultValue={editingEmployee.phone} className="mt-1" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select name="department" defaultValue={editingEmployee.department}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Input name="position" defaultValue={editingEmployee.position} className="mt-1" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select name="role" defaultValue={editingEmployee.role}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editingEmployee.status}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Salary Type</Label>
                  <Select name="salary_type" defaultValue={editingEmployee.salary_type}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Salary (Le)</Label>
                  <Input name="base_salary" type="number" defaultValue={editingEmployee.base_salary} className="mt-1" />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEmployeeDialog(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto">
                  Update Employee
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedPage>
  );
}