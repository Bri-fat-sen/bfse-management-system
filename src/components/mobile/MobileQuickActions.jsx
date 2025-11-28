import React, { useState } from "react";
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  QrCode,
  Plus,
  X,
  Search,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MobileQuickActions({ 
  onQuickSale, 
  onStockCheck, 
  onDeliveryUpdate,
  onScanBarcode 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      icon: ShoppingCart, 
      label: "Quick Sale", 
      color: "bg-[#1EB053]",
      onClick: () => { onQuickSale?.(); setIsOpen(false); }
    },
    { 
      icon: Package, 
      label: "Check Stock", 
      color: "bg-[#0072C6]",
      onClick: () => { onStockCheck?.(); setIsOpen(false); }
    },
    { 
      icon: Truck, 
      label: "Delivery", 
      color: "bg-purple-500",
      onClick: () => { onDeliveryUpdate?.(); setIsOpen(false); }
    },
    { 
      icon: QrCode, 
      label: "Scan", 
      color: "bg-amber-500",
      onClick: () => { onScanBarcode?.(); setIsOpen(false); }
    },
  ];

  return (
    <div className="fixed z-40 lg:hidden" style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))', right: '1rem' }}>
      {/* Action Buttons */}
      <div className={cn(
        "flex flex-col-reverse gap-2 mb-2 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg text-white transition-all",
              action.color,
              "animate-in slide-in-from-bottom duration-200 min-h-[44px]"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <action.icon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-xs whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>

      {/* FAB */}
      <Button
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full shadow-xl transition-all duration-300 p-0 min-w-[48px] min-h-[48px]",
          isOpen 
            ? "bg-gray-800 rotate-45" 
            : "bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </Button>
    </div>
  );
}