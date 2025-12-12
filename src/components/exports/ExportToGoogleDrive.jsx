import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Cloud, Loader2, FileSpreadsheet, CheckCircle2, FolderPlus, Upload } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/Toast";

export default function ExportToGoogleDrive({ 
  open, 
  onOpenChange, 
  data, 
  fileName, 
  orgId,
  dataType = "records" // sales, expenses, inventory, etc.
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [customFileName, setCustomFileName] = useState(fileName || `${dataType}_export_${format(new Date(), 'yyyy-MM-dd')}`);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [driveFileLink, setDriveFileLink] = useState(null);
  const [driveFolderId, setDriveFolderId] = useState(null);

  const convertToCSV = (records) => {
    if (!records || records.length === 0) return "";
    
    const headers = Object.keys(records[0]);
    const csvRows = [
      headers.join(','),
      ...records.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast.error("No Data", "Nothing to export");
      return;
    }

    setUploading(true);
    try {
      // Convert to CSV
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const base64Content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });

      toast.info("Uploading to Drive...", "Creating your export file");

      // Get or create folder
      let folderId = driveFolderId;
      if (!folderId) {
        const rootResponse = await base44.functions.invoke('googleDriveManager', {
          action: 'getRootFolder'
        });
        
        if (rootResponse.data?.success) {
          // Try to create an "Exports" folder
          const folderResponse = await base44.functions.invoke('googleDriveManager', {
            action: 'createFolder',
            fileName: 'Business Exports',
            folderId: rootResponse.data.folder.id
          });
          
          if (folderResponse.data?.success) {
            folderId = folderResponse.data.folderId;
            setDriveFolderId(folderId);
          } else {
            folderId = rootResponse.data.folder.id;
          }
        }
      }

      // Upload to Drive
      const uploadResponse = await base44.functions.invoke('googleDriveManager', {
        action: 'uploadFile',
        folderId: folderId,
        fileName: `${customFileName}.csv`,
        fileContent: base64Content,
        mimeType: 'text/csv'
      });

      if (uploadResponse.data?.success) {
        setDriveFileLink(uploadResponse.data.webViewLink);
        setUploadComplete(true);
        toast.success("Export Complete", `${data.length} records uploaded to Drive`);
      } else {
        throw new Error(uploadResponse.data?.error || "Upload failed");
      }

    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setUploadComplete(false);
    setDriveFileLink(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="h-1 flex -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Export to Google Drive
          </DialogTitle>
        </DialogHeader>

        {!uploadComplete ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm text-blue-900">Ready to Export</p>
                  <p className="text-xs text-blue-700">{data?.length || 0} records as CSV</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">File Name</Label>
              <Input
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="Enter file name..."
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">Will be saved as: {customFileName}.csv</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                📁 File will be uploaded to "Business Exports" folder in your Google Drive
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-green-900 mb-2">Export Successful!</h3>
              <p className="text-sm text-gray-600 mb-4">
                {data?.length || 0} records exported to Google Drive
              </p>
              {driveFileLink && (
                <a
                  href={driveFileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                >
                  <Cloud className="w-4 h-4" />
                  Open in Google Drive
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          {!uploadComplete ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={uploading || !customFileName}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Drive
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleReset}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              Done
            </Button>
          )}
        </div>

        <div className="h-1 flex -mb-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}