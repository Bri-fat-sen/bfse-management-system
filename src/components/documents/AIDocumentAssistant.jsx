import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Sparkles, Loader2, Wand2, CheckCircle2, User, FileText,
  ArrowRight, RefreshCw, Send, Save, ChevronRight, Zap
} from "lucide-react";
import { format } from "date-fns";

export default function AIDocumentAssistant({
  open,
  onOpenChange,
  templates = [],
  employees = [],
  organisation,
  currentEmployee,
  orgId,
  onDocumentCreated
}) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [variables, setVariables] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");

  const activeEmployees = employees.filter(e => e.status === 'active');

  const resetWizard = () => {
    setStep(1);
    setSelectedTemplate(null);
    setSelectedEmployee(null);
    setVariables({});
    setAiSuggestions({});
    setGeneratedContent("");
    setCustomInstructions("");
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Pre-fill with defaults
    const initialVars = {};
    (template.variables || []).forEach(v => {
      if (v.default) initialVars[v.key] = v.default;
    });
    setVariables(initialVars);
    setStep(2);
  };

  const handleEmployeeSelect = (empId) => {
    const emp = employees.find(e => e.id === empId);
    setSelectedEmployee(emp);
    
    // Auto-fill employee-related variables
    if (emp && selectedTemplate?.variables) {
      const autoFilled = { ...variables };
      selectedTemplate.variables.forEach(v => {
        if (v.auto_fill) {
          const [entity, field] = v.auto_fill.split('.');
          if (entity === 'employee' && emp[field]) {
            autoFilled[v.key] = emp[field];
          } else if (entity === 'organisation' && organisation?.[field]) {
            autoFilled[v.key] = organisation[field];
          } else if (v.auto_fill === 'today') {
            autoFilled[v.key] = format(new Date(), 'yyyy-MM-dd');
          }
        }
      });
      // Smart field mapping
      const fieldMap = {
        'employee_name': emp.full_name,
        'employee_full_name': emp.full_name,
        'position': emp.position,
        'job_title': emp.position,
        'department': emp.department,
        'employee_email': emp.email || emp.user_email,
        'hire_date': emp.hire_date,
        'start_date': emp.hire_date,
        'salary': emp.base_salary,
        'monthly_salary': emp.base_salary,
        'base_salary': emp.base_salary,
        'work_location': emp.assigned_location_name || 'Head Office',
        'company_name': organisation?.name,
        'company_address': organisation?.address,
      };
      Object.entries(fieldMap).forEach(([key, val]) => {
        if (val && !autoFilled[key]) autoFilled[key] = val;
      });
      setVariables(autoFilled);
    }
    setStep(3);
  };

  const generateAISuggestions = async () => {
    if (!selectedTemplate || !selectedEmployee) return;
    
    setIsGenerating(true);
    try {
      const missingVars = (selectedTemplate.variables || [])
        .filter(v => !variables[v.key] && !v.auto_fill)
        .map(v => ({ key: v.key, label: v.label, type: v.type }));

      if (missingVars.length === 0) {
        toast.info("All variables are already filled!");
        setIsGenerating(false);
        return;
      }

      const prompt = `You are an HR document assistant for ${organisation?.name || 'a company'} in Sierra Leone.

Employee: ${selectedEmployee.full_name}
Position: ${selectedEmployee.position || 'Not specified'}
Department: ${selectedEmployee.department || 'Not specified'}
Hire Date: ${selectedEmployee.hire_date || 'Not specified'}

Document Type: ${selectedTemplate.name}
${customInstructions ? `Special Instructions: ${customInstructions}` : ''}

Please suggest appropriate values for these document variables:
${missingVars.map(v => `- ${v.label} (${v.key}): ${v.type}`).join('\n')}

Provide realistic, professional values appropriate for Sierra Leone employment documents.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: Object.fromEntries(
            missingVars.map(v => [v.key, { 
              type: "object",
              properties: {
                value: { type: "string" },
                explanation: { type: "string" }
              }
            }])
          )
        }
      });

      setAiSuggestions(response);
      toast.success("AI suggestions generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    }
    setIsGenerating(false);
  };

  const applySuggestion = (key, value) => {
    setVariables(prev => ({ ...prev, [key]: value }));
    toast.success(`Applied suggestion for ${key}`);
  };

  const applyAllSuggestions = () => {
    const newVars = { ...variables };
    Object.entries(aiSuggestions).forEach(([key, data]) => {
      if (data?.value) newVars[key] = data.value;
    });
    setVariables(newVars);
    toast.success("All suggestions applied!");
  };

  const generateDocument = async () => {
    if (!selectedTemplate?.content) return;
    
    let content = selectedTemplate.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    // Replace system variables
    content = content.replace(/{{signature_date}}/g, format(new Date(), 'MMMM d, yyyy'));
    content = content.replace(/{{digital_signature}}/g, '[Pending Signature]');
    
    setGeneratedContent(content);
    setStep(4);
  };

  const createDocument = async (sendForSignature = false) => {
    if (!generatedContent || !selectedEmployee || !selectedTemplate) return;
    
    setIsCreating(true);
    try {
      const docData = {
        organisation_id: orgId,
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.full_name,
        employee_email: selectedEmployee.email || selectedEmployee.user_email,
        document_type: selectedTemplate.document_type || 'custom',
        title: selectedTemplate.name,
        content: generatedContent,
        template_id: selectedTemplate.id,
        variables,
        status: sendForSignature ? 'pending_signature' : 'draft',
        requires_signature: selectedTemplate.requires_signature !== false,
        issued_by_id: currentEmployee?.id,
        issued_by_name: currentEmployee?.full_name,
        issued_at: new Date().toISOString(),
        effective_date: variables.effective_date || variables.start_date || format(new Date(), 'yyyy-MM-dd')
      };

      const created = await base44.entities.EmployeeDocument.create(docData);

      if (sendForSignature) {
        await base44.entities.Notification.create({
          organisation_id: orgId,
          employee_id: selectedEmployee.id,
          type: 'document',
          title: 'New Document Requires Your Signature',
          message: `You have received "${selectedTemplate.name}" that requires your signature.`,
          priority: 'high',
          is_read: false
        });
      }

      toast.success(sendForSignature ? "Document sent for signature!" : "Document saved as draft!");
      onDocumentCreated?.();
      onOpenChange(false);
      resetWizard();
    } catch (error) {
      toast.error("Failed to create document", { description: error.message });
    }
    setIsCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetWizard(); onOpenChange(v); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 to-white">
        {/* Premium Header with Sierra Leone Theme */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1F3C] via-[#1a3a6e] to-[#0F1F3C]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          <div className="relative px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  AI Document Generator
                  <Wand2 className="w-5 h-5 text-amber-400" />
                </h2>
                <p className="text-white/70 text-sm">Intelligent document creation powered by AI</p>
              </div>
            </div>
            
            {/* Flag stripe accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
          </div>
        </div>

        {/* Premium Steps Indicator */}
        <div className="px-8 py-5 bg-white border-b">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Template', icon: FileText },
              { num: 2, label: 'Employee', icon: User },
              { num: 3, label: 'AI Variables', icon: Sparkles },
              { num: 4, label: 'Review & Send', icon: Send }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    step > s.num 
                      ? 'bg-gradient-to-br from-[#1EB053] to-[#15803d] text-white shadow-lg shadow-[#1EB053]/30' 
                      : step === s.num 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.num ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                    {step === s.num && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    step >= s.num ? 'text-[#0F1F3C]' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 rounded-full transition-colors ${
                    step > s.num ? 'bg-gradient-to-r from-[#1EB053] to-amber-400' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Step 1: Select Template */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Select a Template</h3>
                <p className="text-gray-500 text-sm">Choose which document you want to generate</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {templates.map(tmpl => (
                    <Card 
                      key={tmpl.id || tmpl.document_type} 
                      className="cursor-pointer hover:shadow-lg hover:border-[#1EB053] transition-all"
                      onClick={() => handleTemplateSelect(tmpl)}
                    >
                      <CardContent className="p-4">
                        <div className="w-10 h-10 rounded-lg bg-[#0072C6]/10 flex items-center justify-center mb-3">
                          <FileText className="w-5 h-5 text-[#0072C6]" />
                        </div>
                        <p className="font-medium text-sm">{tmpl.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{tmpl.variables?.length || 0} variables</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Employee */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← Back</Button>
                  <h3 className="font-semibold text-lg">Select Employee</h3>
                </div>
                <p className="text-gray-500 text-sm">Choose who this document is for</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {activeEmployees.map(emp => (
                    <Card 
                      key={emp.id}
                      className="cursor-pointer hover:shadow-lg hover:border-[#1EB053] transition-all"
                      onClick={() => handleEmployeeSelect(emp.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1EB053] flex items-center justify-center text-white font-bold">
                          {emp.full_name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{emp.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Fill Variables with AI Help */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Back</Button>
                    <h3 className="font-semibold text-lg">Fill Document Details</h3>
                  </div>
                  <Button onClick={generateAISuggestions} disabled={isGenerating} className="bg-amber-500 hover:bg-amber-600">
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    AI Suggest
                  </Button>
                </div>

                {/* AI Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <Label className="text-xs text-amber-800">Special Instructions for AI (optional)</Label>
                  <Input
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Use formal language, this is for a senior position..."
                    className="mt-1 bg-white"
                  />
                </div>

                {/* Variable Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {(selectedTemplate?.variables || []).map(v => (
                    <div key={v.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{v.label}</Label>
                        {aiSuggestions[v.key] && !variables[v.key] && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-amber-600"
                            onClick={() => applySuggestion(v.key, aiSuggestions[v.key].value)}>
                            <Zap className="w-3 h-3 mr-1" /> Apply
                          </Button>
                        )}
                      </div>
                      {v.type === 'date' ? (
                        <Input type="date" value={variables[v.key] || ''} 
                          onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))} />
                      ) : v.type === 'select' ? (
                        <Select value={variables[v.key] || ''} onValueChange={(val) => setVariables(prev => ({ ...prev, [v.key]: val }))}>
                          <SelectTrigger><SelectValue placeholder={`Select ${v.label}`} /></SelectTrigger>
                          <SelectContent>
                            {v.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input value={variables[v.key] || ''} placeholder={v.default || ''}
                          onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))} />
                      )}
                      {aiSuggestions[v.key]?.explanation && !variables[v.key] && (
                        <p className="text-[10px] text-amber-600 italic">{aiSuggestions[v.key].explanation}</p>
                      )}
                    </div>
                  ))}
                </div>

                {Object.keys(aiSuggestions).length > 0 && (
                  <Button variant="outline" onClick={applyAllSuggestions} className="w-full mt-4">
                    <Sparkles className="w-4 h-4 mr-2" /> Apply All AI Suggestions
                  </Button>
                )}

                <Button onClick={generateDocument} className="w-full bg-[#1EB053] hover:bg-[#178f43]">
                  Generate Document <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 4: Review & Send */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)}>← Back</Button>
                  <h3 className="font-semibold text-lg">Review Document</h3>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Badge className="bg-[#1EB053]">{selectedTemplate?.name}</Badge>
                  <span className="text-sm">for</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0072C6] text-white flex items-center justify-center text-xs">
                      {selectedEmployee?.full_name?.charAt(0)}
                    </div>
                    <span className="font-medium text-sm">{selectedEmployee?.full_name}</span>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <ScrollArea className="h-[300px]">
                    <div className="p-6 bg-white m-4 rounded shadow-sm" dangerouslySetInnerHTML={{ __html: generatedContent }} />
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {step === 4 && (
          <div className="px-8 py-5 bg-white border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex h-1.5 w-12 rounded-full overflow-hidden">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white border" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <span>AI-Powered Document Creation</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(3)}
                className="px-6"
              >
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={() => createDocument(false)} 
                disabled={isCreating}
                className="px-6"
              >
                <Save className="w-4 h-4 mr-2" /> 
                Save Draft
              </Button>
              <Button 
                onClick={() => createDocument(true)} 
                disabled={isCreating} 
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#0062a6] px-8 shadow-lg shadow-[#1EB053]/20"
              >
                {isCreating ? (
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}