import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/Toast";
import { Mail, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BulkPayrollEmailDialog({ open, onOpenChange, payrolls, employees }) {
  const [customMessage, setCustomMessage] = useState("");
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [results, setResults] = useState([]);
  const toast = useToast();

  const sendBulkMutation = useMutation({
    mutationFn: async () => {
      const validPayrolls = payrolls.filter(p => {
        const emp = employees.find(e => e.id === p.employee_id);
        return emp && emp.email;
      });

      setSendingProgress({ current: 0, total: validPayrolls.length, status: 'sending' });
      setResults([]);
      
      const emailResults = [];

      for (let i = 0; i < validPayrolls.length; i++) {
        const payroll = validPayrolls[i];
        const employee = employees.find(e => e.id === payroll.employee_id);

        try {
          const response = await base44.functions.invoke('sendPayrollNotificationGmail', {
            payroll_id: payroll.id,
            employee_email: employee.email,
            employee_name: payroll.employee_name,
            custom_message: customMessage || undefined
          });

          emailResults.push({
            employee_name: payroll.employee_name,
            email: employee.email,
            success: true
          });
        } catch (error) {
          emailResults.push({
            employee_name: payroll.employee_name,
            email: employee.email,
            success: false,
            error: error.message
          });
        }

        setSendingProgress({ current: i + 1, total: validPayrolls.length, status: 'sending' });
      }

      setResults(emailResults);
      setSendingProgress(prev => ({ ...prev, status: 'complete' }));

      return emailResults;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        toast.success("All emails sent", `Successfully sent ${successCount} payroll notifications`);
      } else {
        toast.warning("Partially sent", `Sent ${successCount}, failed ${failCount}`);
      }
    },
    onError: (error) => {
      toast.error("Bulk send failed", error.message);
      setSendingProgress({ current: 0, total: 0, status: 'idle' });
    }
  });

  const validPayrollsCount = payrolls.filter(p => {
    const emp = employees.find(e => e.id === p.employee_id);
    return emp && emp.email;
  }).length;

  const handleClose = () => {
    if (sendingProgress.status !== 'sending') {
      onOpenChange(false);
      setTimeout(() => {
        setSendingProgress({ current: 0, total: 0, status: 'idle' });
        setResults([]);
        setCustomMessage("");
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="h-2 flex -mx-6 -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            Send Payroll Notifications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold">Recipients</p>
                <p className="text-2xl font-black text-blue-900">{validPayrollsCount}</p>
                <p className="text-xs text-blue-600 mt-1">employees with email addresses</p>
              </div>
              <Mail className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>

          {/* Custom Message */}
          {sendingProgress.status === 'idle' && (
            <div>
              <label className="text-sm font-bold text-gray-900 mb-2 block">
                Custom Message (Optional)
              </label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to include in the email..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                This message will be included in the email before the payroll details.
              </p>
            </div>
          )}

          {/* Sending Progress */}
          {sendingProgress.status === 'sending' && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#0072C6] animate-spin" />
                <p className="text-lg font-bold text-gray-900">
                  Sending notifications...
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {sendingProgress.current} of {sendingProgress.total}
                </p>
              </div>
              <Progress 
                value={(sendingProgress.current / sendingProgress.total) * 100} 
                className="h-3"
              />
            </div>
          )}

          {/* Results */}
          {sendingProgress.status === 'complete' && results.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <h4 className="font-bold text-gray-900">Results:</h4>
              <AnimatePresence>
                {results.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{result.employee_name}</p>
                        <p className="text-sm text-gray-600">{result.email}</p>
                        {!result.success && result.error && (
                          <p className="text-xs text-red-600 mt-1">{result.error}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={result.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                      {result.success ? 'Sent' : 'Failed'}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Warning for employees without email */}
          {validPayrollsCount < payrolls.length && sendingProgress.status === 'idle' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ {payrolls.length - validPayrollsCount} employee(s) don't have email addresses and will be skipped.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {sendingProgress.status === 'idle' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => sendBulkMutation.mutate()}
                disabled={validPayrollsCount === 0 || sendBulkMutation.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to {validPayrollsCount} Employee{validPayrollsCount !== 1 ? 's' : ''}
              </Button>
            </>
          )}
          {sendingProgress.status === 'complete' && (
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
            >
              Done
            </Button>
          )}
        </DialogFooter>

        <div className="h-2 flex -mx-6 -mb-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}