import { } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PageHeader({ 
  title, 
  subtitle, 
  action, 
  actionLabel, 
  actionIcon: ActionIcon = Plus,
  children 
}) {
  return (
    <div className="mb-6">
      {/* Sierra Leone flag stripe accent */}
      <div className="flex h-1 w-24 rounded-full overflow-hidden mb-4">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {children}
          {action && (
            <Button 
              onClick={action}
              className="bg-[#1EB053] hover:bg-[#178f43] text-white transition-all shadow-lg hover:shadow-xl"
            >
              <ActionIcon className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}