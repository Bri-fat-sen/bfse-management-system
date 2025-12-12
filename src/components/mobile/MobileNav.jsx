import { useState } from "react";
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
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-gray-200">
      <div 
        className="flex items-stretch justify-between w-full"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {mobileNavItems.map((item) => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] relative"
            >
              {isActive && (
                <div className="absolute top-0 inset-x-2 h-0.5 bg-[#1EB053] rounded-full" />
              )}
              <item.icon 
                className={`w-5 h-5 ${isActive ? "text-[#1EB053]" : "text-gray-400"}`} 
              />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-[#1EB053] font-semibold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}