import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, X, Plus, Loader2 } from "lucide-react";

export default function SendReportEmailDialog({ 
  open, 
  onOpenChange, 
  report,
  onSend,
  defaultRecipients = []
}) {
  const [recipients, setRecipients] = useState(defaultRecipients);
  const [newRecipient, setNewRecipient] = useState("");
  const [subject, setSubject] = useState(`Report: ${report?.name || ""}`);
  const [message, setMessage] = useState("");
  const [includeCSV, setIncludeCSV] = useState(true);
  const [includePDF, setIncludePDF] = useState(false);
  const [sending, setSending] = useState(false);

  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient("");
    }
  };

  const removeRecipient = (email) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSend = async () => {
    if (recipients.length === 0) return;
    
    setSending(true);
    try {
      await onSend({
        recipients,
        subject,
        message,
        includeCSV,
        includePDF
      });
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#1EB053]" />
            Send Report via Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())}
              />
              <Button type="button" onClick={addRecipient} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {recipients.map(email => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  <button onClick={() => removeRecipient(email)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {recipients.length === 0 && (
                <p className="text-sm text-gray-400">Add at least one recipient</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the email..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Attachments</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="csv" 
                checked={includeCSV} 
                onCheckedChange={setIncludeCSV}
              />
              <label htmlFor="csv" className="text-sm">Include CSV file</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="pdf" 
                checked={includePDF} 
                onCheckedChange={setIncludePDF}
              />
              <label htmlFor="pdf" className="text-sm">Include PDF summary</label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={recipients.length === 0 || sending}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}