import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Shield,
  Building2,
  Mail,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Link2,
  Unlink,
  Edit,
  Eye,
  Trash2,
  Phone,
  MapPin,
  Briefcase,
  Send
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
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PermissionGate } from "@/components/permissions/PermissionGate";
import { ROLES } from "@/components/permissions/PermissionsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import SendInviteEmailDialog from "@/components/email/SendInviteEmailDialog";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLinked, setFilterLinked] = useState("all"); // all, linked, unlinked
  const [filterStatus, setFilterStatus] = useState("all");
  const [createEmployeeDialog, setCreateEmployeeDialog] = useState(null);
  const [linkEmployeeDialog, setLinkEmployeeDialog] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [editEmployeeDialog, setEditEmployeeDialog] = useState(null);
  const [viewEmployeeDialog, setViewEmployeeDialog] = useState(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);

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

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return base44.entities.Employee.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEditEmployeeDialog(null);
      toast.success("Employee updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update employee", { description: error.message });
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Employee.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete employee", { description: error.message });
    }
  });

  // Add new employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (data) => {
      const existingEmployees = await base44.entities.Employee.filter({ organisation_id: orgId });
      const employeeCode = `EMP${String(existingEmployees.length + 1).padStart(4, '0')}`;
      
      return base44.entities.Employee.create({
        organisation_id: orgId,
        employee_code: employeeCode,
        ...data,
        full_name: `${data.first_name} ${data.last_name}`.trim(),
        status: 'active',
        hire_date: data.hire_date || new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowAddEmployeeDialog(false);
      toast.success("Employee added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add employee", { description: error.message });
    }
  });

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
      toast.error("Failed to create employee", { description: error.message });
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
      toast.error("Failed to link user", { description: error.message });
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
      toast.error("Failed to unlink user", { description: error.message });
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
    return employees.filter(emp => {
      const matchesSearch = 
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'all' || emp.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, filterStatus]);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Access Restricted</h2>
        <p className="text-gray-500 mt-2">Only platform administrators can access user management.</p>
      </div>
    );
  }

  if (loadingUsers || loadingEmployees) {
    return <LoadingSpinner message="Loading Users..." subtitle="Fetching user data" fullScreen />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Employee Management"
        subtitle="Manage app users, employees, and team access"
        actionIcon={Users}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
            <Send className="w-4 h-4 mr-2" />
            Invite User
          </Button>
          <Button onClick={() => setShowAddEmployeeDialog(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-gray-500">Total Users</p>
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
                <p className="text-2xl font-bold">{usersWithEmployeeStatus.filter(u => u.isLinked).length}</p>
                <p className="text-xs text-gray-500">Linked to Employee</p>
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
                <p className="text-xs text-gray-500">Not Linked</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            App Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Briefcase className="w-4 h-4 mr-2" />
            Employees ({employees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
      {/* Users Table */}
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

      {/* Unlinked Employees Alert */}
      {unlinkedEmployees.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-700">
                <strong>{unlinkedEmployees.length} employee(s)</strong> not linked to app users. 
                Use "Link to Existing Employee" from user actions to connect them.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          {/* Employees Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1EB053]" />
                Employee Directory
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>App Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={emp.profile_photo} />
                                <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xs">
                                  {emp.full_name?.charAt(0) || 'E'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{emp.full_name}</span>
                                <p className="text-xs text-gray-500">{emp.position || '-'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{emp.employee_code}</Badge>
                          </TableCell>
                          <TableCell>{emp.department || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{emp.role?.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              emp.status === 'active' ? 'default' :
                              emp.status === 'inactive' ? 'secondary' :
                              'destructive'
                            } className={emp.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                              {emp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {emp.user_email ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-green-600">Linked</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <X className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-400">No access</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewEmployeeDialog(emp)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditEmployeeDialog(emp)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Employee
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this employee?')) {
                                      deleteEmployeeMutation.mutate(emp.id);
                                    }
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
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
        </TabsContent>
      </Tabs>

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

      {/* View Employee Dialog */}
      <Dialog open={!!viewEmployeeDialog} onOpenChange={() => setViewEmployeeDialog(null)}>
        <DialogContent className="max-w-lg [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#0072C6]" />
              Employee Details
            </DialogTitle>
          </DialogHeader>
          {viewEmployeeDialog && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={viewEmployeeDialog.profile_photo} />
                  <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xl">
                    {viewEmployeeDialog.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewEmployeeDialog.full_name}</h3>
                  <p className="text-gray-500">{viewEmployeeDialog.position} • {viewEmployeeDialog.department}</p>
                  <Badge variant="outline" className="mt-1">{viewEmployeeDialog.employee_code}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{viewEmployeeDialog.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{viewEmployeeDialog.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium">{viewEmployeeDialog.role?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Hire Date</p>
                    <p className="text-sm font-medium">
                      {viewEmployeeDialog.hire_date ? format(new Date(viewEmployeeDialog.hire_date), 'MMM d, yyyy') : '-'}
                    </p>
                  </div>
                </div>
              </div>
              
              {viewEmployeeDialog.address && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">{viewEmployeeDialog.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEmployeeDialog(null)}>Close</Button>
            <Button onClick={() => { setEditEmployeeDialog(viewEmployeeDialog); setViewEmployeeDialog(null); }} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editEmployeeDialog} onOpenChange={() => setEditEmployeeDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#1EB053]" />
              Edit Employee
            </DialogTitle>
          </DialogHeader>
          {editEmployeeDialog && (
            <EditEmployeeForm
              employee={editEmployeeDialog}
              onSubmit={(data) => updateEmployeeMutation.mutate({ id: editEmployeeDialog.id, data })}
              isLoading={updateEmployeeMutation.isPending}
              onCancel={() => setEditEmployeeDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Employee Dialog */}
      <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#1EB053]" />
              Add New Employee
            </DialogTitle>
          </DialogHeader>
          <AddEmployeeForm
            onSubmit={(data) => addEmployeeMutation.mutate(data)}
            isLoading={addEmployeeMutation.isPending}
            onCancel={() => setShowAddEmployeeDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <SendInviteEmailDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organisation={organisation}
      />
    </div>
  );
}

// Edit Employee Form Component
function EditEmployeeForm({ employee, onSubmit, isLoading, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    department: employee?.department || '',
    position: employee?.position || '',
    role: employee?.role || 'read_only',
    status: employee?.status || 'active',
    address: employee?.address || '',
    base_salary: employee?.base_salary || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Department</Label>
          <Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Position</Label>
          <Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role</Label>
          <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.key} value={role.key}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Base Salary (Le)</Label>
        <Input type="number" value={formData.base_salary} onChange={(e) => setFormData({...formData, base_salary: parseFloat(e.target.value) || 0})} className="mt-1" />
      </div>
      <div>
        <Label>Address</Label>
        <Textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="mt-1" rows={2} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Add Employee Form Component
function AddEmployeeForm({ onSubmit, isLoading, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'read_only',
    hire_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      toast.error("First and last name are required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="mt-1" required />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="mt-1" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Department</Label>
          <Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="mt-1" placeholder="e.g. Sales" />
        </div>
        <div>
          <Label>Position</Label>
          <Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="mt-1" placeholder="e.g. Manager" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role</Label>
          <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.key} value={role.key}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Hire Date</Label>
          <Input type="date" value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} className="mt-1" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
          {isLoading ? "Adding..." : "Add Employee"}
        </Button>
      </DialogFooter>
    </form>
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