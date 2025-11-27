import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Send, 
  Loader2, 
  Paperclip, 
  X, 
  Plus,
  FileText,
  Building2,
  User
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// Common government officials and contacts for Sierra Leone
const QUICK_CONTACTS = [
  { name: "NRA (National Revenue Authority)", email: "info@nra.gov.sl", category: "Tax" },
  { name: "OARG", email: "registrar@oarg.gov.sl", category: "Registration" },
  { name: "NASSIT", email: "info@nassit.org.sl", category: "Social Security" },
  { name: "EPA Sierra Leone", email: "info@epa.gov.sl", category: "Environment" },
  { name: "Ministry of Trade", email: "info@trade.gov.sl", category: "Trade" },
];

export default function SendEmailDialog({ 
  open, 
  onOpenChange, 
  defaultSubject = "",
  defaultContent = "",
  attachmentData = null, // { filename, content (base64), type }
  organisation,
  prefilledRecipient = null
}) {
  const [recipients, setRecipients] = useState(prefilledRecipient ? [prefilledRecipient] : []);
  const [newRecipient, setNewRecipient] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultContent);
  const [isSending, setIsSending] = useState(false);
  const [showQuickContacts, setShowQuickContacts] = useState(false);

  const handleAddRecipient = () => {
    if (newRecipient && newRecipient.includes("@")) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleAddQuickContact = (contact) => {
    if (!recipients.includes(contact.email)) {
      setRecipients([...recipients, contact.email]);
    }
    setShowQuickContacts(false);
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    setIsSending(true);
    try {
      // Build HTML content with organisation branding
      const primaryColor = organisation?.primary_color || '#1EB053';
      const secondaryColor = organisation?.secondary_color || '#0072C6';
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); padding: 20px; text-align: center;">
            ${organisation?.logo_url 
              ? `<img src="${organisation.logo_url}" alt="${organisation.name}" style="max-height: 60px; margin-bottom: 10px;" />`
              : ''
            }
            <h2 style="color: white; margin: 0;">${organisation?.name || 'Our Company'}</h2>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${message.split('\n').map(p => `<p style="margin: 0 0 15px; line-height: 1.6; color: #333;">${p}</p>`).join('')}
            </div>
          </div>
          <div style="background: #0F1F3C; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">
              ${organisation?.address ? `${organisation.address}, ` : ''}${organisation?.city || ''}, ${organisation?.country || 'Sierra Leone'}
            </p>
            ${organisation?.phone ? `<p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 12px;">Tel: ${organisation.phone}</p>` : ''}
            ${organisation?.email ? `<p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 12px;">${organisation.email}</p>` : ''}
          </div>
        </div>
      `;

      const payload = {
        to: recipients,
        subject: subject,
        htmlContent: htmlContent,
        textContent: message,
        fromName: organisation?.name || 'BFSE Management System',
        replyTo: organisation?.email
      };

      // Add attachment if provided
      if (attachmentData) {
        payload.attachments = [{
          filename: attachmentData.filename,
          content: attachmentData.content,
          disposition: 'attachment'
        }];
      }

      const response = await base44.functions.invoke('sendEmailMailersend', payload);
      
      if (response.data?.success) {
        toast.success("Email sent successfully!", {
          description: `Sent to ${recipients.length} recipient(s)`
        });
        onOpenChange(false);
        // Reset form
        setRecipients([]);
        setSubject("");
        setMessage("");
      } else {
        throw new Error(response.data?.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.error("Failed to send email", {
        description: error.message
      });
    } finally {
      setIsSending(false);
    }
  };

  // Reset form when dialog opens with new defaults
  React.useEffect(() => {
    if (open) {
      setSubject(defaultSubject);
      setMessage(defaultContent);
      if (prefilledRecipient) {
        setRecipients([prefilledRecipient]);
      }
    }
  }, [open, defaultSubject, defaultContent, prefilledRecipient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#1EB053]" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send documents, reports, or forms via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Recipients */}
          <div>
            <Label className="flex items-center justify-between">
              <span>Recipients *</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-[#0072C6]"
                onClick={() => setShowQuickContacts(!showQuickContacts)}
              >
                <Building2 className="w-3 h-3 mr-1" />
                Quick Contacts
              </Button>
            </Label>
            
            {/* Quick contacts dropdown */}
            {showQuickContacts && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border space-y-2">
                <p className="text-xs text-gray-500 font-medium">Government & Official Contacts</p>
                {QUICK_CONTACTS.map((contact, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white rounded border hover:border-[#1EB053] cursor-pointer transition-colors"
                    onClick={() => handleAddQuickContact(contact)}
                  >
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{contact.category}</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Added recipients */}
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recipients.map((email, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1 pr-1">
                    <User className="w-3 h-3" />
                    {email}
                    <button 
                      onClick={() => handleRemoveRecipient(idx)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add new recipient */}
            <div className="flex gap-2 mt-2">
              <Input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="Enter email address"
                onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleAddRecipient}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label>Subject *</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="mt-1"
            />
          </div>

          {/* Message */}
          <div>
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              rows={5}
              className="mt-1"
            />
          </div>

          {/* Attachment indicator */}
          {attachmentData && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{attachmentData.filename}</p>
                <p className="text-xs text-blue-600">Attached document</p>
              </div>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || recipients.length === 0}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}