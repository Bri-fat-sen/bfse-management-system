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
import { toast } from "sonner";
import { 
  FileText, Users, Send, Loader2, Sparkles,
  ChevronRight, CheckCircle2, AlertCircle, Search,
  FileSignature, Shield, Lock, Heart, Eye, Monitor,
  AlertTriangle, Calendar, Home, TrendingUp, XCircle, DollarSign
} from "lucide-react";
import { DOCUMENT_TYPE_INFO, DEFAULT_TEMPLATES, SL_DOCUMENT_STYLES } from "./DocumentTemplates";
import { format } from "date-fns";

const DOCUMENT_ICONS = {
  employment_contract: FileSignature,
  nda: Lock,
  code_of_conduct: Shield,
  privacy_policy: Eye,
  health_safety_policy: Heart,
  anti_harassment_policy: Shield,
  it_acceptable_use: Monitor,
  disciplinary_policy: AlertTriangle,
  leave_policy: Calendar,
  remote_work_policy: Home,
  probation_confirmation: CheckCircle2,
  promotion_letter: TrendingUp,
  termination_letter: XCircle,
  warning_letter: AlertTriangle,
  salary_revision: DollarSign,
  custom: FileText
};

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
    if (selectedTemplate && selectedEmployees.length >= 1) {
      const employee = employees.find(e => e.id === selectedEmployees[0]);
      const autoFilled = {};
      
      // Auto-fill document reference
      autoFilled['document_ref'] = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      // Auto-fill today's date
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Common field mappings for smart auto-fill
      const fieldMappings = {
        // Employee fields
        'employee_name': employee?.full_name,
        'employee_full_name': employee?.full_name,
        'full_name': employee?.full_name,
        'position': employee?.position,
        'job_title': employee?.position,
        'new_position': employee?.position,
        'previous_position': employee?.position,
        'department': employee?.department,
        'employee_email': employee?.email || employee?.user_email,
        'email': employee?.email || employee?.user_email,
        'employee_address': employee?.address || 'Freetown, Sierra Leone',
        'address': employee?.address,
        'phone': employee?.phone,
        'employee_phone': employee?.phone,
        'employee_code': employee?.employee_code,
        'employee_id_number': employee?.employee_code,
        'hire_date': employee?.hire_date,
        'start_date': employee?.hire_date,
        'monthly_salary': employee?.base_salary,
        'salary': employee?.base_salary,
        'new_salary': employee?.base_salary,
        'previous_salary': employee?.base_salary,
        'base_salary': employee?.base_salary,
        'work_location': employee?.assigned_location_name || 'Head Office',
        'location': employee?.assigned_location_name,
        
        // Organisation fields
        'company_name': organisation?.name,
        'organisation_name': organisation?.name,
        'company_address': organisation?.address || `${organisation?.city || 'Freetown'}, Sierra Leone`,
        'company_phone': organisation?.phone,
        'company_email': organisation?.email,
        'company_registration': organisation?.business_registration_number || 'N/A',
        'tin_number': organisation?.tin_number,
        'nassit_number': organisation?.nassit_number,
        
        // Date fields
        'effective_date': today,
        'issue_date': today,
        'warning_date': today,
        'incident_date': today,
        
        // Current employee (issuer) fields
        'employer_signatory': currentEmployee?.full_name || 'HR Manager',
        'issuing_manager': currentEmployee?.full_name || 'HR Manager',
        'authorized_signatory': currentEmployee?.full_name || 'HR Manager',
        'company_signatory': currentEmployee?.full_name || 'HR Manager',
        'employer_title': currentEmployee?.position || 'Human Resources',
        'issuing_manager_title': currentEmployee?.position || 'Human Resources',
        'signatory_title': currentEmployee?.position || 'Human Resources',
        'company_signatory_title': currentEmployee?.position || 'Human Resources',
      };
      
      (selectedTemplate.variables || []).forEach(v => {
        // First check explicit auto_fill
        if (v.auto_fill) {
          if (v.auto_fill === 'auto') {
            autoFilled[v.key] = autoFilled['document_ref'];
          } else if (v.auto_fill === 'today') {
            autoFilled[v.key] = today;
          } else {
            const [entity, field] = v.auto_fill.split('.');
            if (entity === 'employee' && employee?.[field]) {
              autoFilled[v.key] = employee[field];
            } else if (entity === 'organisation') {
              if (field === 'name' && v.key === 'company_initial') {
                autoFilled[v.key] = organisation?.name?.charAt(0)?.toUpperCase() || 'C';
              } else if (organisation?.[field]) {
                autoFilled[v.key] = organisation[field];
              }
            }
          }
        }
        
        // Smart auto-fill based on field key matching
        if (!autoFilled[v.key] && fieldMappings[v.key]) {
          autoFilled[v.key] = fieldMappings[v.key];
        }
        
        // Handle company_initial specially
        if (v.key === 'company_initial' && !autoFilled[v.key]) {
          autoFilled[v.key] = organisation?.name?.charAt(0)?.toUpperCase() || 'C';
        }
        
        // Apply defaults for empty values
        if (v.default && !autoFilled[v.key]) {
          autoFilled[v.key] = v.default;
        }
      });
      
      setVariables(prev => ({ ...autoFilled, ...prev }));
    }
  }, [selectedTemplate, selectedEmployees, employees, organisation, currentEmployee]);

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

  const [employeeSearch, setEmployeeSearch] = useState("");
  
  const filteredActiveEmployees = activeEmployees.filter(emp => 
    emp.full_name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.position?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.department?.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 to-white">
        {/* Premium Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1F3C] via-[#1a3a6e] to-[#0F1F3C]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          <div className="relative px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-lg shadow-[#1EB053]/20">
                <FileSignature className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Document Creator
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h2>
                <p className="text-white/70 text-sm">Professional HR documents for your organization</p>
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
              { num: 1, label: 'Document Type', icon: FileText },
              { num: 2, label: 'Recipients & Details', icon: Users },
              { num: 3, label: 'Review & Send', icon: Send }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    step > s.num 
                      ? 'bg-gradient-to-br from-[#1EB053] to-[#15803d] text-white shadow-lg shadow-[#1EB053]/30' 
                      : step === s.num 
                        ? 'bg-gradient-to-br from-[#0072C6] to-[#0F1F3C] text-white shadow-lg shadow-[#0072C6]/30 ring-4 ring-[#0072C6]/20' 
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
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 rounded-full transition-colors ${
                    step > s.num ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6]' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-8 py-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F1F3C]">Choose Document Type</h3>
                    <p className="text-sm text-gray-500">Select the type of document you want to create</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {Object.keys(DOCUMENT_TYPE_INFO).length} templates available
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(DOCUMENT_TYPE_INFO).map(([type, info]) => {
                    const IconComponent = DOCUMENT_ICONS[type] || FileText;
                    const isSelected = documentType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setDocumentType(type)}
                        className={`group relative rounded-xl border-2 text-left transition-all duration-200 overflow-hidden ${
                          isSelected 
                            ? 'border-[#1EB053] bg-white shadow-xl shadow-[#1EB053]/20' 
                            : 'border-gray-200 hover:border-[#0072C6]/50 hover:shadow-lg hover:bg-gray-50'
                        }`}
                      >
                        {/* Sierra Leone Stripe */}
                        <div className={`flex h-1 w-full ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <div className="flex-1 bg-[#1EB053]" />
                          <div className="flex-1 bg-white" />
                          <div className="flex-1 bg-[#0072C6]" />
                        </div>
                        
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-md ${
                              isSelected 
                                ? 'bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white shadow-[#1EB053]/30' 
                                : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-500 group-hover:from-[#0072C6]/10 group-hover:to-[#0072C6]/5 group-hover:text-[#0072C6]'
                            }`}>
                              <IconComponent className="w-7 h-7" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className={`font-bold text-base ${isSelected ? 'text-[#0F1F3C]' : 'text-gray-800'}`}>
                                  {info.label}
                                </h4>
                                {isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-[#1EB053] flex-shrink-0" />
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                {info.description}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                {info.requiresSignature && (
                                  <Badge className="bg-[#0072C6]/10 text-[#0072C6] border-0 text-xs">
                                    <FileSignature className="w-3 h-3 mr-1" />
                                    Signature Required
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                                  Professional Template
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {customTemplates.length > 0 && (
                  <div className="mt-8 pt-8 border-t-2 border-dashed">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0F1F3C]">Custom Templates</h4>
                        <p className="text-xs text-gray-500">Organization-specific document templates</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {customTemplates.map(template => {
                        const isSelected = documentType === template.id;
                        return (
                          <button
                            key={template.id}
                            onClick={() => setDocumentType(template.id)}
                            className={`group relative rounded-xl border-2 text-left transition-all duration-200 overflow-hidden ${
                              isSelected 
                                ? 'border-amber-400 bg-white shadow-xl shadow-amber-500/20' 
                                : 'border-gray-200 hover:border-amber-300 hover:shadow-lg hover:bg-amber-50/30'
                            }`}
                          >
                            {/* Custom Stripe */}
                            <div className={`flex h-1 w-full ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                              <div className="flex-1 bg-amber-400" />
                              <div className="flex-1 bg-white" />
                              <div className="flex-1 bg-orange-500" />
                            </div>
                            
                            <div className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                  <FileText className="w-7 h-7" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-bold text-base text-gray-800">
                                      {template.name}
                                    </h4>
                                    {isSelected && (
                                      <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mb-3">
                                    {template.description || 'Custom organization template'}
                                  </p>
                                  
                                  <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-0 text-xs">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Custom Template
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Recipients Section */}
              <div className="bg-white rounded-xl border-2 shadow-lg overflow-hidden">
                {/* Sierra Leone Stripe */}
                <div className="flex h-1 w-full">
                  <div className="flex-1 bg-[#1EB053]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#0072C6]" />
                </div>
                
                <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0072C6]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#0072C6]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0F1F3C]">Select Recipients</h4>
                      <p className="text-xs text-gray-500">{selectedEmployees.length} of {activeEmployees.length} employees selected</p>
                    </div>
                  </div>
                  <Button 
                    variant={selectAll ? "default" : "outline"} 
                    size="sm" 
                    onClick={handleSelectAll}
                    className={selectAll ? "bg-[#1EB053] hover:bg-[#178f43]" : ""}
                  >
                    {selectAll ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search employees by name, position, or department..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-1">
                    {filteredActiveEmployees.map(emp => {
                      const isSelected = selectedEmployees.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleEmployee(emp.id)}
                          className={`group p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-[#1EB053] bg-gradient-to-br from-[#1EB053]/5 to-[#1EB053]/10 shadow-sm'
                              : 'border-gray-100 hover:border-[#0072C6]/30 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                              isSelected 
                                ? 'bg-[#1EB053] text-white' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-[#0072C6]/10'
                            }`}>
                              {emp.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[#0F1F3C] truncate">{emp.full_name}</p>
                              <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#1EB053] flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Document Details Section */}
              {selectedTemplate?.variables?.length > 0 && selectedEmployees.length > 0 && (
                <div className="bg-white rounded-xl border-2 shadow-lg overflow-hidden">
                  {/* Sierra Leone Stripe */}
                  <div className="flex h-1 w-full">
                    <div className="flex-1 bg-[#1EB053]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#0072C6]" />
                  </div>
                  
                  <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1EB053]/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#1EB053]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0F1F3C]">Document Details</h4>
                        <p className="text-xs text-gray-500">Auto-filled where possible • Review and customize as needed</p>
                      </div>
                    </div>
                    {Object.keys(variables).length > 0 && (
                      <Badge className="bg-[#1EB053]/10 text-[#1EB053] border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready to send
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedTemplate.variables
                        .filter(v => !v.auto_fill || !variables[v.key])
                        .map(v => (
                        <div key={v.key} className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                            {v.label}
                            {v.auto_fill && (
                              <span className="px-1.5 py-0.5 bg-[#1EB053]/10 text-[#1EB053] rounded text-[10px] font-medium">AUTO</span>
                            )}
                          </Label>
                          {v.type === 'select' ? (
                            <Select
                              value={variables[v.key] || v.default || ''}
                              onValueChange={(val) => setVariables(prev => ({ ...prev, [v.key]: val }))}
                            >
                              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white">
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
                              className="bg-gray-50 border-gray-200 focus:bg-white"
                            />
                          ) : (
                            <Input
                              type={v.type === 'number' ? 'number' : 'text'}
                              value={variables[v.key] || ''}
                              onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))}
                              placeholder={v.default || ''}
                              className="bg-gray-50 border-gray-200 focus:bg-white"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-[#1EB053]/10 to-[#1EB053]/5 rounded-xl p-4 border border-[#1EB053]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1EB053] text-white flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Document Type</p>
                        <p className="font-semibold text-[#0F1F3C] text-sm">
                          {DOCUMENT_TYPE_INFO[documentType]?.label || selectedTemplate?.name || 'Custom'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#0072C6]/10 to-[#0072C6]/5 rounded-xl p-4 border border-[#0072C6]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0072C6] text-white flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Recipients</p>
                        <p className="font-semibold text-[#0F1F3C] text-sm">{selectedEmployees.length} Employee(s)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                        <FileSignature className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-semibold text-[#0F1F3C] text-sm">Ready to Send</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="bg-white rounded-xl border-2 shadow-lg overflow-hidden">
                  {/* Sierra Leone Stripe */}
                  <div className="flex h-1 w-full">
                    <div className="flex-1 bg-[#1EB053]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#0072C6]" />
                  </div>
                  
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm text-[#0F1F3C]">Document Preview</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Live Preview</Badge>
                  </div>
                  <div className="relative">
                    <style dangerouslySetInnerHTML={{ __html: SL_DOCUMENT_STYLES }} />
                    <div 
                      className="bg-gray-50 p-6 max-h-[300px] overflow-y-auto"
                      style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
                    >
                      <div 
                        className="bg-white shadow-lg rounded-lg mx-auto"
                        style={{ maxWidth: '700px' }}
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                      />
                    </div>
                  </div>
                </div>

                {/* What's Next Info */}
                <div className="bg-white border-2 border-[#0072C6]/20 rounded-xl overflow-hidden shadow-lg">
                  {/* Sierra Leone Stripe */}
                  <div className="flex h-1 w-full">
                    <div className="flex-1 bg-[#1EB053]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#0072C6]" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#0072C6]/5 to-[#1EB053]/5 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0072C6] to-[#1EB053] text-white flex items-center justify-center flex-shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F1F3C]">What happens when you send?</p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                          <span>Documents sent to {selectedEmployees.length} employee(s)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                          <span>Notification sent for signature</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                          <span>Digital signature with full name</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                          <span>Signed copies emailed automatically</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Premium Footer */}
        <div className="px-8 py-5 bg-white border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex h-1.5 w-12 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <span>Sierra Leone HR Documents</span>
          </div>
          
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="px-6"
              >
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
                className="bg-gradient-to-r from-[#0072C6] to-[#0F1F3C] hover:from-[#0062a6] hover:to-[#0a1529] px-8 shadow-lg shadow-[#0072C6]/20"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreateDocuments}
                disabled={sending || createDocumentMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#0062a6] px-8 shadow-lg shadow-[#1EB053]/20"
              >
                {(sending || createDocumentMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Documents...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send for Signature
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}