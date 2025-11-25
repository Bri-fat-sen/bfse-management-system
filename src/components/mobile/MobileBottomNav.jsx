import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Clock,
  Truck,
  Menu
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", page: "Dashboard" },
  { icon: ShoppingCart, label: "Sales", page: "Sales" },
  { icon: Clock, label: "Clock", page: "Attendance" },
  { icon: Truck, label: "Trips", page: "Transport" },
];

export default function MobileBottomNav({ userRole }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Filter nav items based on role
  const getNavForRole = () => {
    switch (userRole) {
      case 'driver':
        return navItems.filter(n => ['Home', 'Clock', 'Trips'].includes(n.label));
      case 'retail_cashier':
      case 'vehicle_sales':
        return navItems.filter(n => ['Home', 'Sales', 'Clock'].includes(n.label));
      default:
        return navItems;
    }
  };

  const items = getNavForRole();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = currentPath.includes(item.page);
          return (
            <Link
              key={item.label}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive 
                  ? "text-[#1EB053]" 
                  : "text-gray-500"
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}