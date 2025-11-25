import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, X, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function AnnouncementBanner({ employees, orgId, currentEmployee }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sending, setSending] = useState(false);

  const sendAnnouncementMutation = useMutation({
    mutationFn: async () => {
      setSending(true);
      // Create notifications for all employees
      const notifications = employees.map(emp => ({
        organisation_id: orgId,
        recipient_id: emp.id,
        recipient_email: emp.email,
        type: 'system',
        title: title,
        message: message,
        priority: priority,
        is_read: false,
      }));
      
      await base44.entities.Notification.bulkCreate(notifications);

      // Log activity
      await base44.entities.ActivityLog.create({
        organisation_id: orgId,
        employee_id: currentEmployee?.id,
        employee_name: currentEmployee?.full_name,
        action_type: 'other',
        module: 'communication',
        description: `Sent announcement: ${title}`,
      });

      return notifications.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: `Announcement sent to ${count} employees` });
      setShowDialog(false);
      setTitle('');
      setMessage('');
      setPriority('normal');
      setSending(false);
    },
    onError: () => {
      toast({ title: "Failed to send announcement", variant: "destructive" });
      setSending(false);
    },
  });

  const isAdmin = ['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role);

  if (!isAdmin) return null;

  return (
    <>
      <Card className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border-l-4 border-l-[#1EB053]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Team Announcements</p>
                <p className="text-sm text-gray-500">Send updates to all employees</p>
              </div>
            </div>
            <Button onClick={() => setShowDialog(true)} className="sl-gradient">
              <Send className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#1EB053]" />
              Send Announcement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Company Update"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your announcement message..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-500">
              This announcement will be sent to {employees.length} employees.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => sendAnnouncementMutation.mutate()}
              disabled={!title || !message || sending}
              className="sl-gradient"
            >
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send to All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}