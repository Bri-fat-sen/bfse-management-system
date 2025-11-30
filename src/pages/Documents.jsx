import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
        FileText, Plus, Search, Filter, MoreVertical, 
        Eye, Send, Trash2, Clock, CheckCircle2, XCircle,
        AlertCircle, Download, Mail, Users, FileCheck,
        FilePlus, Settings, Bell, Loader2, LayoutTemplate, Sparkles
      } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CreateDocumentDialog from "@/components/documents/CreateDocumentDialog";
import DocumentSignatureDialog from "@/components/documents/DocumentSignatureDialog";
import DocumentViewer from "@/components/documents/DocumentViewer";
import { DOCUMENT_TYPE_INFO, DEFAULT_TEMPLATES } from "@/components/documents/DocumentTemplates";
import TemplateManager from "@/components/documents/TemplateManager";
import AIDocumentAssistant from "@/components/documents/AIDocumentAssistant";


const STATUS_CONFIG = {
  draft: { label: "Draft", icon: Clock, color: "bg-gray-100 text-gray-800", dotColor: "bg-gray-400" },
  pending_signature: { label: "Pending", icon: AlertCircle, color: "bg-amber-100 text-amber-800", dotColor: "bg-amber-500" },
  signed: { label: "Signed", icon: CheckCircle2, color: "bg-green-100 text-green-800", dotColor: "bg-green-500" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-100 text-red-800", dotColor: "bg-red-500" },
  expired: { label: "Expired", icon: Clock, color: "bg-gray-100 text-gray-600", dotColor: "bg-gray-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-gray-100 text-gray-600", dotColor: "bg-gray-400" }
};

export default function Documents() {
  const queryClient = useQueryClient();
  const [mainView, setMainView] = useState("documents"); // "documents" or "templates"
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Fetch current user and employee
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

  // Fetch organisation
  const { data: organisations = [] } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const organisation = organisations[0];

  // Fetch all employees for admin - always fetch if org exists
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Check employee role OR base44 admin role (for users without employee record yet)
  // Moved AFTER all hooks to avoid conditional hook issues
  const isAdmin = ['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role) || user?.role === 'admin';

  // Fetch documents - for admins without employee record, fetch all org docs
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['employeeDocuments', orgId, currentEmployee?.id, isAdmin],
    queryFn: async () => {
      if (['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role) || user?.role === 'admin') {
        return base44.entities.EmployeeDocument.filter({ organisation_id: orgId });
      } else if (currentEmployee?.id) {
        return base44.entities.EmployeeDocument.filter({ employee_id: currentEmployee?.id });
      }
      return [];
    },
    enabled: !!orgId,
  });

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter(d => d.employee_id === currentEmployee?.id && d.status === 'pending_signature');
    } else if (activeTab === "signed") {
      filtered = filtered.filter(d => d.status === 'signed');
    } else if (activeTab === "sent" && isAdmin) {
      filtered = filtered.filter(d => d.issued_by_id === currentEmployee?.id);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.title?.toLowerCase().includes(term) ||
        d.employee_name?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(d => d.document_type === typeFilter);
    }

    return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [documents, activeTab, searchTerm, statusFilter, typeFilter, currentEmployee?.id, isAdmin]);

  // My pending documents
  const myPendingDocs = documents.filter(d => 
    d.employee_id === currentEmployee?.id && d.status === 'pending_signature'
  );

  // Stats
  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending_signature').length,
    signed: documents.filter(d => d.status === 'signed').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  }), [documents]);

  const sendReminderMutation = useMutation({
    mutationFn: async (doc) => {
      await base44.entities.Notification.create({
        organisation_id: orgId,
        employee_id: doc.employee_id,
        type: 'document',
        title: 'Document Reminder',
        message: `Please sign "${doc.title}" at your earliest convenience.`,
        priority: 'high',
        is_read: false
      });

      await base44.entities.EmployeeDocument.update(doc.id, {
        reminder_count: (doc.reminder_count || 0) + 1,
        last_reminder_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Reminder sent");
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (docId) => base44.entities.EmployeeDocument.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Document deleted");
    }
  });

  const revertDocumentMutation = useMutation({
    mutationFn: async ({ document, targetVersion }) => {
      // Save current version to history before reverting
      const currentVersionEntry = {
        version: document.version || 1,
        content: document.content,
        variables: document.variables,
        status: document.status,
        updated_by_id: currentEmployee?.id,
        updated_by_name: currentEmployee?.full_name,
        updated_at: new Date().toISOString(),
        change_reason: `Reverted to version ${targetVersion.version}`
      };

      const existingHistory = document.version_history || [];
      
      return base44.entities.EmployeeDocument.update(document.id, {
        content: targetVersion.content,
        variables: targetVersion.variables,
        version: (document.version || 1) + 1,
        version_history: [currentVersionEntry, ...existingHistory]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast.success("Document reverted successfully");
      setShowViewer(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast.error("Failed to revert document", { description: error.message });
    }
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
                title="HR Documents"
                subtitle="Manage employment contracts, policies, and other HR documents"
                action={() => setShowCreateDialog(true)}
                actionLabel="Create Document"
              >
                {isAdmin && (
                  <Button 
                    onClick={() => setShowAIAssistant(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 mr-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                )}
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant={mainView === "documents" ? "default" : "outline"}
              size="sm"
              onClick={() => setMainView("documents")}
              className={mainView === "documents" ? "bg-[#0F1F3C]" : ""}
            >
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </Button>
            <Button
              variant={mainView === "templates" ? "default" : "outline"}
              size="sm"
              onClick={() => setMainView("templates")}
              className={mainView === "templates" ? "bg-[#0F1F3C]" : ""}
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>
        )}
      </PageHeader>

      {mainView === "templates" && isAdmin ? (
        <TemplateManager orgId={orgId} currentEmployee={currentEmployee} />
      ) : (
        <>

      {/* Pending documents alert */}
      {myPendingDocs.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    You have {myPendingDocs.length} document(s) awaiting your signature
                  </p>
                  <p className="text-sm text-amber-700">
                    Please review and sign these documents
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
                onClick={() => setActiveTab("pending")}
              >
                View Pending
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending Signature</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.signed}</p>
                <p className="text-xs text-gray-500">Signed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                My Pending
                {myPendingDocs.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                    {myPendingDocs.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="signed">Signed</TabsTrigger>
              {isAdmin && <TabsTrigger value="sent">Sent by Me</TabsTrigger>}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
                {Object.entries(DOCUMENT_TYPE_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>{info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents table */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const statusConfig = STATUS_CONFIG[doc.status];
                    const StatusIcon = statusConfig?.icon || Clock;
                    const typeInfo = DOCUMENT_TYPE_INFO[doc.document_type] || {};
                    const isPendingForMe = doc.employee_id === currentEmployee?.id && doc.status === 'pending_signature';

                    return (
                      <TableRow key={doc.id} className={isPendingForMe ? 'bg-amber-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isPendingForMe ? 'bg-amber-100' : 'bg-gray-100'
                            }`}>
                              <FileText className={`w-5 h-5 ${isPendingForMe ? 'text-amber-600' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-gray-500">{typeInfo.label || doc.document_type}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{doc.employee_name}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig?.label}
                          </Badge>
                          {doc.signed_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(doc.signed_at), 'MMM d, yyyy')}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{format(new Date(doc.created_date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-gray-500">by {doc.issued_by_name}</p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedDocument(doc);
                                setShowViewer(true);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              
                              {isPendingForMe && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedDocument(doc);
                                  setShowSignDialog(true);
                                }}>
                                  <FileCheck className="w-4 h-4 mr-2" />
                                  Sign Document
                                </DropdownMenuItem>
                              )}
                              
                              {isAdmin && doc.status === 'pending_signature' && (
                                <DropdownMenuItem onClick={() => sendReminderMutation.mutate(doc)}>
                                  <Bell className="w-4 h-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                              )}
                              
                              {isAdmin && doc.status === 'draft' && (
                                <DropdownMenuItem 
                                  onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                              
                              {currentEmployee?.role === 'super_admin' && doc.status === 'rejected' && (
                                <DropdownMenuItem 
                                  onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </>
      )}

      {/* Dialogs */}
      <CreateDocumentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        employees={allEmployees}
        organisation={organisation}
        currentEmployee={currentEmployee}
        orgId={orgId}
      />

      <AIDocumentAssistant
        open={showAIAssistant}
        onOpenChange={setShowAIAssistant}
        templates={allTemplates}
        employees={allEmployees}
        organisation={organisation}
        currentEmployee={currentEmployee}
        orgId={orgId}
        onDocumentCreated={() => queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] })}
      />



      {selectedDocument && (
        <>
          <DocumentSignatureDialog
            open={showSignDialog}
            onOpenChange={setShowSignDialog}
            document={selectedDocument}
            employee={currentEmployee}
            organisation={organisation}
            onSigned={() => setSelectedDocument(null)}
          />

          {showViewer && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-semibold">Document Viewer</h2>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowViewer(false);
                    setSelectedDocument(null);
                  }}>
                    Close
                  </Button>
                </div>
                <DocumentViewer 
                  document={selectedDocument}
                  onRevert={(targetVersion) => revertDocumentMutation.mutate({ 
                    document: selectedDocument, 
                    targetVersion 
                  })}
                  isReverting={revertDocumentMutation.isPending}
                  canRevert={isAdmin && selectedDocument?.status !== 'signed'}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}