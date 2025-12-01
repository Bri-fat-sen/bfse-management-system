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
  { icon: User, label: "Me", page: "EmployeeSelfService" },
];

export default function MobileNav({ currentPageName }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]" />
      
      {/* Nav content */}
      <div 
        className="relative flex items-center justify-around px-1"
        style={{ 
          paddingTop: '0.5rem',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' 
        }}
      >
        {mobileNavItems.map((item) => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="relative flex flex-col items-center min-w-[60px] py-1 group"
            >
              {/* Active indicator pill at top */}
              <div 
                className={`absolute -top-2.5 w-10 h-1 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] opacity-100' 
                    : 'opacity-0'
                }`} 
              />
              
              {/* Icon container */}
              <div 
                className={`relative p-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#1EB053]/15 to-[#0072C6]/10' 
                    : 'group-active:bg-gray-100'
                }`}
              >
                <item.icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive 
                      ? "text-[#1EB053] scale-110" 
                      : "text-gray-400 group-active:text-gray-600"
                  }`} 
                />
                
                {/* Glow effect for active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-[#1EB053]/20 blur-md -z-10" />
                )}
              </div>
              
              {/* Label */}
              <span 
                className={`text-[10px] font-semibold mt-0.5 transition-colors duration-300 ${
                  isActive ? 'text-[#1EB053]' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}