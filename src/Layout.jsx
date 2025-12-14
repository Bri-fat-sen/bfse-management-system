import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  Package,
  Truck,
  Users,
  DollarSign,
  Activity,
  HelpCircle,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Building2,
  Moon,
  Sun,
  Clock,
  Shield,
  BarChart3,
  MapPin,
  Calendar,
  Lock,
  AlertTriangle,
  FileText,
  Upload,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PinLockScreen from "@/components/auth/PinLockScreen";
import SetPinDialog from "@/components/auth/SetPinDialog";
import { PermissionsProvider } from "@/components/permissions/PermissionsContext";
import { DEFAULT_ROLE_PERMISSIONS } from "@/components/permissions/PermissionsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import MobileNav from "@/components/mobile/MobileNav";
import { OfflineProvider, OfflineStatus } from "@/components/offline/OfflineManager";
import GlobalSearch from "@/components/search/GlobalSearch";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import ChatPanel from "@/components/communication/ChatPanel";
import { ChatNotificationProvider } from "@/components/communication/ChatNotificationManager";
import MobileQuickSale from "@/components/mobile/MobileQuickSale";
import MobileStockCheck from "@/components/mobile/MobileStockCheck";
import MobileDeliveryUpdate from "@/components/mobile/MobileDeliveryUpdate";
import RolePreviewSwitcher, { RolePreviewBanner } from "@/components/admin/RolePreviewSwitcher";
import OfflineSyncButton from "@/components/offline/OfflineSyncButton";
import { ToastProvider } from "@/components/ui/Toast";
import { useThemeCustomization } from "@/components/settings/useThemeCustomization";

const menuSections = [
  {
    title: "Overview",
    color: "#1EB053",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", module: "dashboard" },
      { name: "Executive Dashboard", icon: BarChart3, page: "ExecutiveDashboard", module: "dashboard" },
      { name: "My Portal", icon: User, page: "EmployeeSelfService", module: "dashboard" },
      { name: "Calendar & Tasks", icon: Calendar, page: "Calendar", module: "dashboard" },
    ]
  },
  {
    title: "Sales & Customers",
    color: "#0072C6",
    icon: ShoppingCart,
    items: [
      { name: "Point of Sale", icon: ShoppingCart, page: "Sales", module: "sales" },
      { name: "Customer Management", icon: Users, page: "CRM", module: "sales" },
    ]
  },
  {
    title: "Inventory",
    color: "#D4AF37",
    icon: Package,
    items: [
      { name: "Stock Management", icon: Package, page: "Inventory", module: "inventory" },
      { name: "Supplier Relations", icon: Building2, page: "Suppliers", module: "suppliers" },
      { name: "Stock Auditing", icon: BarChart3, page: "StockAudit", module: "inventory", adminOnly: true },
    ]
  },
  {
    title: "Fleet",
    color: "#FF6B35",
    icon: Truck,
    items: [
      { name: "Fleet Operations", icon: Truck, page: "Transport", module: "transport" },
    ]
  },
  {
    title: "HR & Payroll",
    color: "#8B5CF6",
    icon: Users,
    items: [
      { name: "HR Management", icon: Users, page: "HRManagement", module: "hr" },
      { name: "Attendance", icon: Clock, page: "Attendance", module: "attendance" },
      { name: "Work Schedules", icon: Calendar, page: "WorkSchedules", module: "hr" },
      { name: "HR Documents", icon: FileText, page: "Documents", module: "hr" },
      { name: "Document Archive", icon: Upload, page: "UploadedDocuments", module: "settings", adminOnly: true },
    ]
  },
  {
    title: "Finance",
    color: "#EF4444",
    icon: DollarSign,
    items: [
      { name: "Financial Overview", icon: DollarSign, page: "Finance", module: "finance" },
      { name: "Expense Control", icon: DollarSign, page: "ExpenseManagement", module: "finance", adminOnly: true },
      { name: "Construction", icon: Building2, page: "ConstructionExpense", module: "finance", adminOnly: true },
    ]
  },
  {
    title: "System",
    color: "#06B6D4",
    icon: Settings,
    items: [
      { name: "Activity Logs", icon: Activity, page: "ActivityLog", module: "activity_log" },
      { name: "Settings", icon: Settings, page: "Settings", module: "settings" },
      { name: "Help & Support", icon: HelpCircle, page: "Support", module: "settings" },
      { name: "Users & Access", icon: Shield, page: "UserManagement", module: "settings", adminOnly: true },
      { name: "Role Permissions", icon: Lock, page: "RolePermissions", module: "settings", adminOnly: true },
      { name: "Organisation", icon: Building2, page: "OrganisationManage", module: "settings", adminOnly: true },
      { name: "Locations", icon: MapPin, page: "Locations", module: "settings", adminOnly: true },
    ]
  },
  {
    title: "Admin",
    color: "#DC2626",
    icon: Shield,
    items: [
      { name: "Super Admin", icon: Shield, page: "SuperAdminPanel", module: "settings", adminOnly: true },
      { name: "Join Requests", icon: Users, page: "PendingJoinRequests", module: "settings", adminOnly: true },
      { name: "Data Cleanup", icon: AlertTriangle, page: "OrphanedData", module: "settings", adminOnly: true },
      { name: "System Reset", icon: AlertTriangle, page: "ResetData", module: "settings", adminOnly: true },
    ]
  }
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [showStockCheck, setShowStockCheck] = useState(false);
  const [showDeliveryUpdate, setShowDeliveryUpdate] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [previewRole, setPreviewRole] = useState(null);

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
  });

  useThemeCustomization(user?.email);

  const { data: employee, isLoading: loadingEmployee, refetch: refetchEmployee } = useQuery({
    queryKey: ['currentEmployee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const autoLinkEmployee = async () => {
      if (!user?.email || employee?.length > 0) return;
      try {
        const allEmployees = await base44.asServiceRole.entities.Employee.list();
        const matchingEmployee = allEmployees.find(e => e.email === user.email && !e.user_email);
        if (matchingEmployee) {
          await base44.asServiceRole.entities.Employee.update(matchingEmployee.id, { user_email: user.email });
          refetchEmployee();
        }
      } catch (error) {
        console.error('Auto-link failed:', error);
      }
    };
    autoLinkEmployee();
  }, [user?.email, employee, refetchEmployee]);

  const currentEmployee = employee?.[0];

  useEffect(() => {
    if (user && !loadingEmployee && !currentEmployee && currentPageName !== 'JoinOrganisation') {
      window.location.href = createPageUrl('JoinOrganisation');
    }
  }, [user, loadingEmployee, currentEmployee, currentPageName]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentEmployee?.id],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 10),
    enabled: !!currentEmployee?.id,
  });

  const actualRole = useMemo(() => 
    currentEmployee?.role || (user?.role === 'admin' ? 'super_admin' : 'read_only'),
    [currentEmployee?.role, user?.role]
  );
  
  const userRole = useMemo(() => 
    (actualRole === 'super_admin' && previewRole) ? previewRole : actualRole,
    [actualRole, previewRole]
  );
  
  const orgId = currentEmployee?.organisation_id;

  const { data: organisationData } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
  });

  const currentOrg = organisationData?.[0];

  const { data: chatRooms = [] } = useQuery({
    queryKey: ['chatRooms', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.ChatRoom.filter({ organisation_id: orgId }),
    enabled: !!orgId && !!currentEmployee?.id,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
  });

  const unreadChatCount = useMemo(() => {
    if (!currentEmployee?.id || !chatRooms.length) return 0;
    return chatRooms
      .filter(r => r.participants?.includes(currentEmployee.id))
      .reduce((sum, r) => sum + (r.unread_count || 0), 0);
  }, [chatRooms, currentEmployee?.id]);

  const permissions = useMemo(() => {
    return DEFAULT_ROLE_PERMISSIONS[userRole] || DEFAULT_ROLE_PERMISSIONS.read_only;
  }, [userRole]);

  const filteredMenuSections = useMemo(() => {
    const effectiveRole = (actualRole === 'super_admin' && previewRole) ? previewRole : userRole;
    const effectivePermissions = previewRole ? (DEFAULT_ROLE_PERMISSIONS[previewRole] || DEFAULT_ROLE_PERMISSIONS.read_only) : permissions;
    
    if (effectiveRole === 'super_admin' && !previewRole) {
      return menuSections;
    }
    
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.adminOnly && !['super_admin', 'org_admin'].includes(effectiveRole)) {
          return false;
        }
        return effectivePermissions[item.module]?.can_view ?? false;
      })
    })).filter(section => section.items.length > 0);
  }, [userRole, permissions, previewRole, actualRole]);

  const handleLogout = () => {
    setIsPinUnlocked(false);
    sessionStorage.removeItem('pinUnlocked');
    base44.auth.logout();
  };

  const handlePinUnlock = () => {
    setIsPinUnlocked(true);
    sessionStorage.setItem('pinUnlocked', 'true');
  };

  useEffect(() => {
    const unlocked = sessionStorage.getItem('pinUnlocked');
    if (unlocked === 'true') setIsPinUnlocked(true);
  }, []);

  const requiresPinAuth = currentEmployee?.pin_hash && !isPinUnlocked;

  if (loadingUser || (user && loadingEmployee)) {
    return <LoadingSpinner message="Loading..." fullScreen={true} />;
  }

  if (!currentEmployee && currentPageName === 'JoinOrganisation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="sticky top-0 z-30 h-20 px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b shadow-sm">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69250a5e2096205358a5c476/e3d7b69e5_file_00000000014871faa409619479a5f0ef.png" alt="Logo" className="h-12" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <main className="p-6">
          <ToastProvider>
            <PermissionsProvider>
              <OfflineProvider>
                {children}
              </OfflineProvider>
            </PermissionsProvider>
          </ToastProvider>
        </main>
      </div>
    );
  }

  if (currentOrg && currentOrg.status !== 'active' && currentPageName !== 'Settings' && currentPageName !== 'OrganisationManage') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-2 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Organisation {currentOrg.status === 'suspended' ? 'Suspended' : 'Pending'}
              </h2>
              <p className="text-gray-600 mb-6">
                {currentOrg.status === 'suspended' ? 'Contact support for assistance.' : 'Waiting for approval.'}
              </p>
              <Button onClick={handleLogout} className="w-full bg-gradient-to-r from-red-500 to-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requiresPinAuth && user && currentEmployee) {
    return <PinLockScreen employee={currentEmployee} organisation={currentOrg} onUnlock={handlePinUnlock} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-green-50/20">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Modern Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full transition-all duration-300 flex flex-col",
        "bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C]",
        "shadow-2xl",
        sidebarOpen ? "w-72" : "w-20",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-[85vw] max-w-72 lg:w-72 lg:max-w-none"
      )}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-5" />
        
        <div className="relative">
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          <div className="h-20 flex items-center justify-between px-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {currentOrg?.logo_url && (
                  <div className="bg-white p-2 rounded-xl shadow-lg">
                    <img src={currentOrg.logo_url} alt={currentOrg.name} className="h-10 w-auto" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-white text-base line-clamp-1">{currentOrg?.name || 'Loading...'}</p>
                  <p className="text-xs text-blue-300">{currentEmployee?.role || 'User'}</p>
                </div>
              </div>
            ) : (
              currentOrg?.logo_url && (
                <div className="bg-white p-2 rounded-xl shadow-lg mx-auto">
                  <img src={currentOrg.logo_url} alt={currentOrg.name} className="h-10 w-auto" />
                </div>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10 hidden lg:flex"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:bg-white/10 lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {filteredMenuSections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {sidebarOpen && (
                <div className="flex items-center gap-2 px-3 mb-3">
                  <section.icon className="w-4 h-4" style={{ color: section.color }} />
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color: section.color }}>
                    {section.title}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                        isActive
                          ? "bg-gradient-to-r from-white/20 to-white/10 border-l-4 shadow-lg"
                          : "hover:bg-white/5"
                      )}
                      style={isActive ? { borderLeftColor: section.color } : {}}
                    >
                      <item.icon 
                        className="w-5 h-5 transition-all group-hover:scale-110"
                        style={{ color: isActive ? section.color : 'rgba(255,255,255,0.7)' }}
                      />
                      {sidebarOpen && (
                        <span className="font-semibold text-sm" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.8)' }}>
                          {item.name}
                        </span>
                      )}
                      {!sidebarOpen && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-[#0F1F3C] text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-white/10">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </nav>

        <div className="relative p-4">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />
          {sidebarOpen && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs flex-1">
                  <p className="text-white font-bold">🇸🇱 {currentOrg?.name}</p>
                  <p className="text-blue-200">{currentOrg?.country || 'Sierra Leone'}</p>
                </div>
              </div>
            </div>
          )}
          <div className="h-2 flex mt-4">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </div>
      </aside>

      <div className={cn("transition-all duration-300", sidebarOpen ? "lg:ml-72" : "lg:ml-20")}>
        {/* Modern Header */}
        <header className="sticky top-0 z-30 h-20 px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 w-80 justify-start text-gray-500 border-2 h-12 rounded-xl hover:border-[#0072C6]"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
              <span>Search anything...</span>
              <kbd className="ml-auto px-2 py-1 text-xs bg-gray-100 rounded-md font-mono">⌘K</kbd>
            </Button>

            <RolePreviewSwitcher
              currentPreviewRole={previewRole}
              onPreviewRoleChange={setPreviewRole}
              actualRole={actualRole}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatPanelOpen(!chatPanelOpen)}
              className={cn("relative hover:bg-gray-100 rounded-xl", chatPanelOpen && 'bg-gray-100')}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="hover:bg-gray-100 rounded-xl">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <OfflineSyncButton orgId={orgId} />
            <NotificationCenter orgId={orgId} currentEmployee={currentEmployee} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-4">
                  <Avatar className="w-9 h-9 border-2 border-white shadow-md">
                    <AvatarImage src={currentEmployee?.profile_photo} />
                    <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white font-bold">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-900">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">{currentEmployee?.position || currentEmployee?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Profile")} className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Settings")} className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSetPinDialog(true)}>
                  <Lock className="w-4 h-4 mr-2" />
                  {currentEmployee?.pin_hash ? 'Change PIN' : 'Set PIN'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="h-2 flex shadow-sm">
          <div className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#16a047]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-gradient-to-r from-[#0072C6] to-[#005a9e]" />
        </div>

        <RolePreviewBanner previewRole={previewRole} onExit={() => setPreviewRole(null)} />

        <main className="p-6 overflow-x-hidden" style={{ paddingBottom: 'max(6rem, calc(5rem + env(safe-area-inset-bottom, 0px)))', minHeight: 'calc(100vh - 6rem)' }}>
          <ToastProvider>
            <PermissionsProvider>
              <OfflineProvider>
                {children}
              </OfflineProvider>
            </PermissionsProvider>
          </ToastProvider>
        </main>

        <MobileNav currentPageName={currentPageName} />
        <MobileQuickSale open={showQuickSale} onOpenChange={setShowQuickSale} orgId={orgId} currentEmployee={currentEmployee} />
        <MobileStockCheck open={showStockCheck} onOpenChange={setShowStockCheck} orgId={orgId} />
        <MobileDeliveryUpdate open={showDeliveryUpdate} onOpenChange={setShowDeliveryUpdate} orgId={orgId} currentEmployee={currentEmployee} />
        <GlobalSearch orgId={orgId} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <InstallPrompt />
        <ChatNotificationProvider>
          <ChatPanel isOpen={chatPanelOpen} onClose={() => setChatPanelOpen(false)} orgId={orgId} currentEmployee={currentEmployee} />
        </ChatNotificationProvider>
        <SetPinDialog open={showSetPinDialog} onOpenChange={setShowSetPinDialog} employee={currentEmployee} />
      </div>
    </div>
  );
}