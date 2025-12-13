import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Search,
  Calendar,
  User,
  Package,
  DollarSign,
  Truck,
  Clock,
  FileUp,
  Filter,
  Eye,
  Tag,
  Link as LinkIcon,
  Archive,
  TrendingUp,
  FileBox
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import DocumentDetailsDialog from "@/components/documents/DocumentDetailsDialog";
import { motion } from "framer-motion";

export default function UploadedDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch uploaded documents
  const { data: uploadedDocuments = [], isLoading } = useQuery({
    queryKey: ['uploadedDocuments', orgId],
    queryFn: () => base44.entities.UploadedDocument.filter({ organisation_id: orgId }, '-created_date'),
    enabled: !!orgId,
  });

  if (!user || isLoading) {
    return <LoadingSpinner message="Loading documents..." fullScreen={true} />;
  }

  const allTags = useMemo(() => {
    const tags = new Set();
    uploadedDocuments.forEach(doc => {
      (doc.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [uploadedDocuments]);

  const filteredDocuments = useMemo(() => {
    return uploadedDocuments
      .filter(doc => showArchived ? doc.is_archived : !doc.is_archived)
      .filter(doc => typeFilter === "all" || doc.category === typeFilter)
      .filter(doc => tagFilter === "all" || (doc.tags || []).includes(tagFilter))
      .filter(doc => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          doc.file_name?.toLowerCase().includes(search) ||
          doc.description?.toLowerCase().includes(search) ||
          (doc.tags || []).some(tag => tag.toLowerCase().includes(search))
        );
      });
  }, [uploadedDocuments, showArchived, typeFilter, tagFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = uploadedDocuments.filter(d => !d.is_archived).length;
    const byCategory = {};
    uploadedDocuments.forEach(doc => {
      if (doc.is_archived) return;
      byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
    });
    const totalSize = uploadedDocuments.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
    const withExtraction = uploadedDocuments.filter(d => d.extracted_data && !d.is_archived).length;
    return { total, byCategory, totalSize, withExtraction };
  }, [uploadedDocuments]);

  const categoryIcons = {
    expense: DollarSign,
    revenue: TrendingUp,
    production: Package,
    inventory: FileBox,
    payroll: User,
    hr_document: FileText,
    contract: FileText,
    legal: FileText,
    other: FileText
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-2xl blur opacity-30" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-xl">
              <FileUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
              Document Archive
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage uploaded documents with version control</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="w-4 h-4 mr-2" />
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-[#0072C6]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0072C6]">{stats.total}</p>
                </div>
                <FileText className="w-10 h-10 text-[#0072C6] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-[#1EB053]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Extracted</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#1EB053]">{stats.withExtraction}</p>
                </div>
                <FileBox className="w-10 h-10 text-[#1EB053] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Storage</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {(stats.totalSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Package className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Categories</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">{Object.keys(stats.byCategory).length}</p>
                </div>
                <Filter className="w-10 h-10 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="expense">💰 Expenses</SelectItem>
                <SelectItem value="revenue">📈 Revenue</SelectItem>
                <SelectItem value="production">🏭 Production</SelectItem>
                <SelectItem value="inventory">📦 Inventory</SelectItem>
                <SelectItem value="payroll">👥 Payroll</SelectItem>
                <SelectItem value="hr_document">📄 HR Documents</SelectItem>
                <SelectItem value="contract">📋 Contracts</SelectItem>
                <SelectItem value="legal">⚖️ Legal</SelectItem>
                <SelectItem value="other">📁 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {allTags.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Filter by Tag:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`cursor-pointer ${tagFilter === 'all' ? 'bg-[#0072C6] text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setTagFilter('all')}
                >
                  All
                </Badge>
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    className={`cursor-pointer ${tagFilter === tag ? 'bg-[#1EB053] text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setTagFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documents ({filteredDocuments.length})</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredDocuments.length !== stats.total && `${stats.total} total`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Documents Found"
              description={searchTerm || typeFilter !== "all" || tagFilter !== "all" ? 
                "No documents match the current filters" : 
                "Upload your first document to get started"}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Tags</TableHead>
                    <TableHead className="hidden md:table-cell">Records</TableHead>
                    <TableHead className="hidden md:table-cell">Version</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc, idx) => {
                    const Icon = categoryIcons[doc.category] || FileText;
                    const recordCount = doc.linked_records?.length || 0;
                    return (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border">
                            <Icon className="w-5 h-5 text-[#0072C6]" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{doc.file_name}</p>
                            {doc.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              {((doc.file_size || 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            doc.category === 'expense' ? 'bg-red-100 text-red-700' :
                            doc.category === 'revenue' ? 'bg-green-100 text-green-700' :
                            doc.category === 'production' ? 'bg-blue-100 text-blue-700' :
                            doc.category === 'inventory' ? 'bg-purple-100 text-purple-700' :
                            doc.category === 'payroll' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {doc.category || 'other'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(doc.tags || []).slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(doc.tags || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(doc.tags || []).length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {recordCount > 0 ? (
                            <Badge className="bg-[#1EB053] text-white">
                              <LinkIcon className="w-3 h-3 mr-1" />
                              {recordCount}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs font-mono">v{doc.current_version || 1}</span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {doc.created_date ? format(new Date(doc.created_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentDetailsDialog
        document={selectedDocument}
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
        currentEmployee={currentEmployee}
      />
    </div>
  );
}