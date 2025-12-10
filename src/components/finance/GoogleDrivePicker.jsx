import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, FolderOpen, FileText, Image, FileSpreadsheet, File } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

const GOOGLE_DRIVE_ICON = (
  <svg className="w-6 h-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

const FILE_ICONS = {
  'application/pdf': <FileText className="w-5 h-5 text-red-500" />,
  'image/png': <Image className="w-5 h-5 text-blue-500" />,
  'image/jpeg': <Image className="w-5 h-5 text-blue-500" />,
  'text/csv': <FileSpreadsheet className="w-5 h-5 text-green-500" />,
  'application/vnd.google-apps.spreadsheet': <FileSpreadsheet className="w-5 h-5 text-green-600" />,
  'application/vnd.google-apps.document': <FileText className="w-5 h-5 text-blue-600" />,
};

export default function GoogleDrivePicker({ open, onOpenChange, onFileSelected }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to create backend function for Google Drive integration
  const createGoogleDriveFunction = async () => {
    // This function will be called once to set up the backend
    toast.info("Setting up Google Drive", "This will only happen once...");
    
    // The backend function should be created by the developer
    // For now, we'll use the connector to get access token
  };

  useEffect(() => {
    if (open) {
      loadGoogleDriveFiles();
    }
  }, [open]);

  const loadGoogleDriveFiles = async () => {
    setLoading(true);
    try {
      // Call backend function to list Google Drive files
      const response = await base44.functions.invoke('listGoogleDriveFiles', {});
      
      if (response.data.files) {
        setFiles(response.data.files);
        setAccessToken(response.data.accessToken);
      }
    } catch (error) {
      console.error("Failed to load Google Drive files:", error);
      toast.error("Google Drive Error", "Failed to connect to Google Drive. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setLoading(true);
    
    try {
      // Download file from Google Drive via backend
      const response = await base44.functions.invoke('downloadGoogleDriveFile', {
        fileId: file.id,
        fileName: file.name,
        mimeType: file.mimeType
      });

      if (response.data.file_url) {
        toast.success("File imported", `${file.name} ready for extraction`);
        onFileSelected({
          file_url: response.data.file_url,
          fileName: file.name,
          mimeType: file.mimeType
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Download Failed", error.message || "Could not download file from Google Drive");
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType) => {
    return FILE_ICONS[mimeType] || <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0 [&>button]:hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              {GOOGLE_DRIVE_ICON}
            </div>
            <div>
              <h2 className="text-xl font-bold">Import from Google Drive</h2>
              <p className="text-white/80 text-sm">Select a file from your Google Drive</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">
                {selectedFile ? `Importing ${selectedFile.name}...` : 'Loading your Google Drive files...'}
              </p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No compatible files found</p>
              <p className="text-sm text-gray-400">
                Supported: PDF, CSV, PNG, JPG, Google Docs, Google Sheets
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  disabled={loading}
                  className="w-full p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        {file.modifiedTime && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(file.modifiedTime).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {file.mimeType.startsWith('application/vnd.google-apps') && (
                      <Badge variant="outline" className="text-xs">
                        Google {file.mimeType.includes('spreadsheet') ? 'Sheets' : 'Docs'}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {files.length} file{files.length !== 1 ? 's' : ''} available
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}