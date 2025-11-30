import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  FileText, Plus, Search, MoreVertical, Edit, Copy, Trash2,
  Lock, Users, Shield, FileSignature, Eye, Monitor, Heart,
  AlertTriangle, Calendar, Home, TrendingUp, XCircle, DollarSign,
  Settings, CheckCircle2, Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { DOCUMENT_TYPE_INFO, DEFAULT_TEMPLATES } from "./DocumentTemplates";
import TemplateEditorDialog from "./TemplateEditorDialog";

const TEMPLATE_CATEGORIES = [
  { value: "employment", label: "Employment", icon: FileSignature },
  { value: "policy", label: "Policies", icon: Shield },
  { value: "disciplinary", label: "Disciplinary", icon: AlertTriangle },
  { value: "compensation", label: "Compensation", icon: DollarSign },
  { value: "leave", label: "Leave & Benefits", icon: Calendar },
  { value: "other", label: "Other", icon: FileText }
];

const DOCUMENT_TYPE_CATEGORY = {
  employment_contract: "employment",
  nda: "policy",
  code_of_conduct: "policy",
  privacy_policy: "policy",
  health_safety_policy: "policy",
  anti_harassment_policy: "policy",
  it_acceptable_use: "policy",
  disciplinary_policy: "disciplinary",
  leave_policy: "leave",
  remote_work_policy: "policy",
  probation_confirmation: "employment",
  promotion_letter: "compensation",
  termination_letter: "employment",
  warning_letter: "disciplinary",
  salary_revision: "compensation",
  custom: "other"
};

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "org_admin", label: "Org Admin" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "payroll_admin", label: "Payroll Admin" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "all", label: "All Roles" }
];

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

export default function TemplateManager({ orgId, currentEmployee }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [duplicatingTemplate, setDuplicatingTemplate] = useState(null);

  // Fetch custom templates
  const { data: customTemplates = [], isLoading } = useQuery({
    queryKey: ['documentTemplates', orgId],
    queryFn: () => base44.entities.DocumentTemplate.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Combine default and custom templates
  const allTemplates = useMemo(() => {
    const defaults = Object.entries(DEFAULT_TEMPLATES).map(([key, template]) => ({
      id: `default-${key}`,
      document_type: key,
      name: template.name,
      content: template.content,
      variables: template.variables,
      requires_signature: template.requires_signature !== false,
      is_system: true,
      is_active: true,
      category: DOCUMENT_TYPE_CATEGORY[key] || "other",
      allowed_roles: ["all"]
    }));

    const customs = customTemplates.map(t => ({
      ...t,
      is_system: false,
      category: t.category || DOCUMENT_TYPE_CATEGORY[t.document_type] || "other"
    }));

    return [...defaults, ...customs];
  }, [customTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(term) ||
        t.document_type?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    return filtered;
  }, [allTemplates, searchTerm, categoryFilter]);

  // Group by category
  const templatesByCategory = useMemo(() => {
    const grouped = {};
    TEMPLATE_CATEGORIES.forEach(cat => {
      grouped[cat.value] = filteredTemplates.filter(t => t.category === cat.value);
    });
    return grouped;
  }, [filteredTemplates]);

  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId) => base44.entities.DocumentTemplate.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete template", { description: error.message });
    }
  });

  const handleEdit = (template) => {
    if (template.is_system) {
      toast.error("System templates cannot be edited. You can duplicate them instead.");
      return;
    }
    setEditingTemplate(template);
    setDuplicatingTemplate(null);
    setShowEditor(true);
  };

  const handleDuplicate = (template) => {
    setDuplicatingTemplate(template);
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setDuplicatingTemplate(null);
    setShowEditor(true);
  };

  const handleDelete = (template) => {
    if (template.is_system) {
      toast.error("System templates cannot be deleted");
      return;
    }
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F1F3C]">Document Templates</h2>
          <p className="text-sm text-gray-500">Manage and customize document templates for your organization</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-[#1EB053] hover:bg-[#178f43]">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TEMPLATE_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{allTemplates.length}</p>
                <p className="text-xs text-gray-500">Total Templates</p>
              </div>
              <FileText className="w-8 h-8 text-[#1EB053]/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Object.keys(DEFAULT_TEMPLATES).length}</p>
                <p className="text-xs text-gray-500">System Templates</p>
              </div>
              <Shield className="w-8 h-8 text-[#0072C6]/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{customTemplates.length}</p>
                <p className="text-xs text-gray-500">Custom Templates</p>
              </div>
              <Sparkles className="w-8 h-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{TEMPLATE_CATEGORIES.length}</p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
              <Settings className="w-8 h-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates by Category */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-6 pr-4">
          {TEMPLATE_CATEGORIES.map(category => {
            const templates = templatesByCategory[category.value] || [];
            if (templates.length === 0 && categoryFilter !== "all") return null;
            if (templates.length === 0) return null;

            const CategoryIcon = category.icon;

            return (
              <div key={category.value}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-700">{category.label}</h3>
                  <Badge variant="outline" className="text-xs">{templates.length}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(template => {
                    const TypeIcon = DOCUMENT_ICONS[template.document_type] || FileText;
                    
                    return (
                      <Card 
                        key={template.id} 
                        className={`hover:shadow-md transition-shadow ${
                          template.is_system ? 'border-l-4 border-l-[#0072C6]' : 'border-l-4 border-l-amber-400'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                template.is_system 
                                  ? 'bg-[#0072C6]/10 text-[#0072C6]' 
                                  : 'bg-amber-100 text-amber-600'
                              }`}>
                                <TypeIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{template.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {DOCUMENT_TYPE_INFO[template.document_type]?.label || template.document_type}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {template.is_system ? (
                                    <Badge variant="outline" className="text-[10px] bg-[#0072C6]/5 text-[#0072C6] border-[#0072C6]/20">
                                      <Shield className="w-2.5 h-2.5 mr-1" />
                                      System
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                                      <Sparkles className="w-2.5 h-2.5 mr-1" />
                                      Custom
                                    </Badge>
                                  )}
                                  {template.requires_signature && (
                                    <Badge variant="outline" className="text-[10px]">
                                      <FileSignature className="w-2.5 h-2.5 mr-1" />
                                      Signature
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                {!template.is_system && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleEdit(template)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDelete(template)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Role permissions */}
                          {template.allowed_roles && template.allowed_roles.length > 0 && !template.allowed_roles.includes("all") && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Allowed Roles</p>
                              <div className="flex flex-wrap gap-1">
                                {template.allowed_roles.slice(0, 3).map(role => (
                                  <Badge key={role} variant="secondary" className="text-[10px]">
                                    {ROLE_OPTIONS.find(r => r.value === role)?.label || role}
                                  </Badge>
                                ))}
                                {template.allowed_roles.length > 3 && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    +{template.allowed_roles.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No templates found</p>
              <Button variant="outline" className="mt-4" onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Template Editor Dialog */}
      <TemplateEditorDialog
        open={showEditor}
        onOpenChange={(open) => {
          setShowEditor(open);
          if (!open) {
            setEditingTemplate(null);
            setDuplicatingTemplate(null);
          }
        }}
        template={editingTemplate}
        duplicateFrom={duplicatingTemplate}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />
    </div>
  );
}