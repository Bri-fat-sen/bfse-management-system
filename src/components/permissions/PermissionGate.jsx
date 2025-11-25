import React from "react";
import { usePermissions } from "./PermissionsContext";
import { Shield, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Component that conditionally renders children based on permissions
export function PermissionGate({ 
  module, 
  action = 'view', // view, create, edit, delete, export, approve
  customPermission,
  fallback = null,
  showDenied = false,
  children 
}) {
  const { canView, canCreate, canEdit, canDelete, canExport, canApprove, hasCustomPermission } = usePermissions();

  let hasPermission = false;

  if (customPermission) {
    hasPermission = hasCustomPermission(module, customPermission);
  } else {
    switch (action) {
      case 'view':
        hasPermission = canView(module);
        break;
      case 'create':
        hasPermission = canCreate(module);
        break;
      case 'edit':
        hasPermission = canEdit(module);
        break;
      case 'delete':
        hasPermission = canDelete(module);
        break;
      case 'export':
        hasPermission = canExport(module);
        break;
      case 'approve':
        hasPermission = canApprove(module);
        break;
      default:
        hasPermission = canView(module);
    }
  }

  if (hasPermission) {
    return children;
  }

  if (showDenied) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Access Denied</h3>
            <p className="text-red-600 text-sm">
              You don't have permission to {action} {module.replace('_', ' ')}.
            </p>
            <p className="text-red-500 text-xs mt-2">
              Contact your administrator for access.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return fallback;
}

// HOC to wrap entire pages with permission checks
export function withPermission(WrappedComponent, module, action = 'view') {
  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGate module={module} action={action} showDenied>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}

// Hook for inline permission checks
export function useHasPermission(module, action = 'view', customPermission = null) {
  const { canView, canCreate, canEdit, canDelete, canExport, canApprove, hasCustomPermission } = usePermissions();

  if (customPermission) {
    return hasCustomPermission(module, customPermission);
  }

  switch (action) {
    case 'view': return canView(module);
    case 'create': return canCreate(module);
    case 'edit': return canEdit(module);
    case 'delete': return canDelete(module);
    case 'export': return canExport(module);
    case 'approve': return canApprove(module);
    default: return canView(module);
  }
}