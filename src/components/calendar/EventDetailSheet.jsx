import { } from "react";
import { format, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  MapPin, 
  Flag, 
  CheckCircle2,
  Edit,
  Video,
  Phone,
  Briefcase,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-700" },
  scheduled: { label: "Scheduled", color: "bg-purple-100 text-purple-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
};

export default function EventDetailSheet({ 
  open, 
  onOpenChange, 
  event, 
  onEdit 
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.Task.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted", "Task removed successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Error", "Failed to delete task");
    },
  });

  if (!event) return null;

  const { type, data } = event;

  const handleDeleteTask = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(data.id);
    }
  };

  const renderTaskDetails = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{data.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={priorityConfig[data.priority]?.color}>
              {priorityConfig[data.priority]?.label} Priority
            </Badge>
            <Badge className={statusConfig[data.status]?.color}>
              {statusConfig[data.status]?.label}
            </Badge>
          </div>
        </div>
      </div>

      {data.description && (
        <p className="text-gray-600 text-sm">{data.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Due: {format(parseISO(data.due_date), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        {data.due_time && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Time: {data.due_time}</span>
          </div>
        )}
        {data.assigned_to_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Assigned to: {data.assigned_to_name}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onEdit?.(event)}
          className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Task
        </Button>
        <Button
          onClick={handleDeleteTask}
          variant="destructive"
          disabled={deleteTaskMutation.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderMeetingDetails = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          {data.meeting_type === 'video' ? (
            <Video className="w-5 h-5 text-purple-600" />
          ) : data.meeting_type === 'audio' ? (
            <Phone className="w-5 h-5 text-purple-600" />
          ) : (
            <Users className="w-5 h-5 text-purple-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{data.title}</h3>
          <Badge className={statusConfig[data.status]?.color}>
            {statusConfig[data.status]?.label}
          </Badge>
        </div>
      </div>

      {data.description && (
        <p className="text-gray-600 text-sm">{data.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{format(parseISO(data.date), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{data.start_time} - {data.end_time || 'TBD'}</span>
        </div>
        {data.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{data.location}</span>
          </div>
        )}
        {data.organizer_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Organized by: {data.organizer_name}</span>
          </div>
        )}
      </div>

      {data.attendee_names?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Attendees:</p>
          <div className="flex flex-wrap gap-1">
            {data.attendee_names.map((name, idx) => (
              <Badge key={idx} variant="outline">{name}</Badge>
            ))}
          </div>
        </div>
      )}

      {data.meeting_link && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(data.meeting_link, '_blank')}
        >
          <Video className="w-4 h-4 mr-2" />
          Join Meeting
        </Button>
      )}
    </div>
  );

  const renderLeaveDetails = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{data.employee_name}</h3>
          <Badge className="bg-amber-100 text-amber-700 capitalize">
            {data.leave_type} Leave
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {format(parseISO(data.start_date), 'MMM d')} - {format(parseISO(data.end_date), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{data.days_requested} day(s)</span>
        </div>
      </div>

      {data.reason && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
          <p className="text-sm text-gray-600">{data.reason}</p>
        </div>
      )}

      {data.approved_by_name && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Approved by {data.approved_by_name}</span>
        </div>
      )}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <SheetTitle>Event Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {type === 'task' && renderTaskDetails()}
          {type === 'meeting' && renderMeetingDetails()}
          {type === 'leave' && renderLeaveDetails()}
        </div>
      </SheetContent>
    </Sheet>
  );
}