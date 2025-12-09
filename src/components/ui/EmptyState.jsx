import { } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1EB053]/10 to-[#1D5FC3]/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[#1D5FC3]" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action} className="sl-gradient">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}