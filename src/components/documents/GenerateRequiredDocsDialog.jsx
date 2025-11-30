import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Sparkles, FileText, Users, CheckCircle2, AlertCircle, 
  Loader2, ChevronDown, ChevronUp, Info, Scale
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DEFAULT_TEMPLATES, SL_DOCUMENT_STYLES } from "./DocumentTemplates";

// Sierra Leone required documents based on Employment Act 2023
const SL_REQUIRED_DOCUMENTS = [
  {
    type: "employment_contract",
    name: "Employment Contract",
    description: "Required by Employment Act 2023 Section 18 - Every employer must provide written contract within 6 months",
    legal_ref: "Employment Act 2023, Section 18",
    priority: "mandatory",
    icon: FileText
  },
  {
    type: "code_of_conduct",
    name: "Code of Conduct",
    description: "Establishes workplace behavior standards and disciplinary procedures",
    legal_ref: "Employment Act 2023, Section 91",
    priority: "recommended",
    icon: Scale
  },
  {
    type: "privacy_policy",
    name: "Data Privacy Policy",
    description: "Consent for collection and processing of employee personal data",
    legal_ref: "Best Practice",
    priority: "recommended",
    icon: FileText
  },
  {
    type: "health_safety_policy",
    name: "Health & Safety Policy",
    description: "Required for workplaces - occupational health and safety acknowledgment",
    legal_ref: "Factories Act & Employment Act 2023",
    priority: "mandatory",
    icon: FileText
  },
  {
    type: "anti_harassment_policy",
    name: "Anti-Harassment Policy",
    description: "Protection against discrimination per Employment Act 2023 Section 2",
    legal_ref: "Employment Act 2023, Section 2",
    priority: "mandatory",
    icon: FileText
  },
  {
    type: "leave_policy",
    name: "Leave Policy",
    description: "Outlines statutory leave entitlements per Employment Act 2023",
    legal_ref: "Employment Act 2023, Sections 44-50",
    priority: "recommended",
    icon: FileText
  },
  {
    type: "nda",
    name: "Non-Disclosure Agreement",
    description: "Protects company confidential information and trade secrets",
    legal_ref: "Common Law",
    priority: "optional",
    icon: FileText
  }
];

export default function GenerateRequiredDocsDialog({
  open,
  onOpenChange,
  employees = [],
  organisation,
  currentEmployee,
  existingDocuments = [],
  orgId
}) {
  const queryClient = useQueryClient();
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showEmployees, setShowEmployees] = useState(false);

  const activeEmployees = employees.filter(e => e.status === 'active');

  // Calculate which employees are missing which documents
  const complianceStatus = useMemo(() => {
    return activeEmployees.map(emp => {
      const empDocs = existingDocuments.filter(d => d.employee_id === emp.id);
      const missingDocs = SL_REQUIRED_DOCUMENTS.filter(reqDoc => {
        const hasDoc = empDocs.some(d => 
          d.document_type === reqDoc.type && 
          (d.status === 'signed' || d.status === 'pending_signature')
        );
        return !hasDoc;
      });
      return {
        employee: emp,
        missingDocs,
        missingMandatory: missingDocs.filter(d => d.priority === 'mandatory').length,
        isCompliant: missingDocs.filter(d => d.priority === 'mandatory').length === 0
      };
    });
  }, [activeEmployees, existingDocuments]);

  const nonCompliantEmployees = complianceStatus.filter(s => !s.isCompliant);

  const toggleDocType = (type) => {
    setSelectedDocTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const selectAllMandatory = () => {
    const mandatoryTypes = SL_REQUIRED_DOCUMENTS
      .filter(d => d.priority === 'mandatory')
      .map(d => d.type);
    setSelectedDocTypes(mandatoryTypes);
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === activeEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(activeEmployees.map(e => e.id));
    }
  };

  const selectNonCompliant = () => {
    setSelectedEmployees(nonCompliantEmployees.map(s => s.employee.id));
  };

  // Auto-fill template variables
  const fillTemplate = (template, employee) => {
    let content = template.content;
    const variables = {};

    template.variables?.forEach(v => {
      let value = v.default || '';
      
      if (v.auto_fill) {
        const [source, field] = v.auto_fill.split('.');
        if (source === 'employee' && employee[field]) {
          value = employee[field];
        } else if (source === 'organisation' && organisation?.[field]) {
          value = organisation[field];
        }
      }
      
      variables[v.key] = value;
      content = content.replace(new RegExp(`{{${v.key}}}`, 'g'), value || `[${v.label}]`);
    });

    // Add standard placeholders
    content = content.replace(/{{signature_date}}/g, '[To be signed]');
    content = content.replace(/{{digital_signature}}/g, '[Pending Signature]');
    content = content.replace(/{{issue_date}}/g, new Date().toLocaleDateString());

    return { content, variables };
  };

  const generateDocsMutation = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      setProgress(0);
      
      const totalDocs = selectedDocTypes.length * selectedEmployees.length;
      let created = 0;

      for (const empId of selectedEmployees) {
        const employee = activeEmployees.find(e => e.id === empId);
        if (!employee) continue;

        for (const docType of selectedDocTypes) {
          // Skip if document already exists
          const existing = existingDocuments.find(d => 
            d.employee_id === empId && 
            d.document_type === docType &&
            (d.status === 'signed' || d.status === 'pending_signature')
          );
          
          if (existing) {
            created++;
            setProgress((created / totalDocs) * 100);
            continue;
          }

          const template = DEFAULT_TEMPLATES[docType];
          if (!template) continue;

          const { content, variables } = fillTemplate(template, employee);
          const docInfo = SL_REQUIRED_DOCUMENTS.find(d => d.type === docType);

          await base44.entities.EmployeeDocument.create({
            organisation_id: orgId,
            employee_id: empId,
            employee_name: employee.full_name,
            employee_email: employee.email || employee.user_email,
            document_type: docType,
            title: `${docInfo?.name || template.name} - ${employee.full_name}`,
            content: content,
            variables: variables,
            status: 'pending_signature',
            requires_signature: true,
            issued_by_id: currentEmployee?.id,
            issued_by_name: currentEmployee?.full_name,
            issued_at: new Date().toISOString(),
            effective_date: new Date().toISOString().split('T')[0]
          });

          // Create notification for employee
          await base44.entities.Notification.create({
            organisation_id: orgId,
            employee_id: empId,
            type: 'document',
            title: 'Document Requires Your Signature',
            message: `Please review and sign "${docInfo?.name}" in the Documents section.`,
            priority: 'high',
            is_read: false
          });

          created++;
          setProgress((created / totalDocs) * 100);
        }
      }

      return created;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success(`Generated ${count} documents for signature`);
      setProcessing(false);
      setProgress(0);
      setSelectedDocTypes([]);
      setSelectedEmployees([]);
      onOpenChange(false);
    },
    onError: (error) => {
      setProcessing(false);
      toast.error("Failed to generate documents", { description: error.message });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1.5 w-20 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1EB053]" />
            Generate Sierra Leone Required Documents
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Quickly generate legally required HR documents for employees based on the Employment Act 2023
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Compliance Overview */}
          <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#0072C6]" />
                Compliance Overview
              </h4>
              <Badge variant={nonCompliantEmployees.length === 0 ? "default" : "destructive"}>
                {nonCompliantEmployees.length === 0 
                  ? "All Compliant" 
                  : `${nonCompliantEmployees.length} Need Attention`
                }
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {nonCompliantEmployees.length > 0 
                ? `${nonCompliantEmployees.length} employee(s) are missing mandatory documents.`
                : "All employees have the required mandatory documents."}
            </p>
          </div>

          {/* Document Types */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Select Document Types</h4>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={selectAllMandatory}
                className="text-[#1EB053]"
              >
                Select All Mandatory
              </Button>
            </div>
            <div className="space-y-2">
              {SL_REQUIRED_DOCUMENTS.map(doc => (
                <div
                  key={doc.type}
                  onClick={() => toggleDocType(doc.type)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDocTypes.includes(doc.type)
                      ? 'bg-[#1EB053]/10 border-[#1EB053]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedDocTypes.includes(doc.type)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{doc.name}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            doc.priority === 'mandatory' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : doc.priority === 'recommended'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-50 text-gray-600'
                          }
                        >
                          {doc.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                      <p className="text-xs text-[#0072C6] mt-1">📋 {doc.legal_ref}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Selection */}
          <Collapsible open={showEmployees} onOpenChange={setShowEmployees}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Select Employees ({selectedEmployees.length} selected)
                </span>
                {showEmployees ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="flex gap-2 mb-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllEmployees}
                >
                  {selectedEmployees.length === activeEmployees.length ? 'Deselect All' : 'Select All'}
                </Button>
                {nonCompliantEmployees.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={selectNonCompliant}
                    className="text-red-600"
                  >
                    Select Non-Compliant ({nonCompliantEmployees.length})
                  </Button>
                )}
              </div>
              <ScrollArea className="h-48 border rounded-lg p-2">
                <div className="space-y-2">
                  {complianceStatus.map(({ employee, missingMandatory, isCompliant }) => (
                    <div
                      key={employee.id}
                      onClick={() => toggleEmployee(employee.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedEmployees.includes(employee.id)
                          ? 'bg-[#1EB053]/10'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedEmployees.includes(employee.id)} />
                        <div>
                          <p className="font-medium text-sm">{employee.full_name}</p>
                          <p className="text-xs text-gray-500">{employee.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompliant ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Compliant
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {missingMandatory} missing
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          {/* Progress */}
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating documents...
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800">
              Documents will be pre-filled with employee information and sent for digital signature. 
              Employees will receive a notification to sign.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={() => generateDocsMutation.mutate()}
            disabled={selectedDocTypes.length === 0 || selectedEmployees.length === 0 || processing}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {selectedDocTypes.length * selectedEmployees.length} Document(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}