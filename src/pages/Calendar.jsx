import { useState } from "react";
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
  RefreshCw,
  Trash2
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

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.Task.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted");
    },
    onError: () => {
      toast.error("Failed to delete task");
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

  if (!user) {
    return <LoadingSpinner message="Loading..." fullScreen />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <CalendarIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <ProtectedPage module="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Calendar</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Manage tasks, meetings, and schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGoogleSync(true)}
              className="gap-1 text-xs sm:text-sm h-8 sm:h-9"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="hidden sm:inline">Sync with Google</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
              className="h-8 sm:h-9"
            >
              <RefreshCw className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
          <Card className="border-t-4 border-t-blue-500 flex-shrink-0 w-28 sm:w-auto">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                  <p className="text-lg sm:text-2xl font-bold">{taskStats.total}</p>
                </div>
                <ListTodo className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-yellow-500 flex-shrink-0 w-28 sm:w-auto">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold">{taskStats.pending}</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-blue-500 flex-shrink-0 w-28 sm:w-auto">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">In Progress</p>
                  <p className="text-lg sm:text-2xl font-bold">{taskStats.inProgress}</p>
                </div>
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-green-500 flex-shrink-0 w-28 sm:w-auto">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold">{taskStats.completed}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-red-500 flex-shrink-0 w-28 sm:w-auto">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Overdue</p>
                  <p className="text-lg sm:text-2xl font-bold">{taskStats.overdue}</p>
                </div>
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white text-xs sm:text-sm"
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Calendar View</span>
              <span className="sm:hidden">Calendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white text-xs sm:text-sm"
            >
              <ListTodo className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Task List</span>
              <span className="sm:hidden">Tasks</span>
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
              <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">All Tasks</CardTitle>
                <Button
                  onClick={() => handleAddTask()}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] h-8 sm:h-9 text-xs sm:text-sm"
                >
                  Add Task
                </Button>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ListTodo className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">No tasks yet</p>
                    <Button
                      variant="outline"
                      className="mt-3 text-sm"
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
                          className="flex items-start sm:items-center justify-between p-2.5 sm:p-3 rounded-lg border hover:bg-gray-50 transition-colors gap-2"
                        >
                          <div 
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskDialog(true);
                            }}
                            className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1 cursor-pointer"
                          >
                            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 mt-1.5 sm:mt-0 ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-blue-500' :
                              task.due_date < format(new Date(), 'yyyy-MM-dd') ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className={`font-medium text-sm sm:text-base truncate ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                {task.title}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {format(new Date(task.due_date), 'MMM d')}
                                {task.due_time && ` • ${task.due_time}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            <Badge variant="outline" className="capitalize text-[10px] sm:text-xs px-1.5 sm:px-2">
                              {task.priority}
                            </Badge>
                            {task.assigned_to_name && (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 hidden sm:inline-flex">
                                {task.assigned_to_name.split(' ')[0]}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Delete this task?")) {
                                  deleteTaskMutation.mutate(task.id);
                                }
                              }}
                              className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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