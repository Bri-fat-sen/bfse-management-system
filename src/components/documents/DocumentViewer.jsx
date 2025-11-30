import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  FileText, Download, Mail, CheckCircle2, XCircle, Clock, 
  Loader2, Printer, Send, FileSignature, AlertTriangle
} from "lucide-react";
import { getDocumentTypeLabel } from "./DocumentTemplates";
import ReactMarkdown from "react-markdown";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: FileText },
  pending_signature: { label: "Pending Signature", color: "bg-amber-100 text-amber-700", icon: Clock },
  signed: { label: "Signed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500", icon: Clock },
  superseded: { label: "Superseded", color: "bg-blue-100 text-blue-700", icon: FileText }
};

export default function DocumentViewer({
  document,
  onClose,
  orgId,
  organisation,
  currentEmployee,
  isAdmin
}) {
  const queryClient = useQueryClient();
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const canSign = document?.employee_id === currentEmployee?.id && 
                  document?.status === 'pending_signature' &&
                  document?.requires_signature;

  const signDocumentMutation = useMutation({
    mutationFn: async () => {
      const signedDoc = await base44.entities.EmployeeDocument.update(document.id, {
        status: 'signed',
        signed_at: new Date().toISOString(),
        signed_by_name: signatureName,
        signature_hash: btoa(`${signatureName}-${new Date().toISOString()}-${document.id}`)
      });

      // Send signed copy email
      await base44.integrations.Core.SendEmail({
        to: document.employee_email,
        subject: `Signed Document: ${document.title}`,
        body: generateSignedEmailBody()
      });

      // Update email_sent
      await base44.entities.EmployeeDocument.update(document.id, {
        email_sent: true,
        email_sent_at: new Date().toISOString()
      });

      return signedDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Document signed successfully! A copy has been emailed to you.");
      setShowSignDialog(false);
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to sign document", { description: error.message });
    }
  });

  const rejectDocumentMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.EmployeeDocument.update(document.id, {
        status: 'rejected',
        rejection_reason: rejectionReason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Document rejected");
      setShowRejectDialog(false);
      onClose();
    }
  });

  const resendEmailMutation = useMutation({
    mutationFn: async () => {
      await base44.integrations.Core.SendEmail({
        to: document.employee_email,
        subject: `Reminder: Document Pending Your Signature - ${document.title}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🇸🇱 ${organisation?.name}</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <h2>Reminder: Document Pending Signature</h2>
              <p>Dear ${document.employee_name},</p>
              <p>This is a reminder that the following document requires your signature:</p>
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0;"><strong>Document:</strong> ${document.title}</p>
                <p style="margin: 5px 0 0;"><strong>Type:</strong> ${getDocumentTypeLabel(document.document_type)}</p>
              </div>
              <p>Please log in to the employee portal to review and sign this document at your earliest convenience.</p>
              <p>Best regards,<br/>${organisation?.name} HR Department</p>
            </div>
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>Republic of Sierra Leone | ${organisation?.name}</p>
            </div>
          </div>
        `
      });
    },
    onSuccess: () => {
      toast.success("Reminder email sent");
    }
  });

  const generateSignedEmailBody = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🇸🇱 ${organisation?.name}</h1>
          <p style="color: white; margin: 5px 0 0;">Republic of Sierra Leone</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #155724; font-weight: bold;">✓ Document Successfully Signed</p>
          </div>
          
          <h2 style="color: #0F1F3C;">${document?.title}</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Document Type:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${getDocumentTypeLabel(document?.document_type)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Signed By:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${signatureName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Signed On:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Issued By:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${document?.issued_by_name}</td>
            </tr>
          </table>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Document Content</h3>
            <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
              ${document?.content?.replace(/\n/g, '<br/>').replace(/#{1,3}\s/g, '')}
            </div>
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #0056b3;">
              <strong>Digital Signature Verification</strong><br/>
              This document was electronically signed and is legally binding under the laws of Sierra Leone.
              Signature verification code: ${btoa(`${signatureName}-${document?.id}`).slice(0, 20)}
            </p>
          </div>
        </div>
        
        <div style="background: linear-gradient(to right, #1EB053, #FFFFFF, #0072C6); height: 4px;"></div>
        
        <div style="background: #0F1F3C; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">${organisation?.name}</p>
          <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8;">${organisation?.address || ''}</p>
          <p style="margin: 10px 0 0; font-size: 11px; opacity: 0.6;">
            🇸🇱 Republic of Sierra Leone | Employment Act, 2023 Compliant
          </p>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${document?.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .flag-stripe { height: 8px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); margin-bottom: 20px; }
          .content { line-height: 1.8; }
          h1 { color: #0F1F3C; }
          h2 { color: #1EB053; border-bottom: 2px solid #1EB053; padding-bottom: 5px; }
          .signature-box { border: 1px solid #ddd; padding: 20px; margin-top: 40px; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="flag-stripe"></div>
        <div class="header">
          <h1>${organisation?.name}</h1>
          <p>Republic of Sierra Leone</p>
        </div>
        <div class="content">
          ${document?.content?.replace(/\n/g, '<br/>').replace(/#{3}\s(.+)/g, '<h3>$1</h3>').replace(/#{2}\s(.+)/g, '<h2>$1</h2>').replace(/#{1}\s(.+)/g, '<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
        </div>
        ${document?.status === 'signed' ? `
          <div class="signature-box">
            <p><strong>Digitally Signed By:</strong> ${document.signed_by_name}</p>
            <p><strong>Date:</strong> ${format(new Date(document.signed_at), 'MMMM d, yyyy \'at\' h:mm a')}</p>
          </div>
        ` : ''}
        <div class="footer">
          <div class="flag-stripe"></div>
          <p>🇸🇱 ${organisation?.name} | Republic of Sierra Leone</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!document) return null;

  const statusConfig = STATUS_CONFIG[document.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Sheet open={!!document} onOpenChange={() => onClose()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1EB053]" />
              {document.title}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Document Info */}
            <div className="flex flex-wrap gap-2">
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline">{getDocumentTypeLabel(document.document_type)}</Badge>
              {document.version && <Badge variant="secondary">v{document.version}</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Employee</p>
                <p className="font-medium">{document.employee_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Issued By</p>
                <p className="font-medium">{document.issued_by_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Issued Date</p>
                <p className="font-medium">
                  {document.issued_at ? format(new Date(document.issued_at), 'MMM d, yyyy') : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Effective Date</p>
                <p className="font-medium">
                  {document.effective_date ? format(new Date(document.effective_date), 'MMM d, yyyy') : '-'}
                </p>
              </div>
              {document.signed_at && (
                <>
                  <div>
                    <p className="text-gray-500">Signed By</p>
                    <p className="font-medium">{document.signed_by_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Signed Date</p>
                    <p className="font-medium">{format(new Date(document.signed_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </>
              )}
            </div>

            {/* Document Content */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{document.content}</ReactMarkdown>
                </div>
              </ScrollArea>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              
              {isAdmin && document.status === 'pending_signature' && (
                <Button 
                  variant="outline" 
                  onClick={() => resendEmailMutation.mutate()}
                  disabled={resendEmailMutation.isPending}
                >
                  {resendEmailMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send Reminder
                </Button>
              )}

              {canSign && (
                <>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => setShowSignDialog(true)}
                    className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                  >
                    <FileSignature className="w-4 h-4 mr-2" />
                    Sign Document
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-[#1EB053]" />
              Sign Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Legal Agreement</p>
                  <p className="text-amber-700">
                    By signing this document, you acknowledge that you have read, understood, 
                    and agree to be bound by its terms and conditions.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label>Type your full legal name to sign</Label>
              <Input
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 text-lg"
              />
              {signatureName && (
                <div className="mt-2 p-4 border-2 border-dashed rounded-lg bg-gray-50">
                  <p className="text-2xl font-serif italic text-center text-gray-700">
                    {signatureName}
                  </p>
                  <p className="text-xs text-center text-gray-400 mt-1">Digital Signature Preview</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox 
                id="agree" 
                checked={agreeToTerms} 
                onCheckedChange={setAgreeToTerms}
              />
              <label htmlFor="agree" className="text-sm cursor-pointer">
                I confirm that I have read and understood this document and agree to its terms. 
                I understand this signature is legally binding.
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => signDocumentMutation.mutate()}
              disabled={!signatureName || !agreeToTerms || signDocumentMutation.isPending}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {signDocumentMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Sign & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Reject Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this document. 
              The issuer will be notified of your rejection.
            </p>

            <div>
              <Label>Reason for Rejection</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter your reason..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectDocumentMutation.mutate()}
              disabled={!rejectionReason || rejectDocumentMutation.isPending}
            >
              {rejectDocumentMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}