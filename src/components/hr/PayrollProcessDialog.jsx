import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  DollarSign, Plus, Minus, Calculator, Info, Clock, 
  TrendingUp, Users, Briefcase, Calendar, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  calculateFullPayroll,
  calculateRates,
  formatSLE,
  COMMON_ALLOWANCES,
  COMMON_DEDUCTIONS,
  ROLE_BONUS_CONFIG,
  OVERTIME_MULTIPLIERS,
  SL_TAX_BRACKETS,
  PAYROLL_FREQUENCIES,
  applyTemplates
} from "./PayrollCalculator";
import { safeNumber, safeInt, formatNumber } from "@/components/utils/calculations";

export default function PayrollProcessDialog({ 
  open, 
  onOpenChange, 
  employees = [],
  orgId,
  currentEmployee 
}) {
  const queryClient = useQueryClient();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [customAllowances, setCustomAllowances] = useState([]);
  const [customDeductions, setCustomDeductions] = useState([]);
  const [customBonuses, setCustomBonuses] = useState([]);
  const [applyNASSIT, setApplyNASSIT] = useState(true);
  const [applyPAYE, setApplyPAYE] = useState(true);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [weekendHours, setWeekendHours] = useState(0);
  const [holidayHours, setHolidayHours] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salesAmount, setSalesAmount] = useState(0);
  const [commissionRate, setCommissionRate] = useState(2);
  const [payrollFrequency, setPayrollFrequency] = useState("monthly");

  const lastMonth = subMonths(new Date(), 1);
  const [periodStart, setPeriodStart] = useState(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
  const [periodEnd, setPeriodEnd] = useState(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Fetch attendance for the selected employee and period
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', selectedEmployeeId, periodStart, periodEnd],
    queryFn: () => base44.entities.Attendance.filter({
      organisation_id: orgId,
      employee_id: selectedEmployeeId,
    }),
    enabled: !!selectedEmployeeId && !!orgId,
  });

  // Fetch sales for commission calculation
  const { data: salesRecords = [] } = useQuery({
    queryKey: ['sales', selectedEmployeeId, periodStart, periodEnd],
    queryFn: () => base44.entities.Sale.filter({
      organisation_id: orgId,
      employee_id: selectedEmployeeId,
    }),
    enabled: !!selectedEmployeeId && !!orgId,
  });

  // Fetch benefit/deduction templates
  const { data: templates = [] } = useQuery({
    queryKey: ['benefitDeductionTemplates', orgId],
    queryFn: () => base44.entities.BenefitDeductionTemplate.filter({ 
      organisation_id: orgId, 
      is_active: true 
    }),
    enabled: !!orgId,
  });

  // Calculate attendance data from records
  const attendanceData = useMemo(() => {
    if (!attendanceRecords.length) {
      return { daysWorked: 22, expectedDays: 22, regularHours: 176, overtimeHours: 0 };
    }

    const periodRecords = attendanceRecords.filter(r => {
      const date = r.date || r.check_in?.split('T')[0];
      return date >= periodStart && date <= periodEnd;
    });

    const daysWorked = periodRecords.filter(r => 
      r.status === 'present' || r.status === 'late'
    ).length;

    const totalHours = periodRecords.reduce((sum, r) => sum + (r.hours_worked || 0), 0);
    const recordedOvertime = periodRecords.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

    const workingDays = differenceInDays(new Date(periodEnd), new Date(periodStart)) + 1;
    const expectedDays = Math.min(22, Math.round(workingDays * 5/7)); // Approximate working days

    return {
      daysWorked: daysWorked || expectedDays,
      expectedDays,
      regularHours: totalHours || (daysWorked * 8),
      overtimeHours: recordedOvertime
    };
  }, [attendanceRecords, periodStart, periodEnd]);

  // Calculate total sales for commission
  const totalSales = useMemo(() => {
    if (salesAmount > 0) return salesAmount;
    
    return salesRecords
      .filter(s => {
        const date = s.created_date?.split('T')[0];
        return date >= periodStart && date <= periodEnd;
      })
      .reduce((sum, s) => sum + (s.total_amount || 0), 0);
  }, [salesRecords, periodStart, periodEnd, salesAmount]);

  // Auto-set overtime from attendance
  useEffect(() => {
    if (attendanceData.overtimeHours > 0 && overtimeHours === 0) {
      setOvertimeHours(attendanceData.overtimeHours);
    }
  }, [attendanceData.overtimeHours]);

  // Get applicable templates for selected employee
  const applicableTemplates = useMemo(() => {
    if (!selectedEmployee || !templates.length) return [];
    return templates.filter(t => {
      if (t.applies_to_employees?.length > 0) {
        return t.applies_to_employees.includes(selectedEmployee.id);
      }
      if (t.applies_to_roles?.length > 0) {
        return t.applies_to_roles.includes(selectedEmployee.role);
      }
      return true;
    });
  }, [selectedEmployee, templates]);

  // Calculate full payroll
  const payrollData = useMemo(() => {
    if (!selectedEmployee) return null;

    return calculateFullPayroll({
      employee: selectedEmployee,
      periodStart,
      periodEnd,
      attendanceData: {
        ...attendanceData,
        overtimeHours: parseFloat(overtimeHours) || 0,
        weekendHours: parseFloat(weekendHours) || 0,
        holidayHours: parseFloat(holidayHours) || 0
      },
      salesData: {
        totalSales,
        commissionRate: commissionRate / 100
      },
      customAllowances,
      customDeductions,
      customBonuses,
      templates: [], // No auto templates - manual entry only
      applyNASSIT,
      applyPAYE,
      payrollFrequency,
      skipRoleAllowances: true // Skip auto role-based allowances
    });
  }, [
    selectedEmployee, periodStart, periodEnd, attendanceData,
    overtimeHours, weekendHours, holidayHours,
    totalSales, commissionRate,
    customAllowances, customDeductions, customBonuses,
    applicableTemplates, applyNASSIT, applyPAYE, payrollFrequency
  ]);

  const createPayrollMutation = useMutation({
    mutationFn: async (data) => {
      const payroll = await base44.entities.Payroll.create(data);
      
      // Create audit log
      await base44.entities.PayrollAudit.create({
        organisation_id: orgId,
        payroll_id: payroll.id,
        employee_id: data.employee_id,
        employee_name: data.employee_name,
        action: 'created',
        changed_by_id: currentEmployee?.id,
        changed_by_name: currentEmployee?.full_name,
        new_values: {
          gross_pay: data.gross_pay,
          net_pay: data.net_pay,
          total_deductions: data.total_deductions,
          period: `${data.period_start} to ${data.period_end}`
        },
        reason: 'Individual payroll processing'
      });
      
      return payroll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payrollAudit'] });
      onOpenChange(false);
      resetForm();
      toast.success("Payroll processed successfully");
    },
    onError: (error) => {
      toast.error("Failed to process payroll", { description: error.message });
    }
  });

  const resetForm = () => {
    setSelectedEmployeeId("");
    setCustomAllowances([]);
    setCustomDeductions([]);
    setCustomBonuses([]);
    setOvertimeHours(0);
    setWeekendHours(0);
    setHolidayHours(0);
    setSalesAmount(0);
    setPayrollFrequency("monthly");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!payrollData) return;

    createPayrollMutation.mutate({
      ...payrollData,
      organisation_id: orgId,
      status: 'pending_approval'
    });
  };

  const addCustomAllowance = (preset = null) => {
    setCustomAllowances([...customAllowances, { 
      name: preset?.name || "", 
      amount: 0 
    }]);
  };

  const addCustomDeduction = (preset = null) => {
    setCustomDeductions([...customDeductions, { 
      name: preset?.name || "", 
      amount: 0,
      type: preset?.type || "other"
    }]);
  };

  const addCustomBonus = () => {
    setCustomBonuses([...customBonuses, { 
      name: "", 
      amount: 0,
      type: "other"
    }]);
  };

  const roleConfig = selectedEmployee ? ROLE_BONUS_CONFIG[selectedEmployee.role] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        {/* Sierra Leone Flag Header */}
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        {/* Header with gradient */}
        <div className="px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #1EB053 0%, #0072C6 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Process Payroll</h2>
              <p className="text-white/80 text-sm">Auto Calculator with NASSIT & PAYE</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          {/* Employee & Period Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active').map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex items-center gap-2">
                        <span>{e.full_name}</span>
                        <Badge variant="outline" className="text-xs">{e.role}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payroll Frequency</Label>
              <Select value={payrollFrequency} onValueChange={setPayrollFrequency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYROLL_FREQUENCIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span>{config.label}</span>
                        <span className="text-xs text-gray-500">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Period Start</Label>
              <Input 
                type="date" 
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Period End</Label>
              <Input 
                type="date" 
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required 
                className="mt-1" 
              />
            </div>
          </div>

          {selectedEmployee && payrollData && (
            <>
              {/* Employee Info Card */}
              <Card className="bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 border-0">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-lg">{selectedEmployee.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{selectedEmployee.role?.replace('_', ' ')}</Badge>
                        <span className="text-sm text-gray-600">{selectedEmployee.department}</span>
                        {selectedEmployee.assigned_location_name && (
                          <span className="text-sm text-gray-500">• {selectedEmployee.assigned_location_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Base Salary ({selectedEmployee.salary_type || 'monthly'})</p>
                      <p className="text-2xl font-bold text-[#1EB053]">{formatSLE(selectedEmployee.base_salary)}</p>
                      <p className="text-xs text-gray-400">
                        {payrollFrequency !== 'monthly' && `Prorated: ${formatSLE(payrollData.prorated_salary)} | `}
                        Hourly: {formatSLE(payrollData.calculation_details.hourly_rate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance & Hours */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Days Worked</span>
                  </div>
                  <p className="text-xl font-bold">{attendanceData.daysWorked} / {attendanceData.expectedDays}</p>
                </div>
                <div>
                  <Label className="text-xs">Overtime Hours</Label>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(safeNumber(e.target.value, 0))}
                    onWheel={(e) => e.target.blur()}
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">@ {OVERTIME_MULTIPLIERS.regular}x = {formatSLE(safeNumber(overtimeHours) * safeNumber(payrollData?.calculation_details?.hourly_rate) * OVERTIME_MULTIPLIERS.regular)}</p>
                </div>
                <div>
                  <Label className="text-xs">Weekend Hours</Label>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={weekendHours}
                    onChange={(e) => setWeekendHours(safeNumber(e.target.value, 0))}
                    onWheel={(e) => e.target.blur()}
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">@ {OVERTIME_MULTIPLIERS.weekend}x = {formatSLE(safeNumber(weekendHours) * safeNumber(payrollData?.calculation_details?.hourly_rate) * OVERTIME_MULTIPLIERS.weekend)}</p>
                </div>
                <div>
                  <Label className="text-xs">Holiday Hours</Label>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={holidayHours}
                    onChange={(e) => setHolidayHours(safeNumber(e.target.value, 0))}
                    onWheel={(e) => e.target.blur()}
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">@ {OVERTIME_MULTIPLIERS.holiday}x = {formatSLE(safeNumber(holidayHours) * safeNumber(payrollData?.calculation_details?.hourly_rate) * OVERTIME_MULTIPLIERS.holiday)}</p>
                </div>
              </div>

              {/* Sales Commission (for applicable roles) */}
              {roleConfig?.bonusEligible?.includes('sales_commission') && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Sales Commission</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Total Sales (Le)</Label>
                      <Input 
                        type="number"
                        min="0"
                        value={salesAmount || totalSales}
                        onChange={(e) => setSalesAmount(safeNumber(e.target.value, 0))}
                        onWheel={(e) => e.target.blur()}
                        className="mt-1"
                      />
                      {totalSales > 0 && !salesAmount && (
                        <p className="text-xs text-green-600 mt-1">Auto-detected from records</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Commission Rate (%)</Label>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(safeNumber(e.target.value, 0))}
                        onWheel={(e) => e.target.blur()}
                        className="mt-1"
                      />
                      <p className="text-xs text-purple-600 mt-1">
                        = {formatSLE(safeNumber(salesAmount || totalSales) * safeNumber(commissionRate) / 100)} commission
                      </p>
                    </div>
                  </div>
                </div>
              )}





              {/* Allowances, Bonuses & Deductions */}
              <div className="space-y-4">
                {/* Allowances */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-green-700 font-medium flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Allowances
                    </Label>
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => addCustomAllowance(COMMON_ALLOWANCES.find(a => a.name === v))}>
                        <SelectTrigger className="w-44 h-8 text-xs">
                          <SelectValue placeholder="Select allowance..." />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_ALLOWANCES.map(a => (
                            <SelectItem key={a.name} value={a.name} className="text-xs">
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="sm" onClick={() => addCustomAllowance()}>
                        <Plus className="w-4 h-4" /> Custom
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {customAllowances.length === 0 ? (
                      <p className="text-sm text-green-600/70 text-center py-2">No allowances added</p>
                    ) : (
                      customAllowances.map((allowance, index) => (
                        <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg">
                          <Input 
                            placeholder="Allowance name" 
                            value={allowance.name}
                            onChange={(e) => {
                              const updated = [...customAllowances];
                              updated[index].name = e.target.value;
                              setCustomAllowances(updated);
                            }}
                            className="flex-1"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Le</span>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="0"
                              value={allowance.amount || ""}
                              onChange={(e) => {
                                const updated = [...customAllowances];
                                updated[index].amount = safeNumber(e.target.value, 0);
                                setCustomAllowances(updated);
                              }}
                              onWheel={(e) => e.target.blur()}
                              className="w-36 pl-12"
                            />
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                            setCustomAllowances(customAllowances.filter((_, i) => i !== index));
                          }}>
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))
                    )}
                    {customAllowances.length > 0 && (
                      <div className="flex justify-between text-sm font-medium pt-2 border-t border-green-200">
                        <span>Total Allowances</span>
                        <span className="text-green-700">{formatSLE(customAllowances.reduce((s, a) => s + safeNumber(a.amount), 0))}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bonuses */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-purple-700 font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Bonuses
                    </Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCustomBonus}>
                      <Plus className="w-4 h-4 mr-1" /> Add Bonus
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customBonuses.length === 0 ? (
                      <p className="text-sm text-purple-600/70 text-center py-2">No bonuses added</p>
                    ) : (
                      customBonuses.map((bonus, index) => (
                        <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg">
                          <Input 
                            placeholder="Bonus name" 
                            value={bonus.name}
                            onChange={(e) => {
                              const updated = [...customBonuses];
                              updated[index].name = e.target.value;
                              setCustomBonuses(updated);
                            }}
                            className="flex-1"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Le</span>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="0"
                              value={bonus.amount || ""}
                              onChange={(e) => {
                                const updated = [...customBonuses];
                                updated[index].amount = safeNumber(e.target.value, 0);
                                setCustomBonuses(updated);
                              }}
                              onWheel={(e) => e.target.blur()}
                              className="w-36 pl-12"
                            />
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                            setCustomBonuses(customBonuses.filter((_, i) => i !== index));
                          }}>
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))
                    )}
                    {customBonuses.length > 0 && (
                      <div className="flex justify-between text-sm font-medium pt-2 border-t border-purple-200">
                        <span>Total Bonuses</span>
                        <span className="text-purple-700">{formatSLE(customBonuses.reduce((s, b) => s + safeNumber(b.amount), 0))}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-red-700 font-medium flex items-center gap-2">
                      <Minus className="w-4 h-4" /> Deductions
                    </Label>
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => addCustomDeduction(COMMON_DEDUCTIONS.find(d => d.name === v))}>
                        <SelectTrigger className="w-44 h-8 text-xs">
                          <SelectValue placeholder="Select deduction..." />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_DEDUCTIONS.filter(d => d.type !== 'statutory').map(d => (
                            <SelectItem key={d.name} value={d.name} className="text-xs">
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="sm" onClick={() => addCustomDeduction()}>
                        <Plus className="w-4 h-4" /> Custom
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {customDeductions.length === 0 ? (
                      <p className="text-sm text-red-600/70 text-center py-2">No deductions added (statutory deductions are automatic)</p>
                    ) : (
                      customDeductions.map((deduction, index) => (
                        <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg">
                          <Input 
                            placeholder="Deduction name" 
                            value={deduction.name}
                            onChange={(e) => {
                              const updated = [...customDeductions];
                              updated[index].name = e.target.value;
                              setCustomDeductions(updated);
                            }}
                            className="flex-1"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Le</span>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="0"
                              value={deduction.amount || ""}
                              onChange={(e) => {
                                const updated = [...customDeductions];
                                updated[index].amount = safeNumber(e.target.value, 0);
                                setCustomDeductions(updated);
                              }}
                              onWheel={(e) => e.target.blur()}
                              className="w-36 pl-12"
                            />
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                            setCustomDeductions(customDeductions.filter((_, i) => i !== index));
                          }}>
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))
                    )}
                    {customDeductions.length > 0 && (
                      <div className="flex justify-between text-sm font-medium pt-2 border-t border-red-200">
                        <span>Total Deductions</span>
                        <span className="text-red-700">{formatSLE(customDeductions.reduce((s, d) => s + safeNumber(d.amount), 0))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statutory Deductions */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🇸🇱</span>
                  <h4 className="font-semibold text-[#0072C6]">Sierra Leone Statutory Deductions</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs font-medium mb-1">NASSIT Rates:</p>
                        <p className="text-xs">Employee: 5% | Employer: 10%</p>
                        <p className="text-xs font-medium mt-2 mb-1">PAYE Tax Brackets (Annual):</p>
                        {SL_TAX_BRACKETS.map((b, i) => (
                          <p key={i} className="text-xs">
                            {formatSLE(b.min)} - {b.max === Infinity ? '∞' : formatSLE(b.max)}: {b.label}
                          </p>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">NASSIT Contribution (5%)</p>
                      <p className="text-xs text-gray-500">National Social Security</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatSLE(payrollData.nassit_employee)}</span>
                      <Switch checked={applyNASSIT} onCheckedChange={setApplyNASSIT} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">PAYE Tax</p>
                      <p className="text-xs text-gray-500">
                        Bracket: {payrollData.calculation_details.tax_bracket} | 
                        Effective: {payrollData.calculation_details.effective_tax_rate}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatSLE(payrollData.paye_tax)}</span>
                      <Switch checked={applyPAYE} onCheckedChange={setApplyPAYE} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Summary */}
              <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
                <h4 className="font-semibold text-gray-700 mb-3">Pay Breakdown</h4>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Salary</span>
                  <span>{formatSLE(payrollData.base_salary)}</span>
                </div>
                
                {payrollData.overtime_pay > 0 && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>+ Overtime ({overtimeHours}h @ {OVERTIME_MULTIPLIERS.regular}x)</span>
                    <span>{formatSLE(payrollData.overtime_pay)}</span>
                  </div>
                )}
                
                {payrollData.weekend_pay > 0 && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>+ Weekend ({weekendHours}h @ {OVERTIME_MULTIPLIERS.weekend}x)</span>
                    <span>{formatSLE(payrollData.weekend_pay)}</span>
                  </div>
                )}
                
                {payrollData.holiday_pay > 0 && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>+ Holiday ({holidayHours}h @ {OVERTIME_MULTIPLIERS.holiday}x)</span>
                    <span>{formatSLE(payrollData.holiday_pay)}</span>
                  </div>
                )}
                
                {payrollData.total_allowances > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>+ Allowances</span>
                    <span>{formatSLE(payrollData.total_allowances)}</span>
                  </div>
                )}
                
                {payrollData.total_bonuses > 0 && (
                  <div className="flex justify-between text-sm text-purple-600">
                    <span>+ Bonuses</span>
                    <span>{formatSLE(payrollData.total_bonuses)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Gross Pay</span>
                  <span>{formatSLE(payrollData.gross_pay)}</span>
                </div>
                
                {payrollData.nassit_employee > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>- NASSIT (5%)</span>
                    <span>{formatSLE(payrollData.nassit_employee)}</span>
                  </div>
                )}
                
                {payrollData.paye_tax > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>- PAYE Tax</span>
                    <span>{formatSLE(payrollData.paye_tax)}</span>
                  </div>
                )}
                
                {customDeductions.length > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>- Other Deductions</span>
                    <span>{formatSLE(customDeductions.reduce((s, d) => s + safeNumber(d.amount), 0))}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-red-600 text-sm">
                  <span>Total Deductions</span>
                  <span>{formatSLE(payrollData.total_deductions)}</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold pt-3 border-t mt-3 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 -mx-4 px-4 py-3 rounded-b-lg">
                  <span>Net Pay</span>
                  <span className="text-[#1EB053]">{formatSLE(payrollData.net_pay)}</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 pt-2">
                  <span>Employer Cost (incl. NASSIT 10%)</span>
                  <span>{formatSLE(payrollData.employer_cost)}</span>
                </div>
              </div>
            </>
          )}

        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="payroll-process-form"
            onClick={handleSubmit}
            className="flex-1 text-white"
            style={{ background: 'linear-gradient(135deg, #1EB053 0%, #0072C6 100%)' }}
            disabled={!selectedEmployeeId || !payrollData || createPayrollMutation.isPending}
          >
            {createPayrollMutation.isPending ? "Processing..." : "Process Payroll"}
          </Button>
        </div>

        {/* Bottom flag stripe */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}