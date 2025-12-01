import React, { useState, useEffect, useRef } from "react";
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
  Video,
  MoreVertical,
  Edit2,
  Trash2,
  Pin,
  Check,
  CheckCheck,
  Copy,
  Reply,
  BellOff,
  Package,
  FileText
} from "lucide-react";
import AttachmentPicker, { AttachmentPreview, MessageAttachment } from "./AttachmentPicker";
import EnhancedNewGroupDialog from "./EnhancedNewGroupDialog";
import VideoCallDialog from "./VideoCallDialog";
import { useChatNotifications, NotificationSettingsButton, useNotificationSettings } from "./ChatNotificationManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function ChatPanel({ isOpen, onClose, orgId, currentEmployee }) {
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState("video");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const notificationSettings = useNotificationSettings();

  const { data: chatRooms = [] } = useQuery({
    queryKey: ['chatRooms', orgId],
    queryFn: () => base44.entities.ChatRoom.filter({ organisation_id: orgId }),
    enabled: !!orgId && isOpen,
    refetchInterval: isOpen ? 5000 : false,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['panelMessages', selectedRoom?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: selectedRoom?.id, is_deleted: false }, 'created_date', 50),
    enabled: !!selectedRoom?.id,
    refetchInterval: isOpen && selectedRoom ? 2000 : false,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId && isOpen,
  });

  // Use enhanced notification system
  useChatNotifications({
    messages,
    currentEmployeeId: currentEmployee?.id,
    selectedRoomId: selectedRoom?.id,
    isOpen,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (selectedRoom && messages.length > 0 && currentEmployee) {
      const unreadMessages = messages.filter(
        m => m.sender_id !== currentEmployee.id && !m.read_by?.includes(currentEmployee.id)
      );
      unreadMessages.forEach(msg => {
        const newReadBy = [...(msg.read_by || []), currentEmployee.id];
        base44.entities.ChatMessage.update(msg.id, { read_by: newReadBy, is_read: true });
      });
    }
  }, [messages, selectedRoom, currentEmployee]);

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelMessages'] });
      setMessageText("");
      setReplyingTo(null);
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChatMessage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelMessages'] });
      setEditingMessage(null);
      setEditText("");
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      setSelectedRoom(room);
      setShowNewGroupDialog(false);
      setGroupName("");
      setSelectedMembers([]);
      toast.success("Group created!");
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChatRoom.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id) => base44.entities.ChatRoom.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      setSelectedRoom(null);
      toast.success("Chat deleted");
    },
  });

  const myRooms = chatRooms.filter(r => r.participants?.includes(currentEmployee?.id));
  
  const filteredRooms = myRooms.filter(room => 
    room.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedMessages = messages.filter(m => m.is_pinned);

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

    const messageData = {
      organisation_id: orgId,
      room_id: selectedRoom.id,
      sender_id: currentEmployee?.id,
      sender_name: currentEmployee?.full_name,
      sender_photo: currentEmployee?.profile_photo,
      content: messageText,
      message_type: 'text',
      read_by: [currentEmployee?.id],
    };

    if (replyingTo) {
      messageData.reply_to_id = replyingTo.id;
      messageData.reply_to_content = replyingTo.content?.substring(0, 100);
      messageData.reply_to_sender = replyingTo.sender_name;
    }

    sendMessageMutation.mutate(messageData);

    // Update room's last message
    updateRoomMutation.mutate({
      id: selectedRoom.id,
      data: {
        last_message: messageText.substring(0, 50),
        last_message_at: new Date().toISOString(),
        last_message_sender: currentEmployee?.full_name,
      }
    });
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setEditText(msg.content);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || !editingMessage) return;
    updateMessageMutation.mutate({
      id: editingMessage.id,
      data: {
        content: editText,
        is_edited: true,
        edited_at: new Date().toISOString(),
      }
    });
  };

  const handleDeleteMessage = (msg) => {
    updateMessageMutation.mutate({
      id: msg.id,
      data: { is_deleted: true }
    });
    toast.success("Message deleted");
  };

  const handlePinMessage = (msg) => {
    const isPinned = !msg.is_pinned;
    updateMessageMutation.mutate({
      id: msg.id,
      data: {
        is_pinned: isPinned,
        pinned_by: isPinned ? currentEmployee?.id : null,
        pinned_at: isPinned ? new Date().toISOString() : null,
      }
    });
    toast.success(isPinned ? "Message pinned" : "Message unpinned");
  };

  const handleCopyMessage = (msg) => {
    navigator.clipboard.writeText(msg.content);
    toast.success("Copied to clipboard");
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      toast.error("Please enter a group name and select members");
      return;
    }

    const allParticipants = [currentEmployee?.id, ...selectedMembers];
    const allNames = [
      currentEmployee?.full_name,
      ...selectedMembers.map(id => employees.find(e => e.id === id)?.full_name)
    ].filter(Boolean);

    createRoomMutation.mutate({
      organisation_id: orgId,
      name: groupName,
      type: 'group',
      participants: allParticipants,
      participant_names: allNames,
      admins: [currentEmployee?.id],
      is_active: true,
    });
  };

  const handleTyping = () => {
    if (!selectedRoom || !currentEmployee) return;

    // Update typing status
    const currentTyping = selectedRoom.typing_users || [];
    const isAlreadyTyping = currentTyping.some(t => t.user_id === currentEmployee.id);
    
    if (!isAlreadyTyping) {
      updateRoomMutation.mutate({
        id: selectedRoom.id,
        data: {
          typing_users: [
            ...currentTyping.filter(t => t.user_id !== currentEmployee.id),
            { user_id: currentEmployee.id, user_name: currentEmployee.full_name, timestamp: new Date().toISOString() }
          ]
        }
      });
    }

    // Clear typing after 3 seconds
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateRoomMutation.mutate({
        id: selectedRoom.id,
        data: {
          typing_users: (selectedRoom.typing_users || []).filter(t => t.user_id !== currentEmployee.id)
        }
      });
    }, 3000);
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

  const getTypingIndicator = () => {
    if (!selectedRoom?.typing_users?.length) return null;
    const typingOthers = selectedRoom.typing_users.filter(t => t.user_id !== currentEmployee?.id);
    if (!typingOthers.length) return null;
    
    const names = typingOthers.map(t => t.user_name).join(', ');
    return `${names} ${typingOthers.length > 1 ? 'are' : 'is'} typing...`;
  };

  const getReadReceipt = (msg) => {
    if (msg.sender_id !== currentEmployee?.id) return null;
    const readCount = msg.read_by?.filter(id => id !== currentEmployee?.id).length || 0;
    if (readCount > 0) return <CheckCheck className="w-3 h-3 text-blue-500" />;
    return <Check className="w-3 h-3 text-gray-400" />;
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
              onClick={() => { setSelectedRoom(null); setReplyingTo(null); }}
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
            {!selectedRoom ? (
              <p className="text-xs text-gray-300">{myRooms.length} conversations</p>
            ) : (
              <p className="text-xs text-gray-300">
                {getTypingIndicator() || (selectedRoom.type === 'group' ? `${selectedRoom.participants?.length} members` : 'Online')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {selectedRoom && (
            <>
              <NotificationSettingsButton />
              {notificationSettings?.isRoomMuted?.(selectedRoom?.id) && (
                <BellOff className="w-4 h-4 text-gray-400" title="Notifications muted" />
              )}
              {pinnedMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                  className="text-white hover:bg-white/10 relative"
                  title="Pinned messages"
                >
                  <Pin className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1EB053] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pinnedMessages.length}
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startCall("audio")}
                className="text-white hover:bg-white/10"
                title="Voice call"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startCall("video")}
                className="text-white hover:bg-white/10"
                title="Video call"
              >
                <Video className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => notificationSettings?.toggleRoomMute?.(selectedRoom?.id)}>
                    <BellOff className="w-4 h-4 mr-2" />
                    {notificationSettings?.isRoomMuted?.(selectedRoom?.id) ? 'Unmute Chat' : 'Mute Chat'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => deleteRoomMutation.mutate(selectedRoom?.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
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

      {/* Pinned Messages Bar */}
      {showPinnedMessages && pinnedMessages.length > 0 && (
        <div className="p-2 bg-yellow-50 border-b max-h-32 overflow-y-auto">
          <p className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
            <Pin className="w-3 h-3" /> Pinned Messages
          </p>
          {pinnedMessages.map(msg => (
            <div key={msg.id} className="text-xs text-gray-600 truncate p-1 bg-white rounded mb-1">
              <span className="font-medium">{msg.sender_name}:</span> {msg.content}
            </div>
          ))}
        </div>
      )}

      {!selectedRoom ? (
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
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowNewChatDialog(true)}>
              <Plus className="w-3 h-3 mr-1" />
              New Chat
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowNewGroupDialog(true)}>
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
            <p className="text-xs font-medium text-gray-500 mb-2">Start a chat</p>
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
                      className={cn("flex gap-2 group", isOwn && "flex-row-reverse")}
                    >
                      {!isOwn && (
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarImage src={msg.sender_photo} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {msg.sender_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col max-w-[75%]">
                        {/* Reply preview */}
                        {msg.reply_to_content && (
                          <div className={cn(
                            "text-[10px] px-2 py-1 mb-1 rounded border-l-2",
                            isOwn ? "bg-white/20 border-white/50 text-white/80" : "bg-gray-100 border-gray-300 text-gray-500"
                          )}>
                            <span className="font-medium">{msg.reply_to_sender}:</span> {msg.reply_to_content}
                          </div>
                        )}
                        <div className={cn(
                          "rounded-2xl px-3 py-2 relative",
                          isOwn 
                            ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm",
                          msg.is_pinned && "ring-2 ring-yellow-400"
                        )}>
                          {msg.is_pinned && (
                            <Pin className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {!isOwn && selectedRoom?.type === 'group' && (
                            <p className="text-[10px] font-medium text-[#1EB053] mb-0.5">
                              {msg.sender_name}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className={cn(
                            "flex items-center gap-1 mt-1",
                            isOwn ? "justify-end" : ""
                          )}>
                            <span className={cn(
                              "text-[10px]",
                              isOwn ? "text-white/70" : "text-gray-400"
                            )}>
                              {format(new Date(msg.created_date), 'HH:mm')}
                              {msg.is_edited && " (edited)"}
                            </span>
                            {getReadReceipt(msg)}
                          </div>
                        </div>
                      </div>
                      {/* Message actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-40">
                          <DropdownMenuItem onClick={() => setReplyingTo(msg)}>
                            <Reply className="w-4 h-4 mr-2" /> Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyMessage(msg)}>
                            <Copy className="w-4 h-4 mr-2" /> Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePinMessage(msg)}>
                            <Pin className="w-4 h-4 mr-2" /> {msg.is_pinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                          {isOwn && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditMessage(msg)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteMessage(msg)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => notificationSettings?.toggleRoomMute?.(selectedRoom?.id)}>
                            <BellOff className="w-4 h-4 mr-2" /> 
                            {notificationSettings?.isRoomMuted?.(selectedRoom?.id) ? 'Unmute Chat' : 'Mute Chat'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Reply indicator */}
          {replyingTo && (
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-xs text-gray-500 truncate flex-1">
                <span className="font-medium">Replying to {replyingTo.sender_name}:</span> {replyingTo.content?.substring(0, 40)}...
              </div>
              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setReplyingTo(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Typing indicator */}
          {getTypingIndicator() && (
            <div className="px-4 py-1 text-xs text-gray-500 italic flex items-center gap-1">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {getTypingIndicator()}
            </div>
          )}

          {/* Message Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 h-9"
              />
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

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-[#1EB053] hover:bg-[#178f43]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Group Dialog */}
      <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Group Name</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Select Members</Label>
              <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                {employees.filter(e => e.id !== currentEmployee?.id).map((emp) => (
                  <label key={emp.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox
                      checked={selectedMembers.includes(emp.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers([...selectedMembers, emp.id]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== emp.id));
                        }
                      }}
                    />
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="text-xs">{emp.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{emp.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGroupDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateGroup} 
              className="bg-[#1EB053] hover:bg-[#178f43]"
              disabled={!groupName.trim() || selectedMembers.length === 0}
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {employees
                .filter(e => 
                  e.id !== currentEmployee?.id &&
                  e.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      startChat(emp);
                      setShowNewChatDialog(false);
                      setSearchTerm("");
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xs">
                        {emp.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{emp.full_name}</p>
                      <p className="text-xs text-gray-500">{emp.department || emp.position}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video/Audio Call Dialog */}
      <VideoCallDialog
        open={callDialogOpen}
        onOpenChange={setCallDialogOpen}
        callType={callType}
        room={selectedRoom}
        currentEmployee={currentEmployee}
      />
    </div>
  );
}