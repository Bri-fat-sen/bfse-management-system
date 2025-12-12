import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield, Users, Truck, ShoppingCart, Package, DollarSign, UserCog, Headphones, BookOpen } from "lucide-react";

const PREVIEWABLE_ROLES = [
  { role: "org_admin", label: "Org Admin", icon: UserCog, color: "bg-purple-100 text-purple-800" },
  { role: "hr_admin", label: "HR Admin", icon: Users, color: "bg-blue-100 text-blue-800" },
  { role: "payroll_admin", label: "Payroll Admin", icon: DollarSign, color: "bg-green-100 text-green-800" },
  { role: "warehouse_manager", label: "Warehouse Manager", icon: Package, color: "bg-amber-100 text-amber-800" },
  { role: "retail_cashier", label: "Retail Cashier", icon: ShoppingCart, color: "bg-pink-100 text-pink-800" },
  { role: "vehicle_sales", label: "Vehicle Sales", icon: Truck, color: "bg-cyan-100 text-cyan-800" },
  { role: "driver", label: "Driver", icon: Truck, color: "bg-orange-100 text-orange-800" },
  { role: "accountant", label: "Accountant", icon: DollarSign, color: "bg-emerald-100 text-emerald-800" },
  { role: "support_staff", label: "Support Staff", icon: Headphones, color: "bg-indigo-100 text-indigo-800" },
  { role: "read_only", label: "Read Only", icon: BookOpen, color: "bg-gray-100 text-gray-800" },
];

export default function RolePreviewSwitcher({ 
  currentPreviewRole, 
  onPreviewRoleChange,
  actualRole 
}) {
  // Only show for super_admin
  if (actualRole !== 'super_admin') return null;

  const isPreviewActive = !!currentPreviewRole;
  const selectedRole = PREVIEWABLE_ROLES.find(r => r.role === currentPreviewRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isPreviewActive ? "default" : "outline"}
          size="sm"
          className={isPreviewActive 
            ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" 
            : "border-dashed"
          }
        >
          {isPreviewActive ? (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Viewing as: {selectedRole?.label}
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Preview Role
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview as Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isPreviewActive && (
          <>
            <DropdownMenuItem 
              onClick={() => onPreviewRoleChange(null)}
              className="text-red-600 font-medium"
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Exit Preview Mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {PREVIEWABLE_ROLES.map(({ role, label, icon: Icon, color }) => (
          <DropdownMenuItem
            key={role}
            onClick={() => onPreviewRoleChange(role)}
            className={currentPreviewRole === role ? "bg-amber-50" : ""}
          >
            <Icon className="w-4 h-4 mr-2" />
            <span className="flex-1">{label}</span>
            {currentPreviewRole === role && (
              <Badge variant="secondary" className="ml-2 text-xs">Active</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RolePreviewBanner({ previewRole, onExit }) {
  if (!previewRole) return null;

  const selectedRole = PREVIEWABLE_ROLES.find(r => r.role === previewRole);

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>
          <strong>Preview Mode:</strong> You are viewing the app as a <strong>{selectedRole?.label || previewRole}</strong>. 
          Access and navigation are limited to what this role can see.
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onExit}
        className="text-white hover:bg-amber-600 hover:text-white"
      >
        <EyeOff className="w-4 h-4 mr-1" />
        Exit Preview
      </Button>
    </div>
  );
}