import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Download,
  Eye,
  Tag,
  Clock,
  User,
  Link as LinkIcon,
  X,
  Plus,
  History,
  Upload as UploadIcon,
  Sparkles,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  FileStack
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DocumentDetailsDialog({ document, open, onOpenChange, currentEmployee }) {
  const [newTag, setNewTag] = useState("");
  const [newDescription, setNewDescription] = useState(document?.description || "");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [uploadingNewVersion, setUploadingNewVersion] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      return await base44.entities.UploadedDocument.update(document.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['uploadedDocuments']);
      toast.success("Document updated");
    },
  });

  const addTag = () => {
    if (!newTag.trim()) return;
    const currentTags = document.tags || [];
    if (currentTags.includes(newTag.trim())) {
      toast.warning("Tag exists", "This tag is already added");
      return;
    }
    updateMutation.mutate({
      tags: [...currentTags, newTag.trim()]
    });
    setNewTag("");
  };

  const removeTag = (tag) => {
    const currentTags = document.tags || [];
    updateMutation.mutate({
      tags: currentTags.filter(t => t !== tag)
    });
  };

  const updateDescription = () => {
    updateMutation.mutate({ description: newDescription });
  };

  const handleNewVersion = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNewVersion(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const currentVersion = document.current_version || 1;
      const versionHistory = document.version_history || [];
      
      // Add current version to history
      versionHistory.push({
        version: currentVersion,
        file_url: document.file_url,
        uploaded_by: document.uploaded_by_id,
        uploaded_by_name: document.uploaded_by_name,
        uploaded_date: document.updated_date || document.created_date,
        notes: `Version ${currentVersion}`
      });

      await base44.entities.UploadedDocument.update(document.id, {
        file_url: file_url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        current_version: currentVersion + 1,
        version_history: versionHistory,
        uploaded_by_id: currentEmployee?.id,
        uploaded_by_name: currentEmployee?.full_name
      });

      queryClient.invalidateQueries(['uploadedDocuments']);
      toast.success("New version uploaded", `Version ${currentVersion + 1}`);
    } catch (error) {
      toast.error("Upload failed", error.message);
    } finally {
      setUploadingNewVersion(false);
    }
  };

  if (!document) return null;

  const categoryConfig = {
    expense: { color: "from-red-500 to-red-600", icon: DollarSign, label: "Expense", bg: "bg-red-50" },
    revenue: { color: "from-green-500 to-green-600", icon: TrendingUp, label: "Revenue", bg: "bg-green-50" },
    production: { color: "from-blue-500 to-blue-600", icon: Package, label: "Production", bg: "bg-blue-50" },
    inventory: { color: "from-purple-500 to-purple-600", icon: FileStack, label: "Inventory", bg: "bg-purple-50" },
    payroll: { color: "from-amber-500 to-amber-600", icon: Users, label: "Payroll", bg: "bg-amber-50" },
    hr_document: { color: "from-cyan-500 to-cyan-600", icon: Users, label: "HR Document", bg: "bg-cyan-50" },
    contract: { color: "from-indigo-500 to-indigo-600", icon: FileText, label: "Contract", bg: "bg-indigo-50" },
    legal: { color: "from-pink-500 to-pink-600", icon: FileText, label: "Legal", bg: "bg-pink-50" },
    other: { color: "from-gray-500 to-gray-600", icon: FileText, label: "Other", bg: "bg-gray-50" }
  };

  const config = categoryConfig[document?.category] || categoryConfig.other;
  const CategoryIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <div className="h-2 flex -mx-6 -mt-6">
          <div className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#16a047]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-gradient-to-r from-[#0072C6] to-[#005a9e]" />
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", config.color)}
            >
              <CategoryIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <span className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
                Document Details
              </span>
              <p className="text-sm font-normal text-gray-600 mt-1">{document?.file_name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("relative overflow-hidden rounded-2xl border-2", config.bg)}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", config.color)} />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-[#0072C6]" />
                <h3 className="font-bold text-gray-900">File Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">File Name</p>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{document.file_name}</p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Size</p>
                  <p className="font-semibold text-gray-900 text-sm">{((document.file_size || 0) / 1024).toFixed(1)} KB</p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Type</p>
                  <p className="font-semibold text-gray-900 text-sm">{document.file_type || 'Unknown'}</p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Category</p>
                  <Badge className={cn("text-xs", config.color, "text-white border-0")}>
                    {config.label}
                  </Badge>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200 col-span-2">
                  <p className="text-xs text-gray-600 mb-1">Current Version</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
                      v{document.current_version || 1}
                    </span>
                    {(document.version_history || []).length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {document.version_history.length + 1} total versions
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-100"
          >
            <label className="text-sm font-bold text-gray-900 mb-3 block flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0072C6]" />
              Description
            </label>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Add a description..."
              className="mb-3 min-h-[100px] border-2 focus:border-[#0072C6]"
            />
            {newDescription !== (document.description || "") && (
              <Button size="sm" onClick={updateDescription} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                <Plus className="w-4 h-4 mr-2" />
                Save Description
              </Button>
            )}
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-100"
          >
            <label className="text-sm font-bold text-gray-900 mb-3 block flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#1EB053]" />
              Tags & Labels
            </label>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              {(document.tags || []).length === 0 ? (
                <p className="text-sm text-gray-400 italic">No tags yet. Add tags to organize your documents.</p>
              ) : (
                (document.tags || []).map((tag, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Badge className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white gap-2 pl-3 pr-2 py-1.5">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="border-2 focus:border-[#0072C6]"
              />
              <Button onClick={addTag} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] px-6">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Linked Records */}
          {document.linked_records && document.linked_records.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1EB053] to-[#0072C6] opacity-5" />
              <div className="relative p-6">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[#1EB053]" />
                  Linked Records
                  <Badge className="bg-[#1EB053] text-white ml-auto">
                    {document.linked_records.length} record{document.linked_records.length !== 1 ? 's' : ''}
                  </Badge>
                </h3>
                <div className="grid gap-3">
                  {document.linked_records.map((record, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white/80 backdrop-blur rounded-xl border border-green-200 hover:border-green-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">
                            {record.entity_type}
                          </Badge>
                          <p className="text-sm font-semibold text-gray-900">{record.entity_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {record.created_date ? format(new Date(record.created_date), 'MMM d, yyyy') : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {record.created_date ? format(new Date(record.created_date), 'HH:mm') : ''}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Extracted Data Summary */}
          {document.extracted_data && (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
              <h3 className="font-bold text-amber-900 mb-3">Extraction Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {document.extracted_data.total_items && (
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">Items Extracted</p>
                    <p className="text-xl font-bold text-amber-700">{document.extracted_data.total_items}</p>
                  </div>
                )}
                {document.extracted_data.total_amount && (
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-amber-700">Le {document.extracted_data.total_amount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Version History */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="mb-3"
            >
              <History className="w-4 h-4 mr-2" />
              {showVersionHistory ? 'Hide' : 'Show'} Version History ({(document.version_history || []).length})
            </Button>

            {showVersionHistory && document.version_history && document.version_history.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {document.version_history.map((version, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">Version {version.version}</span>
                      <span className="text-xs text-gray-500">
                        {version.uploaded_date ? format(new Date(version.uploaded_date), 'MMM d, yyyy HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Uploaded by: {version.uploaded_by_name || 'Unknown'}
                    </p>
                    {version.notes && (
                      <p className="text-xs text-gray-700 italic">{version.notes}</p>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(version.file_url, '_blank')}
                      className="mt-2 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Metadata */}
          <div className="p-4 bg-gray-50 rounded-xl border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Uploaded By
                </p>
                <p className="font-medium">{document.uploaded_by_name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Upload Date
                </p>
                <p className="font-medium">
                  {document.created_date ? format(new Date(document.created_date), 'MMM d, yyyy HH:mm') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="sticky bottom-0 bg-white/95 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-100 shadow-xl"
          >
            <div className="h-1 flex rounded-full overflow-hidden mb-4">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(document.file_url, '_blank')}
                className="h-12 border-2 hover:border-[#0072C6] hover:text-[#0072C6] transition-all"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const a = window.document.createElement('a');
                  a.href = document.file_url;
                  a.download = document.file_name;
                  a.click();
                }}
                className="h-12 border-2 hover:border-[#1EB053] hover:text-[#1EB053] transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.csv,.png,.jpg,.jpeg,.xlsx,.xls"
                  onChange={handleNewVersion}
                  className="hidden"
                  id={`new-version-${document.id}`}
                  disabled={uploadingNewVersion}
                />
                <label htmlFor={`new-version-${document.id}`} className="w-full block">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white border-0 hover:opacity-90" 
                    disabled={uploadingNewVersion}
                  >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    {uploadingNewVersion ? 'Uploading...' : 'New Version'}
                  </Button>
                </label>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}