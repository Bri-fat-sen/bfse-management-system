import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { Calendar, Plus, AlertCircle } from "lucide-react";
import { format, addWeeks, addMonths, startOfMonth, endOfMonth, subMonths } from "date-fns";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PayCycleCard from "./PayCycleCard";
import PayCycleForm from "./PayCycleForm";
import { calculateFullPayroll } from "./PayrollCalculator";
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Pay Cycles
          </h3>
          <p className="text-sm text-gray-600 mt-1">Automated payroll scheduling for employee groups</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)} 
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#16803d] hover:to-[#005a9e] shadow-lg"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Pay Cycle
        </Button>
      </div>

      {/* Unassigned Warning */}
      {unassignedEmployees.length > 0 && (
        <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 text-lg">Unassigned Employees</p>
                <p className="text-sm text-amber-700 mt-1">
                  {unassignedEmployees.length} employee{unassignedEmployees.length > 1 ? 's are' : ' is'} not assigned to any pay cycle
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-[#1EB053] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading pay cycles...</p>
        </div>
      ) : payCycles.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-[#0072C6]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Pay Cycles Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Create automated pay cycles to streamline payroll processing for different employee groups
            </p>
            <Button 
              onClick={() => setShowDialog(true)}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#16803d] hover:to-[#005a9e]"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Pay Cycle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payCycles.map((cycle) => (
            <PayCycleCard
              key={cycle.id}
              cycle={cycle}
              employees={employees}
              onEdit={() => handleEdit(cycle)}
              onDelete={() => deleteMutation.mutate(cycle.id)}
              onProcess={() => {
                setCycleToProcess(cycle);
                setShowProcessDialog(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <PayCycleForm
        open={showDialog}
        onOpenChange={(open) => !open && resetForm()}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={!!editingCycle}
        isLoading={createMutation.isPending || updateMutation.isPending}
        employees={employees}
      />

      {/* Process Confirmation */}
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