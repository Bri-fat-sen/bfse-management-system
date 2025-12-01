import React, { useState, useRef, useEffect } from "react";
import { format, isToday, isYesterday, isSameDay, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  File,
  X,
  Check,
  CheckCheck,
  Reply,
  Trash2,
  Download,
  Users,
  Info,
  Search,
  FolderOpen,
  Package
} from "lucide-react";
import AttachmentPicker, { AttachmentPreview, MessageAttachment } from "./AttachmentPicker";
import TypingIndicator from "./TypingIndicator";
import MessageReactions from "./MessageReactions";
import VideoCallDialog from "./VideoCallDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function ChatWindow({
  room,
  messages,
  currentEmployee,
  orgId,
  onlineUsers = [],
  onViewInfo,
  typingUsers = [],
  onOpenSearch,
  onOpenFiles
}) {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState("video");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
      setReplyTo(null);
      setAttachments([]);
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) return;

    const messageData = {
      organisation_id: orgId,
      room_id: room.id,
      sender_id: currentEmployee?.id,
      sender_name: currentEmployee?.full_name,
      sender_photo: currentEmployee?.profile_photo,
      content: messageText,
      message_type: attachments.length > 0 ? 'file' : 'text',
      file_url: attachments[0]?.url,
      file_name: attachments[0]?.name,
      reply_to_id: replyTo?.id,
      reply_to_content: replyTo?.content,
      reply_to_sender: replyTo?.sender_name,
    };

    sendMessageMutation.mutate(messageData);

    // Update room's last message
    base44.entities.ChatRoom.update(room.id, {
      last_message: messageText || `Sent ${attachments.length} file(s)`,
      last_message_time: new Date().toISOString(),
      last_message_sender: currentEmployee?.full_name,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments([{ url: file_url, name: file.name, type: file.type }]);
      toast.success("File uploaded");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const formatMessageDate = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const shouldShowDate = (msg, idx) => {
    if (idx === 0) return true;
    const prevDate = parseISO(messages[idx - 1].created_date);
    const currDate = parseISO(msg.created_date);
    return !isSameDay(prevDate, currDate);
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Select a conversation</h3>
          <p className="text-sm">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const otherName = room.type === 'group'
    ? room.name
    : room.participant_names?.find(n => n !== currentEmployee?.full_name) || room.name;

  const isOnline = room.type === 'direct' &&
    room.participants?.some(p => p !== currentEmployee?.id && onlineUsers.includes(p));



  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              {room.type === 'group' ? (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Users className="w-5 h-5" />
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                  {otherName?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{otherName}</h3>
            <p className="text-xs text-gray-500">
              {room.type === 'group' 
                ? `${room.participants?.length || 0} members` 
                : isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenFiles}>
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Shared Files</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => {
                    setCallType("audio");
                    setShowVideoCall(true);
                  }}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => {
                    setCallType("video");
                    setShowVideoCall(true);
                  }}
                >
                  <Video className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video Call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onViewInfo}>
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chat Info</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Say hi to start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isOwn = msg.sender_id === currentEmployee?.id;
              const showDate = shouldShowDate(msg, idx);

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                        {formatMessageDate(msg.created_date)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && (
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarImage src={msg.sender_photo} />
                          <AvatarFallback className="text-xs bg-gray-200">
                            {msg.sender_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isOwn && room.type === 'group' && (
                          <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_name}</span>
                        )}
                        
                        {/* Reply preview */}
                        {msg.reply_to_content && (
                          <div className={`text-xs px-2 py-1 mb-1 rounded border-l-2 border-[#1EB053] bg-gray-50 ${
                            isOwn ? 'ml-auto' : ''
                          }`}>
                            <span className="font-medium text-[#1EB053]">{msg.reply_to_sender}</span>
                            <p className="text-gray-500 truncate max-w-[200px]">{msg.reply_to_content}</p>
                          </div>
                        )}

                        <div className="relative">
                          <div className={`px-3 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}>
                            {msg.message_type === 'file' && msg.file_url && (
                              <div className={`flex items-center gap-2 mb-1 p-2 rounded ${
                                isOwn ? 'bg-white/20' : 'bg-white'
                              }`}>
                                {msg.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <img src={msg.file_url} alt="" className="max-w-[200px] rounded" />
                                ) : (
                                  <>
                                    <File className="w-5 h-5" />
                                    <span className="text-sm truncate max-w-[150px]">{msg.file_name}</span>
                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </>
                                )}
                              </div>
                            )}
                            {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                          </div>

                          {/* Actions */}
                          <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setReplyTo(msg)}
                            >
                              <Reply className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className={`flex items-center gap-1 mt-0.5 text-xs text-gray-400 ${
                          isOwn ? 'flex-row-reverse' : ''
                        }`}>
                          <span>{format(parseISO(msg.created_date), 'HH:mm')}</span>
                          {isOwn && (
                            msg.is_read 
                              ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> 
                              : <Check className="w-3.5 h-3.5" />
                          )}
                        </div>
                        
                        {/* Reactions */}
                        <MessageReactions 
                          message={msg} 
                          currentEmployeeId={currentEmployee?.id}
                          currentEmployeeName={currentEmployee?.full_name}
                        />
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator names={typingUsers} />
        )}
      </ScrollArea>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-[#1EB053] rounded" />
            <div>
              <p className="text-xs font-medium text-[#1EB053]">Replying to {replyTo.sender_name}</p>
              <p className="text-xs text-gray-500 truncate max-w-[250px]">{replyTo.content}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyTo(null)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <File className="w-4 h-4 text-[#0072C6]" />
            <span className="text-sm truncate max-w-[200px]">{attachments[0].name}</span>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setAttachments([])}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="flex-1 h-10"
            disabled={isUploading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={(!messageText.trim() && attachments.length === 0) || isUploading}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] h-10 w-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video/Voice Call Dialog */}
      <VideoCallDialog
        open={showVideoCall}
        onOpenChange={setShowVideoCall}
        callType={callType}
        room={room}
        currentEmployee={currentEmployee}
      />
    </div>
  );
}