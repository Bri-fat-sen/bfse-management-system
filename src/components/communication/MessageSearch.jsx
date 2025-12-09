import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { debounce } from "lodash";
import {
  Search,
  X,
  MessageSquare,
  Users,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MessageSearch({ 
  open, 
  onOpenChange, 
  orgId, 
  currentEmployee,
  onSelectRoom,
  rooms = []
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState({ messages: [], rooms: [] });
  const [isSearching, setIsSearching] = useState(false);

  const searchMessages = useCallback(
    debounce(async (term) => {
      if (!term || term.length < 2) {
        setResults({ messages: [], rooms: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Search messages
        const allMessages = await base44.entities.ChatMessage.filter({
          organisation_id: orgId
        }, '-created_date', 100);

        const matchingMessages = allMessages.filter(m => 
          m.content?.toLowerCase().includes(term.toLowerCase()) ||
          m.sender_name?.toLowerCase().includes(term.toLowerCase())
        ).slice(0, 20);

        // Search rooms
        const matchingRooms = rooms.filter(r =>
          r.name?.toLowerCase().includes(term.toLowerCase()) ||
          r.participant_names?.some(n => n?.toLowerCase().includes(term.toLowerCase()))
        );

        setResults({
          messages: matchingMessages,
          rooms: matchingRooms
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [orgId, rooms]
  );

  useEffect(() => {
    searchMessages(searchTerm);
  }, [searchTerm, searchMessages]);

  const handleClose = () => {
    setSearchTerm("");
    setResults({ messages: [], rooms: [] });
    onOpenChange(false);
  };

  const handleSelectMessage = (message) => {
    const room = rooms.find(r => r.id === message.room_id);
    if (room) {
      onSelectRoom(room, message.id);
      handleClose();
    }
  };

  const handleSelectRoom = (room) => {
    onSelectRoom(room);
    handleClose();
  };

  const highlightText = (text, term) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === term.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Messages
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search messages, people, or groups..."
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
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : results.messages.length === 0 && results.rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rooms */}
              {results.rooms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 px-1">Conversations</h4>
                  <div className="space-y-1">
                    {results.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectRoom(room)}
                      >
                        <Avatar className="w-10 h-10">
                          {room.type === 'group' ? (
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              <Users className="w-5 h-5" />
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                              {room.name?.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{highlightText(room.name, searchTerm)}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {room.type === 'group' 
                              ? `${room.participants?.length || 0} members` 
                              : room.participant_names?.join(', ')}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {results.messages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 px-1">Messages</h4>
                  <div className="space-y-1">
                    {results.messages.map((msg) => {
                      const room = rooms.find(r => r.id === msg.room_id);
                      return (
                        <div
                          key={msg.id}
                          className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectMessage(msg)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={msg.sender_photo} />
                              <AvatarFallback className="text-xs">
                                {msg.sender_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {highlightText(msg.sender_name, searchTerm)}
                            </span>
                            {room && (
                              <Badge variant="secondary" className="text-xs">
                                {room.name}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">
                              {format(new Date(msg.created_date), 'MMM d')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 ml-8">
                            {highlightText(msg.content, searchTerm)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}