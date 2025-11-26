import React, { useState } from "react";
import { format } from "date-fns";
import {
  Image as ImageIcon,
  FileText,
  File,
  Download,
  Grid,
  List,
  Search,
  X,
  Play,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function SharedFilesGallery({ messages = [], roomName }) {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Extract files from messages
  const files = messages
    .filter(m => m.file_url)
    .map(m => ({
      id: m.id,
      url: m.file_url,
      name: m.file_name || 'Untitled',
      type: getFileType(m.file_url, m.file_name),
      sender: m.sender_name,
      date: m.created_date,
    }));

  function getFileType(url, name) {
    const ext = (name || url).split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    return 'other';
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Play;
      case 'audio': return Music;
      case 'pdf':
      case 'document': return FileText;
      default: return File;
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.sender?.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'media') return matchesSearch && ['image', 'video'].includes(f.type);
    if (activeTab === 'documents') return matchesSearch && ['pdf', 'document', 'spreadsheet', 'other'].includes(f.type);
    return matchesSearch;
  });

  const images = filteredFiles.filter(f => f.type === 'image');
  const documents = filteredFiles.filter(f => f.type !== 'image');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Shared Files</h3>
          <div className="flex items-center gap-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="w-full h-8 bg-gray-100 p-0.5">
            <TabsTrigger value="all" className="flex-1 text-xs h-7">All ({files.length})</TabsTrigger>
            <TabsTrigger value="media" className="flex-1 text-xs h-7">Media</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 text-xs h-7">Documents</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No files shared yet</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-6">
            {/* Images Grid */}
            {images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Photos & Videos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((file) => (
                    <div 
                      key={file.id} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                      onClick={() => setPreviewFile(file)}
                    >
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-5 h-5 text-white" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Grid */}
            {documents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
                <div className="grid grid-cols-2 gap-2">
                  {documents.map((file) => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="p-2 bg-white rounded">
                          <Icon className="w-5 h-5 text-[#0072C6]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.sender}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded">
                      <Icon className="w-6 h-6 text-[#0072C6]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {file.sender} • {format(new Date(file.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </a>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewFile && (
            <div className="relative">
              <img 
                src={previewFile.url} 
                alt={previewFile.name} 
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <p className="font-medium">{previewFile.name}</p>
                <p className="text-sm opacity-80">
                  {previewFile.sender} • {format(new Date(previewFile.date), 'MMM d, yyyy')}
                </p>
              </div>
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}