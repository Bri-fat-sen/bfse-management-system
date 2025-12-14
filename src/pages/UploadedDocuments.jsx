import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  Tag,
  Link as LinkIcon,
  Archive,
  TrendingUp,
  Grid3x3,
  List,
  Sparkles,
  FolderOpen,
  Upload
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import DocumentDetailsDialog from "@/components/documents/DocumentDetailsDialog";
import EmptyState from "@/components/ui/EmptyState";

export default function UploadedDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
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

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['uploadedDocuments', orgId],
    queryFn: () => base44.entities.UploadedDocument.filter({ organisation_id: orgId }, '-created_date'),
    enabled: !!orgId,
  });

  const allTags = useMemo(() => {
    const tags = new Set();
    documents.forEach(doc => (doc.tags || []).forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => showArchived ? doc.is_archived : !doc.is_archived)
      .filter(doc => categoryFilter === "all" || doc.category === categoryFilter)
      .filter(doc => !tagFilter || (doc.tags || []).includes(tagFilter))
      .filter(doc => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          doc.file_name?.toLowerCase().includes(search) ||
          doc.description?.toLowerCase().includes(search) ||
          (doc.tags || []).some(tag => tag.toLowerCase().includes(search))
        );
      });
  }, [documents, showArchived, categoryFilter, tagFilter, searchTerm]);

  const categoryColors = {
    expense: "from-red-500 to-rose-600",
    revenue: "from-[#1EB053] to-emerald-600",
    production: "from-[#0072C6] to-blue-600",
    inventory: "from-purple-500 to-purple-600",
    payroll: "from-amber-500 to-orange-600",
    hr_document: "from-cyan-500 to-teal-600",
    contract: "from-indigo-500 to-indigo-600",
    legal: "from-pink-500 to-rose-600",
    other: "from-gray-500 to-gray-600"
  };

  const categoryIcons = {
    expense: "💸",
    revenue: "💰",
    production: "🏭",
    inventory: "📦",
    payroll: "💼",
    hr_document: "👥",
    contract: "📄",
    legal: "⚖️",
    other: "📁"
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#1EB053] border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Modern Hero Header */}
      <div className="relative bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        
        <div className="relative px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] rounded-3xl blur-xl opacity-50"></div>
                  <div className="relative p-5 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-3xl shadow-2xl">
                    <Archive className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-black mb-2">Document Archive</h1>
                  <p className="text-blue-200 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Intelligent document management with AI insights
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowArchived(!showArchived)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
              >
                <Archive className="w-4 h-4 mr-2" />
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{documents.filter(d => !d.is_archived).length}</p>
                    <p className="text-sm text-blue-200">Total Files</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <LinkIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">
                      {documents.reduce((sum, d) => sum + (d.linked_records?.length || 0), 0)}
                    </p>
                    <p className="text-sm text-blue-200">Linked Records</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Tag className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{allTags.length}</p>
                    <p className="text-sm text-blue-200">Unique Tags</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">
                      {Math.round((documents.filter(d => d.linked_records?.length > 0).length / (documents.length || 1)) * 100)}%
                    </p>
                    <p className="text-sm text-blue-200">Linked Rate</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Sierra Leone Stripe */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#0072C6]"></div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                placeholder="Search documents, tags, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-14 text-base border-2 border-gray-200 focus:border-[#1EB053] rounded-2xl shadow-sm"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-64 h-14 border-2 border-gray-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="expense">💸 Expense</SelectItem>
                <SelectItem value="revenue">💰 Revenue</SelectItem>
                <SelectItem value="production">🏭 Production</SelectItem>
                <SelectItem value="inventory">📦 Inventory</SelectItem>
                <SelectItem value="payroll">💼 Payroll</SelectItem>
                <SelectItem value="hr_document">👥 HR Document</SelectItem>
                <SelectItem value="contract">📄 Contract</SelectItem>
                <SelectItem value="legal">⚖️ Legal</SelectItem>
                <SelectItem value="other">📁 Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className={`px-6 ${viewMode === "grid" ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-lg" : ""}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className={`px-6 ${viewMode === "list" ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-lg" : ""}`}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Filter by Tag:
              </p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {allTags.slice(0, 15).map((tag) => (
                    <motion.button
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setTagFilter(tagFilter === tag ? "" : tag)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        tagFilter === tag
                          ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Documents Display */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-lg border p-16"
          >
            <EmptyState
              Icon={FolderOpen}
              title="No documents found"
              description={searchTerm || categoryFilter !== "all" || tagFilter ? "Try adjusting your filters" : "Upload documents to get started"}
            />
          </motion.div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedDocument(doc)}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
                >
                  <div className={`h-2 bg-gradient-to-r ${categoryColors[doc.category] || categoryColors.other}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 bg-gradient-to-br ${categoryColors[doc.category] || categoryColors.other} rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform`}>
                        <span className="text-3xl">{categoryIcons[doc.category] || "📄"}</span>
                      </div>
                      <Badge className="bg-gray-900 text-white border-0 shadow-md text-xs px-3 py-1">
                        v{doc.current_version || 1}
                      </Badge>
                    </div>

                    <h3 className="font-black text-gray-900 mb-2 line-clamp-2 text-lg group-hover:text-[#0072C6] transition-colors">
                      {doc.file_name}
                    </h3>

                    {doc.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {doc.description}
                      </p>
                    )}

                    {(doc.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(doc.tags || []).slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} className="text-xs bg-gray-100 text-gray-700 border-0 font-medium">
                            {tag}
                          </Badge>
                        ))}
                        {(doc.tags || []).length > 3 && (
                          <Badge className="text-xs bg-gray-100 text-gray-700 border-0">
                            +{(doc.tags || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500 truncate max-w-[60%]">
                        {doc.uploaded_by_name || 'Unknown'}
                      </div>
                      {doc.linked_records && doc.linked_records.length > 0 && (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#1EB053]">
                          <LinkIcon className="w-4 h-4" />
                          {doc.linked_records.length}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      {doc.created_date ? format(new Date(doc.created_date), 'MMM d, yyyy') : '-'}
                    </p>
                  </div>

                  <div className="h-1 flex">
                    <div className="flex-1 bg-[#1EB053]"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-[#0072C6]"></div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0F1F3C] to-[#1a3a5e] text-white">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">Document</th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">Category</th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">Linked</th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">Date</th>
                    <th className="px-6 py-5 text-right text-sm font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocuments.map((doc, index) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-green-50/50 cursor-pointer group transition-all"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 bg-gradient-to-br ${categoryColors[doc.category] || categoryColors.other} rounded-2xl shadow-md group-hover:scale-110 transition-transform`}>
                            <span className="text-2xl">{categoryIcons[doc.category] || "📄"}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-[#0072C6] transition-colors text-base">
                              {doc.file_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {((doc.file_size || 0) / 1024).toFixed(1)} KB • v{doc.current_version || 1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={`bg-gradient-to-r ${categoryColors[doc.category] || categoryColors.other} text-white border-0 shadow-md font-semibold`}>
                          {doc.category || 'other'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {(doc.tags || []).slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} className="text-xs bg-gray-100 text-gray-700 border-0 font-medium">
                              {tag}
                            </Badge>
                          ))}
                          {(doc.tags || []).length > 3 && (
                            <Badge className="text-xs bg-gray-100 text-gray-700 border-0">
                              +{(doc.tags || []).length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {doc.linked_records && doc.linked_records.length > 0 ? (
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#1EB053]/20 to-[#0072C6]/20 rounded-xl">
                            <LinkIcon className="w-4 h-4 text-[#1EB053]" />
                            <span className="text-sm font-black text-gray-900">{doc.linked_records.length}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No links</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{doc.uploaded_by_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.created_date ? format(new Date(doc.created_date), 'MMM d, yyyy') : '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.file_url, '_blank');
                            }}
                            className="bg-gradient-to-r from-[#0072C6] to-blue-600 hover:from-blue-600 hover:to-[#0072C6] text-white border-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const a = document.createElement('a');
                              a.href = doc.file_url;
                              a.download = doc.file_name;
                              a.click();
                            }}
                            className="bg-gradient-to-r from-[#1EB053] to-emerald-600 hover:from-emerald-600 hover:to-[#1EB053] text-white border-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <DocumentDetailsDialog
        document={selectedDocument}
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
        currentEmployee={currentEmployee}
      />
    </div>
  );
}