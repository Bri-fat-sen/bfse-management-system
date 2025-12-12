import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Folder, 
  FolderOpen,
  Home,
  ArrowLeft,
  Loader2,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DriveFolderPicker({ open, onOpenChange, onSelect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    if (open) {
      initializeDrive();
    }
  }, [open]);

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
        loadFolders(root.id);
      }
    } catch (error) {
      console.error('Drive init error:', error);
    }
    setIsLoading(false);
  };

  const loadFolders = async (folderId) => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('googleDriveManager', {
        action: 'listFiles',
        folderId: folderId
      });
      
      if (result?.data?.success) {
        const allFolders = (result.data.files || []).filter(
          f => f.mimeType === 'application/vnd.google-apps.folder'
        );
        setFolders(allFolders);
      }
    } catch (error) {
      console.error('Load folders error:', error);
    }
    setIsLoading(false);
  };

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder.id);
    setFolderPath([...folderPath, folder]);
    loadFolders(folder.id);
  };

  const navigateBack = () => {
    if (folderPath.length <= 1) return;
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    const parentFolder = newPath[newPath.length - 1];
    setCurrentFolder(parentFolder.id);
    loadFolders(parentFolder.id);
  };

  const navigateToRoot = () => {
    if (folderPath.length <= 1) return;
    const root = folderPath[0];
    setCurrentFolder(root.id);
    setFolderPath([root]);
    loadFolders(root.id);
  };

  const handleSelect = () => {
    if (selectedFolder) {
      onSelect(selectedFolder);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#1EB053]" />
            Select Google Drive Folder
          </DialogTitle>
        </DialogHeader>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 border-b pb-3">
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
                    loadFolders(folder.id);
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

        {/* Current folder selection */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <Button
            variant={selectedFolder?.id === currentFolder ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => setSelectedFolder({ 
              id: currentFolder, 
              name: folderPath[folderPath.length - 1].name 
            })}
          >
            <Folder className="w-4 h-4 mr-2" />
            Save in: {folderPath[folderPath.length - 1].name}
            {selectedFolder?.id === currentFolder && (
              <Check className="w-4 h-4 ml-auto text-[#1EB053]" />
            )}
          </Button>
        </div>

        {/* Subfolders */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No subfolders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map(folder => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedFolder?.id === folder.id ? 'bg-green-50 border-[#1EB053]' : ''
                  }`}
                >
                  <button
                    className="flex items-center gap-3 flex-1"
                    onDoubleClick={() => navigateToFolder(folder)}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <Folder className={`w-6 h-6 ${
                      selectedFolder?.id === folder.id ? 'text-[#1EB053]' : 'text-[#0072C6]'
                    }`} />
                    <span className="font-medium text-sm">{folder.name}</span>
                    {selectedFolder?.id === folder.id && (
                      <Check className="w-4 h-4 ml-auto text-[#1EB053]" />
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToFolder(folder)}
                  >
                    Open →
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={!selectedFolder}
            className="bg-[#1EB053] hover:bg-[#178f43]"
          >
            Select Folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}