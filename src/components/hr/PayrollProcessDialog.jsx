import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Plus, Minus, Calculator, Info, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calculatePayroll,
  calculatePAYE,
  calculateNASSIT,
  getRoleAllowances,
  calculateHourlyRate,
  formatSLE,
  getTaxBracketInfo,
  OVERTIME_RATES,
} from "./PayrollCalculator";

// Common Sierra Leone allowances
const SL_COMMON_ALLOWANCES = [
  { name: "Transport Allowance", type: "transport" },
  { name: "Housing Allowance", type: "housing" },
  { name: "Medical Allowance", type: "medical" },
  { name: "Risk Allowance", type: "risk" },
  { name: "Meal Allowance", type: "meal" },
  { name: "Communication Allowance", type: "communication" },
  { name: "Leave Allowance", type: "other" },
];

export default function PayrollProcessDialog({ 
  open, 
  onOpenChange, 
  employees = [],
  orgId,
  currentEmployee 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [applyNASSIT, setApplyNASSIT] = useState(true);
  const [applyPAYE, setApplyPAYE] = useState(true);
  const [includeRoleAllowances, setIncludeRoleAllowances] = useState(true);
  const [overtimeType, setOvertimeType] = useState("regular");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const lastMonth = subMonths(new Date(), 1);
  const defaultPeriodStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
  const defaultPeriodEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

  // Set default periods on mount
  useEffect(() => {
    if (!periodStart) setPeriodStart(defaultPeriodStart);
    if (!periodEnd) setPeriodEnd(defaultPeriodEnd);
  }, []);

  const employee = employees.find(e => e.id === selectedEmployee);

  // Fetch attendance data for the selected employee and period
  const { data: attendanceData = [] } = useQuery({
    queryKey: ['attendance', selectedEmployee, periodStart, periodEnd],
    queryFn: () => base44.entities.Attendance.filter({
      organisation_id: orgId,
      employee_id: selectedEmployee,
    }),
    enabled: !!selectedEmployee && !!periodStart && !!periodEnd,
  });

  // Fetch sales data for commission calculation
  const { data: salesData = [] } = useQuery({
    queryKey: ['sales', selectedEmployee, periodStart, periodEnd],
    queryFn: () => base44.entities.Sale.filter({
      organisation_id: orgId,
      employee_id: selectedEmployee,
    }),
    enabled: !!selectedEmployee && ['vehicle_sales', 'retail_cashier', 'warehouse_manager'].includes(employee?.role),
  });

  // Calculate attendance summary for the period
  const attendanceSummary = useMemo(() => {
    if (!attendanceData.length || !periodStart || !periodEnd) return null;
    
    const periodAttendance = attendanceData.filter(a => {
      const date = a.date;
      return date >= periodStart && date <= periodEnd;
    });

    const present_days = periodAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent_days = periodAttendance.filter(a => a.status === 'absent').length;
    const late_days = periodAttendance.filter(a => a.status === 'late').length;
    const total_hours = periodAttendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);
    const overtime_hours = periodAttendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

    return { present_days, absent_days, late_days, total_hours, overtime_hours };
  }, [attendanceData, periodStart, periodEnd]);

  // Calculate total sales for commission
  const totalSales = useMemo(() => {
    if (!salesData.length || !periodStart || !periodEnd) return 0;
    
    return salesData
      .filter(s => {
        const date = s.created_date?.split('T')[0];
        return date >= periodStart && date <= periodEnd;
      })
      .reduce((sum, s) => sum + (s.total_amount || 0), 0);
  }, [salesData, periodStart, periodEnd]);

  const createPayrollMutation = useMutation({
    mutationFn: (data) => base44.entities.Payroll.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      onOpenChange(false);
      setAllowances([]);
      setDeductions([]);
      setBonuses([]);
      setSelectedEmployee("");
      toast({ title: "Payroll processed successfully" });
    },
  });

  const baseSalary = employee?.base_salary || 0;
  const salaryType = employee?.salary_type || 'monthly';
  const hourlyRate = calculateHourlyRate(baseSalary, salaryType);
  
  // Get role-based allowances
  const roleAllowances = includeRoleAllowances ? getRoleAllowances(employee?.role) : [];
  
  // Calculate overtime from form or attendance
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(0);

  // Auto-populate overtime from attendance
  useEffect(() => {
    if (attendanceSummary?.overtime_hours) {
      setOvertimeHours(attendanceSummary.overtime_hours);
    }
    if (hourlyRate) {
      const multiplier = OVERTIME_RATES[overtimeType] || 1.5;
      setOvertimeRate(Math.round(hourlyRate * multiplier));
    }
  }, [attendanceSummary, hourlyRate, overtimeType]);

  // Full payroll calculation using the calculator
  const payrollCalc = useMemo(() => {
    return calculatePayroll({
      baseSalary,
      salaryType,
      role: employee?.role,
      hoursWorked: attendanceSummary?.total_hours || 176,
      overtimeHours,
      overtimeType,
      customAllowances: allowances.map(a => ({ ...a, amount: parseFloat(a.amount) || 0 })),
      customDeductions: deductions.map(d => ({ ...d, amount: parseFloat(d.amount) || 0 })),
      attendanceSummary,
      salesTotal: totalSales,
      applyNASSIT,
      applyPAYE,
      includeRoleAllowances,
    });
  }, [baseSalary, salaryType, employee?.role, overtimeHours, overtimeType, allowances, deductions, attendanceSummary, totalSales, applyNASSIT, applyPAYE, includeRoleAllowances]);

  // Add custom bonuses to calculation
  const customBonusTotal = bonuses.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const allBonuses = [...payrollCalc.bonuses, ...bonuses.filter(b => b.name && b.amount)];
  const totalBonuses = payrollCalc.totalBonuses + customBonusTotal;
  
  const grossPay = payrollCalc.grossPay + customBonusTotal;
  const nassitDeduction = applyNASSIT ? calculateNASSIT(grossPay).employee : 0;
  const payeDeduction = applyPAYE ? calculatePAYE(grossPay * 12) : 0;
  const totalDeductions = payrollCalc.totalDeductions + (customBonusTotal * (applyNASSIT ? 0.05 : 0));
  const netPay = grossPay - totalDeductions;

  const addAllowance = (preset = null) => {
    if (preset) {
      setAllowances([...allowances, { name: preset.name, type: preset.type || 'other', amount: 0 }]);
    } else {
      setAllowances([...allowances, { name: "", type: 'other', amount: 0 }]);
    }
  };

  const addDeduction = () => {
    setDeductions([...deductions, { name: "", type: 'other', amount: 0 }]);
  };

  const addBonus = () => {
    setBonuses([...bonuses, { name: "", type: 'other', amount: 0 }]);
  };

  const updateAllowance = (index, field, value) => {
    const updated = [...allowances];
    updated[index][field] = value;
    setAllowances(updated);
  };

  const updateDeduction = (index, field, value) => {
    const updated = [...deductions];
    updated[index][field] = value;
    setDeductions(updated);
  };

  const updateBonus = (index, field, value) => {
    const updated = [...bonuses];
    updated[index][field] = value;
    setBonuses(updated);
  };

  const removeAllowance = (index) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  const removeDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const removeBonus = (index) => {
    setBonuses(bonuses.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build complete allowances including role-based
    const allAllowancesData = [
      ...roleAllowances,
      ...allowances.filter(a => a.name && a.amount).map(a => ({ ...a, amount: parseFloat(a.amount) }))
    ];
    
    // Build deductions array including statutory
    const allDeductionsData = [...deductions.filter(d => d.name && d.amount).map(d => ({ ...d, amount: parseFloat(d.amount) }))];
    if (applyNASSIT && nassitDeduction > 0) {
      allDeductionsData.push({ name: "NASSIT (5%)", amount: nassitDeduction, type: "statutory", statutory: true });
    }
    if (applyPAYE && payeDeduction > 0) {
      allDeductionsData.push({ name: "PAYE Tax", amount: payeDeduction, type: "statutory", statutory: true });
    }
    
    const data = {
      organisation_id: orgId,
      employee_id: selectedEmployee,
      employee_name: employee?.full_name,
      employee_role: employee?.role,
      employee_location: employee?.assigned_location_name || '',
      period_start: periodStart,
      period_end: periodEnd,
      base_salary: baseSalary,
      salary_type: salaryType,
      hours_worked: attendanceSummary?.total_hours || 0,
      days_worked: attendanceSummary?.present_days || 0,
      overtime_hours: overtimeHours,
      overtime_rate: overtimeRate,
      overtime_pay: overtimeHours * overtimeRate,
      bonuses: allBonuses,
      total_bonuses: totalBonuses,
      allowances: allAllowancesData,
      total_allowances: payrollCalc.totalAllowances,
      deductions: allDeductionsData,
      total_deductions: totalDeductions,
      nassit_employee: nassitDeduction,
      nassit_employer: applyNASSIT ? calculateNASSIT(grossPay).employer : 0,
      paye_tax: payeDeduction,
      gross_pay: grossPay,
      net_pay: netPay,
      status: 'pending_approval',
      attendance_summary: attendanceSummary,
    };

    createPayrollMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#1EB053]" />
            Process Payroll
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee & Period */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Employee</Label>
              <Select 
                value={selectedEmployee} 
                onValueChange={setSelectedEmployee}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active').map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{e.full_name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{e.role}</Badge>
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

          {employee && (
            <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{employee.full_name}</p>
                  <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{employee.role?.replace('_', ' ')}</Badge>
                    {employee.assigned_location_name && (
                      <Badge variant="outline">{employee.assigned_location_name}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Base Salary ({salaryType})</p>
                  <p className="text-xl font-bold text-[#1EB053]">{formatSLE(baseSalary)}</p>
                  {salaryType !== 'monthly' && (
                    <p className="text-xs text-gray-500">Hourly: {formatSLE(hourlyRate)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attendance Summary */}
          {employee && attendanceSummary && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Attendance Summary</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-gray-500">Present</p>
                  <p className="text-lg font-bold text-green-600">{attendanceSummary.present_days}</p>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-gray-500">Absent</p>
                  <p className="text-lg font-bold text-red-600">{attendanceSummary.absent_days}</p>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-gray-500">Late</p>
                  <p className="text-lg font-bold text-amber-600">{attendanceSummary.late_days}</p>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-gray-500">Total Hours</p>
                  <p className="text-lg font-bold text-blue-600">{attendanceSummary.total_hours?.toFixed(1)}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Sales Summary for commission-eligible roles */}
          {employee && totalSales > 0 && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-800">Sales Performance</h4>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-lg font-bold text-green-600">{formatSLE(totalSales)}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Overtime */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Overtime Type</Label>
              <Select value={overtimeType} onValueChange={setOvertimeType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular (1.5x)</SelectItem>
                  <SelectItem value="weekend">Weekend (2x)</SelectItem>
                  <SelectItem value="holiday">Holiday (2.5x)</SelectItem>
                  <SelectItem value="night">Night Shift (1.25x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Overtime Hours</Label>
              <Input 
                type="number" 
                step="0.5" 
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                className="mt-1" 
              />
              {attendanceSummary?.overtime_hours > 0 && (
                <p className="text-xs text-gray-500 mt-1">From attendance: {attendanceSummary.overtime_hours}h</p>
              )}
            </div>
            <div>
              <Label>Overtime Rate (SLE/hr)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(parseFloat(e.target.value) || 0)}
                className="mt-1" 
              />
              <p className="text-xs text-gray-500 mt-1">Pay: {formatSLE(overtimeHours * overtimeRate)}</p>
            </div>
          </div>

          {/* Role-based Allowances */}
          {employee && roleAllowances.length > 0 && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-800">Role-based Allowances ({employee.role?.replace('_', ' ')})</h4>
                <Switch checked={includeRoleAllowances} onCheckedChange={setIncludeRoleAllowances} />
              </div>
              {includeRoleAllowances && (
                <div className="space-y-2">
                  {roleAllowances.map((allowance, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{allowance.name}</span>
                      <span className="font-medium">{formatSLE(allowance.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-2 border-t border-purple-200">
                    <span>Total Role Allowances</span>
                    <span className="text-purple-700">{formatSLE(roleAllowances.reduce((s, a) => s + a.amount, 0))}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Allowances */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-green-600">Allowances</Label>
              <div className="flex gap-2">
                <Select onValueChange={(v) => addAllowance(SL_COMMON_ALLOWANCES.find(a => a.name === v))}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue placeholder="Quick add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SL_COMMON_ALLOWANCES.map(a => (
                      <SelectItem key={a.name} value={a.name} className="text-xs">
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => addAllowance()}>
                  <Plus className="w-4 h-4 mr-1" /> Custom
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {allowances.map((allowance, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="Allowance name" 
                    value={allowance.name}
                    onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    placeholder="Amount"
                    value={allowance.amount}
                    onChange={(e) => updateAllowance(index, 'amount', e.target.value)}
                    className="w-32"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAllowance(index)}>
                    <Minus className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {allowances.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">No allowances added</p>
              )}
            </div>
          </div>

          {/* Statutory Deductions (Sierra Leone) */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-semibold text-[#0072C6]">🇸🇱 Sierra Leone Statutory Deductions</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">NASSIT: 5% employee, 10% employer</p>
                    <p className="text-xs mt-1">PAYE: Progressive tax from 0% to 30%</p>
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
                  <span className="text-sm font-medium">SLE {nassitDeduction.toLocaleString()}</span>
                  <Switch checked={applyNASSIT} onCheckedChange={setApplyNASSIT} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">PAYE Tax</p>
                  <p className="text-xs text-gray-500">Pay As You Earn Income Tax</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">SLE {payeDeduction.toLocaleString()}</span>
                  <Switch checked={applyPAYE} onCheckedChange={setApplyPAYE} />
                </div>
              </div>
            </div>
          </div>

          {/* Bonuses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-amber-600">Bonuses</Label>
              <Button type="button" variant="outline" size="sm" onClick={addBonus}>
                <Plus className="w-4 h-4 mr-1" /> Add Bonus
              </Button>
            </div>
            
            {/* Auto-calculated bonuses */}
            {payrollCalc.bonuses.length > 0 && (
              <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-medium text-amber-700 mb-2">Auto-calculated:</p>
                {payrollCalc.bonuses.map((bonus, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {bonus.name}
                    </span>
                    <span className="font-medium">{formatSLE(bonus.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Custom bonuses */}
            <div className="space-y-2">
              {bonuses.map((bonus, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="e.g., Performance Bonus" 
                    value={bonus.name}
                    onChange={(e) => updateBonus(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Select value={bonus.type} onValueChange={(v) => updateBonus(index, 'type', v)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Amount"
                    value={bonus.amount}
                    onChange={(e) => updateBonus(index, 'amount', e.target.value)}
                    className="w-28"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeBonus(index)}>
                    <Minus className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Other Deductions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-red-600">Other Deductions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDeduction}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {deductions.map((deduction, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="e.g., Loan repayment, Advance" 
                    value={deduction.name}
                    onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Select value={deduction.type} onValueChange={(v) => updateDeduction(index, 'type', v)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                      <SelectItem value="penalty">Penalty</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Amount"
                    value={deduction.amount}
                    onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                    className="w-28"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDeduction(index)}>
                    <Minus className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {deductions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">No other deductions</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Salary</span>
              <span>{formatSLE(baseSalary)}</span>
            </div>
            {overtimeHours > 0 && (
              <div className="flex justify-between text-blue-600 text-sm">
                <span>+ Overtime ({overtimeHours}h × {formatSLE(overtimeRate)})</span>
                <span>{formatSLE(overtimeHours * overtimeRate)}</span>
              </div>
            )}
            {payrollCalc.totalAllowances > 0 && (
              <div className="flex justify-between text-green-600">
                <span>+ Allowances</span>
                <span>{formatSLE(payrollCalc.totalAllowances)}</span>
              </div>
            )}
            {totalBonuses > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>+ Bonuses</span>
                <span>{formatSLE(totalBonuses)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Gross Pay</span>
              <span>{formatSLE(grossPay)}</span>
            </div>
            {applyNASSIT && nassitDeduction > 0 && (
              <div className="flex justify-between text-red-500 text-sm">
                <span>- NASSIT (5%)</span>
                <span>{formatSLE(nassitDeduction)}</span>
              </div>
            )}
            {applyPAYE && payeDeduction > 0 && (
              <div className="flex justify-between text-red-500 text-sm">
                <span>- PAYE Tax</span>
                <span>{formatSLE(payeDeduction)}</span>
              </div>
            )}
            {deductions.length > 0 && (
              <div className="flex justify-between text-red-500 text-sm">
                <span>- Other Deductions</span>
                <span>{formatSLE(deductions.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0))}</span>
              </div>
            )}
            <div className="flex justify-between text-red-600">
              <span>Total Deductions</span>
              <span>{formatSLE(totalDeductions)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 -mx-4 px-4 py-3 rounded-lg">
              <span>Net Pay</span>
              <span className="text-[#1EB053]">{formatSLE(netPay)}</span>
            </div>
            
            {/* Employer costs info */}
            {applyNASSIT && (
              <div className="text-xs text-gray-500 text-right mt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 ml-auto">
                      <Info className="w-3 h-3" />
                      Employer NASSIT (10%): {formatSLE(calculateNASSIT(grossPay).employer)}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Total employer cost: {formatSLE(grossPay + calculateNASSIT(grossPay).employer)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] text-white shadow-lg w-full sm:w-auto"
              disabled={!selectedEmployee || createPayrollMutation.isPending}
            >
              {createPayrollMutation.isPending ? "Processing..." : "Process Payroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}