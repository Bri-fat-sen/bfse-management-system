import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Building2,
  Mail,
  Phone,
  MoreVertical,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Link2,
  Unlink,
  Edit,
  Trash2,
  Lock,
  FolderOpen,
  Star,
  Filter,
  Package,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { ROLES } from "@/components/permissions/PermissionsContext";
import AddEmployeeDialog from "@/components/hr/AddEmployeeDialog";
import SetPinDialog from "@/components/auth/SetPinDialog";
import SendInviteEmailDialog from "@/components/email/SendInviteEmailDialog";
import EmployeeDocuments from "@/components/hr/EmployeeDocuments";
import PerformanceReviewDialog from "@/components/hr/PerformanceReviewDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CreateUserAccountDialog from "@/components/user/CreateUserAccountDialog";

const roles = [
  "super_admin", "org_admin", "hr_admin", "payroll_admin", "warehouse_manager",
  "retail_cashier", "vehicle_sales", "driver", "accountant", "support_staff", "read_only"
];

const departments = ["Management", "Sales", "Operations", "Finance", "Transport", "Support"];

export default function UserManagement() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLinked, setFilterLinked] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("employees"); // employees, users
  const [createEmployeeDialog, setCreateEmployeeDialog] = useState(null);
  const [linkEmployeeDialog, setLinkEmployeeDialog] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [selectedEmployeeForPin, setSelectedEmployeeForPin] = useState(null);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [selectedEmployeeForDocs, setSelectedEmployeeForDocs] = useState(null);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [selectedEmployeeForReview, setSelectedEmployeeForReview] = useState(null);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);

  // Fetch current user and employee
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currentEmployeeData } = useQuery({
    queryKey: ['currentEmployee', currentUser?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  const currentEmployee = currentEmployeeData?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch all Base44 users (requires admin)
  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: currentUser?.role === 'admin',
  });

  // Fetch all employees in the organization
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Fetch organization
  const { data: orgData } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const organisation = orgData?.[0];

  const { data: remunerationPackages = [] } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  // Fetch warehouses/locations
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowEmployeeDialog(false);
      setEditingEmployee(null);
      toast.success("Employee updated successfully");
    },
  });

  // Delete employee handler
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

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (data) => {
      const existingEmployees = await base44.entities.Employee.filter({ organisation_id: orgId });
      const employeeCode = `EMP${String(existingEmployees.length + 1).padStart(4, '0')}`;
      
      return base44.entities.Employee.create({
        organisation_id: orgId,
        employee_code: employeeCode,
        user_email: data.user.email,
        email: data.user.email,
        first_name: data.user.full_name?.split(' ')[0] || '',
        last_name: data.user.full_name?.split(' ').slice(1).join(' ') || '',
        full_name: data.user.full_name || '',
        role: data.role || 'read_only',
        department: data.department || '',
        position: data.position || '',
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setCreateEmployeeDialog(null);
      toast.success("Employee record created and linked successfully");
    },
    onError: (error) => {
      toast.error("Failed to create employee", error.message);
    }
  });

  // Link existing employee mutation
  const linkEmployeeMutation = useMutation({
    mutationFn: async ({ userId, employeeId, userEmail }) => {
      return base44.entities.Employee.update(employeeId, {
        user_email: userEmail,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setLinkEmployeeDialog(null);
      setSelectedEmployeeId("");
      toast.success("User linked to employee record");
    },
    onError: (error) => {
      toast.error("Failed to link user", error.message);
    }
  });

  // Unlink employee mutation
  const unlinkEmployeeMutation = useMutation({
    mutationFn: async (employeeId) => {
      return base44.entities.Employee.update(employeeId, {
        user_email: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("User unlinked from employee record");
    },
    onError: (error) => {
      toast.error("Failed to unlink user", error.message);
    }
  });

  // Match users with employees
  const usersWithEmployeeStatus = useMemo(() => {
    return users.map(user => {
      const linkedEmployee = employees.find(e => e.user_email === user.email || e.email === user.email);
      return {
        ...user,
        linkedEmployee,
        isLinked: !!linkedEmployee,
      };
    });
  }, [users, employees]);

  // Unlinked employees (created but not linked to a user)
  const unlinkedEmployees = useMemo(() => {
    return employees.filter(emp => !emp.user_email);
  }, [employees]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return usersWithEmployeeStatus.filter(user => {
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterLinked === 'all' ||
        (filterLinked === 'linked' && user.isLinked) ||
        (filterLinked === 'unlinked' && !user.isLinked);
      
      return matchesSearch && matchesFilter;
    });
  }, [usersWithEmployeeStatus, searchTerm, filterLinked]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           e.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || e.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, searchTerm, roleFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const packageId = formData.get('remuneration_package_id');
    const selectedPackage = packageId && packageId !== 'null' ? remunerationPackages.find(p => p.id === packageId) : null;
    const baseSalary = selectedPackage ? selectedPackage.base_salary : (parseFloat(formData.get('base_salary')) || 0);
    
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      full_name: `${formData.get('first_name')} ${formData.get('last_name')}`,
      role: formData.get('role'),
      department: formData.get('department'),
      position: formData.get('position'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      salary_type: selectedPackage?.salary_type || formData.get('salary_type'),
      base_salary: baseSalary,
      status: formData.get('status'),
      remuneration_package_id: selectedPackage ? packageId : null,
      remuneration_package_name: selectedPackage?.name || null,
      // Multi-location assignment
      assigned_location_ids: editingEmployee.assigned_location_ids || [],
      assigned_location_names: editingEmployee.assigned_location_names || [],
    };
    updateEmployeeMutation.mutate({ id: editingEmployee.id, data });
  };

  const isPlatformAdmin = currentUser?.role === 'admin';
  const isOrgAdmin = ['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role);

  if (!isPlatformAdmin && !isOrgAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Access Restricted</h2>
        <p className="text-gray-500 mt-2">You need admin privileges to access user management.</p>
      </div>
    );
  }

  if (loadingEmployees || (isPlatformAdmin && loadingUsers)) {
    return <LoadingSpinner message="Loading..." subtitle="Fetching data" fullScreen />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage employees and app user accounts"
        action={() => setShowAddEmployeeDialog(true)}
        actionLabel="Add Employee"
      >
        {isPlatformAdmin && (
          <Button
            variant="outline"
            onClick={() => setShowCreateUserDialog(true)}
            className="border-[#1EB053]/30 hover:border-[#1EB053] hover:bg-[#1EB053]/10"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create User</span>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setShowInviteDialog(true)}
          className="border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/10"
        >
          <Mail className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Send Invite</span>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-xs text-gray-500">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{employees.filter(e => e.status === 'active').length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {isPlatformAdmin && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-xs text-gray-500">App Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <UserX className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{usersWithEmployeeStatus.filter(u => !u.isLinked).length}</p>
                    <p className="text-xs text-gray-500">Users Not Linked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {!isPlatformAdmin && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unlinkedEmployees.length}</p>
                  <p className="text-xs text-gray-500">Unlinked Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'employees' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('employees')}
          className={activeTab === 'employees' ? 'bg-[#1EB053]' : ''}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Employees
        </Button>
        {isPlatformAdmin && (
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'bg-[#0072C6]' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            App Users
          </Button>
        )}
      </div>

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <>
          {/* Unlinked Employees Alert */}
          {unlinkedEmployees.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800">Unlinked Employee Records</p>
                    <p className="text-sm text-amber-700 mb-3">
                      {unlinkedEmployees.length} employee{unlinkedEmployees.length !== 1 ? 's' : ''} without user account link
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {unlinkedEmployees.slice(0, 5).map(emp => (
                        <Badge key={emp.id} variant="outline" className="text-xs bg-white">
                          {emp.full_name} ({emp.employee_code})
                        </Badge>
                      ))}
                      {unlinkedEmployees.length > 5 && (
                        <Badge variant="outline" className="text-xs bg-white">
                          +{unlinkedEmployees.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
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
          {filteredEmployees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Employees Found"
              description="Add employees to get started"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <Card key={emp.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                            {emp.full_name?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{emp.full_name}</h3>
                          <p className="text-sm text-gray-500 truncate">{emp.employee_code}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(emp.status) + " text-xs flex-shrink-0"}>
                        {emp.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{emp.department || 'No department'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{emp.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{emp.phone || 'No phone'}</span>
                      </div>
                      {emp.user_email ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Link2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate text-xs">Linked to user</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Unlink className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate text-xs">Not linked</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs truncate max-w-[120px]">
                        {emp.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${!emp.pin_hash ? "text-amber-600" : ""}`}
                          onClick={() => {
                            setSelectedEmployeeForPin(emp);
                            setShowSetPinDialog(true);
                          }}
                          title={emp.pin_hash ? "Change PIN" : "Set PIN"}
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
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
                          className="h-8 w-8"
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
                          className="h-8"
                          onClick={() => {
                            setEditingEmployee(emp);
                            setShowEmployeeDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        {emp.id !== currentEmployee?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setEmployeeToDelete(emp);
                              setShowDeleteDialog(true);
                            }}
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
        </>
      )}

      {/* Users Tab - Platform Admin Only */}
      {activeTab === 'users' && isPlatformAdmin && (
        <>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0072C6]" />
                App Users
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterLinked} onValueChange={setFilterLinked}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="linked">Linked</SelectItem>
                    <SelectItem value="unlinked">Not Linked</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => refetchUsers()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Platform Role</TableHead>
                      <TableHead>Employee Status</TableHead>
                      <TableHead>Employee Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xs">
                                  {user.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.full_name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{user.email}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isLinked ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">Linked</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-sm text-amber-600">Not Linked</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.linkedEmployee ? (
                              <Badge variant="outline">
                                {user.linkedEmployee.role?.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.isLinked ? (
                                  <>
                                    <DropdownMenuItem disabled className="text-gray-500">
                                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                      Linked to: {user.linkedEmployee?.full_name}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => unlinkEmployeeMutation.mutate(user.linkedEmployee.id)}
                                      className="text-red-600"
                                    >
                                      <Unlink className="w-4 h-4 mr-2" />
                                      Unlink from Employee
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => setCreateEmployeeDialog(user)}>
                                      <UserPlus className="w-4 h-4 mr-2" />
                                      Create Employee Record
                                    </DropdownMenuItem>
                                    {unlinkedEmployees.length > 0 && (
                                      <DropdownMenuItem onClick={() => setLinkEmployeeDialog(user)}>
                                        <Link2 className="w-4 h-4 mr-2" />
                                        Link to Existing Employee
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Unlinked Employees Section */}
          {unlinkedEmployees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  Unlinked Employee Records ({unlinkedEmployees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  These employee records are not linked to any app user.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {unlinkedEmployees.map((emp) => (
                    <div key={emp.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={emp.profile_photo} />
                          <AvatarFallback className="bg-amber-200 text-amber-700">
                            {emp.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{emp.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{emp.email || 'No email'}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {emp.role?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Employee Dialog */}
      <Dialog open={!!createEmployeeDialog} onOpenChange={() => setCreateEmployeeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#1EB053]" />
              Create Employee Record
            </DialogTitle>
            <DialogDescription>
              Create an employee record for {createEmployeeDialog?.full_name} ({createEmployeeDialog?.email})
            </DialogDescription>
          </DialogHeader>
          
          <CreateEmployeeForm
            user={createEmployeeDialog}
            organisation={organisation}
            onSubmit={(data) => createEmployeeMutation.mutate(data)}
            isLoading={createEmployeeMutation.isPending}
            onCancel={() => setCreateEmployeeDialog(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Link to Existing Employee Dialog */}
      <Dialog open={!!linkEmployeeDialog} onOpenChange={() => setLinkEmployeeDialog(null)}>
        <DialogContent className="[&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#0072C6]" />
              Link to Existing Employee
            </DialogTitle>
            <DialogDescription>
              Link {linkEmployeeDialog?.full_name} to an existing employee record
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Employee Record</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {unlinkedEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <span>{emp.full_name}</span>
                        <Badge variant="outline" className="text-xs">{emp.role?.replace('_', ' ')}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkEmployeeDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => linkEmployeeMutation.mutate({
                userId: linkEmployeeDialog?.id,
                employeeId: selectedEmployeeId,
                userEmail: linkEmployeeDialog?.email,
              })}
              disabled={!selectedEmployeeId || linkEmployeeMutation.isPending}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {linkEmployeeMutation.isPending ? "Linking..." : "Link User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={showAddEmployeeDialog}
        onOpenChange={setShowAddEmployeeDialog}
        orgId={orgId}
        employeeCount={employees.length}
        organisation={organisation}
        inviterName={currentEmployee?.full_name}
      />

      {/* Send Invite Email Dialog */}
      <SendInviteEmailDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organisation={organisation}
        inviterName={currentEmployee?.full_name}
      />

      {/* Edit Employee Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              {/* User Linking Section */}
              {isPlatformAdmin && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-xs text-blue-700 flex items-center gap-1 mb-2">
                    <Link2 className="w-3 h-3" /> User Account Link
                  </Label>
                  {editingEmployee.user_email ? (
                    <div className="flex items-center justify-between bg-white rounded p-2 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{editingEmployee.user_email}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (confirm('Unlink this user from employee?')) {
                            try {
                              await unlinkEmployeeMutation.mutateAsync(editingEmployee.id);
                              setShowEmployeeDialog(false);
                              setEditingEmployee(null);
                            } catch (error) {
                              console.error('Unlink error:', error);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                        disabled={unlinkEmployeeMutation.isPending}
                      >
                        <Unlink className="w-4 h-4 mr-1" />
                        {unlinkEmployeeMutation.isPending ? 'Unlinking...' : 'Unlink'}
                      </Button>
                    </div>
                  ) : (
                    <Select 
                      value={editingEmployee.user_email || ""}
                      onValueChange={async (email) => {
                        if (email && confirm(`Link ${email} to this employee?`)) {
                          try {
                            await linkEmployeeMutation.mutateAsync({
                              userId: null,
                              employeeId: editingEmployee.id,
                              userEmail: email
                            });
                            setShowEmployeeDialog(false);
                            setEditingEmployee(null);
                          } catch (error) {
                            console.error('Link error:', error);
                          }
                        }
                      }}
                      disabled={linkEmployeeMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user to link..." />
                      </SelectTrigger>
                      <SelectContent>
                        {usersWithEmployeeStatus.filter(u => !u.isLinked).map(user => (
                          <SelectItem key={user.id} value={user.email}>
                            <div className="flex items-center gap-2">
                              <span>{user.full_name}</span>
                              <span className="text-xs text-gray-500">({user.email})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
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
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editingEmployee.status}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-xs text-green-700 flex items-center gap-1 mb-2">
                  <Package className="w-3 h-3" /> Remuneration Package
                </Label>
                <Select name="remuneration_package_id" defaultValue={editingEmployee.remuneration_package_id || ""}>
                  <SelectTrigger><SelectValue placeholder="Select package (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">No package</SelectItem>
                    {remunerationPackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} - Le {pkg.base_salary?.toLocaleString()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Multi-Location Assignment for super_admin, org_admin, warehouse_manager */}
              {['super_admin', 'org_admin', 'warehouse_manager'].includes(editingEmployee.role) && warehouses.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-xs text-blue-700 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> Assigned Locations (Multiple)
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {warehouses.map(wh => {
                      const isSelected = editingEmployee.assigned_location_ids?.includes(wh.id);
                      return (
                        <label 
                          key={wh.id} 
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentIds = editingEmployee.assigned_location_ids || [];
                              const currentNames = editingEmployee.assigned_location_names || [];
                              if (checked) {
                                setEditingEmployee({
                                  ...editingEmployee,
                                  assigned_location_ids: [...currentIds, wh.id],
                                  assigned_location_names: [...currentNames, wh.name]
                                });
                              } else {
                                const idx = currentIds.indexOf(wh.id);
                                setEditingEmployee({
                                  ...editingEmployee,
                                  assigned_location_ids: currentIds.filter(id => id !== wh.id),
                                  assigned_location_names: currentNames.filter((_, i) => i !== idx)
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{wh.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  {editingEmployee.assigned_location_ids?.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2">
                      {editingEmployee.assigned_location_ids.length} location(s) selected
                    </p>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEmployeeDialog(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">Update</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog - Sierra Leone Theme */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Employee"
        description={`Are you sure you want to remove ${employeeToDelete?.full_name}? This will permanently delete the employee record and cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteEmployee}
        isLoading={isDeleting}
      />

      {/* Set PIN Dialog */}
      {selectedEmployeeForPin && (
        <SetPinDialog
          open={showSetPinDialog}
          onOpenChange={(open) => { setShowSetPinDialog(open); if (!open) setSelectedEmployeeForPin(null); }}
          employee={selectedEmployeeForPin}
          isAdmin={true}
        />
      )}

      {/* Documents Dialog */}
      {selectedEmployeeForDocs && (
        <EmployeeDocuments
          open={showDocumentsDialog}
          onOpenChange={(open) => { setShowDocumentsDialog(open); if (!open) setSelectedEmployeeForDocs(null); }}
          employee={selectedEmployeeForDocs}
          currentEmployee={currentEmployee}
          orgId={orgId}
        />
      )}

      {/* Performance Review Dialog */}
      {selectedEmployeeForReview && (
        <PerformanceReviewDialog
          open={showPerformanceDialog}
          onOpenChange={(open) => { setShowPerformanceDialog(open); if (!open) setSelectedEmployeeForReview(null); }}
          employee={selectedEmployeeForReview}
          currentEmployee={currentEmployee}
          orgId={orgId}
        />
      )}

      {/* Create User Account Dialog */}
      <CreateUserAccountDialog
        open={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
      />
    </div>
  );
}

// Create Employee Form Component
function CreateEmployeeForm({ user, organisation, onSubmit, isLoading, onCancel }) {
  const [formData, setFormData] = useState({
    role: 'read_only',
    department: '',
    position: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ user, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
              {user?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.full_name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div>
        <Label>Role</Label>
        <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role.key} value={role.key}>
                <div className="flex flex-col">
                  <span>{role.name}</span>
                  <span className="text-xs text-gray-500">{role.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Department</Label>
        <Input
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
          placeholder="e.g. Sales, Operations, HR"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Position</Label>
        <Input
          value={formData.position}
          onChange={(e) => setFormData({...formData, position: e.target.value})}
          placeholder="e.g. Sales Manager, Driver"
          className="mt-1"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          {isLoading ? "Creating..." : "Create Employee"}
        </Button>
      </DialogFooter>
    </form>
  );
}