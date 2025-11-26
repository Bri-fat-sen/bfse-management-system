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
  FileText,
  Bell,
  Calculator,
  Warehouse,
  ClipboardList
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
  { 
    icon: ClipboardList, 
    label: "Reports", 
    page: "Reports", 
    color: "from-[#D4AF37] to-amber-600",
    description: "View reports"
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={createPageUrl(action.page)}
              className="group"
            >
              <div className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300 bg-white hover:scale-105">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-sm text-gray-900">{action.label}</span>
                <span className="text-xs text-gray-500 mt-0.5">{action.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}