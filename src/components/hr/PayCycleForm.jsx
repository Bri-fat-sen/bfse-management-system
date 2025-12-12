import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Calendar, Users, Settings, Loader2 } from "lucide-react";
import { formatSLE } from "./PayrollCalculator";

export default function PayCycleForm({ 
  open, 
  onOpenChange, 
  formData, 
  setFormData,
  onSubmit,
  isEditing,
  isLoading,
  employees
}) {
  const toggleEmployee = (empId) => {
    setFormData(prev => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(empId)
        ? prev.employee_ids.filter(id => id !== empId)
        : [...prev.employee_ids, empId]
    }));
  };

  const activeEmployees = employees.filter(e => e.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex h-1.5 w-20 rounded-full overflow-hidden mb-4">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-[#1EB053]" />
            {isEditing ? "Edit Pay Cycle" : "Create Pay Cycle"}
          </DialogTitle>
          <p className="text-sm text-gray-500">Set up automated payroll processing for employee groups</p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Cycle Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Monthly - End of Month"
                className="mt-1.5 h-11"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi_weekly">Bi-Weekly (Every 2 weeks)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  {formData.frequency === 'monthly' ? 'Day of Month' : 'Day of Week'}
                </Label>
                {formData.frequency === 'monthly' ? (
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.pay_day}
                    onChange={(e) => setFormData({ ...formData, pay_day: parseInt(e.target.value) || 28 })}
                    className="mt-1.5 h-11"
                  />
                ) : (
                  <Select value={formData.pay_day.toString()} onValueChange={(v) => setFormData({ ...formData, pay_day: parseInt(v) })}>
                    <SelectTrigger className="mt-1.5 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1.5 h-11"
              />
            </div>
          </div>

          {/* Employee Assignment */}
          <div className="border-t pt-6">
            <Label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <Users className="w-5 h-5 text-[#1EB053]" />
              Assign Employees
              <span className="ml-auto text-[#1EB053] font-bold">
                {formData.employee_ids.length} selected
              </span>
            </Label>
            <ScrollArea className="h-56 border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
              <div className="space-y-2">
                {activeEmployees.map(emp => (
                  <div
                    key={emp.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      formData.employee_ids.includes(emp.id) 
                        ? 'bg-gradient-to-r from-[#1EB053]/10 to-[#1EB053]/5 border-2 border-[#1EB053]' 
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleEmployee(emp.id)}
                  >
                    <Checkbox 
                      checked={formData.employee_ids.includes(emp.id)}
                      onCheckedChange={() => toggleEmployee(emp.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{emp.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {emp.role?.replace('_', ' ')} {emp.department && `• ${emp.department}`}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#1EB053]">{formatSLE(emp.base_salary)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Processing Settings */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-[#0072C6]" />
              <h4 className="font-semibold text-gray-900">Processing Settings</h4>
            </div>
            <div className="space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Use Remuneration Package Settings</p>
                  <p className="text-xs text-gray-600 mt-0.5">Apply package salary, allowances & bonuses</p>
                </div>
                <Switch 
                  checked={formData.use_package_settings} 
                  onCheckedChange={(v) => setFormData({ ...formData, use_package_settings: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Include Attendance Data</p>
                  <p className="text-xs text-gray-600 mt-0.5">Factor in actual days worked and overtime</p>
                </div>
                <Switch 
                  checked={formData.include_attendance} 
                  onCheckedChange={(v) => setFormData({ ...formData, include_attendance: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Auto-Approve Payrolls</p>
                  <p className="text-xs text-gray-600 mt-0.5">Skip approval workflow</p>
                </div>
                <Switch 
                  checked={formData.auto_approve} 
                  onCheckedChange={(v) => setFormData({ ...formData, auto_approve: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Active Status</p>
                  <p className="text-xs text-gray-600 mt-0.5">Enable this pay cycle for processing</p>
                </div>
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300">
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#16803d] hover:to-[#005a9e]"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Update Cycle" : "Create Cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}