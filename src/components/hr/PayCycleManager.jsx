import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/components/ui/Toast";
import { 
  Calendar, Plus, Edit, Trash2, Play, Users, 
  Clock, DollarSign, Settings, Loader2, AlertCircle,
  CheckCircle2, X, UserPlus, RefreshCw
} from "lucide-react";
import { format, addDays, addWeeks, addMonths, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { calculateFullPayroll, formatSLE } from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";

export default function PayCycleManager({ orgId, employees = [], currentEmployee }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [cycleToProcess, setCycleToProcess] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    frequency: "monthly",
    pay_day: 28,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    employee_ids: [],
    auto_process: false,
    use_package_settings: true,
    include_attendance: true,
    auto_approve: false,
    notification_days_before: 2,
    is_active: true
  });

  const { data: payCycles = [], isLoading } = useQuery({
    queryKey: ['payCycles', orgId],
    queryFn: () => base44.entities.PayCycle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: remunerationPackages = [] } = useQuery({
    queryKey: ['remunerationPackages', orgId],
    queryFn: () => base44.entities.RemunerationPackage.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const nextRun = calculateNextRunDate(data.start_date, data.frequency, data.pay_day);
      return base44.entities.PayCycle.create({
        ...data,
        organisation_id: orgId,
        next_run_date: nextRun,
        employee_count: data.employee_ids.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payCycles'] });
      toast.success("Pay cycle created");
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PayCycle.update(id, {
      ...data,
      employee_count: data.employee_ids.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payCycles'] });
      toast.success("Pay cycle updated");
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PayCycle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payCycles'] });
      toast.success("Pay cycle deleted");
    }
  });

  const calculateNextRunDate = (startDate, frequency, payDay) => {
    const now = new Date();
    let next = new Date(startDate);

    if (frequency === "monthly") {
      next = new Date(now.getFullYear(), now.getMonth(), payDay);
      if (next <= now) {
        next = addMonths(next, 1);
      }
    } else if (frequency === "bi_weekly") {
      while (next <= now) {
        next = addWeeks(next, 2);
      }
    } else if (frequency === "weekly") {
      while (next <= now) {
        next = addWeeks(next, 1);
      }
    }

    return format(next, 'yyyy-MM-dd');
  };

  const resetForm = () => {
    setFormData({
      name: "",
      frequency: "monthly",
      pay_day: 28,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      employee_ids: [],
      auto_process: false,
      use_package_settings: true,
      include_attendance: true,
      auto_approve: false,
      notification_days_before: 2,
      is_active: true
    });
    setEditingCycle(null);
    setShowDialog(false);
  };

  const handleEdit = (cycle) => {
    setEditingCycle(cycle);
    setFormData({
      name: cycle.name || "",
      frequency: cycle.frequency || "monthly",
      pay_day: cycle.pay_day || 28,
      start_date: cycle.start_date || format(new Date(), 'yyyy-MM-dd'),
      employee_ids: cycle.employee_ids || [],
      auto_process: cycle.auto_process || false,
      use_package_settings: cycle.use_package_settings !== false,
      include_attendance: cycle.include_attendance !== false,
      auto_approve: cycle.auto_approve || false,
      notification_days_before: cycle.notification_days_before || 2,
      is_active: cycle.is_active !== false
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Pay cycle name required");
      return;
    }
    if (editingCycle) {
      updateMutation.mutate({ id: editingCycle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleEmployee = (empId) => {
    setFormData(prev => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(empId)
        ? prev.employee_ids.filter(id => id !== empId)
        : [...prev.employee_ids, empId]
    }));
  };

  const processPayCycle = async (cycle) => {
    setProcessing(true);
    const results = [];

    try {
      // Get employees in this cycle
      const cycleEmployees = employees.filter(e => cycle.employee_ids?.includes(e.id));
      
      // Calculate period based on frequency
      const lastMonth = subMonths(new Date(), 1);
      const periodStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
      const periodEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

      // Fetch attendance for the period
      const attendanceRecords = cycle.include_attendance 
        ? await base44.entities.Attendance.filter({ organisation_id: orgId })
        : [];

      // Fetch sales for commission
      const salesRecords = await base44.entities.Sale.filter({ organisation_id: orgId });

      const createdPayrollIds = [];

      // Process each employee
      for (const employee of cycleEmployees) {
        try {
          // Get employee's package
          const pkg = employee.remuneration_package_id 
            ? remunerationPackages.find(p => p.id === employee.remuneration_package_id)
            : null;

          // Use package salary if configured
          const effectiveEmployee = (cycle.use_package_settings && pkg)
            ? { ...employee, base_salary: pkg.base_salary, salary_type: pkg.salary_type || employee.salary_type }
            : employee;

          // Get attendance data
          const empAttendance = attendanceRecords.filter(a => a.employee_id === employee.id && a.date >= periodStart && a.date <= periodEnd);
          const daysWorked = empAttendance.filter(a => a.status === 'present' || a.status === 'late').length || 22;
          const overtimeHours = empAttendance.reduce((sum, a) => sum + safeNumber(a.overtime_hours), 0);

          // Get sales
          const empSales = salesRecords.filter(s => s.employee_id === employee.id && s.created_date?.split('T')[0] >= periodStart && s.created_date?.split('T')[0] <= periodEnd);
          const totalSales = empSales.reduce((sum, s) => sum + safeNumber(s.total_amount), 0);

          // Get package allowances and bonuses
          const packageAllowances = (cycle.use_package_settings && pkg) 
            ? (pkg.allowances || []).map(a => ({ name: a.name, amount: a.type === 'percentage' ? 0 : safeNumber(a.amount) }))
            : [];
          
          const packageBonuses = (cycle.use_package_settings && pkg)
            ? (pkg.bonuses || []).map(b => ({ name: b.name, amount: safeNumber(b.amount), type: 'package' }))
            : [];

          // Calculate payroll
          const payrollData = calculateFullPayroll({
            employee: effectiveEmployee,
            periodStart,
            periodEnd,
            attendanceData: { daysWorked, expectedDays: 22, regularHours: daysWorked * 8, overtimeHours },
            salesData: { totalSales, commissionRate: 0.02 },
            customAllowances: packageAllowances,
            customBonuses: packageBonuses,
            templates: [],
            applyNASSIT: true,
            applyPAYE: true,
            payrollFrequency: cycle.frequency,
            skipRoleAllowances: cycle.use_package_settings && pkg
          });

          // Create payroll
          const payroll = await base44.entities.Payroll.create({
            ...payrollData,
            organisation_id: orgId,
            status: cycle.auto_approve ? 'approved' : 'pending_approval',
            payroll_frequency: cycle.frequency
          });

          createdPayrollIds.push(payroll.id);

          // Send payslip email
          if (employee.email || employee.user_email) {
            try {
              await base44.functions.invoke('sendPayslipEmail', {
                payroll,
                employee,
                organisation: { id: orgId },
                recipientEmail: employee.email || employee.user_email,
                subject: `Your Payslip - ${format(new Date(periodStart), 'MMMM yyyy')}`,
                message: `Dear ${employee.full_name},\n\nYour payroll has been automatically processed for the ${format(new Date(periodStart), 'MMMM yyyy')} period.\n\nNet Pay: Le ${payroll.net_pay?.toLocaleString()}\n\nPlease find your payslip attached.\n\nBest regards`
              });
            } catch (emailError) {
              console.error('Email send failed:', emailError);
            }
          }

          results.push({ employee: employee.full_name, status: 'success', netPay: payrollData.net_pay });
        } catch (error) {
          results.push({ employee: employee.full_name, status: 'error', error: error.message });
        }
      }

      // Create PayrollRun record
      if (createdPayrollIds.length > 0) {
        await base44.entities.PayrollRun.create({
          organisation_id: orgId,
          run_number: `PC-${cycle.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyyMMdd')}`,
          name: `${cycle.name} - ${format(new Date(periodStart), 'MMMM yyyy')}`,
          payroll_frequency: cycle.frequency,
          period_start: periodStart,
          period_end: periodEnd,
          status: cycle.auto_approve ? 'approved' : 'pending_approval',
          employee_count: createdPayrollIds.length,
          payroll_ids: createdPayrollIds,
          created_by_id: currentEmployee?.id,
          created_by_name: currentEmployee?.full_name
        });
      }

      // Update pay cycle with last run and next run
      const nextRun = calculateNextRunDate(cycle.next_run_date, cycle.frequency, cycle.pay_day);
      await base44.entities.PayCycle.update(cycle.id, {
        last_run_date: format(new Date(), 'yyyy-MM-dd'),
        next_run_date: nextRun
      });

      queryClient.invalidateQueries({ queryKey: ['payCycles'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payrollRuns'] });

      const successCount = results.filter(r => r.status === 'success').length;
      toast.success("Pay cycle processed", `${successCount} payrolls created and payslips emailed`);
    } catch (error) {
      toast.error("Processing failed", error.message);
    }

    setProcessing(false);
    setShowProcessDialog(false);
    setCycleToProcess(null);
  };

  const activeEmployees = employees.filter(e => e.status === 'active');
  const assignedEmployeeIds = new Set(payCycles.flatMap(c => c.employee_ids || []));
  const unassignedEmployees = activeEmployees.filter(e => !assignedEmployeeIds.has(e.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            Pay Cycles
          </h3>
          <p className="text-sm text-gray-500">Automated payroll scheduling for employee groups</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#1EB053]">
          <Plus className="w-4 h-4 mr-2" />
          Create Pay Cycle
        </Button>
      </div>

      {unassignedEmployees.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Unassigned Employees</p>
                <p className="text-sm text-amber-600">{unassignedEmployees.length} employee(s) not assigned to any pay cycle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading pay cycles...</div>
      ) : payCycles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-600">No pay cycles defined</p>
            <p className="text-sm text-gray-500 mb-4">Create pay cycles to automate payroll processing</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Pay Cycle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payCycles.map((cycle) => {
            const cycleEmployees = employees.filter(e => cycle.employee_ids?.includes(e.id));
            const daysUntilNext = cycle.next_run_date 
              ? Math.ceil((new Date(cycle.next_run_date) - new Date()) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <Card key={cycle.id} className={`${!cycle.is_active ? 'opacity-60' : ''} ${daysUntilNext <= 3 && daysUntilNext > 0 ? 'border-amber-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{cycle.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {cycle.frequency.replace('_', ' ')}
                        </Badge>
                        <Badge variant={cycle.is_active ? "default" : "secondary"} className="text-xs">
                          {cycle.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="flex items-center gap-1 text-blue-600 mb-1">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">Employees</span>
                      </div>
                      <p className="font-bold">{cycle.employee_count || 0}</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <div className="flex items-center gap-1 text-purple-600 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">Pay Day</span>
                      </div>
                      <p className="font-bold">
                        {cycle.frequency === 'monthly' ? `${cycle.pay_day}th` : `Every ${cycle.pay_day === 0 ? 'Sun' : cycle.pay_day === 1 ? 'Mon' : cycle.pay_day === 2 ? 'Tue' : cycle.pay_day === 3 ? 'Wed' : cycle.pay_day === 4 ? 'Thu' : cycle.pay_day === 5 ? 'Fri' : 'Sat'}`}
                      </p>
                    </div>
                  </div>

                  {cycle.next_run_date && (
                    <div className={`p-3 rounded-lg ${daysUntilNext <= 3 && daysUntilNext > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-500 mb-1">Next Run</p>
                      <p className="font-semibold text-sm">{format(new Date(cycle.next_run_date), 'MMM d, yyyy')}</p>
                      {daysUntilNext > 0 && (
                        <p className={`text-xs ${daysUntilNext <= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                          in {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {cycle.last_run_date && (
                    <div className="text-xs text-gray-500">
                      Last run: {format(new Date(cycle.last_run_date), 'MMM d, yyyy')}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {cycle.auto_process && <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Auto Process</Badge>}
                    {cycle.auto_approve && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Auto Approve</Badge>}
                    {cycle.use_package_settings && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">Package Settings</Badge>}
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setCycleToProcess(cycle);
                        setShowProcessDialog(true);
                      }}
                      disabled={!cycle.employee_ids?.length}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run Now
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(cycle)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => deleteMutation.mutate(cycle.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
              <div className="flex-1 bg-[#1EB053]" />
              <div className="flex-1 bg-white border-y border-gray-200" />
              <div className="flex-1 bg-[#0072C6]" />
            </div>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1EB053]" />
              {editingCycle ? "Edit Pay Cycle" : "Create Pay Cycle"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <Label>Cycle Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Monthly - End of Month"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger className="mt-1">
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
                <Label>{formData.frequency === 'monthly' ? 'Day of Month' : 'Day of Week'}</Label>
                {formData.frequency === 'monthly' ? (
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.pay_day}
                    onChange={(e) => setFormData({ ...formData, pay_day: parseInt(e.target.value) || 28 })}
                    className="mt-1"
                  />
                ) : (
                  <Select value={formData.pay_day.toString()} onValueChange={(v) => setFormData({ ...formData, pay_day: parseInt(v) })}>
                    <SelectTrigger className="mt-1">
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
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Assign Employees */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Assign Employees ({formData.employee_ids.length} selected)
              </Label>
              <ScrollArea className="h-48 border rounded-lg p-2">
                <div className="space-y-1">
                  {activeEmployees.map(emp => (
                    <div
                      key={emp.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${formData.employee_ids.includes(emp.id) ? 'bg-[#1EB053]/10' : ''}`}
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <Checkbox checked={formData.employee_ids.includes(emp.id)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{emp.full_name}</p>
                        <p className="text-xs text-gray-500">{emp.role?.replace('_', ' ')} • {emp.department}</p>
                      </div>
                      <span className="text-xs font-medium text-[#1EB053]">{formatSLE(emp.base_salary)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Settings */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Processing Settings
              </h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Use Remuneration Package Settings</p>
                  <p className="text-xs text-gray-500">Apply package salary, allowances & bonuses</p>
                </div>
                <Switch 
                  checked={formData.use_package_settings} 
                  onCheckedChange={(v) => setFormData({ ...formData, use_package_settings: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include Attendance Data</p>
                  <p className="text-xs text-gray-500">Factor in actual days worked and overtime</p>
                </div>
                <Switch 
                  checked={formData.include_attendance} 
                  onCheckedChange={(v) => setFormData({ ...formData, include_attendance: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-Approve Payrolls</p>
                  <p className="text-xs text-gray-500">Skip approval workflow</p>
                </div>
                <Switch 
                  checked={formData.auto_approve} 
                  onCheckedChange={(v) => setFormData({ ...formData, auto_approve: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-gray-500">Enable this pay cycle</p>
                </div>
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                type="submit"
                className="bg-[#1EB053]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingCycle ? "Update Cycle" : "Create Cycle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Process Confirmation Dialog */}
      <ConfirmDialog
        open={showProcessDialog}
        onOpenChange={setShowProcessDialog}
        title="Process Pay Cycle"
        description={`Process payroll for ${cycleToProcess?.employee_count || 0} employees in "${cycleToProcess?.name}"? Payslips will be automatically emailed.`}
        confirmLabel="Process Payroll"
        variant="info"
        onConfirm={() => processPayCycle(cycleToProcess)}
        isLoading={processing}
      />
    </div>
  );
}