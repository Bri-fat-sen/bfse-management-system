import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MessageCircle,
  Send,
  ThumbsUp,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

export default function AnnouncementComments({
  announcement,
  currentEmployee,
  orgId
}) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ['announcementComments', announcement?.id],
    queryFn: () => base44.entities.ChatMessage.filter({
      organisation_id: orgId,
      reply_to_id: announcement?.id,
      message_type: 'announcement_comment'
    }, 'created_date', 50),
    enabled: !!announcement?.id && isOpen,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcementComments', announcement?.id] });
      setComment("");
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.update(announcement.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const handleComment = () => {
    if (!comment.trim()) return;
    
    addCommentMutation.mutate({
      organisation_id: orgId,
      sender_id: currentEmployee?.id,
      sender_name: currentEmployee?.full_name,
      sender_photo: currentEmployee?.profile_photo,
      content: comment,
      message_type: 'announcement_comment',
      reply_to_id: announcement.id,
    });

    // Update comment count
    updateAnnouncementMutation.mutate({
      comment_count: (announcement.comment_count || 0) + 1
    });
  };

  const handleAcknowledge = () => {
    const acknowledgedBy = announcement.acknowledged_by || [];
    if (acknowledgedBy.includes(currentEmployee?.id)) return;
    
    updateAnnouncementMutation.mutate({
      acknowledged_by: [...acknowledgedBy, currentEmployee?.id],
      acknowledged_names: [...(announcement.acknowledged_names || []), currentEmployee?.full_name]
    });
    toast.success("Acknowledgment recorded");
  };

  const handleLike = () => {
    const likedBy = announcement.liked_by || [];
    const isLiked = likedBy.includes(currentEmployee?.id);
    
    updateAnnouncementMutation.mutate({
      liked_by: isLiked 
        ? likedBy.filter(id => id !== currentEmployee?.id)
        : [...likedBy, currentEmployee?.id],
      like_count: isLiked 
        ? (announcement.like_count || 1) - 1 
        : (announcement.like_count || 0) + 1
    });
  };

  const isLiked = announcement.liked_by?.includes(currentEmployee?.id);
  const isAcknowledged = announcement.acknowledged_by?.includes(currentEmployee?.id);
  const likeCount = announcement.like_count || 0;
  const commentCount = announcement.comment_count || comments.length || 0;
  const acknowledgedCount = announcement.acknowledged_by?.length || 0;

  return (
    <div className="mt-3 pt-3 border-t">
      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${isLiked ? 'text-[#1EB053]' : 'text-gray-500'}`}
          onClick={handleLike}
        >
          <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          {likeCount > 0 && likeCount}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          {commentCount > 0 && commentCount}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${isAcknowledged ? 'text-[#1EB053]' : 'text-gray-500'}`}
          onClick={handleAcknowledge}
          disabled={isAcknowledged}
        >
          <Check className={`w-4 h-4 mr-1 ${isAcknowledged ? 'fill-current' : ''}`} />
          {isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
        </Button>

        {acknowledgedCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {acknowledgedCount} acknowledged
          </Badge>
        )}
      </div>

      {/* Comments Section */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="mt-3 space-y-3">
          {/* Comment Input */}
          <div className="flex gap-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={currentEmployee?.profile_photo} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                {currentEmployee?.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                className="h-9"
              />
              <Button
                size="icon"
                className="h-9 w-9 bg-[#1EB053] hover:bg-[#178f43]"
                onClick={handleComment}
                disabled={!comment.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-2 pl-10">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarImage src={c.sender_photo} />
                    <AvatarFallback className="text-[10px] bg-gray-200">
                      {c.sender_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.sender_name}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(c.created_date), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}