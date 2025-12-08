import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  FileText, Search, MoreVertical, Eye, Trash2, Download,
  Upload, FolderOpen, Filter, Calendar, User, Tag, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const CATEGORY_CONFIG = {
  expense: { label: "Expense", color: "bg-red-100 text-red-800", icon: "💸" },
  revenue: { label: "Revenue", color: "bg-green-100 text-green-800", icon: "💰" },
  contract: { label: "Contract", color: "bg-blue-100 text-blue-800", icon: "📄" },
  invoice: { label: "Invoice", color: "bg-purple-100 text-purple-800", icon: "🧾" },
  receipt: { label: "Receipt", color: "bg-amber-100 text-amber-800", icon: "🧾" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800", icon: "📎" }
};

export default function UploadedDocuments() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

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

  // Fetch uploaded documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['uploadedDocuments', orgId],
    queryFn: () => base44.entities.UploadedDocument.filter({ organisation_id: orgId }, '-created_date'),
    enabled: !!orgId,
  });

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.file_name?.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        d.uploaded_by_name?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === "today") {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(d => new Date(d.created_date) >= filterDate);
    }

    return filtered;
  }, [documents, searchTerm, categoryFilter, dateFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: documents.length,
    byCategory: Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
      acc[cat] = documents.filter(d => d.category === cat).length;
      return acc;
    }, {}),
    thisMonth: documents.filter(d => {
      const docDate = new Date(d.created_date);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }).length
  }), [documents]);

  const deleteDocumentMutation = useMutation({
    mutationFn: (docId) => base44.entities.UploadedDocument.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploadedDocuments'] });
      toast.success("Document deleted successfully");
    }
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📕';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    return '📄';
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  return (
    <div className="space-y-6">
      {/* Sierra Leone Flag Stripe */}
      <div className="flex h-1.5 w-full rounded-full overflow-hidden shadow-sm">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <PageHeader
        title="Uploaded Documents Archive"
        subtitle="All uploaded documents and files for record keeping"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="overflow-hidden shadow-md border-0">
          <div className="flex h-1 w-full">
            <div className="flex-1 bg-[#0072C6]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0F1F3C]" />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0072C6] to-[#0F1F3C] flex items-center justify-center shadow-md">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1F3C]">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden shadow-md border-0">
          <div className="flex h-1 w-full">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#15803d]" />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#15803d] flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1F3C]">{stats.thisMonth}</p>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden shadow-md border-0">
          <div className="flex h-1 w-full">
            <div className="flex-1 bg-red-400" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-red-600" />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1F3C]">{stats.byCategory.expense || 0}</p>
                <p className="text-xs text-gray-500">Expense Docs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden shadow-md border-0">
          <div className="flex h-1 w-full">
            <div className="flex-1 bg-green-400" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-green-600" />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F1F3C]">{stats.byCategory.revenue || 0}</p>
                <p className="text-xs text-gray-500">Revenue Docs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="flex h-1 w-full">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        
        <CardHeader className="px-4 sm:px-6 bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by filename, description, uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 sm:px-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Upload className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">
                Uploaded documents will appear here for record keeping
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="sm:hidden space-y-3">
                {filteredDocuments.map((doc) => {
                  const categoryConfig = CATEGORY_CONFIG[doc.category] || CATEGORY_CONFIG.other;
                  return (
                    <div key={doc.id} className="p-4 border-2 rounded-xl shadow-sm bg-white">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-3xl">{getFileIcon(doc.file_name)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.file_name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <Badge className={`${categoryConfig.color} text-xs`}>
                          {categoryConfig.icon} {categoryConfig.label}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDocToDelete(doc);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          <User className="w-3 h-3 inline mr-1" />
                          {doc.uploaded_by_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(doc.created_date), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const categoryConfig = CATEGORY_CONFIG[doc.category] || CATEGORY_CONFIG.other;
                      return (
                        <TableRow key={doc.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{getFileIcon(doc.file_name)}</div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{doc.file_name}</p>
                                {doc.description && (
                                  <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                                )}
                                {doc.tags?.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {doc.tags.slice(0, 3).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px] px-1 py-0">
                                        <Tag className="w-2 h-2 mr-0.5" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={categoryConfig.color}>
                              {categoryConfig.icon} {categoryConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{doc.uploaded_by_name}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{format(new Date(doc.created_date), 'MMM d, yyyy')}</p>
                            <p className="text-xs text-gray-500">{format(new Date(doc.created_date), 'HH:mm')}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-600">{formatFileSize(doc.file_size)}</p>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(doc.file_url, '_blank')}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = doc.file_url;
                                  a.download = doc.file_name;
                                  a.click();
                                }}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                {doc.file_url && (
                                  <DropdownMenuItem onClick={() => {
                                    navigator.clipboard.writeText(doc.file_url);
                                    toast.success("URL copied to clipboard");
                                  }}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Copy URL
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setDocToDelete(doc);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bottom Stripe */}
      <div className="flex h-1.5 w-full rounded-full overflow-hidden shadow-sm">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Document"
        description={`Are you sure you want to delete "${docToDelete?.file_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (docToDelete) {
            deleteDocumentMutation.mutate(docToDelete.id);
            setDocToDelete(null);
          }
        }}
        isLoading={deleteDocumentMutation.isPending}
      />
    </div>
  );
}