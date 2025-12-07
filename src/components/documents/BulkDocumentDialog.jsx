import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/Toast";
import {
  FileText, Users, Send, Loader2, 
  ChevronRight, CheckCircle2, Search, Filter, X
} from "lucide-react";
import { DOCUMENT_TYPE_INFO, DEFAULT_TEMPLATES } from "./DocumentTemplates";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BulkDocumentDialog({
  open,
  onOpenChange,
  employees = [],
  organisation,
  currentEmployee,
  orgId
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [variables, setVariables] = useState({});
  const [sending, setSending] = useState(false);

  // Fetch custom templates
  const { data: customTemplates = [] } = useQuery({
    queryKey: ['documentTemplates', orgId],
    queryFn: () => base44.entities.DocumentTemplate.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId,
  });

  const activeEmployees = employees.filter(e => e.status === 'active');
  
  // Get unique departments and roles
  const departments = [...new Set(activeEmployees.map(e => e.department).filter(Boolean))];
  const roles = [...new Set(activeEmployees.map(e => e.role).filter(Boolean))];

  const selectedTemplate = useMemo(() => {
    if (!documentType) return null;
    const custom = customTemplates.find(t => t.id === documentType);
    if (custom) return custom;
    return DEFAULT_TEMPLATES[documentType] || null;
  }, [documentType, customTemplates]);

  // Filter employees based on search and filters
  const filteredActiveEmployees = useMemo(() => {
    return activeEmployees.filter(emp => {
      const matchesSearch = !employeeSearch || 
        emp.full_name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.position?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.department?.toLowerCase().includes(employeeSearch.toLowerCase());
      
      const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter;
      const matchesRole = roleFilter === "all" || emp.role === roleFilter;
      
      return matchesSearch && matchesDepartment && matchesRole;
    });
  }, [activeEmployees, employeeSearch, departmentFilter, roleFilter]);

  // Auto-fill common variables
  useEffect(() => {
    if (selectedTemplate) {
      const autoFilled = {};
      autoFilled['document_ref'] = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const commonFieldMappings = {
        'company_name': organisation?.name,
        'organisation_name': organisation?.name,
        'company_address': organisation?.address || `${organisation?.city || 'Freetown'}, Sierra Leone`,
        'company_phone': organisation?.phone,
        'company_email': organisation?.email,
        'company_registration': organisation?.business_registration_number || 'N/A',
        'tin_number': organisation?.tin_number,
        'nassit_number': organisation?.nassit_number,
        'effective_date': today,
        'issue_date': today,
        'employer_signatory': currentEmployee?.full_name || 'HR Manager',
        'issuing_manager': currentEmployee?.full_name || 'HR Manager',
        'authorized_signatory': currentEmployee?.full_name || 'HR Manager',
        'employer_title': currentEmployee?.position || 'Human Resources',
        'issuing_manager_title': currentEmployee?.position || 'Human Resources',
        'signatory_title': currentEmployee?.position || 'Human Resources',
        'company_initial': organisation?.name?.charAt(0)?.toUpperCase() || 'C',
      };
      
      (selectedTemplate.variables || []).forEach(v => {
        if (v.auto_fill && v.auto_fill !== 'employee' && commonFieldMappings[v.key]) {
          autoFilled[v.key] = commonFieldMappings[v.key];
        }
        if (v.default && !autoFilled[v.key]) {
          autoFilled[v.key] = v.default;
        }
      });
      
      setVariables(prev => ({ ...autoFilled, ...prev }));
    }
  }, [selectedTemplate, organisation, currentEmployee]);

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredActiveEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredActiveEmployees.map(e => e.id));
    }
  };

  const createDocumentsMutation = useMutation({
    mutationFn: async (documents) => {
      const results = [];
      for (const doc of documents) {
        const created = await base44.entities.EmployeeDocument.create(doc);
        results.push(created);
        
        await base44.entities.Notification.create({
          organisation_id: orgId,
          recipient_id: doc.employee_id,
          type: 'hr',
          title: 'New Document Requires Your Signature',
          message: `You have received "${doc.title}" that requires your signature.`,
          priority: 'high',
          is_read: false
        });
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success(`${results.length} documents created and sent successfully`);
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create documents", error.message);
    }
  });

  const handleCreateDocuments = async () => {
    if (!selectedTemplate || selectedEmployees.length === 0) return;

    setSending(true);
    
    const documents = selectedEmployees.map(empId => {
      const employee = employees.find(e => e.id === empId);
      let content = selectedTemplate.content;
      const empVariables = { ...variables };
      
      // Auto-fill employee-specific variables with conditional logic
      (selectedTemplate.variables || []).forEach(v => {
        if (v.auto_fill) {
          const [entity, field] = v.auto_fill.split('.');
          if (entity === 'employee' && employee?.[field]) {
            empVariables[v.key] = employee[field];
          }
        }
        
        // Apply conditional defaults based on employee data
        if (!empVariables[v.key]) {
          // Conditional logic examples:
          if (v.key === 'reports_to' && employee.department) {
            empVariables[v.key] = `${employee.department} Manager`;
          } else if (v.key === 'work_location' && employee.assigned_location_name) {
            empVariables[v.key] = employee.assigned_location_name;
          } else if (v.key === 'employee_address' && !employee.address) {
            empVariables[v.key] = 'Freetown, Sierra Leone';
          }
        }
      });
      
      // Replace all variables in content
      Object.entries(empVariables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      });
      
      return {
        organisation_id: orgId,
        employee_id: empId,
        employee_name: employee.full_name,
        employee_email: employee.email || employee.user_email,
        document_type: documentType.includes('-') ? 'custom' : documentType,
        title: DOCUMENT_TYPE_INFO[documentType]?.label || selectedTemplate.name,
        content,
        template_id: selectedTemplate.id,
        variables: empVariables,
        status: 'pending_signature',
        requires_signature: selectedTemplate.requires_signature !== false,
        issued_by_id: currentEmployee?.id,
        issued_by_name: currentEmployee?.full_name,
        issued_at: new Date().toISOString(),
        effective_date: empVariables.effective_date || empVariables.start_date || format(new Date(), 'yyyy-MM-dd'),
        version: 1,
        version_history: []
      };
    });

    createDocumentsMutation.mutate(documents);
    setSending(false);
  };

  const resetForm = () => {
    setStep(1);
    setDocumentType("");
    setSelectedEmployees([]);
    setVariables({});
    setEmployeeSearch("");
    setDepartmentFilter("all");
    setRoleFilter("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-50 to-white">
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Bulk Document Creator</h2>
                <p className="text-white/70 text-sm">Send documents to multiple employees at once</p>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 flex">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="px-8 py-5 bg-white border-b">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {[
              { num: 1, label: 'Document Type', icon: FileText },
              { num: 2, label: 'Select Employees', icon: Users },
              { num: 3, label: 'Confirm & Send', icon: Send }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    step > s.num 
                      ? 'bg-gradient-to-br from-[#1EB053] to-[#15803d] text-white shadow-lg' 
                      : step === s.num 
                        ? 'bg-gradient-to-br from-[#0072C6] to-[#0F1F3C] text-white shadow-lg ring-4 ring-[#0072C6]/20' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium ${step >= s.num ? 'text-[#0F1F3C]' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 rounded-full ${step > s.num ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6]' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-8 py-6">
            {/* Step 1: Select Document Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F1F3C] mb-2">Choose Document Type</h3>
                  <p className="text-sm text-gray-500">This document will be sent to all selected employees</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(DOCUMENT_TYPE_INFO).map(([type, info]) => {
                    const isSelected = documentType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setDocumentType(type)}
                        className={`group rounded-xl border-2 text-left transition-all overflow-hidden ${
                          isSelected 
                            ? 'border-[#1EB053] bg-white shadow-xl' 
                            : 'border-gray-200 hover:border-[#0072C6]/50 hover:shadow-lg'
                        }`}
                      >
                        <div className={`flex h-1 w-full ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <div className="flex-1 bg-[#1EB053]" />
                          <div className="flex-1 bg-white" />
                          <div className="flex-1 bg-[#0072C6]" />
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-bold text-sm ${isSelected ? 'text-[#0F1F3C]' : 'text-gray-800'}`}>
                              {info.label}
                            </h4>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1EB053]" />}
                          </div>
                          <p className="text-xs text-gray-600">{info.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Employees */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border-2 shadow-lg overflow-hidden">
                  <div className="flex h-1 w-full">
                    <div className="flex-1 bg-[#1EB053]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#0072C6]" />
                  </div>
                  
                  <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0072C6]/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-[#0072C6]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#0F1F3C]">Select Recipients</h4>
                          <p className="text-xs text-gray-500">{selectedEmployees.length} of {filteredActiveEmployees.length} employees selected</p>
                        </div>
                      </div>
                      <Button 
                        variant={selectedEmployees.length === filteredActiveEmployees.length ? "default" : "outline"} 
                        size="sm" 
                        onClick={handleSelectAll}
                        className={selectedEmployees.length === filteredActiveEmployees.length ? "bg-[#1EB053] hover:bg-[#178f43]" : ""}
                      >
                        {selectedEmployees.length === filteredActiveEmployees.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search employees..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(departmentFilter !== "all" || roleFilter !== "all" || employeeSearch) && (
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          <Filter className="w-3 h-3 mr-1" />
                          Filters active
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEmployeeSearch("");
                            setDepartmentFilter("all");
                            setRoleFilter("all");
                          }}
                          className="h-7 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {filteredActiveEmployees.map(emp => {
                        const isSelected = selectedEmployees.includes(emp.id);
                        return (
                          <div
                            key={emp.id}
                            onClick={() => toggleEmployee(emp.id)}
                            className={`group p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#1EB053] bg-gradient-to-br from-[#1EB053]/5 to-[#1EB053]/10 shadow-sm'
                                : 'border-gray-100 hover:border-[#0072C6]/30 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                isSelected 
                                  ? 'bg-[#1EB053] text-white' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {emp.full_name?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-[#0F1F3C] truncate">{emp.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                                <p className="text-xs text-gray-400 truncate">{emp.department}</p>
                              </div>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1EB053]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Common Variables Section */}
                {selectedTemplate?.variables?.length > 0 && selectedEmployees.length > 0 && (
                  <div className="bg-white rounded-xl border-2 shadow-lg overflow-hidden">
                    <div className="flex h-1 w-full">
                      <div className="flex-1 bg-[#1EB053]" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-[#0072C6]" />
                    </div>
                    
                    <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1EB053]/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[#1EB053]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#0F1F3C]">Common Document Details</h4>
                          <p className="text-xs text-gray-500">These values apply to all documents • Employee-specific fields auto-filled</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedTemplate.variables
                          .filter(v => !v.auto_fill || v.auto_fill !== 'employee')
                          .filter(v => !variables[v.key] || !v.auto_fill)
                          .map(v => (
                          <div key={v.key} className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">
                              {v.label}
                              {v.auto_fill && (
                                <span className="ml-2 px-1.5 py-0.5 bg-[#1EB053]/10 text-[#1EB053] rounded text-[10px]">AUTO</span>
                              )}
                            </Label>
                            {v.type === 'select' ? (
                              <Select
                                value={variables[v.key] || v.default || ''}
                                onValueChange={(val) => setVariables(prev => ({ ...prev, [v.key]: val }))}
                              >
                                <SelectTrigger className="bg-gray-50">
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
                                className="bg-gray-50"
                              />
                            ) : (
                              <Input
                                type={v.type === 'number' ? 'number' : 'text'}
                                value={variables[v.key] || ''}
                                onChange={(e) => setVariables(prev => ({ ...prev, [v.key]: e.target.value }))}
                                placeholder={v.default || ''}
                                className="bg-gray-50"
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

            {/* Step 3: Confirm & Send */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-[#1EB053]/10 to-[#1EB053]/5 rounded-xl p-4 border border-[#1EB053]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1EB053] text-white flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Document</p>
                        <p className="font-semibold text-[#0F1F3C] text-sm">
                          {DOCUMENT_TYPE_INFO[documentType]?.label || 'Custom'}
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
                        <p className="font-semibold text-[#0F1F3C] text-sm">{selectedEmployees.length} Employees</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-semibold text-[#0F1F3C] text-sm">Ready to Send</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipients List */}
                <div className="bg-white rounded-xl border-2 shadow-lg overflow-hidden">
                  <div className="flex h-1 w-full">
                    <div className="flex-1 bg-[#1EB053]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#0072C6]" />
                  </div>
                  
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
                    <h4 className="font-semibold text-[#0F1F3C]">Document Recipients ({selectedEmployees.length})</h4>
                  </div>
                  
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {selectedEmployees.map(empId => {
                        const emp = employees.find(e => e.id === empId);
                        return (
                          <div key={empId} className="flex items-center gap-2 p-2 rounded-lg bg-[#1EB053]/5 border border-[#1EB053]/20">
                            <div className="w-8 h-8 rounded-full bg-[#1EB053] text-white flex items-center justify-center text-xs font-bold">
                              {emp.full_name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{emp.full_name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{emp.position}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* What's Next */}
                <div className="bg-white border-2 border-[#0072C6]/20 rounded-xl overflow-hidden shadow-lg">
                  <div className="flex h-1 w-full">
                    <div className="flex-1 bg-[#1EB053]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#0072C6]" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#0072C6]/5 to-[#1EB053]/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0072C6] to-[#1EB053] text-white flex items-center justify-center">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F1F3C] mb-3">What happens when you send?</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                            <span>Documents sent to {selectedEmployees.length} employee(s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                            <span>Email notifications sent</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                            <span>Employee-specific data auto-populated</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-[#1EB053]" />
                            <span>Version control enabled</span>
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

        {/* Footer */}
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
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !documentType) || (step === 2 && selectedEmployees.length === 0)}
                className="bg-gradient-to-r from-[#0072C6] to-[#0F1F3C] hover:from-[#0062a6] hover:to-[#0a1529] shadow-lg"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreateDocuments}
                disabled={sending || createDocumentsMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#0062a6] shadow-lg"
              >
                {(sending || createDocumentsMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending to {selectedEmployees.length} employee(s)...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {selectedEmployees.length} Document(s)
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