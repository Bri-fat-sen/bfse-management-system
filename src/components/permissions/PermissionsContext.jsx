import { createContext, useContext, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const PermissionsContext = createContext(null);

// Default permissions by role
const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: {
    dashboard: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    sales: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    inventory: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    suppliers: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    transport: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    hr: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    finance: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    communication: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    attendance: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    settings: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    activity_log: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
  },
  org_admin: {
    dashboard: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    sales: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    inventory: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    suppliers: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    transport: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    hr: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    finance: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    communication: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    attendance: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    settings: { can_view: true, can_create: true, can_edit: true, can_delete: false, can_export: true, can_approve: true },
    activity_log: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
  },
  hr_admin: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    inventory: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    suppliers: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    transport: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    hr: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_export: true, can_approve: true },
    finance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    communication: { can_view: true, can_create: true, can_edit: true, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: true, can_edit: true, can_delete: false, can_export: true, can_approve: true },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
  payroll_admin: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    inventory: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    suppliers: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    transport: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    hr: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false, custom_permissions: { view_payroll: true, process_payroll: true } },
    finance: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false, custom_permissions: { view_payroll_reports: true } },
    communication: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
  warehouse_manager: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: true, can_approve: false, custom_permissions: { wholesale_only: true } },
    inventory: { can_view: true, can_create: true, can_edit: true, can_delete: false, can_export: true, can_approve: true, custom_permissions: { manage_stock: true, manage_warehouses: true } },
    suppliers: { can_view: true, can_create: true, can_edit: true, can_delete: false, can_export: true, can_approve: true },
    transport: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    hr: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    finance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    communication: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
  retail_cashier: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false, custom_permissions: { retail_only: true, view_own_sales: true } },
    inventory: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false, custom_permissions: { view_stock_only: true } },
    suppliers: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    transport: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    hr: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    finance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    communication: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false, custom_permissions: { own_attendance_only: true } },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
  vehicle_sales: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false, custom_permissions: { vehicle_sales_only: true } },
    inventory: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false, custom_permissions: { view_assigned_products: true } },
    suppliers: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    transport: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    hr: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    finance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    communication: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
  driver: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    inventory: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    suppliers: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    transport: { can_view: true, can_create: true, can_edit: true, can_delete: false, can_export: false, can_approve: false, custom_permissions: { own_trips_only: true, record_trip: true } },
    hr: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    finance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    communication: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
  accountant: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
    sales: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
    inventory: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
    suppliers: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
    transport: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
    hr: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false, custom_permissions: { view_payroll: true } },
    finance: { can_view: true, can_create: true, can_edit: true, can_delete: false, can_export: true, can_approve: true },
    communication: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: true, can_approve: false },
  },
  support_staff: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    inventory: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    suppliers: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    transport: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    hr: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    finance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    communication: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    settings: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
  read_only: {
    dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    sales: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    inventory: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    suppliers: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    transport: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    hr: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    finance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    communication: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    attendance: { can_view: true, can_create: true, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    settings: { can_view: true, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
    activity_log: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_export: false, can_approve: false },
  },
};

export const MODULES = [
  { key: 'dashboard', name: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'sales', name: 'Sales & POS', icon: 'ShoppingCart' },
  { key: 'inventory', name: 'Inventory', icon: 'Package' },
  { key: 'suppliers', name: 'Suppliers', icon: 'Building2' },
  { key: 'transport', name: 'Transport', icon: 'Truck' },
  { key: 'hr', name: 'HR & Payroll', icon: 'Users' },
  { key: 'finance', name: 'Finance', icon: 'DollarSign' },
  { key: 'communication', name: 'Communication', icon: 'MessageSquare' },
  { key: 'attendance', name: 'Attendance', icon: 'Clock' },
  { key: 'settings', name: 'Settings', icon: 'Settings' },
  { key: 'activity_log', name: 'Activity Log', icon: 'Activity' },
];

export const ROLES = [
  { key: 'super_admin', name: 'Super Admin', description: 'Full system access' },
  { key: 'org_admin', name: 'Organisation Admin', description: 'Full org access' },
  { key: 'hr_admin', name: 'HR Admin', description: 'HR & employee management' },
  { key: 'payroll_admin', name: 'Payroll Admin', description: 'Payroll processing' },
  { key: 'warehouse_manager', name: 'Warehouse Manager', description: 'Inventory & stock' },
  { key: 'retail_cashier', name: 'Retail Cashier', description: 'POS sales' },
  { key: 'vehicle_sales', name: 'Vehicle Sales', description: 'Mobile sales' },
  { key: 'driver', name: 'Driver', description: 'Transport trips' },
  { key: 'accountant', name: 'Accountant', description: 'Finance & reports' },
  { key: 'support_staff', name: 'Support Staff', description: 'Basic access' },
  { key: 'read_only', name: 'Read Only', description: 'View only access' },
];

export function PermissionsProvider({ children }) {
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
  const userRole = currentEmployee?.role || 'read_only';

  // Fetch custom permissions for this org/role
  const { data: customPermissions = [] } = useQuery({
    queryKey: ['permissions', orgId, userRole],
    queryFn: () => base44.entities.Permission.filter({ organisation_id: orgId, role: userRole }),
    enabled: !!orgId,
  });

  // Merge default and custom permissions
  const permissions = useMemo(() => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[userRole] || DEFAULT_ROLE_PERMISSIONS.read_only;
    
    // Apply custom overrides if any exist
    const merged = { ...defaults };
    customPermissions.forEach(perm => {
      if (perm.module && merged[perm.module]) {
        merged[perm.module] = {
          ...merged[perm.module],
          can_view: perm.can_view ?? merged[perm.module].can_view,
          can_create: perm.can_create ?? merged[perm.module].can_create,
          can_edit: perm.can_edit ?? merged[perm.module].can_edit,
          can_delete: perm.can_delete ?? merged[perm.module].can_delete,
          can_export: perm.can_export ?? merged[perm.module].can_export,
          can_approve: perm.can_approve ?? merged[perm.module].can_approve,
          custom_permissions: { ...merged[perm.module].custom_permissions, ...perm.custom_permissions },
        };
      }
    });

    return merged;
  }, [userRole, customPermissions]);

  const value = useMemo(() => ({
    userRole,
    permissions,
    currentEmployee,
    orgId,
    
    // Helper functions
    canView: (module) => permissions[module]?.can_view ?? false,
    canCreate: (module) => permissions[module]?.can_create ?? false,
    canEdit: (module) => permissions[module]?.can_edit ?? false,
    canDelete: (module) => permissions[module]?.can_delete ?? false,
    canExport: (module) => permissions[module]?.can_export ?? false,
    canApprove: (module) => permissions[module]?.can_approve ?? false,
    hasCustomPermission: (module, permission) => permissions[module]?.custom_permissions?.[permission] ?? false,
    
    // Check if user is admin level
    isAdmin: () => ['super_admin', 'org_admin'].includes(userRole),
    isSuperAdmin: () => userRole === 'super_admin',
  }), [userRole, permissions, currentEmployee, orgId]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export { DEFAULT_ROLE_PERMISSIONS };