import React from "react";
import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

export default function InventoryStats({ products, primaryColor, secondaryColor }) {
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock_quantity > 0).length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 10)).length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      subtitle: `${inStockProducts} in stock`,
      icon: Package,
      gradient: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      bgGradient: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}10 100%)`
    },
    {
      title: "Low Stock Alerts",
      value: lowStockProducts,
      subtitle: `${outOfStockProducts} out of stock`,
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
      bgGradient: "linear-gradient(135deg, #FEF3C7 0%, #FEE2E2 100%)"
    },
    {
      title: "Inventory Value",
      value: `Le ${totalValue.toLocaleString()}`,
      subtitle: "Cost value",
      icon: DollarSign,
      gradient: `linear-gradient(135deg, ${secondaryColor} 0%, #8B5CF6 100%)`,
      bgGradient: `linear-gradient(135deg, ${secondaryColor}10 0%, #EDE9FE 100%)`
    },
    {
      title: "Retail Value",
      value: `Le ${totalRetailValue.toLocaleString()}`,
      subtitle: `Le ${(totalRetailValue - totalValue).toLocaleString()} potential profit`,
      icon: TrendingUp,
      gradient: `linear-gradient(135deg, ${primaryColor} 0%, #10B981 100%)`,
      bgGradient: `linear-gradient(135deg, ${primaryColor}10 0%, #D1FAE5 100%)`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={index}
          className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          style={{ background: stat.bgGradient }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: stat.gradient }}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: stat.gradient }} />
        </Card>
      ))}
    </div>
  );
}