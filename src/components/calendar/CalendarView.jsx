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

  const calendarDays = generateCalendarDays();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5">
        <div className="flex flex-col gap-3">
          {/* Top row: Title and navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800">
                  {format(currentDate, 'MMM yyyy')}
                </h2>
                <p className="text-[10px] sm:text-sm text-gray-500">
                  {allEvents.length} events
                </p>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Bottom row: View toggle and Add button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 sm:p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("month")}
                className={cn(
                  "rounded-md px-2 sm:px-3 h-7 sm:h-8 text-xs sm:text-sm",
                  view === "month" && "bg-white shadow-sm"
                )}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("week")}
                className={cn(
                  "rounded-md px-2 sm:px-3 h-7 sm:h-8 text-xs sm:text-sm",
                  view === "week" && "bg-white shadow-sm"
                )}
              >
                Week
              </Button>
            </div>

            {onAddTask && (
              <Button
                onClick={() => onAddTask()}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            )}
          </div>
        </div>

        {/* Legend - scrollable on mobile */}
        <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {Object.entries(eventColors).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1 flex-shrink-0">
              <div className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", colors.dot)} />
              <span className="text-[10px] sm:text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-1.5 sm:p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1 sm:py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                        "min-h-[60px] sm:min-h-[100px] p-0.5 sm:p-1 rounded-md sm:rounded-lg border transition-colors",
                        !isCurrentMonth && "bg-gray-50 opacity-50",
                        isToday && "border-[#1EB053] bg-green-50/50",
                        snapshot.isDraggingOver && "bg-blue-50 border-blue-300",
                        !isToday && isCurrentMonth && "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "text-[10px] sm:text-sm font-medium mb-0.5 sm:mb-1 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full mx-auto",
                        isToday && "bg-[#1EB053] text-white",
                        !isToday && !isCurrentMonth && "text-gray-400",
                        !isToday && isCurrentMonth && "text-gray-700"
                      )}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-0.5 max-h-[35px] sm:max-h-[80px] overflow-y-auto">
                        {dayEvents.slice(0, view === "month" ? 2 : 10).map((event, eventIdx) => (
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
                                  "text-[8px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded truncate cursor-pointer transition-all",
                                  eventColors[event.category || event.type]?.bg,
                                  eventColors[event.category || event.type]?.text,
                                  "border-l-2",
                                  eventColors[event.category || event.type]?.border,
                                  snapshot.isDragging && "shadow-lg ring-2 ring-blue-400",
                                  event.status === 'completed' && "line-through opacity-60"
                                )}
                              >
                                <span className="hidden sm:inline">
                                  {event.time && (
                                    <span className="font-medium mr-1">{event.time}</span>
                                  )}
                                  {event.title}
                                </span>
                                <span className="sm:hidden">{event.title.substring(0, 8)}{event.title.length > 8 ? '…' : ''}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {dayEvents.length > 2 && view === "month" && (
                          <div className="text-[8px] sm:text-[10px] text-gray-500 text-center">
                            +{dayEvents.length - 2}
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
        </div>
      </DragDropContext>
    </div>
  );
}