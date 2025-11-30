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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Send, Save, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { DOCUMENT_TYPES, DEFAULT_TEMPLATES, getDocumentTypeLabel } from "./DocumentTemplates";

export default function CreateDocumentDialog({
  open,
  onOpenChange,
  orgId,
  organisation,
  employees = [],
  currentEmployee
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [requiresSignature, setRequiresSignature] = useState(true);
  const [effectiveDate, setEffectiveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sendImmediately, setSendImmediately] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ['documentTemplates', orgId],
    queryFn: () => base44.entities.DocumentTemplate.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const employee = employees.find(e => e.id === selectedEmployee);

  // Auto-fill placeholders when employee is selected
  useEffect(() => {
    if (employee && organisation) {
      setPlaceholderValues(prev => ({
        ...prev,
        employee_name: employee.full_name,
        employee_position: employee.position || employee.role?.replace('_', ' '),
        employee_address: employee.address || '',
        employee_email: employee.email || employee.user_email,
        position: employee.position || employee.role?.replace('_', ' '),
        department: employee.department || '',
        start_date: employee.hire_date || format(new Date(), 'yyyy-MM-dd'),
        monthly_salary: employee.base_salary?.toString() || '',
        company_name: organisation.name,
        company_address: organisation.address || '',
        company_registration: organisation.business_registration_number || '',
        company_nassit: organisation.nassit_number || '',
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
        work_location: organisation.address || '',
        contract_type: 'Permanent',
        payment_day: '25th',
        payment_method: 'Bank Transfer',
        confidentiality_years: '2'
      }));
    }
  }, [employee, organisation, currentEmployee, effectiveDate]);

  // When document type changes, load default template
  useEffect(() => {
    if (documentType) {
      const customTemplate = templates.find(t => t.document_type === documentType && t.is_default);
      const defaultTemplate = DEFAULT_TEMPLATES[documentType];
      
      if (customTemplate) {
        setSelectedTemplate(customTemplate);
        setContent(customTemplate.content);
        setTitle(customTemplate.name);
        setRequiresSignature(customTemplate.requires_signature ?? true);
      } else if (defaultTemplate) {
        setContent(defaultTemplate.content);
        setTitle(defaultTemplate.name);
        setRequiresSignature(DOCUMENT_TYPES.find(d => d.value === documentType)?.requiresSignature ?? true);
      }
    }
  }, [documentType, templates]);

  const processContent = () => {
    let processed = content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || `[${key}]`);
    });
    return processed;
  };

  const createDocumentMutation = useMutation({
    mutationFn: async (data) => {
      const doc = await base44.entities.EmployeeDocument.create(data);
      
      if (sendImmediately && data.status === 'pending_signature') {
        // Send email notification
        await base44.integrations.Core.SendEmail({
          to: employee.email || employee.user_email,
          subject: `Document Pending Your Signature: ${data.title}`,
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
                  <p style="margin: 0;"><strong>Document:</strong> ${data.title}</p>
                  <p style="margin: 5px 0 0;"><strong>Type:</strong> ${getDocumentTypeLabel(data.document_type)}</p>
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
      }
      
      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Document created successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create document", { description: error.message });
    }
  });

  const resetForm = () => {
    setStep(1);
    setDocumentType("");
    setSelectedEmployee("");
    setSelectedTemplate(null);
    setTitle("");
    setContent("");
    setPlaceholderValues({});
    setRequiresSignature(true);
    setSendImmediately(false);
  };

  const handleSubmit = (asDraft = false) => {
    const processedContent = processContent();
    
    createDocumentMutation.mutate({
      organisation_id: orgId,
      employee_id: selectedEmployee,
      employee_name: employee?.full_name,
      employee_email: employee?.email || employee?.user_email,
      document_type: documentType,
      title,
      content: processedContent,
      template_id: selectedTemplate?.id,
      version: placeholderValues.version || "1.0",
      status: asDraft ? 'draft' : 'pending_signature',
      requires_signature: requiresSignature,
      issued_by_id: currentEmployee?.id,
      issued_by_name: currentEmployee?.full_name,
      issued_at: new Date().toISOString(),
      effective_date: effectiveDate,
      metadata: placeholderValues
    });
  };

  const placeholders = selectedTemplate?.placeholders || 
    DEFAULT_TEMPLATES[documentType]?.placeholders || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            Create Document - Step {step} of 3
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <span>{emp.full_name}</span>
                          <Badge variant="outline" className="text-xs">{emp.role?.replace('_', ' ')}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Document Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="mt-1"
                />
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

              <div className="flex items-center justify-between">
                <div>
                  <Label>Requires Employee Signature</Label>
                  <p className="text-xs text-gray-500">Employee must sign to accept</p>
                </div>
                <Switch checked={requiresSignature} onCheckedChange={setRequiresSignature} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Fill in Document Details</h4>
                <p className="text-sm text-gray-600">
                  Complete the fields below. These will be automatically inserted into the document.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {placeholders.map(placeholder => (
                  <div key={placeholder.key}>
                    <Label>
                      {placeholder.label}
                      {placeholder.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {placeholder.type === 'date' ? (
                      <Input
                        type="date"
                        value={placeholderValues[placeholder.key] || ''}
                        onChange={(e) => setPlaceholderValues(prev => ({
                          ...prev,
                          [placeholder.key]: e.target.value
                        }))}
                        className="mt-1"
                      />
                    ) : placeholder.type === 'currency' || placeholder.type === 'number' ? (
                      <Input
                        type="number"
                        value={placeholderValues[placeholder.key] || ''}
                        onChange={(e) => setPlaceholderValues(prev => ({
                          ...prev,
                          [placeholder.key]: e.target.value
                        }))}
                        className="mt-1"
                      />
                    ) : placeholder.key === 'job_duties' || placeholder.key === 'allowances_list' ? (
                      <Textarea
                        value={placeholderValues[placeholder.key] || ''}
                        onChange={(e) => setPlaceholderValues(prev => ({
                          ...prev,
                          [placeholder.key]: e.target.value
                        }))}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <Input
                        value={placeholderValues[placeholder.key] || ''}
                        onChange={(e) => setPlaceholderValues(prev => ({
                          ...prev,
                          [placeholder.key]: e.target.value
                        }))}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Preview Document</h4>
                <p className="text-sm text-gray-600">
                  Review the document before sending for signature.
                </p>
              </div>

              <div className="border rounded-lg p-6 bg-white prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: processContent()
                    .replace(/\n/g, '<br/>')
                    .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
                    .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
                    .replace(/#{1}\s(.+)/g, '<h1>$1</h1>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                }} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Send notification immediately</Label>
                  <p className="text-xs text-gray-500">Email the employee to sign</p>
                </div>
                <Switch checked={sendImmediately} onCheckedChange={setSendImmediately} />
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!documentType || !selectedEmployee || !title)}
                className="bg-[#1EB053] hover:bg-[#178f43]"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit(true)}
                  disabled={createDocumentMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button 
                  onClick={() => handleSubmit(false)}
                  disabled={createDocumentMutation.isPending}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  {createDocumentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send for Signature
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}