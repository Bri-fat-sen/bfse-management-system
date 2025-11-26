import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingCart,
  UserPlus,
  Package,
  Truck,
  DollarSign,
  Clock,
  Calculator,
  Warehouse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { 
    icon: ShoppingCart, 
    label: "New Sale", 
    page: "Sales", 
    color: "from-[#1EB053] to-emerald-600",
    description: "Process POS sale"
  },
  { 
    icon: UserPlus, 
    label: "Add Employee", 
    page: "HR", 
    color: "from-[#0072C6] to-blue-600",
    description: "Register staff"
  },
  { 
    icon: Package, 
    label: "Stock In", 
    page: "Inventory", 
    color: "from-amber-500 to-orange-500",
    description: "Receive goods"
  },
  { 
    icon: Truck, 
    label: "Record Trip", 
    page: "Transport", 
    color: "from-purple-500 to-violet-600",
    description: "Log transport"
  },
  { 
    icon: Clock, 
    label: "Attendance", 
    page: "Attendance", 
    color: "from-cyan-500 to-teal-500",
    description: "Clock in/out"
  },
  { 
    icon: Calculator, 
    label: "Payroll", 
    page: "HR", 
    color: "from-pink-500 to-rose-500",
    description: "Process salary"
  },
  { 
    icon: DollarSign, 
    label: "Expenses", 
    page: "Finance", 
    color: "from-red-500 to-rose-600",
    description: "Record expense"
  },
  { 
    icon: Warehouse, 
    label: "Suppliers", 
    page: "Suppliers", 
    color: "from-indigo-500 to-purple-600",
    description: "Manage vendors"
  },

];

export default function QuickActions() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg relative">
      {/* Top flag stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
      
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#1EB053]/5 to-[#0072C6]/5 rounded-full transform translate-x-20 -translate-y-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent rounded-full transform -translate-x-10 translate-y-10" />
      
      <CardHeader className="pb-2 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] shadow-md">
            <div className="flex h-4 w-6 rounded-sm overflow-hidden">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
          </div>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Link
              key={action.label}
              to={createPageUrl(action.page)}
              className="group"
            >
              <div className="relative flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:scale-105 overflow-hidden">
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent" />
                </div>
                <span className="font-medium text-sm text-gray-900 relative">{action.label}</span>
                <span className="text-xs text-gray-500 mt-0.5 relative">{action.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
      {/* Bottom flag stripe */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-100" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
    </Card>
  );
}