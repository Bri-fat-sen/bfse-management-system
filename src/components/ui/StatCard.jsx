import { } from "react";
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
    <Card className={`relative overflow-hidden p-3 sm:p-6 bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-sm border-t-4 ${borderColors[color]}`}>
      <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
      
      <div className="flex items-start justify-between relative gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className="text-[10px] sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-lg sm:text-3xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && (
            <p className="text-[10px] sm:text-sm text-gray-500 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-[10px] sm:text-sm ${trend === 'up' ? 'text-[#1EB053]' : 'text-red-500'}`}>
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="font-medium truncate">{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${colorClasses[color]} flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}