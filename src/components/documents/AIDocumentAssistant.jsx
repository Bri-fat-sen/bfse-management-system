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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F1F3C]">Choose Document Template</h3>
                    <p className="text-sm text-gray-500">Select the type of document you want to generate with AI</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {templates.length} templates
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {templates.map(tmpl => (
                    <button
                      key={tmpl.id || tmpl.document_type}
                      onClick={() => handleTemplateSelect(tmpl)}
                      className="group relative p-5 rounded-xl border-2 border-gray-200 text-left transition-all duration-200 hover:border-amber-400 hover:shadow-lg hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#0F1F3C] text-white flex items-center justify-center mb-3 group-hover:from-amber-400 group-hover:to-orange-500 transition-all">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-sm text-[#0F1F3C]">{tmpl.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{tmpl.variables?.length || 0} variables</p>
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-amber-500" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Employee */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F1F3C]">Select Employee</h3>
                    <p className="text-sm text-gray-500">Choose who this document is for</p>
                  </div>
                  <Badge variant="outline" className="bg-[#1EB053]/10 text-[#1EB053] border-[#1EB053]/20">
                    <User className="w-3 h-3 mr-1" />
                    {activeEmployees.length} employees
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activeEmployees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmployeeSelect(emp.id)}
                      className="group relative p-4 rounded-xl border-2 border-gray-200 text-left transition-all duration-200 hover:border-[#1EB053] hover:shadow-lg hover:bg-gradient-to-br hover:from-[#1EB053]/5 hover:to-[#1EB053]/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1EB053] to-[#15803d] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                          {emp.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#0F1F3C] truncate">{emp.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                          {emp.department && (
                            <p className="text-xs text-gray-400 truncate">{emp.department}</p>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-[#1EB053]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Fill Variables with AI Help */}
            {step === 3 && (
              <div className="space-y-6">
                {/* AI Assistant Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                        <Wand2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-semibold text-amber-900 mb-1 block">
                          AI Smart Fill (Optional)
                        </Label>
                        <Input
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          placeholder="e.g., Use formal language, senior position, probation period 6 months..."
                          className="bg-white border-amber-200 focus:border-amber-400"
                        />
                        <p className="text-xs text-amber-700 mt-2">Give AI special instructions to customize the document</p>
                      </div>
                    </div>
                    <Button 
                      onClick={generateAISuggestions} 
                      disabled={isGenerating} 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Suggest
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Variable Fields */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0072C6]/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#0072C6]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0F1F3C]">Document Details</h4>
                        <p className="text-xs text-gray-500">Fill in the required information</p>
                      </div>
                    </div>
                    {Object.keys(aiSuggestions).length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={applyAllSuggestions} 
                        className="border-amber-200 text-amber-600 hover:bg-amber-50"
                      >
                        <Sparkles className="w-3 h-3 mr-1" /> 
                        Apply All
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedTemplate?.variables || []).map(v => (
                        <div key={v.key} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                              {v.label}
                              {v.auto_fill && (
                                <span className="px-1.5 py-0.5 bg-[#1EB053]/10 text-[#1EB053] rounded text-[10px] font-medium">AUTO</span>
                              )}
                            </Label>
                            {aiSuggestions[v.key] && !variables[v.key] && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs text-amber-600 hover:bg-amber-50 px-2"
                                onClick={() => applySuggestion(v.key, aiSuggestions[v.key].value)}
                              >
                                <Zap className="w-3 h-3 mr-1" /> Apply AI
                              </Button>
                            )}
                          </div>
                          {v.type === 'date' ? (
                            <Input 
                              type="date" 
                              value={variables[v.key] || ''} 
                              onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))}
                              className="bg-gray-50 border-gray-200 focus:bg-white"
                            />
                          ) : v.type === 'select' ? (
                            <Select 
                              value={variables[v.key] || ''} 
                              onValueChange={(val) => setVariables(prev => ({ ...prev, [v.key]: val }))}
                            >
                              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white">
                                <SelectValue placeholder={`Select ${v.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {v.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input 
                              value={variables[v.key] || ''} 
                              placeholder={v.default || ''}
                              onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))}
                              className="bg-gray-50 border-gray-200 focus:bg-white"
                            />
                          )}
                          {aiSuggestions[v.key]?.explanation && !variables[v.key] && (
                            <p className="text-[10px] text-amber-600 italic flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {aiSuggestions[v.key].explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={generateDocument} 
                  className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#0062a6] shadow-lg shadow-[#1EB053]/20 h-12 text-base"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Document
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 4: Review & Send */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#1EB053]/10 to-[#1EB053]/5 rounded-xl p-4 border border-[#1EB053]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1EB053] text-white flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Document</p>
                        <p className="font-semibold text-[#0F1F3C] text-sm">{selectedTemplate?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#0072C6]/10 to-[#0072C6]/5 rounded-xl p-4 border border-[#0072C6]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0072C6] text-white flex items-center justify-center font-bold text-lg">
                        {selectedEmployee?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employee</p>
                        <p className="font-semibold text-[#0F1F3C] text-sm truncate">{selectedEmployee?.full_name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                      <span className="font-medium text-sm text-[#0F1F3C]">Document Preview</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>
                  <div className="relative">
                    <div className="bg-gray-50 p-6 max-h-[350px] overflow-y-auto">
                      <div 
                        className="bg-white shadow-lg rounded-lg mx-auto p-8" 
                        style={{ maxWidth: '700px' }}
                        dangerouslySetInnerHTML={{ __html: generatedContent }} 
                      />
                    </div>
                  </div>
                </div>

                {/* What's Next Info */}
                <div className="bg-gradient-to-r from-[#0072C6]/5 to-[#1EB053]/5 border border-[#0072C6]/20 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0072C6] to-[#1EB053] text-white flex items-center justify-center flex-shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F1F3C] mb-2">Ready to Send</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                          <span>Document will be sent to {selectedEmployee?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                          <span>Notification sent for digital signature</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                          <span>Signed copy emailed automatically</span>
                        </div>
                      </div>
                    </div>
                  </div>
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