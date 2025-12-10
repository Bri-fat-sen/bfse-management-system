import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Mail, Loader2, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";

export default function EmailPayslipDialog({ open, onOpenChange, payroll, employee, organisation }) {
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(employee?.email || employee?.user_email || '');
  const [subject, setSubject] = useState(`Your Payslip - ${format(new Date(payroll?.period_start || new Date()), 'MMMM yyyy')}`);
  const [message, setMessage] = useState(
    `Dear ${employee?.full_name},\n\nPlease find attached your payslip for ${format(new Date(payroll?.period_start || new Date()), 'MMMM yyyy')}.\n\nIf you have any questions, please contact the HR department.\n\nBest regards,\n${organisation?.name || 'HR Department'}`
  );

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error("Email required", "Please enter recipient email");
      return;
    }

    setSending(true);
    try {
      await base44.functions.invoke('sendPayslipEmail', {
        payroll,
        employee,
        organisation,
        recipientEmail,
        subject,
        message
      });

      toast.success("Payslip sent", `Email sent to ${recipientEmail}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Email error:", error);
      toast.error("Failed to send", error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        {/* Header with gradient */}
        <div className="px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #1EB053 0%, #0072C6 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Email Payslip</h2>
              <p className="text-white/80 text-sm">Send payslip to employee</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          <div className="space-y-4">
            {/* Payslip Info */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">{employee?.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(payroll?.period_start || new Date()), 'dd MMM')} - {format(new Date(payroll?.period_end || new Date()), 'dd MMM yyyy')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Net Pay: <span className="font-bold text-[#1EB053]">Le {payroll?.net_pay?.toLocaleString() || '0'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Email Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Recipient Email</label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="employee@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                📎 The payslip PDF will be automatically attached to this email
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            className="flex-1 text-white" 
            style={{ background: 'linear-gradient(135deg, #1EB053 0%, #0072C6 100%)' }}
            disabled={sending}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}