import React, { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  MessageSquare,
  Search,
  Plus,
  Users,
  Hash,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChatSidebar({
  rooms,
  selectedRoom,
  onSelectRoom,
  onNewChat,
  onNewGroup,
  currentEmployeeId,
  currentEmployeeName,
  unreadCounts = {}
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.participant_names?.some(n => n?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeFilter === "direct") return matchesSearch && r.type === 'direct';
    if (activeFilter === "groups") return matchesSearch && r.type === 'group';
    return matchesSearch;
  });

  const directChats = filteredRooms.filter(r => r.type === 'direct');
  const groupChats = filteredRooms.filter(r => r.type === 'group');

  const getRoomDisplayName = (room) => {
    if (room.type === 'group') return room.name;
    return room.participant_names?.find(n => n !== currentEmployeeName) || room.name;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Messages</h2>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={onNewChat} title="New Chat">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onNewGroup} title="New Group">
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-0"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b">
        <div className="flex gap-2">
          {["all", "direct", "groups"].map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={activeFilter === filter ? "default" : "ghost"}
              className={activeFilter === filter ? "bg-[#1EB053] hover:bg-[#178f43]" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "all" ? "All" : filter === "direct" ? "Direct" : "Groups"}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredRooms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No conversations</p>
            <p className="text-sm mt-1">Start chatting with your team</p>
            <Button variant="link" onClick={onNewChat} className="mt-2 text-[#1EB053]">
              Start a chat
            </Button>
          </div>
        ) : (
          <div className="py-2">
            {filteredRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const displayName = getRoomDisplayName(room);
              const unread = unreadCounts[room.id] || 0;
              
              return (
                <div
                  key={room.id}
                  className={`mx-2 mb-1 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border border-[#1EB053]/20' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectRoom(room)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        {room.type === 'group' ? (
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <Hash className="w-5 h-5" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                            {displayName?.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {room.type === 'direct' && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-green-500 text-white stroke-white stroke-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {displayName}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatMessageTime(room.last_message_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-sm truncate ${unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                          {room.last_message_sender && room.last_message_sender !== currentEmployeeName && (
                            <span className="text-gray-400">{room.last_message_sender.split(' ')[0]}: </span>
                          )}
                          {room.last_message || 'Start a conversation'}
                        </p>
                        {unread > 0 && (
                          <Badge className="bg-[#1EB053] text-white text-[10px] h-5 min-w-5 flex items-center justify-center ml-2">
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