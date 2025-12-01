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
  Unlink
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

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLinked, setFilterLinked] = useState("all"); // all, linked, unlinked
  const [createEmployeeDialog, setCreateEmployeeDialog] = useState(null);
  const [linkEmployeeDialog, setLinkEmployeeDialog] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

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
        title="User Management"
        subtitle="Manage app users and link them to employee records"
        actionIcon={Users}
      />

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
              These employee records are not linked to any app user. They can be linked when a user is invited.
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
        <DialogContent>
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