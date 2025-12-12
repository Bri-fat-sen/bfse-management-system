import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import {
  MessageSquare,
  Calendar,
  Video,
  Phone,
  Users,
  Plus,
  Clock,
  MapPin,
  ExternalLink,
  Megaphone,
  Repeat,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MeetingDialog from "@/components/communication/MeetingDialog";
import ChatSidebar from "@/components/communication/ChatSidebar";
import ChatWindow from "@/components/communication/ChatWindow";
import AnnouncementsPanel from "@/components/communication/AnnouncementsPanel";
import NewGroupDialog from "@/components/communication/NewGroupDialog";
import GroupSettings from "@/components/communication/GroupSettings";
import MessageSearch from "@/components/communication/MessageSearch";
import SharedFilesGallery from "@/components/communication/SharedFilesGallery";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Communication() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showSharedFiles, setShowSharedFiles] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;
  const canPost = ['super_admin', 'org_admin', 'hr_admin'].includes(currentEmployee?.role);

  const { data: chatRooms = [] } = useQuery({
    queryKey: ['chatRooms', orgId],
    queryFn: () => base44.entities.ChatRoom.filter({ organisation_id: orgId }),
    enabled: !!orgId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedRoom?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: selectedRoom?.id }, 'created_date', 100),
    enabled: !!selectedRoom?.id,
    staleTime: 5 * 1000,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }, 'date', 50),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      setShowNewChatDialog(false);
      setSelectedRoom(room);
    },
  });

  const startChat = (emp) => {
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

  // Loading and error states
  if (!user) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  // Filter and categorize meetings
  const today = new Date();
  const upcomingMeetings = meetings.filter(m => {
    if (!m.date) return false;
    const meetingDate = parseISO(m.date);
    return meetingDate >= today && m.status !== 'cancelled';
  });

  const todayMeetings = upcomingMeetings.filter(m => isToday(parseISO(m.date)));
  const tomorrowMeetings = upcomingMeetings.filter(m => isTomorrow(parseISO(m.date)));
  const laterMeetings = upcomingMeetings.filter(m => 
    !isToday(parseISO(m.date)) && !isTomorrow(parseISO(m.date))
  );

  const MeetingCard = ({ meeting }) => {
    const typeConfig = {
      video: { icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
      audio: { icon: Phone, color: 'text-green-600', bg: 'bg-green-50' },
      in_person: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    };
    const config = typeConfig[meeting.meeting_type] || typeConfig.in_person;
    const Icon = config.icon;

    return (
      <div className="p-4 bg-white rounded-xl border hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {meeting.start_time} - {meeting.end_time || 'TBD'}
              </span>
              {meeting.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {meeting.location}
                </span>
              )}
            </div>
            {meeting.attendee_names?.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  {meeting.attendee_names.slice(0, 4).map((name, i) => (
                    <Avatar key={i} className="w-6 h-6 border-2 border-white">
                      <AvatarFallback className="text-[10px] bg-gray-200">
                        {name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {meeting.attendee_names.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{meeting.attendee_names.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {meeting.is_recurring && (
              <Badge variant="outline" className="text-xs">
                <Repeat className="w-3 h-3 mr-1" />
                Recurring
              </Badge>
            )}
            {meeting.meeting_link && (
              <a
                href={meeting.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1EB053] text-white text-sm rounded-lg hover:bg-[#178f43] transition-colors"
              >
                Join
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          </div>
          </div>
          );
          };

  const MeetingSection = ({ title, meetings, showDate }) => {
    if (meetings.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">{title}</h3>
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <div key={meeting.id}>
              {showDate && (
                <p className="text-xs text-gray-400 mb-1">
                  {format(parseISO(meeting.date), 'EEEE, MMMM d')}
                </p>
              )}
              <MeetingCard meeting={meeting} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sierra Leone Stripe */}
      <div className="h-1 w-full flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-2xl blur opacity-30" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-xl">
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent">
              Communication Hub
            </h1>
            <p className="text-sm text-gray-500 mt-1">Chat, meetings, and announcements</p>
          </div>
        </div>
        <Button
          onClick={() => setShowMeetingDialog(true)}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-xl transition-all"
        >
          <Calendar className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Schedule Meeting</span>
          <span className="sm:hidden">Meeting</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger 
            value="chat" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="meetings" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Meetings</span>
            {todayMeetings.length > 0 && (
              <Badge className="bg-red-500 text-white h-5 px-1.5 text-xs">
                {todayMeetings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="announcements" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
          >
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Announcements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-280px)] min-h-[500px]">
            {/* Sidebar */}
            <Card className="lg:col-span-4 xl:col-span-3 overflow-hidden">
              <ChatSidebar
                rooms={myRooms}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                onNewChat={() => setShowNewChatDialog(true)}
                onNewGroup={() => setShowNewGroupDialog(true)}
                currentEmployeeId={currentEmployee?.id}
              />
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-8 xl:col-span-9 overflow-hidden relative">
              {showSharedFiles && selectedRoom ? (
                <>
                  <div className="absolute top-2 right-2 z-10">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSharedFiles(false)}
                    >
                      Back to Chat
                    </Button>
                  </div>
                  <SharedFilesGallery 
                    messages={messages} 
                    roomName={selectedRoom?.name}
                  />
                </>
              ) : (
                <ChatWindow
                  room={selectedRoom}
                  messages={messages}
                  currentEmployee={currentEmployee}
                  orgId={orgId}
                  onViewInfo={() => selectedRoom?.type === 'group' && setShowGroupSettings(true)}
                  onOpenSearch={() => setShowMessageSearch(true)}
                  onOpenFiles={() => setShowSharedFiles(true)}
                />
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#0072C6]" />
                      Upcoming Meetings
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowMeetingDialog(true)}
                      className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {upcomingMeetings.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="No Upcoming Meetings"
                      description="Schedule meetings to collaborate with your team"
                      action={() => setShowMeetingDialog(true)}
                      actionLabel="Schedule Meeting"
                    />
                  ) : (
                    <>
                      <MeetingSection title="Today" meetings={todayMeetings} />
                      <MeetingSection title="Tomorrow" meetings={tomorrowMeetings} />
                      <MeetingSection title="Later" meetings={laterMeetings} showDate />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 opacity-80" />
                    <span className="text-4xl font-bold">{todayMeetings.length}</span>
                  </div>
                  <p className="text-sm opacity-90">Meetings Today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Meetings</span>
                      <span className="font-semibold">{upcomingMeetings.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Video Calls</span>
                      <span className="font-semibold text-blue-600">
                        {upcomingMeetings.filter(m => m.meeting_type === 'video').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">In Person</span>
                      <span className="font-semibold text-purple-600">
                        {upcomingMeetings.filter(m => m.meeting_type === 'in_person').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowMeetingDialog(true)}
                  >
                    <Video className="w-4 h-4 mr-2 text-blue-600" />
                    Quick Video Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2 text-green-600" />
                    Start Audio Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <div className="max-w-3xl mx-auto">
            <AnnouncementsPanel
              orgId={orgId}
              currentEmployee={currentEmployee}
              canPost={canPost}
              totalEmployees={employees.length}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0072C6]" />
              Start New Chat
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EB053]"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {employees
                .filter(e => 
                  e.id !== currentEmployee?.id &&
                  (e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   e.department?.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => startChat(emp)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                        {emp.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-gray-500">{emp.department || emp.position}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {emp.role?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Group Dialog */}
      <NewGroupDialog
        open={showNewGroupDialog}
        onOpenChange={setShowNewGroupDialog}
        employees={employees}
        currentEmployee={currentEmployee}
        orgId={orgId}
        onGroupCreated={setSelectedRoom}
      />

      {/* Meeting Dialog */}
      <MeetingDialog
        open={showMeetingDialog}
        onOpenChange={setShowMeetingDialog}
        employees={employees}
        orgId={orgId}
        currentEmployee={currentEmployee}
      />

      {/* Group Settings Dialog */}
      <GroupSettings
        room={selectedRoom}
        open={showGroupSettings}
        onOpenChange={setShowGroupSettings}
        currentEmployee={currentEmployee}
        orgId={orgId}
      />

      {/* Message Search Dialog */}
      <MessageSearch
        open={showMessageSearch}
        onOpenChange={setShowMessageSearch}
        orgId={orgId}
        currentEmployee={currentEmployee}
        rooms={myRooms}
        onSelectRoom={(room, messageId) => {
          setSelectedRoom(room);
          setShowMessageSearch(false);
          // Could scroll to specific message if messageId provided
        }}
      />
    </div>
  );
}