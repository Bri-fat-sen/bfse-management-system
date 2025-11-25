import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const DOCUMENT_TYPES = [
  { value: "contract", label: "Employment Contract" },
  { value: "id_card", label: "ID Card" },
  { value: "passport", label: "Passport" },
  { value: "certificate", label: "Certificate" },
  { value: "resume", label: "Resume/CV" },
  { value: "medical", label: "Medical Record" },
  { value: "other", label: "Other" },
];

export default function EmployeeDocuments({ 
  open, 
  onOpenChange, 
  employee,
  currentEmployee,
  orgId 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    document_type: "other",
    title: "",
    description: "",
    expiry_date: "",
    file: null,
    file_url: ""
  });

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
      resetUploadForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmployeeDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast({ title: "Document deleted" });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }) => base44.entities.EmployeeDocument.update(id, { is_verified: verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments'] });
      toast({ title: "Document verification updated" });
    },
  });

  const resetUploadForm = () => {
    setUploadForm({
      document_type: "other",
      title: "",
      description: "",
      expiry_date: "",
      file: null,
      file_url: ""
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadForm(prev => ({ 
        ...prev, 
        file_url, 
        file_name: file.name,
        title: prev.title || file.name.split('.')[0]
      }));
      toast({ title: "File uploaded" });
    } catch (error) {
      toast({ title: "Failed to upload file", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    
    if (!uploadForm.file_url) {
      toast({ title: "Please upload a file", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      organisation_id: orgId,
      employee_id: employee.id,
      employee_name: employee.full_name || `${employee.first_name} ${employee.last_name}`,
      document_type: uploadForm.document_type,
      title: uploadForm.title,
      description: uploadForm.description,
      file_url: uploadForm.file_url,
      file_name: uploadForm.file_name,
      expiry_date: uploadForm.expiry_date || null,
      uploaded_by: currentEmployee.id,
      uploaded_by_name: currentEmployee.full_name || `${currentEmployee.first_name} ${currentEmployee.last_name}`,
      is_verified: false
    });
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const daysUntil = differenceInDays(new Date(expiryDate), new Date());
    if (daysUntil < 0) return { status: "expired", color: "destructive" };
    if (daysUntil <= 30) return { status: "expiring", color: "warning" };
    return { status: "valid", color: "success" };
  };

  const canManageDocuments = ['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center justify-between">
            <span>Documents - {employee?.full_name || `${employee?.first_name} ${employee?.last_name}`}</span>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No documents uploaded yet</p>
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const expiryStatus = getExpiryStatus(doc.expiry_date);
              return (
                <Card key={doc.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[#0072C6]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium truncate">{doc.title}</p>
                            {doc.is_verified && (
                              <Badge className="bg-green-500 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              Uploaded {format(new Date(doc.created_date), 'PP')}
                            </span>
                            {expiryStatus && (
                              <Badge variant={expiryStatus.color === 'destructive' ? 'destructive' : 'outline'} className="text-xs">
                                {expiryStatus.status === 'expired' ? (
                                  <><AlertTriangle className="w-3 h-3 mr-1" /> Expired</>
                                ) : expiryStatus.status === 'expiring' ? (
                                  <><Clock className="w-3 h-3 mr-1" /> Expiring Soon</>
                                ) : null}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.file_url;
                            link.download = doc.file_name || doc.title;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {canManageDocuments && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => verifyMutation.mutate({ id: doc.id, verified: !doc.is_verified })}
                            >
                              <CheckCircle className={`w-4 h-4 ${doc.is_verified ? 'text-green-500' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => deleteMutation.mutate(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select 
                value={uploadForm.document_type} 
                onValueChange={(val) => setUploadForm(prev => ({ ...prev, document_type: val }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input 
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label>Expiry Date (Optional)</Label>
              <Input 
                type="date"
                value={uploadForm.expiry_date}
                onChange={(e) => setUploadForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>File</Label>
              {uploadForm.file_url ? (
                <div className="mt-1 p-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg flex items-center justify-between border border-[#1EB053]/20">
                  <span className="text-sm text-[#1EB053] truncate">{uploadForm.file_name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setUploadForm(prev => ({ ...prev, file_url: "", file_name: "" }))}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="mt-1 flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#1EB053] hover:bg-[#1EB053]/5 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {uploading ? "Uploading..." : "Click to select file"}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg"
                disabled={createMutation.isPending || !uploadForm.file_url}
              >
                Upload Document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}