import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AnnouncementComments({ 
  announcement, 
  currentEmployee 
}) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const comments = announcement.comments || [];

  const updateAnnouncementMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.update(announcement.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      content: newComment,
      sender_id: currentEmployee?.id,
      sender_name: currentEmployee?.full_name,
      sender_photo: currentEmployee?.profile_photo,
      created_at: new Date().toISOString()
    };

    updateAnnouncementMutation.mutate({
      comments: [...comments, comment]
    });

    setNewComment("");
  };

  return (
    <div className="mt-2 pt-2 border-t border-gray-200">
      <button
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        onClick={() => setShowComments(!showComments)}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        {showComments ? (
          <ChevronUp className="w-3 h-3 ml-1" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-1" />
        )}
      </button>

      {showComments && (
        <div className="mt-2 space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.sender_photo} />
                <AvatarFallback className="text-xs">
                  {comment.sender_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-white rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{comment.sender_name}</span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.created_at), 'MMM d, HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 mt-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={currentEmployee?.profile_photo} />
              <AvatarFallback className="text-xs">
                {currentEmployee?.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-1">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="h-8 text-sm"
              />
              <Button 
                size="icon" 
                className="h-8 w-8 bg-[#1EB053]"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}