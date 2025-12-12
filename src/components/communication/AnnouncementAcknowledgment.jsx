import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Check,
  CheckCheck,
  Eye,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AnnouncementAcknowledgment({ 
  announcement, 
  currentEmployee,
  totalEmployees = 0
}) {
  const queryClient = useQueryClient();
  
  const acknowledgments = announcement.acknowledgments || [];
  const hasAcknowledged = acknowledgments.some(a => a.user_id === currentEmployee?.id);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.update(announcement.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const handleAcknowledge = () => {
    if (hasAcknowledged) return;

    const newAck = {
      user_id: currentEmployee?.id,
      user_name: currentEmployee?.full_name,
      user_photo: currentEmployee?.profile_photo,
      acknowledged_at: new Date().toISOString()
    };

    updateMutation.mutate({
      acknowledgments: [...acknowledgments, newAck]
    });
  };

  const ackPercentage = totalEmployees > 0 
    ? Math.round((acknowledgments.length / totalEmployees) * 100) 
    : 0;

  return (
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700">
            <Eye className="w-3.5 h-3.5" />
            <span>{acknowledgments.length} acknowledged</span>
            {totalEmployees > 0 && (
              <span className="text-gray-400">({ackPercentage}%)</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-green-600" />
            Acknowledged by
          </h4>
          {acknowledgments.length === 0 ? (
            <p className="text-sm text-gray-500">No acknowledgments yet</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {acknowledgments.map((ack) => (
                <div key={ack.user_id} className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={ack.user_photo} />
                    <AvatarFallback className="text-xs">
                      {ack.user_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ack.user_name}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(ack.acknowledged_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={hasAcknowledged ? "secondary" : "outline"}
              className={`h-7 text-xs ${hasAcknowledged ? 'text-green-600' : ''}`}
              onClick={handleAcknowledge}
              disabled={hasAcknowledged}
            >
              {hasAcknowledged ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Acknowledged
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Acknowledge
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {hasAcknowledged 
              ? 'You have acknowledged this announcement' 
              : 'Mark as read and acknowledged'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}