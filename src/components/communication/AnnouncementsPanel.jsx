import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Megaphone,
  Plus,
  Pin,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const PRIORITY_CONFIG = {
  urgent: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  important: { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  normal: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export default function AnnouncementsPanel({ orgId, currentEmployee, canPost }) {
  const queryClient = useQueryClient();
  const [showNewDialog, setShowNewDialog] = useState(false);

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', orgId],
    queryFn: () => base44.entities.ChatMessage.filter({ 
      organisation_id: orgId,
      message_type: 'announcement'
    }, '-created_date', 20),
    enabled: !!orgId,
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setShowNewDialog(false);
      toast.success("Announcement posted");
    },
  });

  const handlePost = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    createAnnouncementMutation.mutate({
      organisation_id: orgId,
      sender_id: currentEmployee?.id,
      sender_name: currentEmployee?.full_name,
      sender_photo: currentEmployee?.profile_photo,
      content: formData.get('content'),
      message_type: 'announcement',
      priority: formData.get('priority') || 'normal',
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#0072C6]" />
            Announcements
          </CardTitle>
          {canPost && (
            <Button size="sm" onClick={() => setShowNewDialog(true)} className="h-8 bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
              <Plus className="w-4 h-4 mr-1" />
              Post
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-3 pt-0">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No announcements yet</p>
          </div>
        ) : (
          announcements.map((ann) => {
            const config = PRIORITY_CONFIG[ann.priority] || PRIORITY_CONFIG.normal;
            const Icon = config.icon;
            
            return (
              <div 
                key={ann.id} 
                className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{ann.sender_name}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(ann.created_date), 'MMM d, HH:mm')}
                      </span>
                      {ann.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* New Announcement Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#0072C6]" />
              New Announcement
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <Select name="priority" defaultValue="normal">
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="important">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600" />
                      Important
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea 
              name="content" 
              placeholder="Write your announcement..."
              className="min-h-[120px]"
              required
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}