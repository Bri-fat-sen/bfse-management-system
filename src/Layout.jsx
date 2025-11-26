import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
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
  ChevronUp
} from "lucide-react";
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
import { Toaster } from "sonner";

const menuSections = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", module: "dashboard" },
      { name: "Employee Portal", icon: User, page: "EmployeeDashboard", module: "dashboard" },
      { name: "Communication", icon: MessageSquare, page: "Communication", module: "communication", badge: "3" },
    ]
  },
  {
    title: "Operations",
    items: [
      { name: "Sales & POS", icon: ShoppingCart, page: "Sales", module: "sales" },
      { name: "Inventory", icon: Package, page: "Inventory", module: "inventory" },
      { name: "Suppliers", icon: Building2, page: "Suppliers", module: "inventory" },
      { name: "Transport", icon: Truck, page: "Transport", module: "transport" },
    ]
  },
  {
    title: "People",
    items: [
      { name: "HR & Payroll", icon: Users, page: "HR", module: "hr" },
      { name: "Attendance", icon: Clock, page: "Attendance", module: "attendance" },
    ]
  },
  {
    title: "Insights",
    items: [
      { name: "Analytics", icon: BarChart3, page: "Analytics", module: "dashboard" },
      { name: "HR Analytics", icon: Users, page: "HRAnalytics", module: "hr" },
      { name: "Finance", icon: DollarSign, page: "Finance", module: "finance" },
      { name: "Reports", icon: BarChart3, page: "Reports", module: "finance" },
      { name: "Activity Log", icon: Activity, page: "ActivityLog", module: "activity_log" },
    ]
  },
  {
    title: "Admin",
    items: [
      { name: "Locations", icon: MapPin, page: "Locations", module: "settings", adminOnly: true },
      { name: "Organisation", icon: Building2, page: "OrganisationManage", module: "settings", adminOnly: true },
      { name: "Permissions", icon: Shield, page: "RolePermissions", module: "settings", adminOnly: true },
      { name: "Settings", icon: Settings, page: "Settings", module: "settings" },
      { name: "Support", icon: HelpCircle, page: "Support", module: "settings" },
    ]
  }
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 10),
  });

  const { data: employee } = useQuery({
    queryKey: ['currentEmployee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const userRole = currentEmployee?.role || 'read_only';
  const orgId = currentEmployee?.organisation_id;

  // Get permissions for the user's role
  const permissions = useMemo(() => {
    return DEFAULT_ROLE_PERMISSIONS[userRole] || DEFAULT_ROLE_PERMISSIONS.read_only;
  }, [userRole]);

  // Filter menu items based on permissions
  const filteredMenuSections = useMemo(() => {
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Admin-only items
        if (item.adminOnly && !['super_admin', 'org_admin'].includes(userRole)) {
          return false;
        }
        
        // Restrict Reports to specific roles
        if (item.page === 'Reports' && !['super_admin', 'org_admin', 'accountant', 'hr_admin', 'warehouse_manager'].includes(userRole)) {
          return false;
        }
        

        // Check if user can view this module
        return permissions[item.module]?.can_view ?? false;
      })
    })).filter(section => section.items.length > 0);
  }, [userRole, permissions]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#0F1F3C]' : 'bg-gray-50'}`}>
      <style>{`
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-[#0F1F3C] text-white transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo with Sierra Leone Flag Colors */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex flex-col shadow-lg">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">BRI-FAT-SEN</p>
                <p className="text-[10px] text-gray-400">Enterprise</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex flex-col mx-auto shadow-lg">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
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

        {/* Navigation with Sections */}
        <nav className="p-3 space-y-4 overflow-y-auto h-[calc(100%-8rem)]">
          {filteredMenuSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  {sidebarOpen ? (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <span>{section.title}</span>
                      {collapsedSections[section.title] ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronUp className="w-3 h-3" />
                      )}
                    </button>
                  ) : (
                    sectionIndex > 0 && <div className="border-t border-white/10 my-2" />
                  )}
                  {(!collapsedSections[section.title] || !sidebarOpen) && (
                    <div className="space-y-1">
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

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-8 w-1 rounded-full overflow-hidden">
                <div className="w-full bg-gradient-to-b from-[#1EB053] via-white to-[#0072C6]" />
              </div>
              <div className="text-xs">
                <p className="text-gray-400">🇸🇱 Sierra Leone</p>
                <p className="text-gray-500">BFSE Management v1.0</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Navbar */}
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
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className={darkMode ? 'text-white hover:bg-white/10' : ''}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Offline Status */}
            <OfflineStatus />

            {/* Notifications */}
            <NotificationCenter orgId={orgId} currentEmployee={currentEmployee} />

            {/* User Menu */}
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sierra Leone Flag Stripe */}
        <div className="h-1.5 sl-flag-stripe" />

        {/* Page Content */}
        <main className={`p-4 lg:p-6 pb-24 lg:pb-6 ${darkMode ? 'text-white' : ''}`}>
          <PermissionsProvider>
            <OfflineProvider>
              {children}
            </OfflineProvider>
          </PermissionsProvider>
        </main>

        {/* Mobile Bottom Navigation */}
                    <MobileNav currentPageName={currentPageName} />

                    {/* Global Search Dialog */}
                    <GlobalSearch 
                      orgId={orgId} 
                      isOpen={searchOpen} 
                      onClose={() => setSearchOpen(false)} 
                    />

                    {/* Toast notifications - using sonner library */}
                    <Toaster 
                      position="top-right" 
                      richColors 
                      expand={false}
                      visibleToasts={5}
                      duration={4000}
                    />
                    </div>
                    </div>
                    );
        }