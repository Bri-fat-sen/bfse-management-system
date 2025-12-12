import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Send,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Lock,
  FolderOpen,
  UserPlus,
  Cloud
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import AddEmployeeDialog from "@/components/hr/AddEmployeeDialog";
import BulkPayrollDialog from "@/components/hr/BulkPayrollDialog";
import PayrollProcessDialog from "@/components/hr/PayrollProcessDialog";
import LeaveManagement from "@/components/hr/LeaveManagement";
import PerformanceOverview from "@/components/hr/PerformanceOverview";
import SetPinDialog from "@/components/auth/SetPinDialog";
import SendInviteEmailDialog from "@/components/email/SendInviteEmailDialog";
import EmployeeDocuments from "@/components/hr/EmployeeDocuments";
import PerformanceReviewDialog from "@/components/hr/PerformanceReviewDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RemunerationPackageManager from "@/components/hr/RemunerationPackageManager";
import PayCycleManager from "@/components/hr/PayCycleManager";
import ExportToGoogleDrive from "@/components/exports/ExportToGoogleDrive";
import { format } from "date-fns";

export default function HRManagement() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showBulkPayrollDialog, setShowBulkPayrollDialog] = useState(false);
  const [showPayrollProcessDialog, setShowPayrollProcessDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [selectedEmployeeForPin, setSelectedEmployeeForPin] = useState(null);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [selectedEmployeeForDocs, setSelectedEmployeeForDocs] = useState(null);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [selectedEmployeeForReview, setSelectedEmployeeForReview] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showDeletePayrollDialog, setShowDeletePayrollDialog] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [showDriveExport, setShowDriveExport] = useState(false);
  const [exportData, setExportData] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employeeData } = useQuery({
    queryKey: ['currentEmployee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employeeData?.[0];
  const orgId = currentEmployee?.organisation_id;
  const isAdmin = ['super_admin', 'org_admin', 'hr_admin', 'payroll_admin'].includes(currentEmployee?.role) || user?.role === 'admin';

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: async () => {
      const orgs = await base44.entities.Organisation.list();
      return orgs.find(o => o.id === orgId);
    },
    enabled: !!orgId,
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }),
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

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['leaveRequests', orgId],
    queryFn: () => base44.entities.LeaveRequest.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: performanceReviews = [] } = useQuery({
    queryKey: ['performanceReviews', orgId],
    queryFn: () => base44.entities.PerformanceReview.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Employee deleted successfully");
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete employee", error.message);
    }
  });

  const bulkDeleteEmployeesMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.Employee.delete(id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Employees deleted", `${ids.length} employees removed successfully`);
      setSelectedEmployeeIds([]);
      setShowBulkDeleteDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to delete employees", error.message);
    }
  });

  const deletePayrollMutation = useMutation({
    mutationFn: (id) => base44.entities.Payroll.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast.success("Payroll deleted successfully");
      setShowDeletePayrollDialog(false);
      setPayrollToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete payroll", error.message);
    }
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || emp.role === roleFilter;
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, roleFilter, statusFilter]);

  // Calculate HR metrics
  const hrMetrics = useMemo(() => {
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
    const todayAttendance = attendance.filter(a => a.status === 'present').length;
    const pendingPayrolls = payrolls.filter(p => p.status === 'pending_approval').length;
    const thisMonthPayroll = payrolls.filter(p => {
      const payrollDate = new Date(p.period_start);
      const now = new Date();
      return payrollDate.getMonth() === now.getMonth() && payrollDate.getFullYear() === now.getFullYear();
    });
    const totalPayrollThisMonth = thisMonthPayroll.reduce((sum, p) => sum + (p.net_pay || 0), 0);

    return {
      totalEmployees: employees.length,
      activeEmployees,
      pendingLeaves,
      todayAttendance,
      attendanceRate: activeEmployees > 0 ? ((todayAttendance / activeEmployees) * 100).toFixed(1) : 0,
      pendingPayrolls,
      totalPayrollThisMonth,
      avgSalary: employees.length > 0 ? employees.reduce((sum, e) => sum + (e.base_salary || 0), 0) / employees.length : 0,
      pendingReviews: performanceReviews.filter(r => r.status === 'pending').length,
    };
  }, [employees, attendance, leaveRequests, payrolls, performanceReviews]);

  if (isLoading || !user) {
    return <LoadingSpinner message="Loading HR data..." />;
  }

  if (!currentEmployee || !orgId) {
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

  return (
    <div className="space-y-6">
      {/* Sierra Leone Stripe */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <PageHeader
        title="HR Management"
        subtitle="Employee management, payroll, and performance tracking"
        action={() => setShowAddEmployeeDialog(true)}
        actionLabel="Add Employee"
        actionIcon={UserPlus}
      >
        <Button
          variant="outline"
          onClick={() => {
            setExportData(employees);
            setShowDriveExport(true);
          }}
          className="border-blue-500 text-blue-700 hover:bg-blue-50"
        >
          <Cloud className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowInviteDialog(true)}
          className="border-[#0072C6]/30 hover:border-[#0072C6]"
        >
          <Send className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Send Invite</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowBulkPayrollDialog(true)}
          className="border-[#1EB053]/30 hover:border-[#1EB053]"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Process Payroll</span>
        </Button>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <Card className="border-l-4 border-l-[#1EB053]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#1EB053]" />
              <Badge className="bg-[#1EB053]/10 text-[#1EB053] text-[10px] sm:text-xs">Active</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{hrMetrics.activeEmployees}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Active Employees</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0072C6]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[#0072C6]" />
              <Badge className="bg-[#0072C6]/10 text-[#0072C6] text-[10px] sm:text-xs">{hrMetrics.attendanceRate}%</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{hrMetrics.todayAttendance}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Present Today</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
              <Badge className="bg-amber-100 text-amber-700 text-[10px] sm:text-xs">{hrMetrics.pendingLeaves}</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{leaveRequests.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Leave Requests</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              <Badge className="bg-purple-100 text-purple-700 text-[10px] sm:text-xs">{hrMetrics.pendingPayrolls}</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{payrolls.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Payroll Records</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              <Badge className="bg-green-100 text-green-700 text-[10px] sm:text-xs">Avg</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold">Le {(hrMetrics.avgSalary / 1000).toFixed(0)}k</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Average Salary</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
              <Badge className="bg-pink-100 text-pink-700 text-[10px] sm:text-xs">{hrMetrics.pendingReviews}</Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{performanceReviews.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="employees" className="text-xs sm:text-sm">Employees</TabsTrigger>
          <TabsTrigger value="packages" className="text-xs sm:text-sm">Packages</TabsTrigger>
          <TabsTrigger value="paycycles" className="text-xs sm:text-sm">Pay Cycles</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs sm:text-sm">Payroll</TabsTrigger>
          <TabsTrigger value="leaves" className="text-xs sm:text-sm">Leaves</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Payrolls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#1EB053]" />
                  Recent Payrolls
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payrolls.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No payroll records yet</p>
                ) : (
                  <div className="space-y-3">
                    {payrolls.slice(0, 5).map(payroll => (
                      <div key={payroll.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                              {payroll.employee_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{payroll.employee_name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(payroll.period_start), 'MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-bold text-[#1EB053] text-sm">Le {payroll.net_pay?.toLocaleString()}</p>
                            <Badge variant={
                              payroll.status === 'paid' ? 'default' :
                              payroll.status === 'approved' ? 'secondary' : 'outline'
                            } className="text-[10px]">
                              {payroll.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setPayrollToDelete(payroll);
                                  setShowDeletePayrollDialog(true);
                                }} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
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

            {/* Pending Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Pending Leave Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaveRequests.filter(l => l.status === 'pending').length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {leaveRequests.filter(l => l.status === 'pending').slice(0, 5).map(leave => (
                      <div key={leave.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-amber-200 text-amber-700">
                              {leave.employee_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{leave.employee_name}</p>
                            <p className="text-xs text-gray-500">{leave.leave_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{leave.days_requested} days</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Payroll Summary */}
          <Card className="border-l-4 border-l-[#1EB053]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#1EB053]" />
                  This Month's Payroll
                </span>
                <Badge className="bg-[#1EB053] text-white">
                  Le {hrMetrics.totalPayrollThisMonth.toLocaleString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1EB053]">
                    {payrolls.filter(p => p.status === 'paid').length}
                  </p>
                  <p className="text-xs text-gray-500">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#0072C6]">
                    {payrolls.filter(p => p.status === 'approved').length}
                  </p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {payrolls.filter(p => p.status === 'pending_approval').length}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {payrolls.filter(p => p.status === 'draft').length}
                  </p>
                  <p className="text-xs text-gray-500">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <RemunerationPackageManager orgId={orgId} />
        </TabsContent>

        {/* Pay Cycles Tab */}
        <TabsContent value="paycycles" className="space-y-4">
          <PayCycleManager orgId={orgId} employees={employees} currentEmployee={currentEmployee} />
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              {selectedEmployeeIds.length > 0 && (
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-blue-900">
                    {selectedEmployeeIds.length} employee(s) selected
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEmployeeIds([])}
                      className="flex-1 sm:flex-none"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowBulkDeleteDialog(true)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="org_admin">Org Admin</SelectItem>
                      <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredEmployees.map(emp => (
              <Card key={emp.id} className={`hover:shadow-lg transition-shadow ${selectedEmployeeIds.includes(emp.id) ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(emp.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedEmployeeIds(prev =>
                            prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]
                          );
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        disabled={emp.id === currentEmployee?.id}
                      />
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        <AvatarImage src={emp.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-sm">
                          {emp.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{emp.full_name}</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{emp.employee_code}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedEmployeeForPin(emp);
                          setShowSetPinDialog(true);
                        }}>
                          <Lock className="w-4 h-4 mr-2" />
                          {emp.pin_hash ? 'Change PIN' : 'Set PIN'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedEmployeeForDocs(emp);
                          setShowDocumentsDialog(true);
                        }}>
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedEmployeeForReview(emp);
                          setShowPerformanceDialog(true);
                        }}>
                          <Star className="w-4 h-4 mr-2" />
                          Performance Review
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {emp.id !== currentEmployee?.id && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setEmployeeToDelete(emp);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{emp.department || 'No department'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{emp.position || 'No position'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate text-[10px] sm:text-xs">{emp.email || 'No email'}</span>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex items-center justify-between gap-2">
                    <Badge variant={
                      emp.status === 'active' ? 'default' :
                      emp.status === 'inactive' ? 'secondary' : 'destructive'
                    } className="text-[10px] sm:text-xs">
                      {emp.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs truncate max-w-[120px]">
                      {emp.role?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payroll Records</CardTitle>
              <Button onClick={() => setShowPayrollProcessDialog(true)} className="bg-[#1EB053]">
                <Plus className="w-4 h-4 mr-2" />
                New Payroll
              </Button>
            </CardHeader>
            <CardContent>
              {payrolls.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No payroll records yet</p>
                <Button 
                  onClick={() => setShowBulkPayrollDialog(true)}
                  className="mt-4 bg-[#1EB053] w-full sm:w-auto"
                >
                  Process Payroll
                </Button>
              </div>
              ) : (
              <div className="space-y-3">
                {payrolls.slice(0, 20).map(payroll => (
                  <div key={payroll.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-1 min-w-0">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-sm">
                          {payroll.employee_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{payroll.employee_name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {format(new Date(payroll.period_start), 'MMM d')} - {format(new Date(payroll.period_end), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">Gross</p>
                        <p className="font-medium text-sm">Le {payroll.gross_pay?.toLocaleString()}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">Net Pay</p>
                        <p className="font-bold text-sm sm:text-base text-[#1EB053]">Le {payroll.net_pay?.toLocaleString()}</p>
                      </div>
                      <Badge variant={
                        payroll.status === 'paid' ? 'default' :
                        payroll.status === 'approved' ? 'secondary' : 'outline'
                      } className="text-[10px] sm:text-xs">
                        {payroll.status?.replace('_', ' ')}
                      </Badge>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setPayrollToDelete(payroll);
                              setShowDeletePayrollDialog(true);
                            }} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves">
          <LeaveManagement orgId={orgId} currentEmployee={currentEmployee} />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <PerformanceOverview orgId={orgId} employees={employees} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddEmployeeDialog
        open={showAddEmployeeDialog}
        onOpenChange={setShowAddEmployeeDialog}
        orgId={orgId}
        employeeCount={employees.length}
        organisation={organisation}
        inviterName={currentEmployee?.full_name}
      />

      <SendInviteEmailDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organisation={organisation}
        inviterName={currentEmployee?.full_name}
      />

      <BulkPayrollDialog
        open={showBulkPayrollDialog}
        onOpenChange={setShowBulkPayrollDialog}
        orgId={orgId}
        employees={employees}
      />

      <PayrollProcessDialog
        open={showPayrollProcessDialog}
        onOpenChange={setShowPayrollProcessDialog}
        orgId={orgId}
        employees={employees}
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

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Employee"
        description={`Are you sure you want to delete ${employeeToDelete?.full_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteEmployeeMutation.mutate(employeeToDelete.id)}
        isLoading={deleteEmployeeMutation.isPending}
      />

      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Delete Multiple Employees"
        description={`Are you sure you want to delete ${selectedEmployeeIds.length} employee(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={() => bulkDeleteEmployeesMutation.mutate(selectedEmployeeIds)}
        isLoading={bulkDeleteEmployeesMutation.isPending}
      />

      <ConfirmDialog
        open={showDeletePayrollDialog}
        onOpenChange={setShowDeletePayrollDialog}
        title="Delete Payroll Record"
        description={`Are you sure you want to delete the payroll for ${payrollToDelete?.employee_name} (${payrollToDelete?.period_start ? format(new Date(payrollToDelete.period_start), 'MMM yyyy') : ''})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deletePayrollMutation.mutate(payrollToDelete.id)}
        isLoading={deletePayrollMutation.isPending}
      />

      <ExportToGoogleDrive
        open={showDriveExport}
        onOpenChange={setShowDriveExport}
        data={exportData}
        fileName={`hr_employees_${format(new Date(), 'yyyy-MM-dd')}`}
        dataType="employees"
        orgId={orgId}
      />
    </div>
  );
}