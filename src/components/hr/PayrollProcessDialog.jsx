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
  applyTemplates
} from "./PayrollCalculator";

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
      templates: applicableTemplates,
      applyNASSIT,
      applyPAYE
    });
  }, [
    selectedEmployee, periodStart, periodEnd, attendanceData,
    overtimeHours, weekendHours, holidayHours,
    totalSales, commissionRate,
    customAllowances, customDeductions, customBonuses,
    applicableTemplates, applyNASSIT, applyPAYE
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#1EB053]" />
            Process Payroll - Auto Calculator
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee & Period Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">@ {OVERTIME_MULTIPLIERS.regular}x rate</p>
                </div>
                <div>
                  <Label className="text-xs">Weekend Hours</Label>
                  <Input 
                    type="number" 
                    step="0.5"
                    value={weekendHours}
                    onChange={(e) => setWeekendHours(e.target.value)}
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">@ {OVERTIME_MULTIPLIERS.weekend}x rate</p>
                </div>
                <div>
                  <Label className="text-xs">Holiday Hours</Label>
                  <Input 
                    type="number" 
                    step="0.5"
                    value={holidayHours}
                    onChange={(e) => setHolidayHours(e.target.value)}
                    className="mt-1"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">@ {OVERTIME_MULTIPLIERS.holiday}x rate</p>
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
                      <Label className="text-xs">Total Sales (SLE)</Label>
                      <Input 
                        type="number"
                        value={salesAmount || totalSales}
                        onChange={(e) => setSalesAmount(parseFloat(e.target.value) || 0)}
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
                        step="0.5"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-based Allowances (Auto-calculated) */}
              {payrollData.allowances.filter(a => a.type === 'role_based').length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Role-based Allowances (Auto)</span>
                  </div>
                  <div className="space-y-1">
                    {payrollData.allowances.filter(a => a.type === 'role_based').map((a, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-green-700">{a.name}</span>
                        <span className="font-medium">{formatSLE(a.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Template-based Benefits/Deductions */}
              {applicableTemplates.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Benefits & Deductions Templates</span>
                    <Badge variant="secondary" className="text-xs">{applicableTemplates.length} applied</Badge>
                  </div>
                  <div className="space-y-1">
                    {payrollData.allowances.filter(a => a.template_id).map((a, i) => (
                      <div key={`b-${i}`} className="flex justify-between text-sm">
                        <span className="text-green-600">+ {a.name}</span>
                        <span className="font-medium text-green-600">{formatSLE(a.amount)}</span>
                      </div>
                    ))}
                    {payrollData.deductions.filter(d => d.template_id).map((d, i) => (
                      <div key={`d-${i}`} className="flex justify-between text-sm">
                        <span className="text-red-600">- {d.name}</span>
                        <span className="font-medium text-red-600">{formatSLE(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Allowances */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between">
                    <span>Additional Allowances, Bonuses & Deductions</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  {/* Custom Allowances */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-green-600">Additional Allowances</Label>
                      <div className="flex gap-2">
                        <Select onValueChange={(v) => addCustomAllowance(COMMON_ALLOWANCES.find(a => a.name === v))}>
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue placeholder="Quick add..." />
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
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {customAllowances.map((allowance, index) => (
                        <div key={index} className="flex gap-2">
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
                          <Input 
                            type="number" 
                            placeholder="Amount"
                            value={allowance.amount || ""}
                            onChange={(e) => {
                              const updated = [...customAllowances];
                              updated[index].amount = parseFloat(e.target.value) || 0;
                              setCustomAllowances(updated);
                            }}
                            className="w-32"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => {
                            setCustomAllowances(customAllowances.filter((_, i) => i !== index));
                          }}>
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Bonuses */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-purple-600">Additional Bonuses</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addCustomBonus}>
                        <Plus className="w-4 h-4 mr-1" /> Add Bonus
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {customBonuses.map((bonus, index) => (
                        <div key={index} className="flex gap-2">
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
                          <Input 
                            type="number" 
                            placeholder="Amount"
                            value={bonus.amount || ""}
                            onChange={(e) => {
                              const updated = [...customBonuses];
                              updated[index].amount = parseFloat(e.target.value) || 0;
                              setCustomBonuses(updated);
                            }}
                            className="w-32"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => {
                            setCustomBonuses(customBonuses.filter((_, i) => i !== index));
                          }}>
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Deductions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-red-600">Other Deductions</Label>
                      <div className="flex gap-2">
                        <Select onValueChange={(v) => addCustomDeduction(COMMON_DEDUCTIONS.find(d => d.name === v))}>
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue placeholder="Quick add..." />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_DEDUCTIONS.map(d => (
                              <SelectItem key={d.name} value={d.name} className="text-xs">
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm" onClick={() => addCustomDeduction()}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {customDeductions.map((deduction, index) => (
                        <div key={index} className="flex gap-2">
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
                          <Input 
                            type="number" 
                            placeholder="Amount"
                            value={deduction.amount || ""}
                            onChange={(e) => {
                              const updated = [...customDeductions];
                              updated[index].amount = parseFloat(e.target.value) || 0;
                              setCustomDeductions(updated);
                            }}
                            className="w-32"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => {
                            setCustomDeductions(customDeductions.filter((_, i) => i !== index));
                          }}>
                            <Minus className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

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
                    <span>{formatSLE(customDeductions.reduce((s, d) => s + (d.amount || 0), 0))}</span>
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto"
              disabled={!selectedEmployeeId || !payrollData || createPayrollMutation.isPending}
            >
              {createPayrollMutation.isPending ? "Processing..." : "Process Payroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}