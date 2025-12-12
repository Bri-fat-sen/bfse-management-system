import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Folder, 
  FileText, 
  Download, 
  RefreshCw, 
  FolderOpen,
  Home,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function DriveFileBrowser({ 
  onFileSelect, 
  title = "Google Drive Files"
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  useEffect(() => {
    initializeDrive();
  }, []);

  const initializeDrive = async () => {
    setIsLoading(true);
    try {
      const rootResult = await base44.functions.invoke('googleDriveManager', {
        action: 'getRootFolder'
      });
      
      if (rootResult?.data?.success) {
        const root = rootResult.data.folder;
        setCurrentFolder(root.id);
        setFolderPath([{ name: 'My Drive', id: root.id }]);
        loadFiles(root.id);
      }
    } catch (error) {
      console.error('Drive init error:', error);
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
      console.error('Load files error:', error);
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
    const root = folderPath[0];
    setCurrentFolder(root.id);
    setFolderPath([root]);
    loadFiles(root.id);
  };

  const handleFileSelect = async (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      navigateToFolder(file);
    } else if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
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
        
        <div className="flex items-center gap-2 mt-2 text-sm">
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
              <Button variant="ghost" size="sm" onClick={navigateBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span>/</span>
            </>
          )}
          {folderPath.map((folder, idx) => (
            <React.Fragment key={folder.id}>
              <span className={idx === folderPath.length - 1 ? 'font-semibold text-[#1EB053]' : ''}>
                {folder.name}
              </span>
              {idx < folderPath.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No files</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {file.mimeType === 'application/vnd.google-apps.folder' ? (
                    <Folder className="w-6 h-6 text-[#0072C6]" />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.modifiedTime && format(new Date(file.modifiedTime), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}