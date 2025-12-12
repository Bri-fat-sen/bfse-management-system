import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Check,
  X,
  Save,
  RefreshCw,
  Users,
  Eye,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MODULES, ROLES, DEFAULT_ROLE_PERMISSIONS } from "@/components/permissions/PermissionsContext";
import { PermissionGate } from "@/components/permissions/PermissionGate";

const PERMISSION_TYPES = [
  { key: 'can_view', label: 'View', icon: Eye, color: 'text-blue-500' },
  { key: 'can_create', label: 'Create', icon: Plus, color: 'text-green-500' },
  { key: 'can_edit', label: 'Edit', icon: Edit, color: 'text-amber-500' },
  { key: 'can_delete', label: 'Delete', icon: Trash2, color: 'text-red-500' },
  { key: 'can_export', label: 'Export', icon: Download, color: 'text-purple-500' },
  { key: 'can_approve', label: 'Approve', icon: CheckCircle, color: 'text-teal-500' },
];

export default function RolePermissions() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('retail_cashier');
  const [editedPermissions, setEditedPermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

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

  const { data: customPermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['allPermissions', orgId],
    queryFn: () => base44.entities.Permission.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const savePermissionMutation = useMutation({
    mutationFn: async ({ role, module, permissions }) => {
      const existing = customPermissions.find(p => p.role === role && p.module === module);
      if (existing) {
        return base44.entities.Permission.update(existing.id, permissions);
      } else {
        return base44.entities.Permission.create({
          organisation_id: orgId,
          role,
          module,
          ...permissions
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPermissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success("Permissions saved successfully");
    },
  });

  // Get current permissions for selected role (merged defaults + custom)
  const getCurrentPermissions = (role) => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.read_only;
    const customs = customPermissions.filter(p => p.role === role);
    
    const merged = { ...defaults };
    customs.forEach(perm => {
      if (perm.module && merged[perm.module]) {
        merged[perm.module] = {
          ...merged[perm.module],
          can_view: perm.can_view ?? merged[perm.module].can_view,
          can_create: perm.can_create ?? merged[perm.module].can_create,
          can_edit: perm.can_edit ?? merged[perm.module].can_edit,
          can_delete: perm.can_delete ?? merged[perm.module].can_delete,
          can_export: perm.can_export ?? merged[perm.module].can_export,
          can_approve: perm.can_approve ?? merged[perm.module].can_approve,
        };
      }
    });
    
    return merged;
  };

  const permissions = editedPermissions[selectedRole] || getCurrentPermissions(selectedRole);

  const handlePermissionChange = (module, permType, value) => {
    const currentPerms = editedPermissions[selectedRole] || getCurrentPermissions(selectedRole);
    const updated = {
      ...currentPerms,
      [module]: {
        ...currentPerms[module],
        [permType]: value
      }
    };
    setEditedPermissions({ ...editedPermissions, [selectedRole]: updated });
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    const permsToSave = editedPermissions[selectedRole];
    if (!permsToSave) return;

    for (const module of Object.keys(permsToSave)) {
      await savePermissionMutation.mutateAsync({
        role: selectedRole,
        module,
        permissions: permsToSave[module]
      });
    }
    setHasChanges(false);
    setEditedPermissions({});
  };

  const handleReset = () => {
    setEditedPermissions({});
    setHasChanges(false);
  };

  const roleEmployeeCount = (role) => employees.filter(e => e.role === role).length;

  const selectedRoleInfo = ROLES.find(r => r.key === selectedRole);

  if (!user) {
    return <LoadingSpinner message="Loading Permissions..." subtitle="Fetching role configurations" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (loadingPermissions) {
    return <LoadingSpinner message="Loading Permissions..." subtitle="Fetching role configurations" fullScreen={true} />;
  }

  return (
    <PermissionGate module="settings" action="edit" showDenied>
      <div className="space-y-6">
        <PageHeader
          title="Role & Permissions"
          subtitle="Configure access control for each role"
          actionIcon={Shield}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Role Selector */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0072C6]" />
                Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {ROLES.map((role) => (
                  <div
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedRole === role.key 
                        ? 'bg-[#1EB053]/10 border-l-4 border-l-[#1EB053]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{role.name}</p>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {roleEmployeeCount(role.key)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#1EB053]" />
                  {selectedRoleInfo?.name} Permissions
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{selectedRoleInfo?.description}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {hasChanges && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleReset} className="flex-1 sm:flex-none">
                      <RefreshCw className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Reset</span>
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveAll}
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] flex-1 sm:flex-none"
                      disabled={savePermissionMutation.isPending}
                    >
                      <Save className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Module</TableHead>
                      {PERMISSION_TYPES.map((perm) => (
                        <TableHead key={perm.key} className="text-center w-24">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center justify-center gap-1 w-full">
                                <perm.icon className={`w-4 h-4 ${perm.color}`} />
                                <span className="text-xs">{perm.label}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{perm.label} permission</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULES.map((module) => (
                      <TableRow key={module.key}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                              <span className="text-sm">📦</span>
                            </div>
                            {module.name}
                          </div>
                        </TableCell>
                        {PERMISSION_TYPES.map((perm) => (
                          <TableCell key={perm.key} className="text-center">
                            <Switch
                              checked={permissions[module.key]?.[perm.key] ?? false}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.key, perm.key, checked)
                              }
                              className="data-[state=checked]:bg-[#1EB053]"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Permission Types</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-gray-500">
                  <div><Eye className="w-3 h-3 inline mr-1 text-blue-500" /> View: See data</div>
                  <div><Plus className="w-3 h-3 inline mr-1 text-green-500" /> Create: Add new</div>
                  <div><Edit className="w-3 h-3 inline mr-1 text-amber-500" /> Edit: Modify</div>
                  <div><Trash2 className="w-3 h-3 inline mr-1 text-red-500" /> Delete: Remove</div>
                  <div><Download className="w-3 h-3 inline mr-1 text-purple-500" /> Export: Download</div>
                  <div><CheckCircle className="w-3 h-3 inline mr-1 text-teal-500" /> Approve: Authorize</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees with this role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Employees with "{selectedRoleInfo?.name}" Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employees.filter(e => e.role === selectedRole).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No employees assigned to this role</p>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {employees
                  .filter(e => e.role === selectedRole)
                  .map((emp) => (
                    <div key={emp.id} className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center mx-auto mb-2 text-white font-medium">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <p className="text-sm font-medium truncate">{emp.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{emp.department || emp.position}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}