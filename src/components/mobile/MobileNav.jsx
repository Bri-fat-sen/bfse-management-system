import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Clock,
  User
} from "lucide-react";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Home", page: "Dashboard" },
  { icon: ShoppingCart, label: "Sales", page: "Sales" },
  { icon: Package, label: "Stock", page: "Inventory" },
  { icon: Clock, label: "Clock", page: "Attendance" },
  { icon: User, label: "Me", page: "EmployeeDashboard" },
];

export default function MobileNav({ currentPageName }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 lg:hidden" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}>
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
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
  );
}