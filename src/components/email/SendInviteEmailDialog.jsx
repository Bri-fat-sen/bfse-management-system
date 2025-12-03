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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail, 
  Send, 
  Loader2,
  UserPlus,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { generateInviteEmailHTML, generateInviteEmailText } from "./InviteEmailTemplate";

const ROLES = [
  { value: 'super_admin', label: 'Super Administrator' },
  { value: 'org_admin', label: 'Organisation Administrator' },
  { value: 'hr_admin', label: 'HR Administrator' },
  { value: 'payroll_admin', label: 'Payroll Administrator' },
  { value: 'warehouse_manager', label: 'Warehouse Manager' },
  { value: 'retail_cashier', label: 'Retail Cashier' },
  { value: 'vehicle_sales', label: 'Vehicle Sales' },
  { value: 'driver', label: 'Driver' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'support_staff', label: 'Support Staff' },
  { value: 'read_only', label: 'Read Only Access' }
];

// Custom domain for the app
const APP_DOMAIN = "https://www.brifatsensystems.com";

export default function SendInviteEmailDialog({ 
  open, 
  onOpenChange, 
  organisation,
  inviterName,
  loginUrl = APP_DOMAIN
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [selectedRole, setSelectedRole] = useState("support_staff");
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async () => {
    if (!recipientEmail || !recipientEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!recipientName.trim()) {
      toast.error("Please enter the recipient's name");
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = generateInviteEmailHTML({
        recipientName,
        organisationName: organisation?.name || 'Our Organisation',
        organisationLogo: organisation?.logo_url,
        role: selectedRole,
        inviterName,
        loginUrl
      });

      const textContent = generateInviteEmailText({
        recipientName,
        organisationName: organisation?.name || 'Our Organisation',
        role: selectedRole,
        inviterName,
        loginUrl
      });

      const payload = {
        to: recipientEmail,
        toName: recipientName,
        subject: `You're Invited to Join ${organisation?.name || 'Our Team'}!`,
        htmlContent,
        textContent,
        fromName: organisation?.name || 'Business Management System',
        replyTo: organisation?.email
      };

      const response = await base44.functions.invoke('sendEmailMailersend', payload);
      
      if (response.data?.success) {
        toast.success("Invitation sent successfully!", {
          description: `Sent to ${recipientName} (${recipientEmail})`
        });
        onOpenChange(false);
        // Reset form
        setRecipientEmail("");
        setRecipientName("");
        setSelectedRole("support_staff");
      } else {
        throw new Error(response.data?.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.error("Failed to send invitation", {
        description: error.message
      });
    } finally {
      setIsSending(false);
    }
  };

  const previewHtml = generateInviteEmailHTML({
    recipientName: recipientName || 'Team Member',
    organisationName: organisation?.name || 'Our Organisation',
    organisationLogo: organisation?.logo_url,
    role: selectedRole,
    inviterName,
    loginUrl
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#1EB053]" />
            Send Team Invitation
          </DialogTitle>
          <DialogDescription>
            Invite a new team member to join {organisation?.name || 'your organisation'}
          </DialogDescription>
        </DialogHeader>

        {showPreview ? (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Email Preview</h3>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                Back to Form
              </Button>
            </div>
            <div 
              className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Recipient Name */}
            <div>
              <Label>Recipient Name *</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter full name"
                className="mt-1"
              />
            </div>

            {/* Recipient Email */}
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>

            {/* Role Selection */}
            <div>
              <Label>Assign Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                This role will be mentioned in the invitation email
              </p>
            </div>

            {/* Organisation Info */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                {organisation?.logo_url ? (
                  <img 
                    src={organisation.logo_url} 
                    alt={organisation.name} 
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {organisation?.name?.charAt(0) || 'O'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{organisation?.name || 'Organisation'}</p>
                  <p className="text-sm text-gray-500">Invitation will be sent from this organisation</p>
                </div>
              </div>
            </div>

            {/* Preview Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Email
            </Button>
          </div>
        )}

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || !recipientEmail || !recipientName}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] w-full sm:w-auto"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}