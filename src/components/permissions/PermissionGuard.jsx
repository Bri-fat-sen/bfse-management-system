import React from "react";
import { usePermissions } from "./PermissionsContext";
import { AlertTriangle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PermissionGuard({ 
  module, 
  action = "view",
  customPermission = null,
  fallback = null,
  children 
}) {
  const permissions = usePermissions();
  
  const hasPermission = () => {
    if (!module) return true;
    
    // Check custom permission first
    if (customPermission) {
      return permissions.hasCustomPermission(module, customPermission);
    }
    
    // Check standard action
    switch (action) {
      case "view": return permissions.canView(module);
      case "create": return permissions.canCreate(module);
      case "edit": return permissions.canEdit(module);
      case "delete": return permissions.canDelete(module);
      case "export": return permissions.canExport(module);
      case "approve": return permissions.canApprove(module);
      default: return false;
    }
  };

  if (!hasPermission()) {
    if (fallback) return fallback;
    
    return (
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-6">
            You don't have permission to {action} this {module} content.
            <br />
            Contact your administrator for access.
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Hook for conditional rendering
export function useHasPermission(module, action = "view", customPermission = null) {
  const permissions = usePermissions();
  
  if (!module) return true;
  
  if (customPermission) {
    return permissions.hasCustomPermission(module, customPermission);
  }
  
  switch (action) {
    case "view": return permissions.canView(module);
    case "create": return permissions.canCreate(module);
    case "edit": return permissions.canEdit(module);
    case "delete": return permissions.canDelete(module);
    case "export": return permissions.canExport(module);
    case "approve": return permissions.canApprove(module);
    default: return false;
  }
}

// Component for hiding UI elements based on permissions
export function PermissionButton({ module, action, customPermission, children, ...props }) {
  const hasPermission = useHasPermission(module, action, customPermission);
  
  if (!hasPermission) return null;
  
  return <Button {...props}>{children}</Button>;
}