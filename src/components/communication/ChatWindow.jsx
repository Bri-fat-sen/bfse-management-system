import React, { useState, useRef, useEffect } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Users,
  Hash,
  Circle,
  ArrowLeft,
  Info
} from "lucide-react";
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

export default function ChatWindow({
  room,
  messages,
  currentEmployee,
  onSendMessage,
  onBack,
  isMobile
}) {
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  const getDisplayName = () => {
    if (room.type === 'group') return room.name;
    return room.participant_names?.find(n => n !== currentEmployee?.full_name) || room.name;
  };

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;
    
    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_date);
      if (!currentDate || !isSameDay(currentDate, msgDate)) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msg.created_date });
      }
      groups.push({ type: 'message', ...msg });
    });
    
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center max-w-sm px-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-[#1EB053]" />
          </div>
          <h3 className="font-bold text-xl text-gray-800 mb-2">Your Messages</h3>
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="relative">
            <Avatar className="w-10 h-10">
              {room.type === 'group' ? (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Hash className="w-4 h-4" />
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                  {getDisplayName()?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            {room.type === 'direct' && (
              <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-white stroke-white stroke-2" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{getDisplayName()}</p>
            <p className="text-xs text-green-600">
              {room.type === 'group' 
                ? `${room.participants?.length || 0} members` 
                : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#1EB053]">
                  <Phone className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#0072C6]">
                  <Video className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video Call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Info className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chat Info</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-[#F8FAFC]">
        <div className="p-4 space-y-4 min-h-full">
          {groupedMessages.length === 0 ? (
            <div className="h-full min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400">Say hello! 👋</p>
              </div>
            </div>
          ) : (
            groupedMessages.map((item, index) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${index}`} className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 shadow-sm border">
                      {formatMessageDate(item.date)}
                    </div>
                  </div>
                );
              }

              const isOwn = item.sender_id === currentEmployee?.id;
              
              return (
                <div key={item.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && room.type === 'group' && (
                      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                        <AvatarImage src={item.sender_photo} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          {item.sender_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={isOwn ? 'text-right' : ''}>
                      {!isOwn && room.type === 'group' && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{item.sender_name?.split(' ')[0]}</p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl inline-block ${
                        isOwn 
                          ? 'bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white rounded-br-md' 
                          : 'bg-white text-gray-900 shadow-sm border rounded-bl-md'
                      }`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] text-gray-400">
                          {format(new Date(item.created_date), 'HH:mm')}
                        </span>
                        {isOwn && (
                          item.is_read 
                            ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            : <Check className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#1EB053]">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#1EB053] hidden sm:flex">
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#1EB053]"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1EB053]"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          <Button 
            onClick={handleSend} 
            disabled={!messageText.trim()}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] h-10 w-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}