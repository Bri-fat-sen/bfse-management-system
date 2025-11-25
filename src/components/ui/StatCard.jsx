import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = "green",
  subtitle 
}) {
  const colorClasses = {
    green: "from-[#1EB053] to-[#16803d]",
    blue: "from-[#0072C6] to-[#005a9e]",
    gold: "from-[#D4AF37] to-[#b8962e]",
    navy: "from-[#0F1F3C] to-[#1a2d52]",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600"
  };

  const borderColors = {
    green: "border-t-[#1EB053]",
    blue: "border-t-[#0072C6]",
    gold: "border-t-[#D4AF37]",
    navy: "border-t-[#0F1F3C]",
    red: "border-t-red-500",
    purple: "border-t-purple-500"
  };

  return (
    <Card className={`relative overflow-hidden p-6 bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-sm border-t-4 ${borderColors[color]}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
      
      <div className="flex items-start justify-between relative">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-[#1EB053]' : 'text-red-500'}`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}