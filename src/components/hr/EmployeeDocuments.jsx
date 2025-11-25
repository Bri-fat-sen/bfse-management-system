import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  AlertTriangle,
  Plus,
  Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";

const DOCUMENT_TYPES = [
  { value: "id_card", label: "ID Card", icon: "🪪" },
  { value: "passport", label: "Passport", icon: "📕" },
  { value: "contract", label: "Employment Contract", icon: "📋" },
  { value: "certificate", label: "Certificate", icon: "📜" },
  { value: "resume", label: "Resume/CV", icon: "📄" },
  { value: "medical", label: "Medical Document", icon: "🏥" },
  { value: "other", label: "Other", icon: "📁" },
];

export default function EmployeeDocuments({ employee, currentEmployee, orgId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "other",
    document_name: "",
    expiry_date: "",
    notes: "",
  });
  const [fileUrl, setFileUrl] = useState("");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['employeeDocuments', employee?.id],
    queryFn: () => base44.entities.EmployeeDocument.filter({ employee_id: employee?.id }),
    enabled: !!employee?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmployeeDocument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast({ title: "Document uploaded successfully" });
      setShowUploadDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmployeeDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast({ title: "Document deleted" });
    },
  });

  const resetForm = () => {
    setFormData({ document_type: "other", document_name: "", expiry_date: "", notes: "" });
    setFileUrl("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);
    if (!formData.document_name) {
      setFormData({ ...formData, document_name: file.name });
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileUrl) {
      toast({ title: "Please upload a file", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      organisation_id: orgId,
      employee_id: employee.id,
      employee_name: employee.full_name || `${employee.first_name} ${employee.last_name}`,
      document_type: formData.document_type,
      document_name: formData.document_name,
      file_url: fileUrl,
      expiry_date: formData.expiry_date || null,
      notes: formData.notes,
      uploaded_by: currentEmployee.id,
    });
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return { status: "expired", color: "bg-red-100 text-red-700" };
    if (daysLeft <= 30) return { status: "expiring", color: "bg-amber-100 text-amber-700" };
    return { status: "valid", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Documents</h3>
        <Button size="sm" onClick={() => setShowUploadDialog(true)} className="bg-[#1EB053] hover:bg-green-600">
          <Plus className="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No documents uploaded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const docType = DOCUMENT_TYPES.find(t => t.value === doc.document_type);
            const expiry = getExpiryStatus(doc.expiry_date);
            return (
              <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{docType?.icon || "📁"}</span>
                      <div>
                        <p className="font-medium text-sm">{doc.document_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {docType?.label || doc.document_type}
                          </Badge>
                          {expiry && (
                            <Badge className={`text-xs ${expiry.color}`}>
                              {expiry.status === "expired" ? "Expired" : 
                               expiry.status === "expiring" ? "Expiring Soon" : "Valid"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => deleteMutation.mutate(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select 
                value={formData.document_type} 
                onValueChange={(v) => setFormData({ ...formData, document_type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Document Name</Label>
              <Input
                value={formData.document_name}
                onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                placeholder="e.g., National ID Card"
                className="mt-1"
              />
            </div>

            <div>
              <Label>File</Label>
              <Input type="file" onChange={handleFileUpload} disabled={uploading} className="mt-1" />
              {fileUrl && <p className="text-xs text-green-600 mt-1">File uploaded successfully</p>}
            </div>

            <div>
              <Label>Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#1EB053] hover:bg-green-600"
                disabled={!fileUrl || !formData.document_name || createMutation.isPending}
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}