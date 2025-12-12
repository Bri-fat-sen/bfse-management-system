import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  FileText, Check, X, Loader2, AlertTriangle, 
  Pen, Download, Mail
} from "lucide-react";
import { format } from "date-fns";
import { SL_DOCUMENT_STYLES } from "./DocumentTemplates";

export default function DocumentSignatureDialog({
  open,
  onOpenChange,
  document,
  employee,
  organisation,
  onSigned
}) {
  const queryClient = useQueryClient();
  const [signatureName, setSignatureName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (open) {
      setSignatureName(employee?.full_name || "");
      setAgreed(false);
      setRejecting(false);
      setRejectionReason("");
    }
  }, [open, employee]);

  const signDocumentMutation = useMutation({
    mutationFn: async () => {
      const signedAt = new Date().toISOString();
      
      // Update document with signature
      const signedContent = document.content
        .replace(/{{signature_date}}/g, format(new Date(), 'MMMM d, yyyy'))
        .replace(/{{digital_signature}}/g, signatureName)
        .replace(/\[Pending Signature\]/g, signatureName);

      await base44.entities.EmployeeDocument.update(document.id, {
        status: 'signed',
        signed_at: signedAt,
        signature_name: signatureName,
        content: signedContent
      });

      // Send emails with PDF to employee and all admins via backend function
      try {
        await base44.functions.invoke('sendSignedDocumentEmail', {
          documentTitle: document.title,
          documentContent: signedContent,
          employeeName: employee?.full_name || document.employee_name,
          employeeEmail: document.employee_email || employee?.email || employee?.user_email,
          organisationName: organisation?.name,
          organisationId: document.organisation_id,
          signedAt: signedAt
        });
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        // Don't fail the whole operation if email fails
      }

      // Create notification for issuer
      await base44.entities.Notification.create({
        organisation_id: document.organisation_id,
        employee_id: document.issued_by_id,
        type: 'document',
        title: 'Document Signed',
        message: `${employee?.full_name || document.employee_name} has signed "${document.title}"`,
        priority: 'normal',
        is_read: false
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Document signed! Copies emailed to you and admins.");
      onSigned?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to sign document", { description: error.message });
    }
  });

  const rejectDocumentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.EmployeeDocument.update(document.id, {
        status: 'rejected',
        rejection_reason: rejectionReason
      });

      // Notify issuer
      await base44.entities.Notification.create({
        organisation_id: document.organisation_id,
        employee_id: document.issued_by_id,
        type: 'document',
        title: 'Document Rejected',
        message: `${employee?.full_name} has rejected "${document.title}". Reason: ${rejectionReason}`,
        priority: 'high',
        is_read: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Document rejected");
      onOpenChange(false);
    }
  });

  const handleSign = () => {
    if (!signatureName.trim()) {
      toast.error("Please enter your full name as signature");
      return;
    }
    if (!agreed) {
      toast.error("Please confirm you have read and agree to the document");
      return;
    }
    signDocumentMutation.mutate();
  };

  const generateEmailHtml = (content, org) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .email-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #0F1F3C 0%, #1a2f4c 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .flag-bar {
      height: 6px;
      background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-header p {
      margin: 10px 0 0 0;
      opacity: 0.8;
    }
    .email-body {
      padding: 30px;
    }
    .document-content {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: #fafafa;
    }
    .email-footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    ${SL_DOCUMENT_STYLES}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="flag-bar"></div>
    <div class="email-header">
      <h1>📄 Signed Document</h1>
      <p>${org?.name || 'Your Employer'}</p>
    </div>
    <div class="email-body">
      <p>Dear ${document?.employee_name},</p>
      <p>Please find below your signed copy of <strong>${document?.title}</strong>.</p>
      <p>This document was digitally signed on <strong>${format(new Date(), 'MMMM d, yyyy')}</strong>.</p>
      
      <div class="document-content">
        ${content}
      </div>
      
      <p style="margin-top: 20px;">
        Please keep this email for your records. If you have any questions, please contact HR.
      </p>
    </div>
    <div class="flag-bar"></div>
    <div class="email-footer">
      <p>🇸🇱 Republic of Sierra Leone</p>
      <p>${org?.name} • ${org?.address || ''}</p>
      <p>This is an automated email from the HR Management System</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  // Prepare display content
  const displayContent = document?.content
    ?.replace(/{{signature_date}}/g, format(new Date(), 'MMMM d, yyyy'))
    ?.replace(/{{digital_signature}}/g, signatureName || '[Your Signature]')
    ?.replace(/\[Pending Signature\]/g, signatureName || '[Your Signature]');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            {document?.title}
          </DialogTitle>
        </DialogHeader>

        {!rejecting ? (
          <>
            <ScrollArea className="flex-1">
              <div className="border rounded-lg overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: SL_DOCUMENT_STYLES }} />
                <div 
                  className="bg-white p-6"
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div>
                <Label>Your Digital Signature (Full Legal Name)</Label>
                <div className="flex gap-2 mt-2">
                  <Pen className="w-5 h-5 text-gray-400" />
                  <Input
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Type your full name exactly as it appears above"
                    className="flex-1 text-lg font-serif"
                  />
                </div>
                {signatureName && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border-2 border-[#1EB053] rounded-lg text-center">
                    <p className="text-sm text-gray-500 mb-1">Digital Signature Preview</p>
                    <p className="text-2xl font-serif text-[#0F1F3C]" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                      {signatureName}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Signed on {format(new Date(), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={setAgreed}
                />
                <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that I have read and understood this document. By typing my name above, 
                  I agree to be legally bound by the terms and conditions contained herein.
                </Label>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setRejecting(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleSign}
                disabled={!signatureName || !agreed || signDocumentMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {signDocumentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Sign Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Reject Document</p>
                  <p className="text-sm text-red-700 mt-1">
                    Please provide a reason for rejecting this document. The issuer will be notified.
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Reason for Rejection</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why you are rejecting this document..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => rejectDocumentMutation.mutate()}
                disabled={!rejectionReason || rejectDocumentMutation.isPending}
                variant="destructive"
              >
                {rejectDocumentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}