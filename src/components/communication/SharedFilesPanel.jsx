import React, { useState } from "react";
import { format } from "date-fns";
import {
  Image as ImageIcon,
  File,
  FileText,
  Film,
  Music,
  Download,
  ExternalLink,
  Grid,
  List,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getFileIcon = (url, type) => {
  if (url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || type?.startsWith('image')) {
    return { icon: ImageIcon, color: 'text-green-600', bg: 'bg-green-50' };
  }
  if (url?.match(/\.(mp4|mov|avi|webm)$/i) || type?.startsWith('video')) {
    return { icon: Film, color: 'text-purple-600', bg: 'bg-purple-50' };
  }
  if (url?.match(/\.(mp3|wav|ogg)$/i) || type?.startsWith('audio')) {
    return { icon: Music, color: 'text-pink-600', bg: 'bg-pink-50' };
  }
  if (url?.match(/\.(pdf|doc|docx|txt)$/i)) {
    return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' };
  }
  return { icon: File, color: 'text-gray-600', bg: 'bg-gray-50' };
};

export default function SharedFilesPanel({ messages = [], roomName }) {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("all");

  const fileMessages = messages.filter(m => m.file_url);
  
  const images = fileMessages.filter(m => m.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const documents = fileMessages.filter(m => !m.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));

  const filteredFiles = filter === "images" 
    ? images 
    : filter === "documents" 
    ? documents 
    : fileMessages;

  const searchedFiles = filteredFiles.filter(m =>
    m.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Shared Files</h3>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
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
            className="pl-10 h-9"
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full h-8 bg-gray-100">
            <TabsTrigger value="all" className="flex-1 text-xs h-7">
              All ({fileMessages.length})
            </TabsTrigger>
            <TabsTrigger value="images" className="flex-1 text-xs h-7">
              Images ({images.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 text-xs h-7">
              Docs ({documents.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 p-4">
        {searchedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No files shared yet</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-2">
            {searchedFiles.map((msg) => {
              const isImage = msg.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const { icon: FileIcon, color, bg } = getFileIcon(msg.file_url);

              return (
                <div
                  key={msg.id}
                  className="aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => isImage && setSelectedImage(msg)}
                >
                  {isImage ? (
                    <img
                      src={msg.file_url}
                      alt={msg.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full ${bg} flex flex-col items-center justify-center p-2`}>
                      <FileIcon className={`w-8 h-8 ${color}`} />
                      <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                        {msg.file_name?.split('.').pop()?.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {searchedFiles.map((msg) => {
              const { icon: FileIcon, color, bg } = getFileIcon(msg.file_url);

              return (
                <div
                  key={msg.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <FileIcon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{msg.file_name || 'File'}</p>
                    <p className="text-xs text-gray-500">
                      {msg.sender_name} • {format(new Date(msg.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="relative">
            <img
              src={selectedImage?.file_url}
              alt={selectedImage?.file_name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
              <p className="font-medium">{selectedImage?.file_name}</p>
              <p className="text-sm opacity-80">
                Shared by {selectedImage?.sender_name} • {selectedImage?.created_date && format(new Date(selectedImage.created_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              <a
                href={selectedImage?.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </a>
              <a
                href={selectedImage?.file_url}
                download
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm"
              >
                <Download className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}