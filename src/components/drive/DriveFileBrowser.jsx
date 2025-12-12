import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Folder, 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  FolderOpen,
  Home,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function DriveFileBrowser({ 
  onFileSelect, 
  allowUpload = false,
  title = "Google Drive Files"
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  useEffect(() => {
    setupDrive();
  }, []);

  const setupDrive = async () => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('googleDriveManager', {
        action: 'setup'
      });
      
      if (result?.data?.success) {
        setFolders(result.data.folders);
        setCurrentFolder(result.data.folders.root);
        setFolderPath([{ name: result.data.rootName, id: result.data.folders.root }]);
        loadFiles(result.data.folders.root);
      }
    } catch (error) {
      toast({ 
        title: "Failed to setup Drive", 
        description: error.message,
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const loadFiles = async (folderId) => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('googleDriveManager', {
        action: 'listFiles',
        folderId: folderId
      });
      
      if (result?.data?.success) {
        setFiles(result.data.files || []);
      }
    } catch (error) {
      toast({ 
        title: "Failed to load files", 
        description: error.message,
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder.id);
    setFolderPath([...folderPath, folder]);
    loadFiles(folder.id);
  };

  const navigateBack = () => {
    if (folderPath.length <= 1) return;
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    const parentFolder = newPath[newPath.length - 1];
    setCurrentFolder(parentFolder.id);
    loadFiles(parentFolder.id);
  };

  const navigateToRoot = () => {
    if (!folders) return;
    setCurrentFolder(folders.root);
    setFolderPath([folderPath[0]]);
    loadFiles(folders.root);
  };

  const handleFileSelect = async (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      navigateToFolder(file);
    } else if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const downloadFile = async (file) => {
    try {
      const result = await base44.functions.invoke('googleDriveManager', {
        action: 'downloadFile',
        folderId: file.id // reusing folderId param for fileId
      });
      
      if (result?.data?.success) {
        const link = document.createElement('a');
        link.href = `data:${result.data.mimeType};base64,${result.data.content}`;
        link.download = file.name;
        link.click();
        toast({ title: "File downloaded" });
      }
    } catch (error) {
      toast({ 
        title: "Download failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-8 h-8 text-[#0072C6]" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#1EB053]" />
            {title}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadFiles(currentFolder)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={navigateToRoot}
            disabled={folderPath.length <= 1}
          >
            <Home className="w-4 h-4" />
          </Button>
          {folderPath.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={navigateBack}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-gray-400">/</span>
            </>
          )}
          {folderPath.map((folder, idx) => (
            <React.Fragment key={folder.id}>
              <button
                onClick={() => {
                  if (idx < folderPath.length - 1) {
                    const newPath = folderPath.slice(0, idx + 1);
                    setFolderPath(newPath);
                    setCurrentFolder(folder.id);
                    loadFiles(folder.id);
                  }
                }}
                className={`hover:text-[#1EB053] ${
                  idx === folderPath.length - 1 ? 'font-semibold text-[#1EB053]' : ''
                }`}
              >
                {folder.name}
              </button>
              {idx < folderPath.length - 1 && <span className="text-gray-400">/</span>}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No files in this folder</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      {file.modifiedTime && (
                        <>
                          <span>•</span>
                          <span>{format(new Date(file.modifiedTime), 'MMM d, yyyy')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {file.mimeType !== 'application/vnd.google-apps.folder' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(file);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}