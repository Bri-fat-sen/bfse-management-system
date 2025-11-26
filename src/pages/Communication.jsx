import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MessageSquare,
  Calendar,
  Plus,
  Users,
  Video,
  Phone,
  Clock,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MeetingDialog from "@/components/communication/MeetingDialog";
import ChatSidebar from "@/components/communication/ChatSidebar";
import ChatWindow from "@/components/communication/ChatWindow";
import NewChatDialog from "@/components/communication/NewChatDialog";

export default function Communication() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedRoom?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: selectedRoom?.id }, 'created_date', 100),
    enabled: !!selectedRoom?.id,
    refetchInterval: 3000,
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
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      setSelectedRoom(room);
      toast.success("Conversation created");
    },
  });

  const handleSendMessage = (content) => {
    if (!content.trim() || !selectedRoom) return;

    sendMessageMutation.mutate({
      organisation_id: orgId,
      room_id: selectedRoom.id,
      sender_id: currentEmployee?.id,
      sender_name: currentEmployee?.full_name,
      sender_photo: currentEmployee?.profile_photo,
      content: content,
      message_type: 'text',
    });

    base44.entities.ChatRoom.update(selectedRoom.id, {
      last_message: content,
      last_message_time: new Date().toISOString(),
      last_message_sender: currentEmployee?.full_name,
    });
  };

  const startDirectChat = (emp) => {
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

  const createGroupChat = (name, members) => {
    const allParticipants = [currentEmployee, ...members];
    
    createRoomMutation.mutate({
      organisation_id: orgId,
      name: name,
      type: 'group',
      participants: allParticipants.map(m => m.id),
      participant_names: allParticipants.map(m => m.full_name),
      is_active: true,
    });
  };

  const myRooms = chatRooms.filter(r => r.participants?.includes(currentEmployee?.id));
  const upcomingMeetings = meetings.filter(m => m.status !== 'completed');
  const todayMeetings = meetings.filter(m => {
    if (!m.date) return false;
    const meetingDate = new Date(m.date);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Hub"
        subtitle="Connect with your team"
      >
        {activeTab === "meetings" && (
          <Button 
            onClick={() => setShowMeetingDialog(true)} 
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        )}
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4" />
            Chat
            {myRooms.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{myRooms.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Calendar className="w-4 h-4" />
            Meetings
            {todayMeetings.length > 0 && (
              <Badge className="ml-1 text-xs bg-red-500">{todayMeetings.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-280px)] min-h-[500px]">
              {/* Sidebar - hidden on mobile when chat selected */}
              <div className={`border-r ${isMobileView && selectedRoom ? 'hidden' : 'block'}`}>
                <ChatSidebar
                  rooms={myRooms}
                  selectedRoom={selectedRoom}
                  onSelectRoom={setSelectedRoom}
                  onNewChat={() => setShowNewChatDialog(true)}
                  onNewGroup={() => setShowNewChatDialog(true)}
                  currentEmployeeId={currentEmployee?.id}
                  currentEmployeeName={currentEmployee?.full_name}
                />
              </div>

              {/* Chat Window */}
              <div className={`lg:col-span-2 ${isMobileView && !selectedRoom ? 'hidden' : 'block'}`}>
                <ChatWindow
                  room={selectedRoom}
                  messages={messages}
                  currentEmployee={currentEmployee}
                  onSendMessage={handleSendMessage}
                  onBack={() => setSelectedRoom(null)}
                  isMobile={isMobileView}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="mt-4 space-y-4">
          {/* Today's Meetings */}
          {todayMeetings.length > 0 && (
            <Card className="border-l-4 border-l-[#1EB053]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1EB053]" />
                  Today's Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {todayMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 rounded-xl">
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
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {meeting.start_time}
                            </span>
                            {meeting.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {meeting.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button className="bg-[#1EB053] hover:bg-[#178f43]">
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No Meetings Scheduled"
                  description="Schedule meetings to collaborate with your team"
                  action={() => setShowMeetingDialog(true)}
                  actionLabel="Schedule Meeting"
                />
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
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
                          {meeting.attendee_names?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex -space-x-2">
                                {meeting.attendee_names.slice(0, 3).map((name, i) => (
                                  <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-[10px]">
                                      {name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              {meeting.attendee_names.length > 3 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  +{meeting.attendee_names.length - 3} more
                                </span>
                              )}
                            </div>
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

      <MeetingDialog
        open={showMeetingDialog}
        onOpenChange={setShowMeetingDialog}
        employees={employees}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        employees={employees}
        currentEmployee={currentEmployee}
        onStartDirectChat={startDirectChat}
        onCreateGroup={createGroupChat}
      />
    </div>
  );
}