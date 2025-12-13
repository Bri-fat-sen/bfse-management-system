import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_ROLE_PERMISSIONS, ROLES, MODULES } from "./PermissionsContext";
import { Check, X, Shield, Lock, Eye, Edit, Trash2, Download, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PermissionMatrix({ selectedRole = null }) {
  const rolesToShow = selectedRole 
    ? ROLES.filter(r => r.key === selectedRole)
    : ROLES;

  const granularPermissions = [
    { key: 'can_void', label: 'Void Transactions', modules: ['sales'], icon: X },
    { key: 'can_refund', label: 'Issue Refunds', modules: ['sales'], icon: DollarSign },
    { key: 'can_view_profit_margins', label: 'View Profit Margins', modules: ['sales'], icon: Eye },
    { key: 'can_adjust_stock', label: 'Adjust Stock Levels', modules: ['inventory'], icon: Edit },
    { key: 'can_view_cost_price', label: 'View Cost Prices', modules: ['inventory'], icon: Eye },
    { key: 'can_audit', label: 'Perform Audits', modules: ['inventory'], icon: Shield },
    { key: 'can_approve_expenses', label: 'Approve Expenses', modules: ['finance'], icon: CheckCircle },
    { key: 'can_view_sensitive_data', label: 'View Sensitive Financial Data', modules: ['finance'], icon: Lock },
    { key: 'can_reconcile_accounts', label: 'Reconcile Accounts', modules: ['finance'], icon: CheckCircle },
    { key: 'can_process_payroll', label: 'Process Payroll', modules: ['hr'], icon: DollarSign },
    { key: 'can_view_salaries', label: 'View Employee Salaries', modules: ['hr'], icon: Eye },
    { key: 'can_terminate_employees', label: 'Terminate Employees', modules: ['hr'], icon: Trash2 },
    { key: 'can_approve_overtime', label: 'Approve Overtime', modules: ['attendance'], icon: CheckCircle },
    { key: 'can_override_timesheet', label: 'Override Timesheets', modules: ['attendance'], icon: Edit },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl">
        <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
        <CardHeader className="bg-gradient-to-br from-gray-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1EB053]" />
            Permission Matrix
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Comprehensive role-based access control overview</p>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="standard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="standard">Standard Permissions</TabsTrigger>
              <TabsTrigger value="granular">Granular Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-gray-700">Role / Module</th>
                      {MODULES.map(module => (
                        <th key={module.key} className="p-3 text-center font-semibold text-gray-700 min-w-[100px]">
                          {module.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rolesToShow.map(role => {
                      const permissions = DEFAULT_ROLE_PERMISSIONS[role.key] || {};
                      return (
                        <tr key={role.key} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-gray-900">{role.name}</p>
                              <p className="text-xs text-gray-500">{role.description}</p>
                            </div>
                          </td>
                          {MODULES.map(module => {
                            const perm = permissions[module.key] || {};
                            const hasAccess = perm.can_view;
                            const accessLevel = 
                              perm.can_delete ? 'Full' :
                              perm.can_edit ? 'Edit' :
                              perm.can_create ? 'Create' :
                              perm.can_view ? 'View' : 'None';
                            
                            return (
                              <td key={module.key} className="p-3 text-center">
                                {hasAccess ? (
                                  <Badge className={`
                                    ${accessLevel === 'Full' ? 'bg-green-100 text-green-700' :
                                      accessLevel === 'Edit' ? 'bg-blue-100 text-blue-700' :
                                      accessLevel === 'Create' ? 'bg-purple-100 text-purple-700' :
                                      'bg-gray-100 text-gray-700'}
                                  `}>
                                    {accessLevel}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-400">None</Badge>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="granular" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {granularPermissions.map(perm => (
                  <Card key={perm.key} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <perm.icon className="w-4 h-4 text-[#0072C6]" />
                        {perm.label}
                      </CardTitle>
                      <p className="text-xs text-gray-500">Modules: {perm.modules.join(', ')}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {rolesToShow.map(role => {
                          const hasPermission = perm.modules.some(module => 
                            DEFAULT_ROLE_PERMISSIONS[role.key]?.[module]?.custom_permissions?.[perm.key]
                          );
                          return (
                            <Badge 
                              key={role.key}
                              className={hasPermission ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                            >
                              {hasPermission ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                              {role.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Access Level Legend
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">Full</Badge>
                <span className="text-gray-600">All operations</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">Edit</Badge>
                <span className="text-gray-600">View & modify</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-700">Create</Badge>
                <span className="text-gray-600">View & add new</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-700">View</Badge>
                <span className="text-gray-600">Read only</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}