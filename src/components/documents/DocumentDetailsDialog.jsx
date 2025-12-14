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
  Upload,
  Sparkles,
  TrendingUp,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

export default function DocumentDetailsDialog({ document, open, onOpenChange, currentEmployee }) {
  const [newTag, setNewTag] = useState("");
  const [newDescription, setNewDescription] = useState(document?.description || "");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [uploadingNewVersion, setUploadingNewVersion] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (document) {
      setNewDescription(document.description || "");
    }
  }, [document]);

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      return await base44.entities.UploadedDocument.update(document.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['uploadedDocuments']);
      toast.success("Document updated", "Changes saved successfully");
    },
    onError: (error) => {
      toast.error("Update failed", error.message);
    }
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
    if (newDescription !== (document.description || "")) {
      updateMutation.mutate({ description: newDescription });
    }
  };

  const handleNewVersion = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNewVersion(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const currentVersion = document.current_version || 1;
      const versionHistory = document.version_history || [];
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        {/* Sierra Leone Stripe Header */}
        <div className="h-2 flex -mx-6 -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-gradient-to-br ${categoryColors[document.category] || categoryColors.other} rounded-2xl shadow-xl`}>
              <span className="text-4xl">{categoryIcons[document.category] || "📄"}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-black bg-gradient-to-r from-[#0F1F3C] to-[#0072C6] bg-clip-text text-transparent">
                Document Details
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Complete document information and version history
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* File Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white"
          >
            <div className={`h-1 bg-gradient-to-r ${categoryColors[document.category] || categoryColors.other}`} />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#0072C6]" />
                <h3 className="font-black text-gray-900">File Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{document.file_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Size</p>
                    <p className="font-semibold text-gray-900">{((document.file_size || 0) / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Type</p>
                    <p className="font-semibold text-gray-900">{document.file_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Version</p>
                    <Badge className={`bg-gradient-to-r ${categoryColors[document.category] || categoryColors.other} text-white border-0 font-black text-base px-4 py-1`}>
                      v{document.current_version || 1}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-6"
          >
            <label className="text-sm font-black text-gray-900 mb-3 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Add a detailed description..."
              className="min-h-[100px] border-2 border-gray-200 rounded-2xl"
            />
            {newDescription !== (document.description || "") && (
              <Button 
                size="sm" 
                onClick={updateDescription} 
                className="mt-3 bg-gradient-to-r from-[#1EB053] to-emerald-600 hover:from-emerald-600 hover:to-[#1EB053] text-white border-0"
              >
                Save Description
              </Button>
            )}
          </motion.div>

          {/* Tags Manager */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-6"
          >
            <label className="text-sm font-black text-gray-900 mb-3 block flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              <AnimatePresence>
                {(document.tags || []).map((tag, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white border-0 gap-2 pl-3 pr-2 py-1.5 font-semibold">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="border-2 border-gray-200 rounded-xl"
              />
              <Button 
                onClick={addTag} 
                className="bg-gradient-to-r from-[#0072C6] to-blue-600 hover:from-blue-600 hover:to-[#0072C6] text-white border-0 px-6"
              >
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
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-6"
            >
              <h3 className="font-black text-green-900 mb-4 flex items-center gap-2 text-lg">
                <LinkIcon className="w-5 h-5" />
                Linked Records ({document.linked_records.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {document.linked_records.map((record, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-green-100"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs font-bold">
                        {record.entity_type}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900">{record.entity_name}</span>
                    </div>
                    {record.created_date && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(record.created_date), 'MMM d')}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Version History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Version History ({(document.version_history || []).length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                {showVersionHistory ? 'Hide' : 'Show'}
              </Button>
            </div>

            <AnimatePresence>
              {showVersionHistory && document.version_history && document.version_history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {document.version_history.map((version, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-gray-900 text-white border-0 font-black">
                          Version {version.version}
                        </Badge>
                        {version.uploaded_date && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(version.uploaded_date), 'MMM d, yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {version.uploaded_by_name || 'Unknown'}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(version.file_url, '_blank')}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Upload Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 p-6"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <User className="w-5 h-5 text-[#0072C6]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1">Uploaded By</p>
                  <p className="font-semibold text-gray-900">{document.uploaded_by_name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Clock className="w-5 h-5 text-[#0072C6]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1">Upload Date</p>
                  <p className="font-semibold text-gray-900">
                    {document.created_date ? format(new Date(document.created_date), 'MMM d, yyyy HH:mm') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <Button
              onClick={() => window.open(document.file_url, '_blank')}
              className="flex-1 bg-gradient-to-r from-[#0072C6] to-blue-600 hover:from-blue-600 hover:to-[#0072C6] text-white border-0 h-12 text-base font-bold"
            >
              <Eye className="w-5 h-5 mr-2" />
              View Document
            </Button>
            <Button
              onClick={() => {
                const a = document.createElement('a');
                a.href = document.file_url;
                a.download = document.file_name;
                a.click();
              }}
              className="flex-1 bg-gradient-to-r from-[#1EB053] to-emerald-600 hover:from-emerald-600 hover:to-[#1EB053] text-white border-0 h-12 text-base font-bold"
            >
              <Download className="w-5 h-5 mr-2" />
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
              <label htmlFor={`new-version-${document.id}`}>
                <Button
                  as="span"
                  disabled={uploadingNewVersion}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-500 text-white border-0 h-12 px-6 font-bold cursor-pointer"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {uploadingNewVersion ? 'Uploading...' : 'New Version'}
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Stripe */}
        <div className="h-2 flex -mx-6 -mb-6 mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}