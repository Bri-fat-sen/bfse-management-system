import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  Check,
  CheckCheck,
  Paperclip
} from "lucide-react";
import { format } from "date-fns";

export default function Communication() {
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showNewMeetingDialog, setShowNewMeetingDialog] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

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
    queryKey: ['chatRooms', orgId, currentEmployee?.id],
    queryFn: () => base44.entities.ChatRoom.filter({ organisation_id: orgId }),
    enabled: !!orgId && !!currentEmployee?.id,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedRoom?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: selectedRoom?.id }, 'created_date', 100),
    enabled: !!selectedRoom?.id,
    refetchInterval: 3000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, '-date', 20),
    enabled: !!orgId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) => base44.entities.ChatMessage.create({
      organisation_id: orgId,
      room_id: selectedRoom.id,
      sender_id: currentEmployee.id,
      sender_name: currentEmployee.full_name,
      sender_photo: currentEmployee.profile_photo,
      content,
      message_type: "text"
    }),
    onSuccess: () => {
      refetchMessages();
      setMessageInput("");
      // Update last message in room
      base44.entities.ChatRoom.update(selectedRoom.id, {
        last_message: messageInput.substring(0, 50),
        last_message_time: new Date().toISOString(),
        last_message_sender: currentEmployee.full_name
      });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      setShowNewChatDialog(false);
      setSelectedRoom(newRoom);
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: (data) => base44.entities.Meeting.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setShowNewMeetingDialog(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedRoom) return;
    sendMessageMutation.mutate(messageInput);
  };

  const myRooms = chatRooms.filter(room => 
    room.participants?.includes(currentEmployee?.id)
  );

  const getOtherParticipant = (room) => {
    if (room.type === 'group') return null;
    const otherId = room.participants?.find(p => p !== currentEmployee?.id);
    return employees.find(e => e.id === otherId);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Communication Hub" 
        subtitle="Chat, calls, and meetings"
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
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" onClick={() => setShowNewChatDialog(true)} className="sl-gradient">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search chats..." className="pl-10" />
                  </div>
                </div>
                <ScrollArea className="h-[480px]">
                  {myRooms.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No conversations yet
                    </div>
                  ) : (
                    myRooms.map((room) => {
                      const otherPerson = getOtherParticipant(room);
                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b ${
                            selectedRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-l-[#1D5FC3]' : ''
                          }`}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={room.type === 'group' ? null : otherPerson?.profile_photo} />
                            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] text-white">
                              {room.type === 'group' ? <Users className="w-5 h-5" /> : otherPerson?.first_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {room.type === 'group' ? room.name : otherPerson?.full_name || 'Unknown'}
                              </p>
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
                      );
                    })
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 border-0 shadow-sm flex flex-col">
              {selectedRoom ? (
                <>
                  <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] text-white">
                          {selectedRoom.type === 'group' ? <Users className="w-4 h-4" /> : getOtherParticipant(selectedRoom)?.first_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {selectedRoom.type === 'group' ? selectedRoom.name : getOtherParticipant(selectedRoom)?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedRoom.type === 'group' 
                            ? `${selectedRoom.participants?.length} members` 
                            : 'Direct message'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isMe = msg.sender_id === currentEmployee?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                              {!isMe && (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={msg.sender_photo} />
                                  <AvatarFallback className="text-xs bg-gray-200">
                                    {msg.sender_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                {!isMe && selectedRoom.type === 'group' && (
                                  <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_name}</p>
                                )}
                                <div className={`px-4 py-2 rounded-2xl ${
                                  isMe 
                                    ? 'bg-gradient-to-r from-[#1EB053] to-[#1D5FC3] text-white rounded-br-sm' 
                                    : 'bg-gray-100 rounded-bl-sm'
                                }`}>
                                  <p>{msg.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                                  <span className="text-xs text-gray-400">
                                    {msg.created_date && format(new Date(msg.created_date), 'HH:mm')}
                                  </span>
                                  {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="sl-gradient"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <EmptyState
                    icon={MessageSquare}
                    title="Select a conversation"
                    description="Choose a chat from the list or start a new conversation"
                    action={() => setShowNewChatDialog(true)}
                    actionLabel="New Chat"
                  />
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowNewMeetingDialog(true)} className="sl-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={
                      meeting.status === 'scheduled' ? "bg-blue-100 text-blue-800" :
                      meeting.status === 'in_progress' ? "bg-green-100 text-green-800" :
                      meeting.status === 'completed' ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {meeting.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">{meeting.meeting_type?.replace(/_/g, ' ')}</Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">{meeting.title}</h3>
                  {meeting.description && (
                    <p className="text-sm text-gray-500 mb-4">{meeting.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {meeting.date && format(new Date(meeting.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {meeting.start_time} - {meeting.end_time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      {meeting.attendees?.length || 0} attendees
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <p className="text-xs text-gray-500">By {meeting.organizer_name}</p>
                    {meeting.meeting_type === 'video' && meeting.status === 'scheduled' && (
                      <Button size="sm" className="sl-gradient">
                        <Video className="w-3 h-3 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          <NewChatForm 
            employees={employees.filter(e => e.id !== currentEmployee?.id)}
            currentEmployee={currentEmployee}
            orgId={orgId}
            existingRooms={myRooms}
            onCreateRoom={(data) => createRoomMutation.mutateAsync(data)}
            onCancel={() => setShowNewChatDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* New Meeting Dialog */}
      <Dialog open={showNewMeetingDialog} onOpenChange={setShowNewMeetingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <MeetingForm 
            employees={employees}
            currentEmployee={currentEmployee}
            orgId={orgId}
            onSave={(data) => createMeetingMutation.mutateAsync(data)}
            onCancel={() => setShowNewMeetingDialog(false)}
            isLoading={createMeetingMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewChatForm({ employees, currentEmployee, orgId, existingRooms, onCreateRoom, onCancel }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter(e => 
    e.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEmployee = async (emp) => {
    // Check if direct chat already exists
    const existingRoom = existingRooms.find(room => 
      room.type === 'direct' && room.participants?.includes(emp.id)
    );
    
    if (existingRoom) {
      onCancel();
      return;
    }

    await onCreateRoom({
      organisation_id: orgId,
      type: 'direct',
      participants: [currentEmployee.id, emp.id],
      participant_names: [currentEmployee.full_name, emp.full_name]
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Search employees..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="h-64">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => handleSelectEmployee(emp)}
            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Avatar>
              <AvatarImage src={emp.profile_photo} />
              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#1D5FC3] text-white">
                {emp.first_name?.[0]}{emp.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{emp.full_name}</p>
              <p className="text-sm text-gray-500">{emp.position || emp.role}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

function MeetingForm({ employees, currentEmployee, orgId, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: "09:00",
    end_time: "10:00",
    meeting_type: "in_person",
    location: "",
    attendees: [],
    attendee_names: []
  });

  const handleAttendeesChange = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (formData.attendees.includes(empId)) {
      setFormData({
        ...formData,
        attendees: formData.attendees.filter(id => id !== empId),
        attendee_names: formData.attendee_names.filter(name => name !== emp?.full_name)
      });
    } else {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, empId],
        attendee_names: [...formData.attendee_names, emp?.full_name]
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input 
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Meeting title"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Date</label>
          <Input 
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Start</label>
          <Input 
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">End</label>
          <Input 
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Type</label>
        <div className="flex gap-2 mt-1">
          {['in_person', 'video', 'audio'].map(type => (
            <Button
              key={type}
              variant={formData.meeting_type === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData({ ...formData, meeting_type: type })}
              className={formData.meeting_type === type ? "sl-gradient" : ""}
            >
              {type === 'in_person' ? 'In Person' : type === 'video' ? 'Video' : 'Audio'}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Attendees</label>
        <ScrollArea className="h-32 border rounded-lg mt-1">
          {employees.map(emp => (
            <div 
              key={emp.id}
              onClick={() => handleAttendeesChange(emp.id)}
              className={`p-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50 ${
                formData.attendees.includes(emp.id) ? 'bg-blue-50' : ''
              }`}
            >
              <input 
                type="checkbox" 
                checked={formData.attendees.includes(emp.id)}
                readOnly
                className="w-4 h-4"
              />
              <span className="text-sm">{emp.full_name}</span>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={() => onSave({
            ...formData,
            organisation_id: orgId,
            organizer_id: currentEmployee.id,
            organizer_name: currentEmployee.full_name,
            status: "scheduled"
          })}
          disabled={isLoading || !formData.title}
          className="sl-gradient"
        >
          {isLoading ? "Scheduling..." : "Schedule Meeting"}
        </Button>
      </div>
    </div>
  );
}