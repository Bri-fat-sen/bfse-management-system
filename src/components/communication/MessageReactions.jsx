import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export default function MessageReactions({ message, currentEmployeeId, currentEmployeeName }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const reactions = message.reactions || {};
  
  const updateReactionsMutation = useMutation({
    mutationFn: (newReactions) => base44.entities.ChatMessage.update(message.id, { reactions: newReactions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const toggleReaction = (emoji) => {
    const currentReactions = { ...reactions };
    
    if (!currentReactions[emoji]) {
      currentReactions[emoji] = [];
    }
    
    const userIndex = currentReactions[emoji].findIndex(r => r.id === currentEmployeeId);
    
    if (userIndex >= 0) {
      currentReactions[emoji].splice(userIndex, 1);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      currentReactions[emoji].push({ id: currentEmployeeId, name: currentEmployeeName });
    }
    
    updateReactionsMutation.mutate(currentReactions);
    setOpen(false);
  };

  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {Object.entries(reactions).map(([emoji, users]) => {
        const hasReacted = users.some(u => u.id === currentEmployeeId);
        const names = users.map(u => u.name).join(', ');
        
        return (
          <TooltipProvider key={emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleReaction(emoji)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-all ${
                    hasReacted 
                      ? 'bg-[#1EB053]/20 border border-[#1EB053]' 
                      : 'bg-gray-100 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600">{users.length}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{names}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
            {hasReactions ? <Plus className="w-3 h-3" /> : <Smile className="w-3 h-3" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}