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
  Upload as UploadIcon
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";

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

  const categoryColors = {
    expense: "bg-red-100 text-red-700",
    revenue: "bg-green-100 text-green-700",
    production: "bg-blue-100 text-blue-700",
    inventory: "bg-purple-100 text-purple-700",
    payroll: "bg-amber-100 text-amber-700",
    hr_document: "bg-cyan-100 text-cyan-700",
    contract: "bg-indigo-100 text-indigo-700",
    legal: "bg-pink-100 text-pink-700",
    other: "bg-gray-100 text-gray-700"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="h-1 flex -mx-6 -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#0072C6]" />
            Document Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-3">File Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{document.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{((document.file_size || 0) / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{document.file_type || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <Badge className={categoryColors[document.category] || categoryColors.other}>
                  {document.category || 'other'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-bold text-[#0072C6]">v{document.current_version || 1}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Add a description..."
              className="mb-2"
            />
            {newDescription !== (document.description || "") && (
              <Button size="sm" onClick={updateDescription}>
                Save Description
              </Button>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(document.tags || []).map((tag, idx) => (
                <Badge key={idx} className="bg-[#1EB053] text-white gap-1 pl-3 pr-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:bg-white/20 rounded p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Linked Records */}
          {document.linked_records && document.linked_records.length > 0 && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Linked Records ({document.linked_records.length})
              </h3>
              <div className="space-y-2">
                {document.linked_records.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {record.entity_type}
                      </Badge>
                      <span className="text-sm font-medium">{record.entity_name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {record.created_date ? format(new Date(record.created_date), 'MMM d, HH:mm') : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.open(document.file_url, '_blank')}
              className="flex-1"
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
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <div className="relative flex-1">
              <input
                type="file"
                accept=".pdf,.csv,.png,.jpg,.jpeg,.xlsx,.xls"
                onChange={handleNewVersion}
                className="hidden"
                id={`new-version-${document.id}`}
                disabled={uploadingNewVersion}
              />
              <label htmlFor={`new-version-${document.id}`} className="w-full">
                <Button variant="outline" className="w-full" disabled={uploadingNewVersion}>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  {uploadingNewVersion ? 'Uploading...' : 'New Version'}
                </Button>
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}