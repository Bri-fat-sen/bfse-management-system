import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { DOCUMENT_TYPES, DEFAULT_TEMPLATES, getDocumentTypeLabel } from "./DocumentTemplates";

export default function BulkDocumentDialog({
  open,
  onOpenChange,
  orgId,
  organisation,
  employees = [],
  currentEmployee
}) {
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const activeEmployees = employees.filter(e => e.status === 'active');

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === activeEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(activeEmployees.map(e => e.id));
    }
  };

  const processDocuments = async () => {
    if (!documentType || selectedEmployees.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setResults([]);
    const processedResults = [];

    const template = DEFAULT_TEMPLATES[documentType];
    if (!template) {
      toast.error("Template not found for this document type");
      setProcessing(false);
      return;
    }

    for (let i = 0; i < selectedEmployees.length; i++) {
      const empId = selectedEmployees[i];
      const employee = employees.find(e => e.id === empId);

      if (!employee) continue;

      try {
        // Generate placeholders for this employee
        const placeholders = {
          employee_name: employee.full_name,
          employee_position: employee.position || employee.role?.replace('_', ' '),
          employee_address: employee.address || '',
          employee_email: employee.email || employee.user_email,
          position: employee.position || employee.role?.replace('_', ' '),
          department: employee.department || '',
          start_date: employee.hire_date || effectiveDate,
          monthly_salary: employee.base_salary?.toString() || '',
          company_name: organisation?.name,
          company_address: organisation?.address || '',
          company_registration: organisation?.business_registration_number || '',
          company_nassit: organisation?.nassit_number || '',
          effective_date: effectiveDate,
          issue_date: format(new Date(), 'yyyy-MM-dd'),
          issuer_name: currentEmployee?.full_name,
          issuer_position: currentEmployee?.position || currentEmployee?.role?.replace('_', ' '),
          version: '1.0',
          annual_leave_days: '21',
          sick_leave_days: '5',
          carry_forward_days: '5',
          probation_months: '6',
          work_start_time: '08:00',
          work_end_time: '17:00',
          work_location: organisation?.address || '',
          contract_type: 'Permanent',
          payment_day: '25th',
          payment_method: 'Bank Transfer',
          confidentiality_years: '2'
        };

        // Process content
        let content = template.content;
        Object.entries(placeholders).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          content = content.replace(regex, value || `[${key}]`);
        });

        const doc = await base44.entities.EmployeeDocument.create({
          organisation_id: orgId,
          employee_id: empId,
          employee_name: employee.full_name,
          employee_email: employee.email || employee.user_email,
          document_type: documentType,
          title: `${template.name} - ${employee.full_name}`,
          content,
          version: "1.0",
          status: 'pending_signature',
          requires_signature: DOCUMENT_TYPES.find(d => d.value === documentType)?.requiresSignature ?? true,
          issued_by_id: currentEmployee?.id,
          issued_by_name: currentEmployee?.full_name,
          issued_at: new Date().toISOString(),
          effective_date: effectiveDate,
          metadata: placeholders
        });

        // Send notification email
        await base44.integrations.Core.SendEmail({
          to: employee.email || employee.user_email,
          subject: `Document Pending Your Signature: ${template.name}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🇸🇱 ${organisation?.name}</h1>
              </div>
              <div style="padding: 30px; background: white;">
                <h2>Document Pending Signature</h2>
                <p>Dear ${employee.full_name},</p>
                <p>A new document requires your signature:</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Document:</strong> ${template.name}</p>
                  <p style="margin: 5px 0 0;"><strong>Type:</strong> ${getDocumentTypeLabel(documentType)}</p>
                </div>
                <p>Please log in to the employee portal to review and sign this document.</p>
                <p>Best regards,<br/>${currentEmployee?.full_name}<br/>${organisation?.name}</p>
              </div>
              <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>Republic of Sierra Leone | ${organisation?.name}</p>
              </div>
            </div>
          `
        });

        processedResults.push({ employee: employee.full_name, status: 'success' });
      } catch (error) {
        processedResults.push({ employee: employee.full_name, status: 'error', error: error.message });
      }

      setProgress(((i + 1) / selectedEmployees.length) * 100);
    }

    setResults(processedResults);
    setShowResults(true);
    setProcessing(false);
    queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });

    const successCount = processedResults.filter(r => r.status === 'success').length;
    toast.success(`Created ${successCount} documents successfully`);
  };

  const resetForm = () => {
    setDocumentType("");
    setSelectedEmployees([]);
    setProgress(0);
    setResults([]);
    setShowResults(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1EB053]" />
            Bulk Document Creation
          </DialogTitle>
        </DialogHeader>

        {showResults ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Results</h3>
              <Badge variant={results.every(r => r.status === 'success') ? 'default' : 'destructive'}>
                {results.filter(r => r.status === 'success').length}/{results.length} Successful
              </Badge>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {results.map((result, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                    result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.employee}</span>
                    </div>
                    {result.status === 'error' && (
                      <span className="text-red-600 text-sm">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => { resetForm(); onOpenChange(false); }}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.filter(t => DEFAULT_TEMPLATES[t.value]).map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Select Employees ({selectedEmployees.length} selected)</Label>
                <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                  {selectedEmployees.length === activeEmployees.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-lg p-2">
                <div className="space-y-2">
                  {activeEmployees.map(emp => (
                    <div 
                      key={emp.id} 
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedEmployees.includes(emp.id) ? 'bg-[#1EB053]/10' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedEmployees.includes(emp.id)}
                          onCheckedChange={() => toggleEmployee(emp.id)}
                        />
                        <div>
                          <p className="font-medium text-sm">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">{emp.role?.replace('_', ' ')} • {emp.department}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Creating documents...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={processDocuments}
                disabled={!documentType || selectedEmployees.length === 0 || processing}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send to {selectedEmployees.length} Employees
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}