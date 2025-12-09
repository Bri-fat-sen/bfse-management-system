import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import { format } from "date-fns";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  Edit,
  Trash2,
  Lock,
  Star,
  FolderOpen,
  UserCheck,
  UserX,
  AlertCircle,
  DollarSign,
  Clock,
  Calendar,
  FileText,
  Grid,
  List,
  MoreVertical,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

import AddEmployeeDialog from "@/components/hr/AddEmployeeDialog";
import SetPinDialog from "@/components/auth/SetPinDialog";
import EmployeeDocuments from "@/components/hr/EmployeeDocuments";
import PerformanceReviewDialog from "@/components/hr/PerformanceReviewDialog";
import EmployeeEntryTemplate from "@/components/templates/EmployeeEntryTemplate";
import PayrollProcessDialog from "@/components/hr/PayrollProcessDialog";
import PayslipGenerator from "@/components/hr/PayslipGenerator";
import LeaveRequestDialog from "@/components/hr/LeaveRequestDialog";
import LeaveManagement from "@/components/hr/LeaveManagement";
import PerformanceOverview from "@/components/hr/PerformanceOverview";
import BulkPayrollDialog from "@/components/hr/BulkPayrollDialog";
import RemunerationPackageManager from "@/components/hr/RemunerationPackageManager";
import PayrollReportingModule from "@/components/hr/PayrollReportingModule";
import AIReportSummary from "@/components/ai/AIReportSummary";
import PayComponentManager from "@/components/hr/PayComponentManager";
import StatutoryRateManager from "@/components/hr/StatutoryRateManager";
import PayrollApprovalWorkflow from "@/components/hr/PayrollApprovalWorkflow";
import OvertimePrediction from "@/components/hr/OvertimePrediction";
import PayrollAuditLog from "@/components/hr/PayrollAuditLog";

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "org_admin", label: "Org Admin" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "payroll_admin", label: "Payroll Admin" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "retail_cashier", label: "Retail Cashier" },
  { value: "vehicle_sales", label: "Vehicle Sales" },
  { value: "driver", label: "Driver" },
  { value: "accountant", label: "Accountant" },
  { value: "support_staff", label: "Support Staff" },
  { value: "read_only", label: "Read Only" },
];

export default function HR() {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("employees");
  const [payrollSubTab, setPayrollSubTab] = useState("records");
  
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [selectedEmployeeForPin, setSelectedEmployeeForPin] = useState(null);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [selectedEmployeeForDocs, setSelectedEmployeeForDocs] = useState(null);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [selectedEmployeeForReview, setSelectedEmployeeForReview] = useState(null);
  
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showBulkPayrollDialog, setShowBulkPayrollDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [showPayrollDeleteConfirm, setShowPayrollDeleteConfirm] = useState(false);
  const [payrollToReverse, setPayrollToReverse] = useState(null);
  const [showReverseConfirm, setShowReverseConfirm] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['todayAttendance', orgId],
    queryFn: () => base44.entities.Attendance.filter({ 
      organisation_id: orgId,
      date: format(new Date(), 'yyyy-MM-dd')
    }),
    enabled: !!orgId,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }, '-created_date', 50),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Employee deleted successfully");
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete employee", error.message);
    },
  });

  // Delete payroll mutation
  const deletePayrollMutation = useMutation({
    mutationFn: async (payroll) => {
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
      await base44.entities.Payroll.delete(payroll.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast.success("Payroll deleted successfully");
      setShowPayrollDeleteConfirm(false);
      setPayrollToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete payroll", error.message);
    },
  });

  // Reverse payroll mutation
  const reversePayrollMutation = useMutation({
    mutationFn: async (payroll) => {
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
      await base44.entities.Payroll.update(payroll.id, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast.success("Payroll reversed successfully");
      setShowReverseConfirm(false);
      setPayrollToReverse(null);
    },
    onError: (error) => {
      toast.error("Failed to reverse payroll", error.message);
    },
  });

  // Departments from employees
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = 
        e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone?.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesRole = roleFilter === "all" || e.role === roleFilter;
      const matchesDepartment = departmentFilter === "all" || e.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesRole && matchesDepartment;
    });
  }, [employees, searchTerm, statusFilter, roleFilter, departmentFilter]);

  // Stats
  const stats = useMemo(() => {
    const activeCount = employees.filter(e => e.status === 'active').length;
    const presentCount = attendance.filter(a => a.clock_in_time).length;
    const totalSalary = employees
      .filter(e => e.status === 'active')
      .reduce((sum, e) => sum + (e.base_salary || 0), 0);
    
    return {
      total: employees.length,
      active: activeCount,
      present: presentCount,
      totalSalary,
      pendingPayrolls: payrolls.filter(p => p.status === 'pending_approval').length
    };
  }, [employees, attendance, payrolls]);

  if (!user) {
    return <LoadingSpinner message="Loading HR..." fullScreen />;
  }

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
    return <LoadingSpinner message="Loading HR..." fullScreen />;
  }

  return (
    <ProtectedPage module="hr">
      <div className="space-y-6">
        {/* Sierra Leone Stripe Header */}
        <div className="h-2 w-full flex rounded-full overflow-hidden shadow-lg">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#1EB053] via-white to-[#0072C6] rounded-3xl blur-lg opacity-40" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-2xl">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#1EB053] via-[#0072C6] to-[#1EB053] bg-clip-text text-transparent">
                Human Resources
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">Manage employees, payroll, and HR operations</p>
            </div>
          </div>
          <EmployeeEntryTemplate organisation={organisation?.[0]} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Employees"
            value={stats.total}
            icon={Users}
            color="blue"
            subtitle={`${stats.active} active`}
          />
          <StatCard
            title="Present Today"
            value={stats.present}
            icon={UserCheck}
            color="green"
            subtitle={`${((stats.present / stats.active) * 100 || 0).toFixed(0)}% attendance`}
          />
          <StatCard
            title="Total Payroll"
            value={`Le ${(stats.totalSalary / 1000).toFixed(0)}K`}
            icon={DollarSign}
            color="gold"
            subtitle="Monthly base"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingPayrolls}
            icon={AlertCircle}
            color="red"
            subtitle="Payroll items"
          />
          <StatCard
            title="Departments"
            value={departments.length || 1}
            icon={Building2}
            color="purple"
          />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border-2 border-gray-200 p-1.5 w-full rounded-xl shadow-sm">
            <TabsTrigger 
              value="employees" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger 
              value="attendance" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Clock className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger 
              value="payroll" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Payroll
            </TabsTrigger>
            <TabsTrigger 
              value="leave" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Leave
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Star className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* EMPLOYEES TAB */}
          <TabsContent value="employees" className="mt-6 space-y-6">
            {/* Filters */}
            <Card className="border-t-4 border-t-[#1EB053] shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search by name, code, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base border-2 focus:border-[#1EB053] rounded-xl"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[160px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {ROLES.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {departments.length > 0 && (
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <div className="ml-auto flex gap-1 bg-gray-100 p-1 rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white' : ''}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white' : ''}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Showing {filteredEmployees.length} of {employees.length} employees
                    </span>
                    {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all' || departmentFilter !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setRoleFilter("all");
                          setDepartmentFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Employee Button (Mobile) */}
            <Button
              onClick={() => {
                setEditingEmployee(null);
                setShowAddDialog(true);
              }}
              className="w-full lg:hidden bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-xl transition-all h-12"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Employee
            </Button>

            {/* Employees Display */}
            {filteredEmployees.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <EmptyState
                    icon={Users}
                    title={searchTerm || statusFilter !== 'all' ? "No Employees Found" : "No Employees Yet"}
                    description={searchTerm || statusFilter !== 'all' ? "Try adjusting your filters" : "Add your first employee to get started"}
                  />
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((emp) => (
                  <Card 
                    key={emp.id} 
                    className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden relative"
                  >
                    <div className="h-1.5 flex">
                      <div className="flex-1 bg-[#1EB053]" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-[#0072C6]" />
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-16 h-16 border-4 border-white shadow-lg ring-2 ring-gray-100">
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xl font-bold">
                            {emp.full_name?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate text-gray-900">{emp.full_name}</h3>
                          <p className="text-sm text-gray-500 font-mono">{emp.employee_code}</p>
                          <Badge 
                            className={`mt-2 ${
                              emp.status === 'active' ? 'bg-green-100 text-green-800' :
                              emp.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {emp.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center flex-shrink-0">
                            <Star className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="font-semibold truncate">
                              {ROLES.find(r => r.value === emp.role)?.label || emp.role}
                            </p>
                          </div>
                        </div>

                        {emp.department && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Department</p>
                              <p className="font-semibold truncate">{emp.department}</p>
                            </div>
                          </div>
                        )}

                        {emp.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center flex-shrink-0">
                              <Mail className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-gray-700">{emp.email}</p>
                            </div>
                          </div>
                        )}

                        {emp.phone && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center flex-shrink-0">
                              <Phone className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-gray-700">{emp.phone}</p>
                            </div>
                          </div>
                        )}

                        {emp.base_salary > 0 && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Base Salary</p>
                              <p className="font-bold text-[#1EB053]">Le {emp.base_salary.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingEmployee(emp);
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedEmployeeForPin(emp);
                            setShowSetPinDialog(true);
                          }}
                          title={emp.pin_hash ? "Change PIN" : "Set PIN"}
                          className={!emp.pin_hash ? "border-amber-300 text-amber-600" : ""}
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
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
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedEmployeeForReview(emp);
                            setShowPerformanceDialog(true);
                          }}
                          title="Performance"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        {emp.id !== currentEmployee?.id && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEmployeeToDelete(emp);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-500 hover:bg-red-50 hover:border-red-300"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-t-4 border-t-[#0072C6] shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {filteredEmployees.map((emp) => (
                      <div 
                        key={emp.id}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all group"
                      >
                        <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white font-bold">
                            {emp.full_name?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="font-bold text-gray-900 truncate">{emp.full_name}</p>
                            <p className="text-sm text-gray-500 font-mono">{emp.employee_code}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Role & Department</p>
                            <p className="text-sm font-medium truncate">
                              {ROLES.find(r => r.value === emp.role)?.label || emp.role}
                            </p>
                            {emp.department && (
                              <p className="text-xs text-gray-500 truncate">{emp.department}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Contact</p>
                            <p className="text-sm truncate">{emp.email || emp.phone || '-'}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Salary</p>
                              <p className="text-sm font-bold text-[#1EB053]">
                                {emp.base_salary > 0 ? `Le ${emp.base_salary.toLocaleString()}` : '-'}
                              </p>
                            </div>
                            <Badge className={
                              emp.status === 'active' ? 'bg-green-100 text-green-800' :
                              emp.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {emp.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingEmployee(emp);
                              setShowAddDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEmployeeForPin(emp);
                              setShowSetPinDialog(true);
                            }}
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEmployeeForDocs(emp);
                              setShowDocumentsDialog(true);
                            }}
                          >
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                          {emp.id !== currentEmployee?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEmployeeToDelete(emp);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ATTENDANCE TAB */}
          <TabsContent value="attendance" className="mt-6">
            <Card className="border-t-4 border-t-[#1EB053]">
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

          {/* PAYROLL TAB */}
          <TabsContent value="payroll" className="mt-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'records', label: 'Payroll Records', icon: FileText },
                { id: 'approval', label: 'Approval Workflow', icon: UserCheck },
                { id: 'components', label: 'Pay Components', icon: DollarSign },
                { id: 'packages', label: 'Packages', icon: Users },
                { id: 'statutory', label: 'Statutory Rates', icon: Building2 },
                { id: 'overtime', label: 'Overtime Analysis', icon: Clock },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'audit', label: 'Audit Trail', icon: Clock }
              ].map(tab => (
                <Button
                  key={tab.id}
                  variant={payrollSubTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPayrollSubTab(tab.id)}
                  className={payrollSubTab === tab.id ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white' : ''}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {payrollSubTab === 'records' && (
              <Card className="border-t-4 border-t-[#1EB053]">
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
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] flex-1 sm:flex-none"
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
                                      onClick={() => {
                                        setPayrollToReverse(payroll);
                                        setShowReverseConfirm(true);
                                      }}
                                      className="text-amber-600"
                                    >
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Reverse Payroll
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPayrollToDelete(payroll);
                                      setShowPayrollDeleteConfirm(true);
                                    }}
                                    className="text-red-600"
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

          {/* LEAVE TAB */}
          <TabsContent value="leave" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button 
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                onClick={() => setShowLeaveDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Leave
              </Button>
            </div>
            <LeaveManagement orgId={orgId} currentEmployee={currentEmployee} />
          </TabsContent>

          {/* PERFORMANCE TAB */}
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

        {/* Dialogs */}
        <AddEmployeeDialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) setEditingEmployee(null);
          }}
          editingEmployee={editingEmployee}
          orgId={orgId}
          employeeCount={employees.length}
          organisation={organisation?.[0]}
          inviterName={currentEmployee?.full_name}
          onSuccess={() => {
            setShowAddDialog(false);
            setEditingEmployee(null);
          }}
        />

        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Employee"
          description={`Are you sure you want to delete ${employeeToDelete?.full_name}? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deleteEmployeeMutation.mutate(employeeToDelete.id)}
          isLoading={deleteEmployeeMutation.isPending}
        />

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

        <PayrollProcessDialog
          open={showPayrollDialog}
          onOpenChange={setShowPayrollDialog}
          employees={employees}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        <BulkPayrollDialog
          open={showBulkPayrollDialog}
          onOpenChange={setShowBulkPayrollDialog}
          employees={employees}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        <LeaveRequestDialog
          open={showLeaveDialog}
          onOpenChange={setShowLeaveDialog}
          currentEmployee={currentEmployee}
          orgId={orgId}
        />

        <ConfirmDialog
          open={showPayrollDeleteConfirm}
          onOpenChange={setShowPayrollDeleteConfirm}
          title="Delete Payroll"
          description={`Are you sure you want to delete the payroll for ${payrollToDelete?.employee_name}? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deletePayrollMutation.mutate(payrollToDelete)}
          isLoading={deletePayrollMutation.isPending}
        />

        <ConfirmDialog
          open={showReverseConfirm}
          onOpenChange={setShowReverseConfirm}
          title="Reverse Payroll"
          description={`Are you sure you want to reverse the payroll for ${payrollToReverse?.employee_name}? This will mark it as cancelled.`}
          confirmLabel="Reverse"
          variant="warning"
          onConfirm={() => reversePayrollMutation.mutate(payrollToReverse)}
          isLoading={reversePayrollMutation.isPending}
        />
      </div>
    </ProtectedPage>
  );
}