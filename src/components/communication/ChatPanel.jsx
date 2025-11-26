import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import {
  MessageSquare,
  X,
  Plus,
  Users,
  Search,
  Maximize2,
  Send,
  Paperclip,
  Image,
  Smile,
  ArrowLeft,
  Phone,
  Video
} from "lucide-react";
import VideoCallDialog from "./VideoCallDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

export default function ChatPanel({ isOpen, onClose, orgId, currentEmployee }) {
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState("video");

  const { data: chatRooms = [] } = useQuery({
    queryKey: ['chatRooms', orgId],
    queryFn: () => base44.entities.ChatRoom.filter({ organisation_id: orgId }),
    enabled: !!orgId && isOpen,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['panelMessages', selectedRoom?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: selectedRoom?.id }, 'created_date', 50),
    enabled: !!selectedRoom?.id,
    refetchInterval: isOpen ? 3000 : false,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId && isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelMessages'] });
      setMessageText("");
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      setSelectedRoom(room);
    },
  });

  const myRooms = chatRooms.filter(r => r.participants?.includes(currentEmployee?.id));
  
  const filteredRooms = myRooms.filter(room => 
    room.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startChat = (emp) => {
    const existingRoom = chatRooms.find(r =>
      r.type === 'direct' &&
      r.participants?.includes(currentEmployee?.id) &&
      r.participants?.includes(emp.id)
    );

    if (existingRoom) {
      setSelectedRoom(existingRoom);
      return;
    }

    createRoomMutation.mutate({
      organisation_id: orgId,
      name: emp.full_name,
      type: 'direct',
      participants: [currentEmployee?.id, emp.id],
      participant_names: [currentEmployee?.full_name, emp.full_name],
      is_active: true,
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedRoom) return;

    sendMessageMutation.mutate({
      organisation_id: orgId,
      room_id: selectedRoom.id,
      sender_id: currentEmployee?.id,
      sender_name: currentEmployee?.full_name,
      sender_photo: currentEmployee?.profile_photo,
      content: messageText,
      message_type: 'text',
    });
  };

  const formatMessageTime = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  const startCall = (type) => {
    setCallType(type);
    setCallDialogOpen(true);
  };

  const getOtherParticipantName = (room) => {
    if (room.type === 'group') return room.name;
    const names = room.participant_names || [];
    return names.find(n => n !== currentEmployee?.full_name) || room.name;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-0 w-full sm:w-96 h-[calc(100vh-4rem)] bg-white shadow-2xl z-40 flex flex-col border-l animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#0F1F3C] to-[#1a3a5c]">
        <div className="flex items-center gap-3">
          {selectedRoom && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedRoom(null)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              {selectedRoom ? getOtherParticipantName(selectedRoom) : 'Messages'}
            </h3>
            {!selectedRoom && (
              <p className="text-xs text-gray-300">{myRooms.length} conversations</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link to={createPageUrl("Communication")}>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              title="Open full view"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {!selectedRoom ? (
        // Chat List View
        <>
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-gray-50"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 p-3 border-b">
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              New Chat
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              <Users className="w-3 h-3 mr-1" />
              New Group
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredRooms.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={room.avatar_url} />
                      <AvatarFallback className={cn(
                        "text-white text-sm",
                        room.type === 'group' 
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-gradient-to-br from-[#1EB053] to-[#0072C6]"
                      )}>
                        {room.type === 'group' ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          getOtherParticipantName(room)?.charAt(0)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {getOtherParticipantName(room)}
                        </p>
                        {room.last_message_at && (
                          <span className="text-[10px] text-gray-400">
                            {formatMessageTime(room.last_message_at)}
                          </span>
                        )}
                      </div>
                      {room.last_message && (
                        <p className="text-xs text-gray-500 truncate">
                          {room.last_message}
                        </p>
                      )}
                    </div>
                    {room.unread_count > 0 && (
                      <Badge className="bg-[#1EB053] text-white h-5 min-w-5 flex items-center justify-center text-[10px]">
                        {room.unread_count}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Online Team Members */}
          <div className="p-3 border-t bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-2">Team Members</p>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {employees.filter(e => e.id !== currentEmployee?.id).slice(0, 8).map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => startChat(emp)}
                  className="flex-shrink-0 group"
                  title={emp.full_name}
                >
                  <Avatar className="w-8 h-8 ring-2 ring-white group-hover:ring-[#1EB053] transition-all">
                    <AvatarImage src={emp.profile_photo} />
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                      {emp.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Chat View
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === currentEmployee?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex gap-2", isOwn && "flex-row-reverse")}
                    >
                      {!isOwn && (
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarImage src={msg.sender_photo} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {msg.sender_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2",
                        isOwn 
                          ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      )}>
                        {!isOwn && selectedRoom?.type === 'group' && (
                          <p className="text-[10px] font-medium text-[#1EB053] mb-0.5">
                            {msg.sender_name}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          isOwn ? "text-white/70" : "text-gray-400"
                        )}>
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                <Image className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 h-9"
              />
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white h-8 w-8"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}