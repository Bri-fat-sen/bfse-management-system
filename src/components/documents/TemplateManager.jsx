import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Plus, Edit, Trash2, Save, Loader2, Copy } from "lucide-react";
import { DOCUMENT_TYPES, DEFAULT_TEMPLATES, getDocumentTypeLabel } from "./DocumentTemplates";

export default function TemplateManager({ open, onOpenChange, orgId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("custom");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const { data: customTemplates = [], isLoading } = useQuery({
    queryKey: ['documentTemplates', orgId],
    queryFn: () => base44.entities.DocumentTemplate.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      toast.success("Template created successfully");
      setShowEditor(false);
      setEditingTemplate(null);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DocumentTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      toast.success("Template updated successfully");
      setShowEditor(false);
      setEditingTemplate(null);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.DocumentTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      toast.success("Template deleted");
    }
  });

  const handleCopyDefault = (type) => {
    const defaultTemplate = DEFAULT_TEMPLATES[type];
    if (defaultTemplate) {
      setEditingTemplate({
        document_type: type,
        name: `Custom - ${defaultTemplate.name}`,
        content: defaultTemplate.content,
        placeholders: defaultTemplate.placeholders,
        requires_signature: true,
        is_active: true,
        is_default: false
      });
      setShowEditor(true);
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    const data = {
      ...editingTemplate,
      organisation_id: orgId
    };

    if (editingTemplate.id) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

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
            Document Templates
          </DialogTitle>
        </DialogHeader>

        {showEditor ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select 
                  value={editingTemplate?.document_type || ""} 
                  onValueChange={(v) => setEditingTemplate(prev => ({ ...prev, document_type: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Template Name</Label>
                <Input
                  value={editingTemplate?.name || ""}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Template Content (Markdown)</Label>
              <p className="text-xs text-gray-500 mb-1">
                Use {"{{placeholder_name}}"} for dynamic content. E.g. {"{{employee_name}}"}, {"{{company_name}}"}
              </p>
              <Textarea
                value={editingTemplate?.content || ""}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                className="mt-1 font-mono text-sm"
                rows={15}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingTemplate?.is_active ?? true}
                    onCheckedChange={(v) => setEditingTemplate(prev => ({ ...prev, is_active: v }))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingTemplate?.requires_signature ?? true}
                    onCheckedChange={(v) => setEditingTemplate(prev => ({ ...prev, requires_signature: v }))}
                  />
                  <Label>Requires Signature</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingTemplate?.is_default ?? false}
                    onCheckedChange={(v) => setEditingTemplate(prev => ({ ...prev, is_default: v }))}
                  />
                  <Label>Set as Default</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowEditor(false); setEditingTemplate(null); }}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                className="bg-[#1EB053] hover:bg-[#178f43]"
              >
                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Template
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Templates</TabsTrigger>
              <TabsTrigger value="default">Default Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  Create and manage your organization's custom document templates
                </p>
                <Button onClick={() => { setEditingTemplate({}); setShowEditor(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                {customTemplates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No custom templates yet</p>
                    <p className="text-sm">Create one or copy from default templates</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customTemplates.map(template => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{getDocumentTypeLabel(template.document_type)}</Badge>
                            {template.is_default && <Badge className="bg-[#1EB053]">Default</Badge>}
                            {!template.is_active && <Badge variant="secondary">Inactive</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingTemplate(template); setShowEditor(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="default" className="mt-4">
              <p className="text-sm text-gray-500 mb-4">
                Sierra Leone compliant document templates. Copy to customize for your organization.
              </p>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {Object.entries(DEFAULT_TEMPLATES).map(([type, template]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{getDocumentTypeLabel(type)}</Badge>
                          <Badge variant="secondary">System Template</Badge>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => handleCopyDefault(type)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy & Customize
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}