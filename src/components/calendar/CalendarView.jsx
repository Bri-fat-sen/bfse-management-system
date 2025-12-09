import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, Briefcase, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const eventColors = {
  task: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-800", dot: "bg-blue-500" },
  meeting: { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-800", dot: "bg-purple-500" },
  leave: { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-800", dot: "bg-amber-500" },
  deadline: { bg: "bg-red-100", border: "border-red-400", text: "text-red-800", dot: "bg-red-500" },
  reminder: { bg: "bg-green-100", border: "border-green-400", text: "text-green-800", dot: "bg-green-500" },
};

const priorityColors = {
  low: "bg-gray-200 text-gray-700",
  medium: "bg-blue-200 text-blue-700",
  high: "bg-orange-200 text-orange-700",
  urgent: "bg-red-200 text-red-700",
};

export default function CalendarView({ 
  tasks = [], 
  meetings = [], 
  leaveRequests = [], 
  onTaskDrop, 
  onEventClick,
  onAddTask,
  currentEmployee 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week

  // Combine all events into unified format
  const allEvents = useMemo(() => {
    const events = [];

    // Add tasks
    tasks.forEach(task => {
      if (task.due_date) {
        events.push({
          id: task.id,
          type: "task",
          title: task.title,
          date: task.due_date,
          time: task.due_time,
          priority: task.priority,
          status: task.status,
          category: task.category === 'deadline' ? 'deadline' : 'task',
          data: task,
          draggable: true,
        });
      }
    });

    // Add meetings
    meetings.forEach(meeting => {
      if (meeting.date && meeting.status !== 'cancelled') {
        events.push({
          id: meeting.id,
          type: "meeting",
          title: meeting.title,
          date: meeting.date,
          time: meeting.start_time,
          endTime: meeting.end_time,
          attendees: meeting.attendee_names,
          data: meeting,
          draggable: false,
        });
      }
    });

    // Add leave requests (approved only)
    leaveRequests.forEach(leave => {
      if (leave.status === 'approved' && leave.start_date) {
        // Create event for each day of leave
        const start = parseISO(leave.start_date);
        const end = parseISO(leave.end_date);
        let current = start;
        while (current <= end) {
          events.push({
            id: `${leave.id}-${format(current, 'yyyy-MM-dd')}`,
            type: "leave",
            title: `${leave.employee_name} - ${leave.leave_type} leave`,
            date: format(current, 'yyyy-MM-dd'),
            data: leave,
            draggable: false,
          });
          current = addDays(current, 1);
        }
      }
    });

    return events;
  }, [tasks, meetings, leaveRequests]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allEvents.filter(event => event.date === dateStr);
  };

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newDate = destination.droppableId;
    const event = allEvents.find(e => e.id === draggableId);
    
    if (event && event.draggable && onTaskDrop) {
      onTaskDrop(event.data, newDate);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    if (view === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(weekStart, i));
      }
      return days;
    }

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const calendarDays = useMemo(() => generateCalendarDays(), [currentDate, view]);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
      {/* Sierra Leone Stripe */}
      <div className="h-1 flex">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y border-gray-100" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex flex-col gap-3">
          {/* Top row: Title and navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#1EB053] to-[#0072C6] rounded-xl blur opacity-30" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 text-gray-700 border-0">
                    {allEvents.length} events scheduled
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 border-gray-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                className="h-9 sm:h-10 rounded-xl hover:bg-gray-100 border-gray-200 font-semibold"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 border-gray-200"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Bottom row: View toggle and Add button */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-xl blur" />
              <div className="relative flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("month")}
                  className={cn(
                    "rounded-lg px-4 h-8 text-sm font-medium transition-all relative",
                    view === "month" ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {view === "month" && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 flex rounded-t-lg overflow-hidden">
                      <div className="flex-1 bg-white/40" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-white/40" />
                    </div>
                  )}
                  Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("week")}
                  className={cn(
                    "rounded-lg px-4 h-8 text-sm font-medium transition-all relative",
                    view === "week" ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {view === "week" && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 flex rounded-t-lg overflow-hidden">
                      <div className="flex-1 bg-white/40" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-white/40" />
                    </div>
                  )}
                  Week
                </Button>
              </div>
            </div>

            {onAddTask && (
              <Button
                onClick={() => onAddTask()}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:shadow-lg transition-all h-9 sm:h-10 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>Add Task</span>
              </Button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          {Object.entries(eventColors).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all">
              <div className={cn("w-3 h-3 rounded-full shadow-sm", colors.dot)} />
              <span className="text-xs font-medium text-gray-700 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-4 sm:p-6">
          {/* Month View */}
          {view === "month" && (
            <>
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {weekDays.map(day => (
                  <div key={day} className="text-center">
                    <div className="py-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                      <span className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">{day}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);
              const dateStr = format(day, 'yyyy-MM-dd');

              return (
                <Droppable key={dateStr} droppableId={dateStr}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      onClick={() => dayEvents.length === 0 && onAddTask?.(dateStr)}
                      className={cn(
                        "min-h-[90px] sm:min-h-[120px] p-2 sm:p-3 rounded-xl border-2 transition-all group cursor-pointer",
                        !isCurrentMonth && "bg-gray-50/50 opacity-60 border-gray-100",
                        isToday && "border-[#1EB053] bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg ring-2 ring-[#1EB053]/20",
                        snapshot.isDraggingOver && "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400 shadow-lg scale-[1.02]",
                        !isToday && isCurrentMonth && "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
                        "relative overflow-hidden"
                      )}
                    >
                      {/* Date number */}
                      <div className={cn(
                        "text-sm sm:text-base font-bold mb-2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all",
                        isToday && "bg-gradient-to-br from-[#1EB053] to-[#0e7f3d] text-white shadow-md",
                        !isToday && !isCurrentMonth && "text-gray-400",
                        !isToday && isCurrentMonth && "text-gray-700 group-hover:bg-gray-100"
                      )}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Events */}
                      <div className="space-y-1 max-h-[50px] sm:max-h-[70px] overflow-y-auto custom-scrollbar">
                        {dayEvents.slice(0, view === "month" ? 3 : 10).map((event, eventIdx) => (
                          <Draggable
                            key={event.id}
                            draggableId={event.id}
                            index={eventIdx}
                            isDragDisabled={!event.draggable}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick?.(event);
                                }}
                                className={cn(
                                  "text-[10px] sm:text-xs px-2 py-1 rounded-lg cursor-pointer transition-all hover:shadow-md",
                                  eventColors[event.category || event.type]?.bg,
                                  eventColors[event.category || event.type]?.text,
                                  "border-l-4 font-medium",
                                  eventColors[event.category || event.type]?.border,
                                  snapshot.isDragging && "shadow-2xl ring-2 ring-blue-500 scale-105 rotate-2",
                                  event.status === 'completed' && "line-through opacity-60",
                                  "flex items-center gap-1"
                                )}
                              >
                                {event.time && (
                                  <span className="font-bold opacity-75">{event.time}</span>
                                )}
                                <span className="truncate flex-1">{event.title}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {dayEvents.length > 3 && view === "month" && (
                          <div className="text-[10px] text-gray-500 text-center font-medium bg-gray-100 rounded py-0.5">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                      {provided.placeholder}

                      {/* Add indicator on hover for empty days */}
                      {dayEvents.length === 0 && isCurrentMonth && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              );
            })}
              </div>
            </>
          )}

          {/* Week View */}
          {view === "week" && (
            <div className="grid grid-cols-7 gap-1 sm:gap-3">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isToday = isSameDay(day, new Date());
                const dateStr = format(day, 'yyyy-MM-dd');

                return (
                  <Droppable key={dateStr} droppableId={dateStr}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        onClick={() => dayEvents.length === 0 && onAddTask?.(dateStr)}
                        className={cn(
                          "min-h-[400px] sm:min-h-[500px] rounded-lg sm:rounded-xl border-2 transition-all group cursor-pointer relative overflow-hidden",
                          isToday && "border-[#1EB053] bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-xl ring-4 ring-[#1EB053]/20",
                          snapshot.isDraggingOver && "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400 shadow-xl scale-[1.02]",
                          !isToday && "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                        )}
                      >
                        {/* Sierra Leone mini stripe for today */}
                        {isToday && (
                          <div className="absolute top-0 left-0 right-0 h-1 flex">
                            <div className="flex-1 bg-[#1EB053]" />
                            <div className="flex-1 bg-white" />
                            <div className="flex-1 bg-[#0072C6]" />
                          </div>
                        )}

                        {/* Date header */}
                        <div className={cn(
                          "p-2 sm:p-4 border-b-2 border-dashed",
                          isToday ? "border-[#1EB053]/30" : "border-gray-200"
                        )}>
                          <div className={cn(
                            "text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-0.5 sm:mb-1",
                            isToday ? "text-[#1EB053]" : "text-gray-500"
                          )}>
                            {format(day, 'EEE')}
                          </div>
                          <div className={cn(
                            "text-2xl sm:text-4xl font-bold",
                            isToday && "bg-gradient-to-br from-[#1EB053] to-[#0072C6] bg-clip-text text-transparent",
                            !isToday && "text-gray-900"
                          )}>
                            {format(day, 'd')}
                          </div>
                          {dayEvents.length > 0 && (
                            <Badge className="mt-2 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 text-gray-700 border-0 text-xs">
                              {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Events list */}
                        <div className="p-1.5 sm:p-3 space-y-1 sm:space-y-2 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
                          {dayEvents.map((event, eventIdx) => (
                            <Draggable
                              key={event.id}
                              draggableId={event.id}
                              index={eventIdx}
                              isDragDisabled={!event.draggable}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick?.(event);
                                  }}
                                  className={cn(
                                    "p-2 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:shadow-lg border-l-4",
                                    eventColors[event.category || event.type]?.bg,
                                    eventColors[event.category || event.type]?.text,
                                    eventColors[event.category || event.type]?.border,
                                    snapshot.isDragging && "shadow-2xl ring-4 ring-blue-500/50 scale-105",
                                    event.status === 'completed' && "opacity-60"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-1 mb-0.5 sm:mb-1">
                                    <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                      {event.time && (
                                        <Badge className="bg-white/50 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                                          <span className="hidden sm:inline">{event.time}</span>
                                        </Badge>
                                      )}
                                      {event.status === 'completed' && (
                                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                      )}
                                    </div>
                                    {event.priority && (
                                      <Badge className={cn("text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5", priorityColors[event.priority])}>
                                        {event.priority.charAt(0).toUpperCase()}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={cn(
                                    "font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-2",
                                    event.status === 'completed' && "line-through"
                                  )}>
                                    {event.title}
                                  </p>
                                  {event.attendees?.length > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs opacity-75 mt-1 sm:mt-2">
                                      <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      <span className="truncate">{event.attendees.length}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {dayEvents.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-10 h-10 mb-2" />
                              <p className="text-xs font-medium">Add event</p>
                            </div>
                          )}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}