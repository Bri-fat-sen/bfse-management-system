import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FormWrapper({ 
  children, 
  className,
  maxWidth = "2xl" 
}) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth] || "max-w-2xl";

  return (
    <Card className={cn(
      "mx-auto border-0 shadow-2xl overflow-hidden",
      maxWidthClass,
      className
    )}>
      {/* Sierra Leone flag stripe */}
      <div className="h-1.5 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]" />
      {children}
    </Card>
  );
}

export function FormWrapperHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  variant = "default",
  rightContent 
}) {
  const variants = {
    default: "bg-white border-b",
    gradient: "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white",
    dark: "bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] text-white",
    gold: "bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] text-white",
  };

  const iconBg = {
    default: "bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 text-[#1EB053]",
    gradient: "bg-white/20 text-white backdrop-blur-sm",
    dark: "bg-white/10 text-white backdrop-blur-sm",
    gold: "bg-[#D4AF37]/20 text-[#D4AF37]",
  };

  const subtitleColor = {
    default: "text-gray-500",
    gradient: "text-white/80",
    dark: "text-white/70",
    gold: "text-white/70",
  };

  return (
    <CardHeader className={cn("pb-6", variants[variant])}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              iconBg[variant]
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {subtitle && (
              <p className={cn("text-sm mt-0.5", subtitleColor[variant])}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {rightContent}
      </div>
    </CardHeader>
  );
}

export function FormWrapperContent({ children, className, noPadding = false }) {
  return (
    <CardContent className={cn(
      !noPadding && "p-6",
      className
    )}>
      {children}
    </CardContent>
  );
}

export function FormInfoBanner({ 
  icon: Icon, 
  message, 
  variant = "info" 
}) {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={cn(
      "p-4 rounded-xl border flex items-center gap-3",
      variants[variant]
    )}>
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function FormSummaryCard({ items }) {
  return (
    <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-white/60 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
            <p className="font-semibold text-gray-900 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}