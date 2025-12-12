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

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

export default function MessageReactions({ message, currentEmployeeId, currentEmployeeName }) {
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  
  const reactions = message.reactions || [];
  
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {});

  const updateReactionsMutation = useMutation({
    mutationFn: ({ messageId, newReactions }) => 
      base44.entities.ChatMessage.update(messageId, { reactions: newReactions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const handleReaction = (emoji) => {
    const existingIndex = reactions.findIndex(
      r => r.emoji === emoji && r.user_id === currentEmployeeId
    );

    let newReactions;
    if (existingIndex >= 0) {
      // Remove reaction
      newReactions = reactions.filter((_, i) => i !== existingIndex);
    } else {
      // Add reaction
      newReactions = [...reactions, {
        emoji,
        user_id: currentEmployeeId,
        user_name: currentEmployeeName,
        created_at: new Date().toISOString()
      }];
    }

    updateReactionsMutation.mutate({ messageId: message.id, newReactions });
    setShowPicker(false);
  };

  const hasReacted = (emoji) => 
    reactions.some(r => r.emoji === emoji && r.user_id === currentEmployeeId);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Object.entries(groupedReactions).map(([emoji, users]) => (
        <TooltipProvider key={emoji}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleReaction(emoji)}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                  hasReacted(emoji) 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {users.map(u => u.user_name).join(', ')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
            <Smile className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`p-1.5 rounded hover:bg-gray-100 text-lg ${
                  hasReacted(emoji) ? 'bg-blue-50' : ''
                }`}
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