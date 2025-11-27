import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  User,
  Plus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Home", page: "Dashboard" },
  { icon: ShoppingCart, label: "Sales", page: "Sales" },
  { icon: Package, label: "Stock", page: "Inventory" },
  { icon: Truck, label: "Fleet", page: "Transport" },
  { icon: User, label: "Me", page: "EmployeeDashboard" },
];

const quickActions = [
  { icon: ShoppingCart, label: "Quick Sale", page: "Sales", color: "bg-green-500" },
  { icon: Package, label: "Check Stock", page: "Inventory", color: "bg-blue-500" },
  { icon: Truck, label: "Update Delivery", page: "Transport", color: "bg-purple-500" },
];

export default function MobileNav({ currentPageName }) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 lg:hidden pb-safe">
        <div className="flex items-center justify-around py-1 relative">
          {mobileNavItems.slice(0, 2).map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive 
                    ? "text-[#1EB053]" 
                    : "text-gray-400 active:text-gray-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-green-100' : ''}`}>
                  <item.icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#1EB053]' : ''}`}>{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Center FAB Button */}
          <button
            onClick={() => setShowQuickActions(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-7 h-7" />
          </button>

          {/* Spacer for FAB */}
          <div className="w-14" />

          {mobileNavItems.slice(3).map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive 
                    ? "text-[#1EB053]" 
                    : "text-gray-400 active:text-gray-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-green-100' : ''}`}>
                  <item.icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#1EB053]' : ''}`}>{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Actions Drawer */}
      <Drawer open={showQuickActions} onOpenChange={setShowQuickActions}>
        <DrawerContent className="pb-8">
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>Quick Actions</DrawerTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowQuickActions(false)}>
              <X className="w-5 h-5" />
            </Button>
          </DrawerHeader>
          <div className="px-4 grid grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.page}
                to={createPageUrl(action.page)}
                onClick={() => setShowQuickActions(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className={`w-14 h-14 rounded-full ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}