import React, { useState, useEffect } from "react";
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
  const [activeSection, setActiveSection] = useState('details');

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
    }
    if (open) {
      setActiveSection('details');
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

  const sections = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>

        {/* Header with gradient */}
        <div 
          className="px-6 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Edit Task' : 'New Task'}
                </h2>
                <p className="text-white/80 text-sm">
                  {isEditing ? `Updating: ${task.title}` : 'Create a new task'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6">
            
            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Task Details</h3>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                    className="mt-1.5 border-gray-200"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add details about this task..."
                    className="mt-1.5 border-gray-200"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Flag className="w-3 h-3" /> Priority
                    </Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(p => (
                          <SelectItem key={p.value} value={p.value}>
                            <span className={`px-2 py-0.5 rounded ${p.color}`}>{p.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Category
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium flex items-center gap-2">
                    <User className="w-3 h-3" /> Assigned To
                  </Label>
                  <Select 
                    value={formData.assigned_to_id} 
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className="mt-1.5 border-gray-200">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Schedule Section */}
            {activeSection === 'schedule' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <Calendar className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Schedule</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
                    <Label className="text-[#1EB053] font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Due Date *
                    </Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="mt-2 border-[#1EB053]/30 bg-white"
                    />
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Time
                    </Label>
                    <Input
                      type="time"
                      value={formData.due_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                      className="mt-2 border-gray-200 bg-white"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                    >
                      <SelectTrigger className="mt-1.5 border-gray-200">
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

                {isEditing && (
                  <div className="pt-4 border-t">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Delete this task?")) {
                          deleteMutation.mutate();
                        }
                      }}
                      disabled={isPending}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full sm:flex-1 text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />{isEditing ? 'Update Task' : 'Create Task'}</>
              )}
            </Button>
          </div>
        </form>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1" style={{ backgroundColor: primaryColor }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}