import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingCart,
  Clock,
  Truck,
  Package,
  DollarSign,
  Users,
  MessageSquare,
  Settings
} from "lucide-react";

const quickActions = [
  { icon: ShoppingCart, label: "New Sale", page: "Sales", color: "from-[#1EB053] to-[#16803d]" },
  { icon: Clock, label: "Clock In/Out", page: "Attendance", color: "from-[#0072C6] to-[#005a9e]" },
  { icon: Truck, label: "Record Trip", page: "Transport", color: "from-[#D4AF37] to-[#b8962e]" },
  { icon: Package, label: "Inventory", page: "Inventory", color: "from-[#0F1F3C] to-[#1a2d52]" },
];

export default function MobileQuickActions({ userRole }) {
  // Filter actions based on role
  const getActionsForRole = () => {
    switch (userRole) {
      case 'driver':
        return quickActions.filter(a => ['Clock In/Out', 'Record Trip'].includes(a.label));
      case 'retail_cashier':
      case 'vehicle_sales':
        return quickActions.filter(a => ['New Sale', 'Clock In/Out', 'Inventory'].includes(a.label));
      default:
        return quickActions;
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={createPageUrl(action.page)}
          className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-white flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform min-h-[100px]`}
        >
          <action.icon className="w-8 h-8" />
          <span className="font-semibold text-sm text-center">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}