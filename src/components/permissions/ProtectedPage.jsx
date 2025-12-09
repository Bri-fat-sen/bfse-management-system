import { } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePermissions } from "./PermissionsContext";
import { Shield, Lock, Home, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProtectedPage({ module, action = 'view', children }) {
  const { canView, canCreate, canEdit, userRole, isAdmin } = usePermissions();

  let hasAccess = false;

  switch (action) {
    case 'view':
      hasAccess = canView(module);
      break;
    case 'create':
      hasAccess = canCreate(module);
      break;
    case 'edit':
      hasAccess = canEdit(module);
      break;
    default:
      hasAccess = canView(module);
  }

  if (hasAccess) {
    return children;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the <strong>{module.replace(/_/g, ' ')}</strong> module.
          </p>
          <div className="bg-white/60 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">
              Your role: <span className="font-semibold text-gray-700">{userRole?.replace(/_/g, ' ')}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Contact your administrator if you need access.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Button onClick={() => window.history.back()} className="sl-gradient">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick role check helpers
export function isRestrictedRole(role) {
  return ['retail_cashier', 'driver', 'vehicle_sales', 'support_staff', 'read_only'].includes(role);
}

export function canAccessHR(role) {
  return ['super_admin', 'org_admin', 'hr_admin', 'payroll_admin'].includes(role);
}

export function canAccessFinance(role) {
  return ['super_admin', 'org_admin', 'accountant', 'payroll_admin'].includes(role);
}

export function canAccessReports(role) {
  return ['super_admin', 'org_admin', 'accountant', 'hr_admin', 'warehouse_manager'].includes(role);
}

export function canAccessSettings(role) {
  return ['super_admin', 'org_admin'].includes(role);
}