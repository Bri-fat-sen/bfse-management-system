import React from "react";
import { usePermissions } from "./PermissionsContext";
import { AlertCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Component to conditionally render content based on permissions
 * Usage: <PermissionGuard module="finance" action="can_approve_expenses">...</PermissionGuard>
 */
export function PermissionGuard({ 
  module, 
  action, 
  customPermission,
  children, 
  fallback = null,
  showDenied = false 
}) {
  const { permissions, hasCustomPermission } = usePermissions();
  
  let hasPermission = false;
  
  if (customPermission) {
    // Check custom permission
    hasPermission = hasCustomPermission(module, customPermission);
  } else if (action) {
    // Check standard action permission
    hasPermission = permissions[module]?.[action] ?? false;
  }
  
  if (!hasPermission) {
    if (showDenied) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-red-900 mb-1">Access Denied</h3>
            <p className="text-sm text-red-600">You don't have permission to access this feature.</p>
          </CardContent>
        </Card>
      );
    }
    return fallback;
  }
  
  return <>{children}</>;
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission(module, action, customPermission) {
  const { permissions, hasCustomPermission } = usePermissions();
  
  if (customPermission) {
    return hasCustomPermission(module, customPermission);
  }
  
  return permissions[module]?.[action] ?? false;
}

/**
 * Utility to get all granted permissions for a module
 */
export function useModulePermissions(module) {
  const { permissions, hasCustomPermission } = usePermissions();
  
  const modulePerms = permissions[module] || {};
  
  return {
    ...modulePerms,
    hasCustomPermission: (perm) => hasCustomPermission(module, perm),
  };
}

export default PermissionGuard;