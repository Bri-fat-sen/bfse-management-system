import React, { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Search,
  Plus,
  Users,
  MessageSquare,
  Hash,
  Bell,
  Pin,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatSidebar({
  rooms,
  selectedRoom,
  onSelectRoom,
  onNewChat,
  onNewGroup,
  currentEmployeeId,
  onlineUsers = [],
  unreadCounts = {}
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.participant_names?.some(n => n?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === "direct") return matchesSearch && r.type === 'direct';
    if (filter === "groups") return matchesSearch && r.type === 'group';
    if (filter === "unread") return matchesSearch && unreadCounts[r.id] > 0;
    return matchesSearch;
  });

  // Sort by last message time
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Messages</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onNewChat}>
                <MessageSquare className="w-4 h-4 mr-2" />
                New Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onNewGroup}>
                <Users className="w-4 h-4 mr-2" />
                New Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 bg-gray-50"
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mt-3">
          <TabsList className="w-full h-8 bg-gray-100 p-0.5">
            <TabsTrigger value="all" className="flex-1 text-xs h-7">All</TabsTrigger>
            <TabsTrigger value="direct" className="flex-1 text-xs h-7">Direct</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1 text-xs h-7">Groups</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {sortedRooms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No conversations</p>
            <Button variant="link" size="sm" onClick={onNewChat}>
              Start a chat
            </Button>
          </div>
        ) : (
          <div className="py-1">
            {sortedRooms.map((room) => {
              const otherName = room.type === 'group' 
                ? room.name 
                : room.participant_names?.find(n => n !== room.participant_names?.[0]) || room.name;
              const isSelected = selectedRoom?.id === room.id;
              const unread = unreadCounts[room.id] || 0;
              const isOnline = room.type === 'direct' && 
                room.participants?.some(p => p !== currentEmployeeId && onlineUsers.includes(p));

              return (
                <div
                  key={room.id}
                  className={`px-3 py-2.5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border-l-3 border-l-[#1EB053]' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectRoom(room)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-11 h-11">
                        {room.type === 'group' ? (
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <Hash className="w-5 h-5" />
                          </AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src={room.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white font-medium">
                              {otherName?.charAt(0)}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {room.is_pinned && <Pin className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                          <p className={`font-medium truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                            {otherName}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(room.last_message_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-sm truncate ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                          {room.is_typing ? (
                            <span className="text-[#1EB053] italic">typing...</span>
                          ) : (
                            room.last_message || 'No messages yet'
                          )}
                        </p>
                        {unread > 0 && (
                          <Badge className="bg-[#1EB053] text-white h-5 min-w-5 px-1.5 text-xs flex-shrink-0">
                            {unread > 99 ? '99+' : unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}