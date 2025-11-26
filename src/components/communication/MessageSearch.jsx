import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  X,
  MessageSquare,
  ArrowRight,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function MessageSearch({
  open,
  onOpenChange,
  orgId,
  rooms = [],
  onSelectMessage
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['searchMessages', orgId],
    queryFn: () => base44.entities.ChatMessage.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId && open,
  });

  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim() || debouncedSearch.length < 2) return [];
    
    const term = debouncedSearch.toLowerCase();
    return allMessages
      .filter(m => 
        m.content?.toLowerCase().includes(term) ||
        m.sender_name?.toLowerCase().includes(term) ||
        m.file_name?.toLowerCase().includes(term)
      )
      .slice(0, 50);
  }, [allMessages, debouncedSearch]);

  const handleSelectResult = (message) => {
    const room = rooms.find(r => r.id === message.room_id);
    if (room) {
      onSelectMessage?.(room, message);
      onOpenChange(false);
      setSearchTerm("");
    }
  };

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || 'Unknown';
  };

  const highlightText = (text, term) => {
    if (!text || !term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === term.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Messages
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search messages, files, or people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No messages found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">
                {searchResults.length} result{searchResults.length !== 1 && 's'}
              </p>
              {searchResults.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors group"
                  onClick={() => handleSelectResult(msg)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={msg.sender_photo} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                        {msg.sender_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.sender_name}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(msg.created_date), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {highlightText(msg.content, debouncedSearch)}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {getRoomName(msg.room_id)}
                      </Badge>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}