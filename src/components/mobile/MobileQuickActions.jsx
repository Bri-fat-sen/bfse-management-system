import { useState } from "react";
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

  // Hide on desktop (lg:hidden), position above mobile nav
  return (
    <div 
      className="fixed z-40 lg:hidden"
      style={{ 
        bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))', 
        right: '0.75rem' 
      }}
    >
      {/* Action Buttons - appears when FAB is clicked */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-2 mb-2">
          {actions.map((action, index) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-white",
                action.color
              )}
              style={{ 
                animation: `slideUp 0.2s ease-out ${index * 0.05}s both`
              }}
            >
              <action.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-xs whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-transform duration-200",
          isOpen 
            ? "bg-gray-700" 
            : "bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        )}
        style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}