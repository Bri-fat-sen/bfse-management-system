import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText, Plus, Trash2, Loader2, Save, Eye, Code,
  Variable, Settings, Users, GripVertical, Sparkles
} from "lucide-react";
import { DOCUMENT_TYPE_INFO, SL_DOCUMENT_STYLES } from "./DocumentTemplates";

const TEMPLATE_CATEGORIES = [
  { value: "employment", label: "Employment" },
  { value: "policy", label: "Policies" },
  { value: "disciplinary", label: "Disciplinary" },
  { value: "compensation", label: "Compensation" },
  { value: "leave", label: "Leave & Benefits" },
  { value: "other", label: "Other" }
];

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "org_admin", label: "Org Admin" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "payroll_admin", label: "Payroll Admin" },
  { value: "warehouse_manager", label: "Warehouse Manager" }
];

const VARIABLE_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" }
];

const AUTO_FILL_OPTIONS = [
  { value: "", label: "Manual Entry" },
  { value: "employee.full_name", label: "Employee Name" },
  { value: "employee.position", label: "Employee Position" },
  { value: "employee.department", label: "Employee Department" },
  { value: "employee.base_salary", label: "Employee Salary" },
  { value: "employee.hire_date", label: "Employee Hire Date" },
  { value: "employee.user_email", label: "Employee Email" },
  { value: "employee.address", label: "Employee Address" },
  { value: "employee.phone", label: "Employee Phone" },
  { value: "employee.employee_code", label: "Employee Code" },
  { value: "employee.assigned_location_name", label: "Work Location" },
  { value: "organisation.name", label: "Company Name" },
  { value: "organisation.address", label: "Company Address" },
  { value: "organisation.phone", label: "Company Phone" },
  { value: "organisation.email", label: "Company Email" },
  { value: "organisation.business_registration_number", label: "Business Reg. No." },
  { value: "organisation.tin_number", label: "TIN Number" },
  { value: "organisation.nassit_number", label: "NASSIT Number" },
  { value: "today", label: "Today's Date" },
  { value: "auto", label: "Auto-Generate" }
];

export default function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  duplicateFrom,
  orgId,
  currentEmployee
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  
  const [formData, setFormData] = useState({
    name: "",
    document_type: "custom",
    category: "other",
    content: "",
    requires_signature: true,
    is_active: true,
    allowed_roles: [],
    variables: []
  });

  const [previewContent, setPreviewContent] = useState("");

  // Initialize form when template/duplicateFrom changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        document_type: template.document_type || "custom",
        category: template.category || "other",
        content: template.content || "",
        requires_signature: template.requires_signature !== false,
        is_active: template.is_active !== false,
        allowed_roles: template.allowed_roles || [],
        variables: template.variables || []
      });
    } else if (duplicateFrom) {
      setFormData({
        name: `${duplicateFrom.name} (Copy)`,
        document_type: duplicateFrom.document_type || "custom",
        category: duplicateFrom.category || "other",
        content: duplicateFrom.content || "",
        requires_signature: duplicateFrom.requires_signature !== false,
        is_active: true,
        allowed_roles: duplicateFrom.allowed_roles || [],
        variables: duplicateFrom.variables || []
      });
    } else {
      setFormData({
        name: "",
        document_type: "custom",
        category: "other",
        content: getDefaultContent(),
        requires_signature: true,
        is_active: true,
        allowed_roles: [],
        variables: []
      });
    }
    setActiveTab("details");
  }, [template, duplicateFrom, open]);

  // Update preview
  useEffect(() => {
    let content = formData.content;
    formData.variables.forEach(v => {
      content = content.replace(
        new RegExp(`{{${v.key}}}`, 'g'),
        v.default || `[${v.label}]`
      );
    });
    setPreviewContent(content);
  }, [formData.content, formData.variables]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentTemplate.create({
      ...data,
      organisation_id: orgId,
      last_updated_by: currentEmployee?.full_name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      toast.success("Template created successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to create template", { description: error.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentTemplate.update(template.id, {
      ...data,
      last_updated_by: currentEmployee?.full_name,
      version: (template.version || 1) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      toast.success("Template updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update template", { description: error.message });
    }
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Template content is required");
      return;
    }

    const data = {
      name: formData.name,
      document_type: formData.document_type,
      category: formData.category,
      content: formData.content,
      requires_signature: formData.requires_signature,
      is_active: formData.is_active,
      allowed_roles: formData.allowed_roles.length > 0 ? formData.allowed_roles : ["all"],
      variables: formData.variables
    };

    if (template && !duplicateFrom) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        {
          key: `variable_${prev.variables.length + 1}`,
          label: "New Variable",
          type: "text",
          auto_fill: "",
          default: "",
          options: []
        }
      ]
    }));
  };

  const updateVariable = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => i === index ? { ...v, ...updates } : v)
    }));
  };

  const removeVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      allowed_roles: prev.allowed_roles.includes(role)
        ? prev.allowed_roles.filter(r => r !== role)
        : [...prev.allowed_roles, role]
    }));
  };

  const isEditing = !!template && !duplicateFrom;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#0F1F3C] to-[#1a3a6e]">
          <DialogTitle className="text-white flex items-center gap-2">
            {isEditing ? (
              <>
                <FileText className="w-5 h-5" />
                Edit Template
              </>
            ) : duplicateFrom ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-400" />
                Duplicate Template
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create New Template
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="details" className="gap-2">
                <Settings className="w-4 h-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <Code className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="variables" className="gap-2">
                <Variable className="w-4 h-4" />
                Variables
                {formData.variables.length > 0 && (
                  <Badge className="ml-1 h-5 px-1.5">{formData.variables.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="permissions" className="gap-2">
                <Users className="w-4 h-4" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="details" className="m-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Standard Employment Contract"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, document_type: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOCUMENT_TYPE_INFO).map(([key, info]) => (
                          <SelectItem key={key} value={key}>{info.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                      <Label>Requires Signature</Label>
                      <Switch
                        checked={formData.requires_signature}
                        onCheckedChange={(val) => setFormData(prev => ({ ...prev, requires_signature: val }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Active</Label>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(val) => setFormData(prev => ({ ...prev, is_active: val }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="m-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Template Content (HTML)</Label>
                    <p className="text-xs text-gray-500">
                      Use {"{{variable_name}}"} for dynamic fields
                    </p>
                  </div>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter HTML content with {{variables}}..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Use the provided CSS classes like <code className="bg-blue-100 px-1 rounded">sl-document</code>, 
                    <code className="bg-blue-100 px-1 rounded">sl-header</code>, <code className="bg-blue-100 px-1 rounded">sl-section</code> for consistent styling.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="variables" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Template Variables</h3>
                    <p className="text-sm text-gray-500">Define variables that can be filled when creating documents</p>
                  </div>
                  <Button onClick={addVariable} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </div>

                {formData.variables.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Variable className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No variables defined</p>
                    <Button onClick={addVariable} variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Variable
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.variables.map((variable, index) => (
                      <Card key={index} className="p-4 border">
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-4 h-4 text-gray-400 mt-2 cursor-move" />
                          <div className="flex-1 grid grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Key</Label>
                              <Input
                                value={variable.key}
                                onChange={(e) => updateVariable(index, { key: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                                placeholder="variable_key"
                                className="font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Label</Label>
                              <Input
                                value={variable.label}
                                onChange={(e) => updateVariable(index, { label: e.target.value })}
                                placeholder="Display Label"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Type</Label>
                              <Select
                                value={variable.type}
                                onValueChange={(val) => updateVariable(index, { type: val })}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {VARIABLE_TYPES.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Auto-Fill</Label>
                              <Select
                                value={variable.auto_fill || ""}
                                onValueChange={(val) => updateVariable(index, { auto_fill: val })}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Manual" />
                                </SelectTrigger>
                                <SelectContent>
                                  {AUTO_FILL_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariable(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {variable.type === "select" && (
                          <div className="mt-3 ml-7">
                            <Label className="text-xs">Options (comma-separated)</Label>
                            <Input
                              value={(variable.options || []).join(", ")}
                              onChange={(e) => updateVariable(index, { 
                                options: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                              })}
                              placeholder="Option 1, Option 2, Option 3"
                              className="mt-1"
                            />
                          </div>
                        )}
                        <div className="mt-3 ml-7">
                          <Label className="text-xs">Default Value</Label>
                          <Input
                            value={variable.default || ""}
                            onChange={(e) => updateVariable(index, { default: e.target.value })}
                            placeholder="Default value"
                            className="mt-1"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="permissions" className="m-0 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Role Permissions</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select which roles can use this template. Leave empty for all roles.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ROLE_OPTIONS.map(role => (
                    <div
                      key={role.value}
                      onClick={() => toggleRole(role.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.allowed_roles.includes(role.value)
                          ? 'border-[#1EB053] bg-[#1EB053]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          formData.allowed_roles.includes(role.value)
                            ? 'bg-[#1EB053] text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{role.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.allowed_roles.length === 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      No roles selected — this template will be available to all roles.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="m-0">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-medium">Full Document Preview</p>
                    <Badge className="bg-green-100 text-green-700 border-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                  <ScrollArea className="h-[500px] bg-gray-50">
                    <div className="p-6">
                      <style dangerouslySetInnerHTML={{ __html: SL_DOCUMENT_STYLES }} />
                      <div 
                        className="bg-white shadow-lg rounded-lg mx-auto"
                        style={{ maxWidth: '700px' }}
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                      />
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#1EB053] hover:bg-[#178f43]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update Template" : "Create Template"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultContent() {
  return `<div class="sl-document">
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>Document Title</h1>
    <p class="sl-subtitle">{{company_name}}</p>
  </div>

  <div class="sl-section">
    <h2>Section Title</h2>
    <p>Document content goes here. Use {{variable_name}} for dynamic fields.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read and understood this document.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <p>{{company_name}} • 🇸🇱 Sierra Leone</p>
  </div>
</div>`;
}