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
  ChevronUp,
  Calendar,
  Lock,
  AlertTriangle,
  FileText,
  Upload
} from "lucide-react";
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
import MobileQuickActions from "@/components/mobile/MobileQuickActions";
import MobileQuickSale from "@/components/mobile/MobileQuickSale";
import MobileStockCheck from "@/components/mobile/MobileStockCheck";
import MobileDeliveryUpdate from "@/components/mobile/MobileDeliveryUpdate";

import RolePreviewSwitcher, { RolePreviewBanner } from "@/components/admin/RolePreviewSwitcher";
import OfflineSyncButton from "@/components/offline/OfflineSyncButton";
import { ToastProvider } from "@/components/ui/Toast";

const menuSections = [
  {
    title: "Dashboard",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", module: "dashboard" },
      { name: "My Portal", icon: User, page: "EmployeeSelfService", module: "dashboard" },
      { name: "Calendar & Tasks", icon: Calendar, page: "Calendar", module: "dashboard" },
    ]
  },
  {
    title: "Sales & Customers",
    items: [
      { name: "Point of Sale", icon: ShoppingCart, page: "Sales", module: "sales" },
      { name: "Customer Management", icon: Users, page: "CRM", module: "sales" },
    ]
  },
  {
    title: "Inventory & Warehouse",
    items: [
      { name: "Stock Management", icon: Package, page: "Inventory", module: "inventory" },
      { name: "Supplier Relations", icon: Building2, page: "Suppliers", module: "suppliers" },
      { name: "Stock Auditing", icon: BarChart3, page: "StockAudit", module: "inventory", adminOnly: true },
    ]
  },
  {
    title: "Transport & Fleet",
    items: [
      { name: "Fleet Operations", icon: Truck, page: "Transport", module: "transport" },
    ]
  },
  {
    title: "Human Resources",
    items: [
      { name: "HR & Payroll", icon: Users, page: "HRManagement", module: "hr" },
      { name: "Time & Attendance", icon: Clock, page: "Attendance", module: "attendance" },
      { name: "Work Schedules", icon: Calendar, page: "WorkSchedules", module: "hr" },
    ]
  },
  {
    title: "Documents & Records",
    items: [
      { name: "HR Documents", icon: FileText, page: "Documents", module: "hr" },
      { name: "Document Archive", icon: Upload, page: "UploadedDocuments", module: "settings", adminOnly: true },
    ]
  },
  {
    title: "Finance & Accounting",
    items: [
      { name: "Financial Overview", icon: DollarSign, page: "Finance", module: "finance" },
      { name: "Expense Control", icon: DollarSign, page: "ExpenseManagement", module: "finance", adminOnly: true },
      { name: "Construction Projects", icon: Building2, page: "ConstructionExpense", module: "finance", adminOnly: true },
    ]
  },
  {
    title: "Reports & Analytics",
    items: [
      { name: "Activity Logs", icon: Activity, page: "ActivityLog", module: "activity_log" },
    ]
  },
  {
    title: "System Administration",
    items: [
      { name: "Settings", icon: Settings, page: "Settings", module: "settings" },
      { name: "Help & Support", icon: HelpCircle, page: "Support", module: "settings" },
      { name: "Users & Access", icon: Shield, page: "UserManagement", module: "settings", adminOnly: true },
      { name: "Role Permissions", icon: Lock, page: "RolePermissions", module: "settings", adminOnly: true },
      { name: "Organisation Settings", icon: Building2, page: "OrganisationManage", module: "settings", adminOnly: true },
      { name: "Locations & Sites", icon: MapPin, page: "Locations", module: "settings", adminOnly: true },
    ]
  },
  {
    title: "Super Admin Tools",
    items: [
      { name: "Super Admin Panel", icon: Shield, page: "SuperAdminPanel", module: "settings", adminOnly: true },
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
  const [collapsedSections, setCollapsedSections] = useState({});
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [showStockCheck, setShowStockCheck] = useState(false);
  const [showDeliveryUpdate, setShowDeliveryUpdate] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [previewRole, setPreviewRole] = useState(null);

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee, isLoading: loadingEmployee, refetch: refetchEmployee } = useQuery({
    queryKey: ['currentEmployee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const autoLinkEmployee = async () => {
      if (!user?.email || employee?.length > 0) return;
      
      try {
        // Try to find employee by email field (not user_email)
        const allEmployees = await base44.asServiceRole.entities.Employee.list();
        const matchingEmployee = allEmployees.find(e => 
          e.email === user.email && !e.user_email
        );
        
        if (matchingEmployee) {
          await base44.asServiceRole.entities.Employee.update(matchingEmployee.id, {
            user_email: user.email
          });
          refetchEmployee();
        }
      } catch (error) {
        console.error('Auto-link employee failed:', error);
      }
    };
    
    autoLinkEmployee();
  }, [user?.email, employee, refetchEmployee]);

  const currentEmployee = employee?.[0];

  // Redirect users without employee record to JoinOrganisation page
  useEffect(() => {
    if (user && !loadingEmployee && !currentEmployee && currentPageName !== 'JoinOrganisation') {
      window.location.href = createPageUrl('JoinOrganisation');
    }
  }, [user, loadingEmployee, currentEmployee, currentPageName]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentEmployee?.id],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 10),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
  });

  const currentOrg = organisationData?.[0];

  const { data: chatRooms = [] } = useQuery({
    queryKey: ['chatRooms', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.ChatRoom.filter({ organisation_id: orgId }),
    enabled: !!orgId && !!currentEmployee?.id,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
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
        if (item.page === 'Reports' && !['super_admin', 'org_admin', 'accountant', 'hr_admin', 'warehouse_manager'].includes(effectiveRole)) {
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
    if (unlocked === 'true') {
      setIsPinUnlocked(true);
    }
  }, []);

  const requiresPinAuth = currentEmployee?.pin_hash && !isPinUnlocked;

  // Show loading while fetching auth data
  if (loadingUser || (user && loadingEmployee)) {
    return <LoadingSpinner message="Loading..." subtitle="Please wait" fullScreen={true} />;
  }

  // If user has no organisation, show minimal layout for JoinOrganisation page
  if (!currentEmployee && currentPageName === 'JoinOrganisation') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-30 h-16 px-4 lg:px-6 flex items-center justify-between bg-white border-b shadow-sm">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69250a5e2096205358a5c476/e3d7b69e5_file_00000000014871faa409619479a5f0ef.png"
              alt="BRI-FAT-SEN"
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="sl-gradient text-white text-sm">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="h-1.5 sl-flag-stripe" />
        <main className="p-4 lg:p-6">
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

  // Handle non-active organisation
  if (currentOrg && currentOrg.status !== 'active' && currentPageName !== 'Settings' && currentPageName !== 'OrganisationManage') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="h-1 flex rounded-full overflow-hidden mb-6">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Organisation {currentOrg.status === 'suspended' ? 'Suspended' : 'Pending Activation'}</h2>
            <p className="text-gray-600 mb-4">
              {currentOrg.status === 'suspended' 
                ? 'This organisation has been suspended. Please contact support.'
                : 'This organisation is pending activation. Please wait for approval.'}
            </p>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (requiresPinAuth && user && currentEmployee) {
    return (
      <PinLockScreen
        employee={currentEmployee}
        organisation={currentOrg}
        onUnlock={handlePinUnlock}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#0F1F3C]' : 'bg-gray-50'}`} style={{ minHeight: '100dvh' }}>
      <style>{`
        @supports (height: 100dvh) {
          .min-h-screen { min-height: 100dvh; }
        }
        .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem)); }
        @media (max-width: 768px) {
          input, select, textarea { font-size: 16px !important; }
        }
        :root {
          --sl-green: #1EB053;
          --sl-white: #FFFFFF;
          --sl-blue: #0072C6;
          --sl-navy: #0F1F3C;
          --sl-gold: #D4AF37;
          --sl-sky: #E3F1FF;
          --sl-light-green: #E8F5E9;
          --sl-light-blue: #E3F2FD;
        }
        .sl-gradient {
          background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
        }
        .sl-gradient-text {
          background: linear-gradient(135deg, var(--sl-green) 0%, var(--sl-blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sl-flag-stripe {
          background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
        }
        .sl-flag-stripe-vertical {
          background: linear-gradient(to bottom, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
        }
        .sidebar-item-active {
          background: linear-gradient(90deg, rgba(30, 176, 83, 0.25) 0%, rgba(0, 114, 198, 0.15) 100%);
          border-left: 4px solid var(--sl-green);
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .dark .card-dark {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sl-card-green {
          border-top: 4px solid #1EB053;
        }
        .sl-card-blue {
          border-top: 4px solid #0072C6;
        }
        .sl-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .sl-hero-pattern {
          background-image: 
            linear-gradient(135deg, rgba(30, 176, 83, 0.9) 0%, rgba(0, 114, 198, 0.9) 100%),
            url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-[#0F1F3C] text-white transition-all duration-300 flex flex-col
        w-[85vw] max-w-64 lg:${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex-shrink-0">
          <div className="h-1.5 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {currentOrg?.logo_url && (
                <div className="bg-white p-1.5 rounded-lg flex-shrink-0 inline-flex">
                  <img 
                    src={currentOrg.logo_url} 
                    alt={currentOrg.name} 
                    className="h-8 w-auto object-contain"
                  />
                </div>
              )}
              <p className="font-bold text-base text-white leading-tight line-clamp-2 min-w-0">{currentOrg?.name || 'Loading...'}</p>
            </div>
          ) : (
            currentOrg?.logo_url ? (
              <div className="bg-white p-1.5 rounded-lg mx-auto inline-flex">
                <img 
                  src={currentOrg.logo_url} 
                  alt={currentOrg.name} 
                  className="h-8 w-auto object-contain"
                />
              </div>
            ) : (
              <p className="font-bold text-xs text-white text-center">{currentOrg?.name?.charAt(0) || '?'}</p>
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

            <div className="h-0.5 flex mx-4">
            <div className="flex-1 bg-[#1EB053]/30" />
            <div className="flex-1 bg-white/30" />
            <div className="flex-1 bg-[#0072C6]/30" />
            </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredMenuSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {sectionIndex > 0 && sidebarOpen && (
                <div className="h-0.5 flex mx-3 my-3">
                  <div className="flex-1 bg-[#1EB053]/30" />
                  <div className="flex-1 bg-white/30" />
                  <div className="flex-1 bg-[#0072C6]/30" />
                </div>
              )}
              {sidebarOpen ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  <span>{section.title}</span>
                  {collapsedSections[section.title] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              ) : null}
              {(!collapsedSections[section.title] || !sidebarOpen) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = currentPageName === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                          ${isActive ? 'sidebar-item-active' : 'sidebar-item'}
                          ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
                        `}
                      >
                        <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#1EB053]' : 'group-hover:text-[#1EB053]'}`} />
                        {sidebarOpen && (
                          <>
                            <span className="font-medium text-sm flex-1">{item.name}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1EB053] text-white rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {!sidebarOpen && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-[#0F1F3C] text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-white/10">
                            {item.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0">
          <div className="h-0.5 flex mx-4 mb-3">
            <div className="flex-1 bg-[#1EB053]/30" />
            <div className="flex-1 bg-white/30" />
            <div className="flex-1 bg-[#0072C6]/30" />
          </div>

          {sidebarOpen ? (
            <div className="px-4 pb-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-1 rounded-full overflow-hidden">
                    <div className="w-full bg-gradient-to-b from-[#1EB053] via-white to-[#0072C6]" />
                  </div>
                  <div className="text-xs flex-1">
                    <p className="text-white/90 font-medium">🇸🇱 {currentOrg?.name || 'Organisation'}</p>
                    <p className="text-gray-400 text-[10px]">{currentOrg?.country || 'Sierra Leone'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-2 pb-4">
              <div className="flex h-10 w-1 rounded-full overflow-hidden mx-auto">
                <div className="w-full bg-gradient-to-b from-[#1EB053] via-white to-[#0072C6]" />
              </div>
            </div>
          )}

          <div className="h-1.5 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className={`
          sticky top-0 z-30 h-16 px-4 lg:px-6 flex items-center justify-between
          ${darkMode ? 'bg-[#0F1F3C]/95 border-white/10' : 'bg-white/95 border-gray-200'}
          border-b backdrop-blur-md
        `}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              className={`hidden md:flex items-center gap-2 w-64 justify-start text-gray-500 ${darkMode ? 'bg-white/5 border-white/10' : ''}`}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">⌘K</kbd>
            </Button>

            <RolePreviewSwitcher
              currentPreviewRole={previewRole}
              onPreviewRoleChange={setPreviewRole}
              actualRole={actualRole}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatPanelOpen(!chatPanelOpen)}
              className={cn(
                "relative",
                darkMode ? 'text-white hover:bg-white/10' : '',
                chatPanelOpen && 'bg-gray-100'
              )}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1EB053] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadChatCount > 9 ? '9+' : unreadChatCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className={darkMode ? 'text-white hover:bg-white/10' : ''}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <OfflineSyncButton orgId={orgId} />

            <NotificationCenter orgId={orgId} currentEmployee={currentEmployee} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`flex items-center gap-2 ${darkMode ? 'text-white hover:bg-white/10' : ''}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentEmployee?.profile_photo} />
                    <AvatarFallback className="sl-gradient text-white text-sm">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">{currentEmployee?.role || user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Profile")} className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Settings")} className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSetPinDialog(true)}>
                  <Lock className="w-4 h-4 mr-2" />
                  <span>{currentEmployee?.pin_hash ? 'Change PIN' : 'Set PIN'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="h-1.5 sl-flag-stripe" />

        <RolePreviewBanner 
          previewRole={previewRole} 
          onExit={() => setPreviewRole(null)} 
        />

        <main className={`p-4 lg:p-6 ${darkMode ? 'text-white' : ''} overflow-x-hidden`} style={{ paddingBottom: 'max(6rem, calc(5rem + env(safe-area-inset-bottom, 0px)))', minHeight: 'calc(100vh - 4.5rem)' }}>
          <ToastProvider>
            <PermissionsProvider>
              <OfflineProvider>
                {children}
              </OfflineProvider>
            </PermissionsProvider>
          </ToastProvider>
        </main>

        <MobileNav currentPageName={currentPageName} />

        <MobileQuickSale
          open={showQuickSale}
          onOpenChange={setShowQuickSale}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        <MobileStockCheck
          open={showStockCheck}
          onOpenChange={setShowStockCheck}
          orgId={orgId}
        />

        <MobileDeliveryUpdate
          open={showDeliveryUpdate}
          onOpenChange={setShowDeliveryUpdate}
          orgId={orgId}
          currentEmployee={currentEmployee}
        />

        <GlobalSearch 
          orgId={orgId} 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />

        <InstallPrompt />

        <ChatNotificationProvider>
          <ChatPanel 
            isOpen={chatPanelOpen}
            onClose={() => setChatPanelOpen(false)}
            orgId={orgId}
            currentEmployee={currentEmployee}
          />
        </ChatNotificationProvider>

        <SetPinDialog
          open={showSetPinDialog}
          onOpenChange={setShowSetPinDialog}
          employee={currentEmployee}
        />
      </div>
    </div>
  );
}