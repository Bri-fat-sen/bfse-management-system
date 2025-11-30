import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  FileText, Plus, Search, Filter, Eye, Send, CheckCircle2, 
  XCircle, Clock, AlertCircle, Download, Mail, Users, 
  FileSignature, Loader2, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import { DOCUMENT_TYPES, getDocumentTypeLabel } from "@/components/documents/DocumentTemplates";
import CreateDocumentDialog from "@/components/documents/CreateDocumentDialog";
import DocumentViewer from "@/components/documents/DocumentViewer";
import BulkDocumentDialog from "@/components/documents/BulkDocumentDialog";
import TemplateManager from "@/components/documents/TemplateManager";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: FileText },
  pending_signature: { label: "Pending Signature", color: "bg-amber-100 text-amber-700", icon: Clock },
  signed: { label: "Signed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
  superseded: { label: "Superseded", color: "bg-blue-100 text-blue-700", icon: FileText }
};

export default function EmployeeDocumentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employees[0];
  const orgId = currentEmployee?.organisation_id;
  const isAdmin = ['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role);

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const currentOrg = organisation?.[0];

  const { data: allEmployees = [] } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId && isAdmin,
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['employeeDocuments', orgId, currentEmployee?.id],
    queryFn: async () => {
      if (isAdmin) {
        return base44.entities.EmployeeDocument.filter({ organisation_id: orgId });
      } else {
        return base44.entities.EmployeeDocument.filter({ employee_id: currentEmployee?.id });
      }
    },
    enabled: !!orgId && !!currentEmployee?.id,
  });

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (search) {
        const searchLower = search.toLowerCase();
        if (!doc.title?.toLowerCase().includes(searchLower) &&
            !doc.employee_name?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      if (statusFilter !== "all" && doc.status !== statusFilter) return false;
      if (typeFilter !== "all" && doc.document_type !== typeFilter) return false;
      return true;
    });
  }, [documents, search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending_signature').length,
    signed: documents.filter(d => d.status === 'signed').length,
    draft: documents.filter(d => d.status === 'draft').length
  }), [documents]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Documents"
        subtitle="Manage employment contracts, policies, and agreements"
        icon={FileText}
        actions={
          isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTemplateManager(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Document
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Single Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBulkDialog(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Documents
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Documents</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending Signature</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
            <div className="text-sm text-gray-500">Signed</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents or employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1EB053]" />
            Documents ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredDocuments.map(doc => {
                  const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#1EB053]" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doc.employee_name}</span>
                            <span>•</span>
                            <span>{getDocumentTypeLabel(doc.document_type)}</span>
                            {doc.issued_at && (
                              <>
                                <span>•</span>
                                <span>{format(new Date(doc.issued_at), 'MMM d, yyyy')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {doc.status === 'signed' && doc.email_sent && (
                          <Mail className="w-4 h-4 text-green-500" />
                        )}
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateDocumentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        orgId={orgId}
        organisation={currentOrg}
        employees={allEmployees}
        currentEmployee={currentEmployee}
      />

      <BulkDocumentDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
        orgId={orgId}
        organisation={currentOrg}
        employees={allEmployees}
        currentEmployee={currentEmployee}
      />

      <DocumentViewer
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        orgId={orgId}
        organisation={currentOrg}
        currentEmployee={currentEmployee}
        isAdmin={isAdmin}
      />

      <TemplateManager
        open={showTemplateManager}
        onOpenChange={setShowTemplateManager}
        orgId={orgId}
      />
    </div>
  );
}