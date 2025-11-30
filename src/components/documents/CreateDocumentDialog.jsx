import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  FileText, Users, Send, Save, Eye, Loader2, 
  ChevronRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { DOCUMENT_TYPE_INFO, DEFAULT_TEMPLATES, SL_DOCUMENT_STYLES } from "./DocumentTemplates";
import { format } from "date-fns";

export default function CreateDocumentDialog({
  open,
  onOpenChange,
  employees = [],
  organisation,
  currentEmployee,
  orgId
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [variables, setVariables] = useState({});
  const [customContent, setCustomContent] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch custom templates
  const { data: customTemplates = [] } = useQuery({
    queryKey: ['documentTemplates', orgId],
    queryFn: () => base44.entities.DocumentTemplate.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const activeEmployees = employees.filter(e => e.status === 'active');

  const selectedTemplate = useMemo(() => {
    if (!documentType) return null;
    
    // Check custom templates first
    const custom = customTemplates.find(t => t.id === documentType);
    if (custom) return custom;
    
    // Fall back to default templates
    return DEFAULT_TEMPLATES[documentType] || null;
  }, [documentType, customTemplates]);

  // Auto-fill variables when employee or template changes
  useEffect(() => {
    if (selectedTemplate && selectedEmployees.length === 1) {
      const employee = employees.find(e => e.id === selectedEmployees[0]);
      if (employee) {
        const autoFilled = {};
        
        // Auto-fill company initial from organisation name
        if (organisation?.name) {
          autoFilled['company_initial'] = organisation.name.charAt(0).toUpperCase();
        }
        
        // Auto-fill document reference
        autoFilled['document_ref'] = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        
        (selectedTemplate.variables || []).forEach(v => {
          if (v.auto_fill) {
            const [entity, field] = v.auto_fill.split('.');
            if (entity === 'employee' && employee[field]) {
              autoFilled[v.key] = employee[field];
            } else if (entity === 'organisation' && organisation?.[field]) {
              autoFilled[v.key] = organisation[field];
            }
          }
          if (v.default && !autoFilled[v.key]) {
            autoFilled[v.key] = v.default;
          }
        });
        setVariables(prev => ({ ...autoFilled, ...prev }));
      }
    }
  }, [selectedTemplate, selectedEmployees, employees, organisation]);

  // Generate preview
  useEffect(() => {
    if (selectedTemplate && selectedEmployees.length > 0) {
      let content = selectedTemplate.content;
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
      });
      // Replace signature placeholders
      content = content.replace(/{{signature_date}}/g, format(new Date(), 'MMMM d, yyyy'));
      content = content.replace(/{{digital_signature}}/g, '[Pending Signature]');
      setPreviewContent(content);
    }
  }, [selectedTemplate, variables, selectedEmployees]);

  const createDocumentMutation = useMutation({
    mutationFn: async (documents) => {
      const results = [];
      for (const doc of documents) {
        const created = await base44.entities.EmployeeDocument.create(doc);
        results.push(created);
        
        // Send notification to employee
        await base44.entities.Notification.create({
          organisation_id: orgId,
          employee_id: doc.employee_id,
          type: 'document',
          title: 'New Document Requires Your Signature',
          message: `You have received "${doc.title}" that requires your signature. Please review and sign at your earliest convenience.`,
          priority: 'high',
          action_url: `/documents/${created.id}`,
          is_read: false
        });
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success(`${results.length} document(s) created and sent for signature`);
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create documents", { description: error.message });
    }
  });

  const resetForm = () => {
    setStep(1);
    setDocumentType("");
    setSelectedEmployees([]);
    setSelectAll(false);
    setVariables({});
    setCustomContent("");
    setCustomTitle("");
    setPreviewContent("");
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(activeEmployees.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleCreateDocuments = async () => {
    if (!selectedTemplate || selectedEmployees.length === 0) return;

    setSending(true);
    
    const documents = selectedEmployees.map(empId => {
      const employee = employees.find(e => e.id === empId);
      
      // Replace variables for this specific employee
      let content = selectedTemplate.content;
      const empVariables = { ...variables };
      
      // Auto-fill employee-specific variables
      (selectedTemplate.variables || []).forEach(v => {
        if (v.auto_fill) {
          const [entity, field] = v.auto_fill.split('.');
          if (entity === 'employee' && employee[field]) {
            empVariables[v.key] = employee[field];
          } else if (entity === 'organisation' && organisation?.[field]) {
            empVariables[v.key] = organisation[field];
          }
        }
      });
      
      Object.entries(empVariables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      });
      
      return {
        organisation_id: orgId,
        employee_id: empId,
        employee_name: employee.full_name,
        employee_email: employee.email || employee.user_email,
        document_type: documentType.includes('-') ? 'custom' : documentType,
        title: customTitle || DOCUMENT_TYPE_INFO[documentType]?.label || selectedTemplate.name,
        content,
        template_id: selectedTemplate.id,
        variables: empVariables,
        status: 'pending_signature',
        requires_signature: selectedTemplate.requires_signature !== false,
        issued_by_id: currentEmployee?.id,
        issued_by_name: currentEmployee?.full_name,
        issued_at: new Date().toISOString(),
        effective_date: variables.effective_date || variables.start_date || format(new Date(), 'yyyy-MM-dd')
      };
    });

    createDocumentMutation.mutate(documents);
    setSending(false);
  };

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
            Create HR Document
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 py-4 border-b">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? 'text-[#1EB053]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > s ? 'bg-[#1EB053] text-white' : 
                  step === s ? 'border-2 border-[#1EB053] text-[#1EB053]' : 
                  'border-2 border-gray-300'
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {s === 1 ? 'Select Type' : s === 2 ? 'Choose Recipients' : 'Review & Send'}
                </span>
              </div>
              {s < 3 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </React.Fragment>
          ))}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {step === 1 && (
            <div className="space-y-4 py-4">
              <Label>Select Document Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(DOCUMENT_TYPE_INFO).map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setDocumentType(type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      documentType === type 
                        ? 'border-[#1EB053] bg-[#1EB053]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{info.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                    {info.requiresSignature && (
                      <Badge variant="outline" className="mt-2 text-xs">Requires Signature</Badge>
                    )}
                  </button>
                ))}
              </div>

              {customTemplates.length > 0 && (
                <>
                  <Label className="mt-6">Or Choose Custom Template</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {customTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setDocumentType(template.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          documentType === template.id 
                            ? 'border-[#1EB053] bg-[#1EB053]/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm">{template.name}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">Custom</Badge>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label>Select Recipients ({selectedEmployees.length} selected)</Label>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectAll ? 'Deselect All' : 'Select All Active'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {activeEmployees.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmployee(emp.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEmployees.includes(emp.id)
                        ? 'border-[#1EB053] bg-[#1EB053]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{emp.full_name}</p>
                        <p className="text-xs text-gray-500">{emp.position} • {emp.department}</p>
                      </div>
                      {selectedEmployees.includes(emp.id) && (
                        <CheckCircle2 className="w-5 h-5 text-[#1EB053]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTemplate?.variables?.length > 0 && (
                <div className="mt-6 space-y-4">
                  <Label>Fill Document Variables</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.variables.map(v => (
                      <div key={v.key}>
                        <Label className="text-xs text-gray-500">{v.label}</Label>
                        {v.type === 'select' ? (
                          <Select
                            value={variables[v.key] || v.default || ''}
                            onValueChange={(val) => setVariables(prev => ({ ...prev, [v.key]: val }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={`Select ${v.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {v.options?.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : v.type === 'date' ? (
                          <Input
                            type="date"
                            value={variables[v.key] || ''}
                            onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <Input
                            type={v.type === 'number' ? 'number' : 'text'}
                            value={variables[v.key] || ''}
                            onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))}
                            placeholder={v.auto_fill ? `Auto-filled from ${v.auto_fill}` : ''}
                            className="mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label>Document Preview</Label>
                <Badge variant="secondary">
                  {selectedEmployees.length} recipient(s)
                </Badge>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: SL_DOCUMENT_STYLES }} />
                <div 
                  className="bg-white p-4 max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">What happens next?</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Documents will be sent to {selectedEmployees.length} employee(s)</li>
                      <li>• Each employee will receive a notification to sign</li>
                      <li>• Employees can review and digitally sign with their full name</li>
                      <li>• Signed copies will be emailed automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button 
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !documentType) ||
                (step === 2 && selectedEmployees.length === 0)
              }
              className="bg-[#1EB053] hover:bg-[#178f43]"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleCreateDocuments}
              disabled={sending || createDocumentMutation.isPending}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {(sending || createDocumentMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send for Signature
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}