import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2, Calendar, Clock, Flag, Tag, User, Trash2, X, Check,
  FileText
} from "lucide-react";
import { format } from "date-fns";

const priorities = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-600" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-600" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-600" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-600" },
];

const categories = [
  { value: "work", label: "Work" },
  { value: "meeting", label: "Meeting" },
  { value: "deadline", label: "Deadline" },
  { value: "reminder", label: "Reminder" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
];

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function TaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  orgId, 
  employees = [],
  currentEmployee,
  defaultDate,
  organisation
}) {
  const queryClient = useQueryClient();
  const isEditing = !!task;
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    due_time: "",
    priority: "medium",
    category: "work",
    status: "pending",
    assigned_to_id: "",
    assigned_to_name: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        due_date: task.due_date || format(new Date(), 'yyyy-MM-dd'),
        due_time: task.due_time || "",
        priority: task.priority || "medium",
        category: task.category || "work",
        status: task.status || "pending",
        assigned_to_id: task.assigned_to_id || "",
        assigned_to_name: task.assigned_to_name || "",
      });
      setShowAdvanced(true);
    } else {
      setFormData({
        title: "",
        description: "",
        due_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
        due_time: "",
        priority: "medium",
        category: "work",
        status: "pending",
        assigned_to_id: currentEmployee?.id || "",
        assigned_to_name: currentEmployee?.full_name || "",
      });
      setShowAdvanced(false);
    }
  }, [task, defaultDate, currentEmployee, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({
      ...data,
      organisation_id: orgId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task created successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.update(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task updated successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Task.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const data = {
      ...formData,
      completed_date: formData.status === 'completed' ? format(new Date(), 'yyyy-MM-dd') : null,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAssigneeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setFormData(prev => ({
      ...prev,
      assigned_to_id: employeeId,
      assigned_to_name: employee?.full_name || "",
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header */}
        <div 
          className="px-6 py-4 text-white border-b border-white/20"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{isEditing ? 'Edit Task' : 'Quick Task'}</h2>
                <p className="text-white/80 text-xs">Press Ctrl+Enter to save</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div>
              <Label className="font-medium">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What needs to be done?"
                autoFocus
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Due Date *</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm">Time</Label>
                <Input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Assigned To</Label>
                <Select value={formData.assigned_to_id} onValueChange={handleAssigneeChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full text-sm text-gray-600 hover:text-gray-900 text-left"
            >
              {showAdvanced ? '− Hide' : '+ Show'} More Options
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label className="text-sm">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isEditing && (
                  <div>
                    <Label className="text-sm">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add details..."
                    className="mt-1.5"
                    rows={2}
                  />
                </div>

                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => { if (confirm("Delete this task?")) deleteMutation.mutate(); }}
                    disabled={isPending}
                    className="w-full"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{isEditing ? 'Update' : 'Add Task'}</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}