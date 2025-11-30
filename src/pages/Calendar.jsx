import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { toast } from "sonner";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import CalendarView from "@/components/calendar/CalendarView";
import TaskDialog from "@/components/calendar/TaskDialog";
import EventDetailSheet from "@/components/calendar/EventDetailSheet";
import GoogleCalendarSync from "@/components/calendar/GoogleCalendarSync";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  RefreshCw
} from "lucide-react";

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventSheet, setShowEventSheet] = useState(false);
  const [defaultDate, setDefaultDate] = useState(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [showGoogleSync, setShowGoogleSync] = useState(false);

  // Fetch current user and employee
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch all employees for assignment
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', orgId],
    queryFn: () => base44.entities.Task.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Fetch meetings (3 months range)
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ['meetings', orgId],
    queryFn: () => base44.entities.Meeting.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Fetch leave requests (approved only)
  const { data: leaveRequests = [], isLoading: leaveLoading } = useQuery({
    queryKey: ['leaveRequests', orgId],
    queryFn: () => base44.entities.LeaveRequest.filter({ organisation_id: orgId, status: 'approved' }),
    enabled: !!orgId,
  });

  // Update task mutation (for drag and drop)
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task rescheduled");
    },
    onError: () => {
      toast.error("Failed to reschedule task");
    },
  });

  const handleTaskDrop = (task, newDate) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { due_date: newDate },
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventSheet(true);
  };

  const handleEditTask = (event) => {
    setShowEventSheet(false);
    setSelectedTask(event.data);
    setShowTaskDialog(true);
  };

  const handleAddTask = (date) => {
    setSelectedTask(null);
    setDefaultDate(date || format(new Date(), 'yyyy-MM-dd'));
    setShowTaskDialog(true);
  };

  // Task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.due_date < format(new Date(), 'yyyy-MM-dd')).length,
  };

  const isLoading = tasksLoading || meetingsLoading || leaveLoading;

  if (!user || !currentEmployee || !orgId) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  return (
    <ProtectedPage module="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
              <p className="text-sm text-gray-500">Manage tasks, meetings, and schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGoogleSync(true)}
              className="gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sync with Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                </div>
                <ListTodo className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{taskStats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">{taskStats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold">{taskStats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white"
            >
              <ListTodo className="w-4 h-4 mr-1" />
              Task List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <LoadingSpinner message="Loading calendar..." />
              </div>
            ) : (
              <CalendarView
                tasks={tasks}
                meetings={meetings}
                leaveRequests={leaveRequests}
                onTaskDrop={handleTaskDrop}
                onEventClick={handleEventClick}
                onAddTask={handleAddTask}
                currentEmployee={currentEmployee}
              />
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Tasks</CardTitle>
                <Button
                  onClick={() => handleAddTask()}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No tasks yet</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => handleAddTask()}
                    >
                      Create your first task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks
                      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                      .map(task => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskDialog(true);
                          }}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-blue-500' :
                              task.due_date < format(new Date(), 'yyyy-MM-dd') ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <div>
                              <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(task.due_date), 'MMM d, yyyy')}
                                {task.due_time && ` at ${task.due_time}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {task.priority}
                            </Badge>
                            {task.assigned_to_name && (
                              <Badge variant="secondary">
                                {task.assigned_to_name.split(' ')[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Task Dialog */}
        <TaskDialog
          open={showTaskDialog}
          onOpenChange={(open) => {
            setShowTaskDialog(open);
            if (!open) {
              setSelectedTask(null);
              setDefaultDate(null);
            }
          }}
          task={selectedTask}
          orgId={orgId}
          employees={employees}
          currentEmployee={currentEmployee}
          defaultDate={defaultDate}
        />

        {/* Event Detail Sheet */}
        <EventDetailSheet
          open={showEventSheet}
          onOpenChange={setShowEventSheet}
          event={selectedEvent}
          onEdit={handleEditTask}
        />

        {/* Google Calendar Sync */}
        <GoogleCalendarSync
          open={showGoogleSync}
          onOpenChange={setShowGoogleSync}
          orgId={orgId}
          onSyncComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
          }}
        />
      </div>
    </ProtectedPage>
  );
}