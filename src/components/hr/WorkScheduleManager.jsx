import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun", full: "Sunday" },
  { value: 1, label: "Mon", full: "Monday" },
  { value: 2, label: "Tue", full: "Tuesday" },
  { value: 3, label: "Wed", full: "Wednesday" },
  { value: 4, label: "Thu", full: "Thursday" },
  { value: 5, label: "Fri", full: "Friday" },
  { value: 6, label: "Sat", full: "Saturday" },
];

export default function WorkScheduleManager({ orgId, employees }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [formData, setFormData] = useState({
    schedule_type: "fixed",
    work_days: [1, 2, 3, 4, 5],
    start_time: "08:00",
    end_time: "17:00",
    break_duration_mins: 60,
    expected_hours_per_day: 8,
    expected_hours_per_week: 40,
    overtime_threshold_daily: 8,
    overtime_threshold_weekly: 40,
    effective_from: format(new Date(), 'yyyy-MM-dd'),
    is_active: true,
    notes: ""
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['workSchedules', orgId],
    queryFn: () => base44.entities.WorkSchedule.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      toast.success("Schedule created");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkSchedule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      toast.success("Schedule updated");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      toast.success("Schedule deleted");
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (employeeIds) => {
      const promises = employeeIds.map(empId => {
        const emp = employees.find(e => e.id === empId);
        return base44.entities.WorkSchedule.create({
          ...formData,
          organisation_id: orgId,
          employee_id: empId,
          employee_name: emp?.full_name
        });
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      toast.success(`Schedules created for ${selectedEmployees.length} employees`);
      setBulkDialogOpen(false);
      setSelectedEmployees([]);
      resetForm();
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
    setFormData({
      schedule_type: "fixed",
      work_days: [1, 2, 3, 4, 5],
      start_time: "08:00",
      end_time: "17:00",
      break_duration_mins: 60,
      expected_hours_per_day: 8,
      expected_hours_per_week: 40,
      overtime_threshold_daily: 8,
      overtime_threshold_weekly: 40,
      effective_from: format(new Date(), 'yyyy-MM-dd'),
      is_active: true,
      notes: ""
    });
  };

  const openEditDialog = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      schedule_type: schedule.schedule_type || "fixed",
      work_days: schedule.work_days || [1, 2, 3, 4, 5],
      start_time: schedule.start_time || "08:00",
      end_time: schedule.end_time || "17:00",
      break_duration_mins: schedule.break_duration_mins || 60,
      expected_hours_per_day: schedule.expected_hours_per_day || 8,
      expected_hours_per_week: schedule.expected_hours_per_week || 40,
      overtime_threshold_daily: schedule.overtime_threshold_daily || 8,
      overtime_threshold_weekly: schedule.overtime_threshold_weekly || 40,
      effective_from: schedule.effective_from || format(new Date(), 'yyyy-MM-dd'),
      effective_to: schedule.effective_to || "",
      is_active: schedule.is_active !== false,
      notes: schedule.notes || ""
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, data: formData });
    } else {
      const emp = employees.find(e => e.id === formData.employee_id);
      createMutation.mutate({
        ...formData,
        organisation_id: orgId,
        employee_name: emp?.full_name
      });
    }
  };

  const toggleWorkDay = (day) => {
    const newDays = formData.work_days.includes(day)
      ? formData.work_days.filter(d => d !== day)
      : [...formData.work_days, day].sort((a, b) => a - b);
    setFormData(prev => ({ ...prev, work_days: newDays }));
  };

  const getEmployeeSchedule = (empId) => {
    return schedules.find(s => s.employee_id === empId && s.is_active);
  };

  const employeesWithoutSchedule = employees.filter(e => 
    e.status === 'active' && !getEmployeeSchedule(e.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Work Schedules</h2>
          <p className="text-sm text-gray-500">
            {schedules.filter(s => s.is_active).length} active schedules
          </p>
        </div>
        <div className="flex gap-2">
          {employeesWithoutSchedule.length > 0 && (
            <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Bulk Assign ({employeesWithoutSchedule.length})
            </Button>
          )}
          <Button onClick={() => setDialogOpen(true)} className="bg-[#1EB053] hover:bg-[#178f43]">
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Schedule List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Work Days</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Expected/Week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No schedules configured yet</p>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => {
                  const emp = employees.find(e => e.id === schedule.employee_id);
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={emp?.profile_photo} />
                            <AvatarFallback className="text-xs bg-gray-200">
                              {schedule.employee_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{schedule.employee_name}</p>
                            <p className="text-xs text-gray-500">{emp?.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {DAYS_OF_WEEK.map(day => (
                            <span
                              key={day.value}
                              className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                schedule.work_days?.includes(day.value)
                                  ? 'bg-[#1EB053] text-white'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {day.label.charAt(0)}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{schedule.expected_hours_per_week}h</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.is_active ? "secondary" : "outline"}>
                          {schedule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(schedule)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-red-500"
                            onClick={() => deleteMutation.mutate(schedule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Schedule" : "Add Work Schedule"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {!editingSchedule && (
              <div>
                <Label>Employee *</Label>
                <Select 
                  value={formData.employee_id} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, employee_id: val }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Work Days</Label>
              <div className="flex gap-2 mt-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWorkDay(day.value)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      formData.work_days.includes(day.value)
                        ? 'bg-[#1EB053] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Break Duration (mins)</Label>
                <Input
                  type="number"
                  value={formData.break_duration_mins}
                  onChange={(e) => setFormData(prev => ({ ...prev, break_duration_mins: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Expected Hours/Day</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.expected_hours_per_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_hours_per_day: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expected Hours/Week</Label>
                <Input
                  type="number"
                  value={formData.expected_hours_per_week}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_hours_per_week: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Overtime After (daily)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.overtime_threshold_daily}
                  onChange={(e) => setFormData(prev => ({ ...prev, overtime_threshold_daily: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Effective To (optional)</Label>
                <Input
                  type="date"
                  value={formData.effective_to || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_to: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active Schedule</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-[#1EB053] hover:bg-[#178f43]"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Assign Schedule</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Employees</Label>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {employeesWithoutSchedule.map(emp => (
                  <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox
                      checked={selectedEmployees.includes(emp.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEmployees([...selectedEmployees, emp.id]);
                        } else {
                          setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                        }
                      }}
                    />
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="text-xs">{emp.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{emp.full_name}</span>
                    <Badge variant="outline" className="text-xs ml-auto">{emp.department}</Badge>
                  </label>
                ))}
              </div>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setSelectedEmployees(employeesWithoutSchedule.map(e => e.id))}
                className="mt-1 p-0 h-auto"
              >
                Select All
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="font-medium mb-3">Schedule Details</p>
              
              <div className="space-y-3">
                <div>
                  <Label>Work Days</Label>
                  <div className="flex gap-2 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWorkDay(day.value)}
                        className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                          formData.work_days.includes(day.value)
                            ? 'bg-[#1EB053] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day.label.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Hours/Day</Label>
                    <Input
                      type="number"
                      value={formData.expected_hours_per_day}
                      onChange={(e) => setFormData(prev => ({ ...prev, expected_hours_per_day: parseFloat(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Hours/Week</Label>
                    <Input
                      type="number"
                      value={formData.expected_hours_per_week}
                      onChange={(e) => setFormData(prev => ({ ...prev, expected_hours_per_week: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => bulkCreateMutation.mutate(selectedEmployees)}
              disabled={selectedEmployees.length === 0 || bulkCreateMutation.isPending}
              className="bg-[#1EB053] hover:bg-[#178f43]"
            >
              {bulkCreateMutation.isPending ? "Creating..." : `Create ${selectedEmployees.length} Schedules`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}