import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Users,
  Video,
  Phone,
  Calendar,
  Paperclip,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MeetingDialog from "@/components/communication/MeetingDialog";
import AnnouncementBanner from "@/components/communication/AnnouncementBanner";

export default function Communication() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: chatRooms = [] } = useQuery({
    queryKey: ['chatRooms', orgId],
    queryFn: () => base44.entities.ChatRoom.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedRoom?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: selectedRoom?.id }, 'created_date', 100),
    enabled: !!selectedRoom?.id,
    refetchInterval: 5000,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 20),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      setShowNewChatDialog(false);
      setSelectedRoom(room);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Update room's last message
    base44.entities.ChatRoom.update(selectedRoom.id, {
      last_message: messageText,
      last_message_time: new Date().toISOString(),
      last_message_sender: currentEmployee?.full_name,
    });
  };

  const startChat = (emp) => {
    // Check if room already exists
    const existingRoom = chatRooms.find(r => 
      r.type === 'direct' && 
      r.participants?.includes(currentEmployee?.id) && 
      r.participants?.includes(emp.id)
    );

    if (existingRoom) {
      setSelectedRoom(existingRoom);
      setShowNewChatDialog(false);
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

  const myRooms = chatRooms.filter(r => r.participants?.includes(currentEmployee?.id));

  const filteredRooms = myRooms.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.participant_names?.some(n => n?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Hub"
        subtitle="Chat, calls, and meetings"
      />

      {/* Announcement Banner for Admins */}
      <AnnouncementBanner 
        employees={employees}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Meetings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Chat List */}
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Messages</CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setShowNewChatDialog(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                  {filteredRooms.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No conversations yet</p>
                      <Button variant="link" onClick={() => setShowNewChatDialog(true)}>
                        Start a chat
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredRooms.map((room) => {
                        const otherName = room.participant_names?.find(n => n !== currentEmployee?.full_name) || room.name;
                        const isSelected = selectedRoom?.id === room.id;
                        return (
                          <div
                            key={room.id}
                            className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-[#1EB053]/5 border-l-2 border-l-[#1EB053]' : ''
                            }`}
                            onClick={() => setSelectedRoom(room)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="sl-gradient text-white">
                                  {room.type === 'group' ? <Users className="w-4 h-4" /> : otherName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium truncate">{otherName}</p>
                                  {room.last_message_time && (
                                    <span className="text-xs text-gray-400">
                                      {format(new Date(room.last_message_time), 'HH:mm')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  {room.last_message || 'No messages yet'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedRoom ? (
                <>
                  <CardHeader className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="sl-gradient text-white">
                            {selectedRoom.type === 'group' ? <Users className="w-4 h-4" /> : 
                              selectedRoom.participant_names?.find(n => n !== currentEmployee?.full_name)?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {selectedRoom.participant_names?.find(n => n !== currentEmployee?.full_name) || selectedRoom.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedRoom.type === 'group' ? `${selectedRoom.participants?.length} members` : 'Online'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-[400px] p-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <p>No messages yet. Say hi!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg) => {
                            const isOwn = msg.sender_id === currentEmployee?.id;
                            return (
                              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                  {!isOwn && (
                                    <p className="text-xs text-gray-500 mb-1">{msg.sender_name}</p>
                                  )}
                                  <div className={`p-3 rounded-2xl ${
                                    isOwn 
                                      ? 'bg-gradient-to-r from-[#1EB053] to-[#1D5FC3] text-white rounded-br-md' 
                                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                  }`}>
                                    <p>{msg.content}</p>
                                  </div>
                                  <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                                    isOwn ? 'justify-end' : 'justify-start'
                                  }`}>
                                    <span>{format(new Date(msg.created_date), 'HH:mm')}</span>
                                    {isOwn && (
                                      msg.is_read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>

                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!messageText.trim()}
                        className="sl-gradient"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                    <p className="text-sm">Choose a chat from the list or start a new one</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Meetings</CardTitle>
              <Button onClick={() => setShowMeetingDialog(true)} className="bg-[#0072C6] hover:bg-[#005a9e]">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No Meetings Scheduled"
                  description="Schedule meetings to collaborate with your team"
                />
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          meeting.meeting_type === 'video' ? 'bg-blue-100' : 
                          meeting.meeting_type === 'audio' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {meeting.meeting_type === 'video' ? (
                            <Video className="w-6 h-6 text-blue-600" />
                          ) : meeting.meeting_type === 'audio' ? (
                            <Phone className="w-6 h-6 text-green-600" />
                          ) : (
                            <Users className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(meeting.date), 'EEEE, MMMM d')} at {meeting.start_time}
                          </p>
                          {meeting.attendee_names && (
                            <p className="text-xs text-gray-400">
                              {meeting.attendee_names.slice(0, 3).join(', ')}
                              {meeting.attendee_names.length > 3 && ` +${meeting.attendee_names.length - 3} more`}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={
                        meeting.status === 'completed' ? 'secondary' :
                        meeting.status === 'in_progress' ? 'default' : 'outline'
                      }>
                        {meeting.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Dialog */}
      <MeetingDialog
        open={showMeetingDialog}
        onOpenChange={setShowMeetingDialog}
        employees={employees}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Search employees..." />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {employees
                .filter(e => e.id !== currentEmployee?.id)
                .map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => startChat(emp)}
                  >
                    <Avatar>
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="sl-gradient text-white">
                        {emp.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-gray-500">{emp.department || emp.role}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}