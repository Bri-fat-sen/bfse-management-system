import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Edit, Copy, Eye, Code, Variable, Shield,
  Sparkles, FileSignature, Users, CheckCircle2
} from "lucide-react";
import { DOCUMENT_TYPE_INFO, SL_DOCUMENT_STYLES } from "./DocumentTemplates";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  org_admin: "Org Admin",
  hr_admin: "HR Admin",
  payroll_admin: "Payroll Admin",
  warehouse_manager: "Warehouse Manager",
  all: "All Roles"
};

export default function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
  onEdit,
  onDuplicate
}) {
  const previewContent = useMemo(() => {
    if (!template) return "";
    let content = template.content || "";
    (template.variables || []).forEach(v => {
      content = content.replace(
        new RegExp(`{{${v.key}}}`, 'g'),
        v.default || `[${v.label || v.key}]`
      );
    });
    return content;
  }, [template]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#0F1F3C] to-[#1a3a6e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                template.is_system 
                  ? 'bg-[#0072C6]/20 text-white' 
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">{template.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={template.is_system 
                    ? "bg-[#0072C6]/30 text-[#0072C6] border-0" 
                    : "bg-amber-500/30 text-amber-300 border-0"
                  }>
                    {template.is_system ? (
                      <><Shield className="w-3 h-3 mr-1" /> System Template</>
                    ) : (
                      <><Sparkles className="w-3 h-3 mr-1" /> Custom Template</>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-white/70 border-white/20">
                    {DOCUMENT_TYPE_INFO[template.document_type]?.label || template.document_type}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-3 border-b bg-gray-50">
            <TabsList>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="variables" className="gap-2">
                <Variable className="w-4 h-4" />
                Variables
                {template.variables?.length > 0 && (
                  <Badge className="ml-1 h-5 px-1.5 bg-gray-200 text-gray-700">{template.variables.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <FileText className="w-4 h-4" />
                Details
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="preview" className="m-0 p-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">Document Preview</p>
                  <Badge variant="outline" className="text-xs">Live Preview</Badge>
                </div>
                <div className="bg-gray-50 p-6 max-h-[500px] overflow-auto">
                  <style dangerouslySetInnerHTML={{ __html: SL_DOCUMENT_STYLES }} />
                  <div 
                    className="bg-white shadow-lg rounded-lg mx-auto"
                    style={{ maxWidth: '700px', transform: 'scale(0.85)', transformOrigin: 'top center' }}
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variables" className="m-0 p-6">
              {template.variables?.length > 0 ? (
                <div className="space-y-3">
                  {template.variables.map((variable, index) => (
                    <div key={index} className="p-4 bg-gray-50 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{variable.label}</p>
                          <code className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {`{{${variable.key}}}`}
                          </code>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs capitalize">
                            {variable.type}
                          </Badge>
                          {variable.auto_fill && (
                            <Badge className="ml-2 text-xs bg-[#1EB053]/10 text-[#1EB053] border-0">
                              Auto-fill
                            </Badge>
                          )}
                        </div>
                      </div>
                      {variable.auto_fill && (
                        <p className="text-xs text-gray-500 mt-2">
                          Auto-fills from: <code className="bg-gray-200 px-1 rounded">{variable.auto_fill}</code>
                        </p>
                      )}
                      {variable.default && (
                        <p className="text-xs text-gray-500 mt-1">
                          Default: {variable.default}
                        </p>
                      )}
                      {variable.type === "select" && variable.options?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {variable.options.map((opt, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{opt}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Variable className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No variables defined for this template</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="m-0 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Template Name</label>
                    <p className="font-medium mt-1">{template.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Document Type</label>
                    <p className="font-medium mt-1">{DOCUMENT_TYPE_INFO[template.document_type]?.label || template.document_type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                    <p className="font-medium mt-1 capitalize">{template.category || "Other"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requires Signature</label>
                    <p className="font-medium mt-1 flex items-center gap-2">
                      {template.requires_signature !== false ? (
                        <><CheckCircle2 className="w-4 h-4 text-green-600" /> Yes</>
                      ) : (
                        <>No</>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="font-medium mt-1">
                      <Badge className={template.is_active !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {template.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Allowed Roles</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(!template.allowed_roles || template.allowed_roles.length === 0 || template.allowed_roles.includes("all")) ? (
                        <Badge variant="outline">All Roles</Badge>
                      ) : (
                        template.allowed_roles.map(role => (
                          <Badge key={role} variant="outline">{ROLE_LABELS[role] || role}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={() => { onDuplicate(); onOpenChange(false); }}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          {!template.is_system && (
            <Button onClick={() => { onEdit(); onOpenChange(false); }} className="bg-[#1EB053] hover:bg-[#178f43]">
              <Edit className="w-4 h-4 mr-2" />
              Edit Template
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}