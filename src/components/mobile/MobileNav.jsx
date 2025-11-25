import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Clock,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Home", page: "Dashboard" },
  { icon: ShoppingCart, label: "Sales", page: "Sales" },
  { icon: Truck, label: "Trips", page: "Transport" },
  { icon: Clock, label: "Clock", page: "Attendance" },
];

export default function MobileNav({ currentPageName }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive 
                  ? "text-[#1EB053]" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
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