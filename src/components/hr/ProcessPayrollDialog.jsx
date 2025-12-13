import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calculator, Users, DollarSign, Calendar, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/Toast";
import { calculateSalaryBreakdown, formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";

export default function ProcessPayrollDialog({ open, onOpenChange, orgId, employees, payCycles }) {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payCycleId, setPayCycleId] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [showPreview, setShowPreview] = useState(false);
  const [payrollPreview, setPayrollPreview] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [manualAdjustments, setManualAdjustments] = useState({});

  const queryClient = useQueryClient();
  const toast = useToast();

  const activeEmployees = employees.filter(e => e.status === 'active');

  const processMutation = useMutation({
    mutationFn: async (payrollRecords) => {
      const created = await Promise.all(
        payrollRecords.map(record => base44.entities.Payroll.create(record))
      );
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      toast.success("Payroll Processed", `Successfully processed ${payrollPreview.length} employee payrolls`);
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Processing Failed", error.message);
    },
  });

  const resetForm = () => {
    setSelectedEmployees([]);
    setShowPreview(false);
    setPayrollPreview([]);
    setAllowances([]);
    setBonuses([]);
    setDeductions([]);
    setManualAdjustments({});
  };

  const calculateFrequencyMultiplier = (freq) => {
    switch(freq) {
      case 'weekly': return 52 / 12;
      case 'bi_weekly': return 26 / 12;
      case 'monthly': return 1;
      default: return 1;
    }
  };

  const handleGeneratePreview = () => {
    if (selectedEmployees.length === 0) {
      toast.error("No Employees", "Please select at least one employee");
      return;
    }

    const [year, month] = payPeriod.split('-');
    const periodStart = `${year}-${month}-01`;
    const periodEnd = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

    const frequencyMultiplier = calculateFrequencyMultiplier(frequency);

    const preview = selectedEmployees.map(empId => {
      const emp = activeEmployees.find(e => e.id === empId);
      if (!emp) return null;

      const adjustment = manualAdjustments[empId] || {};
      
      // Calculate prorated salary based on frequency
      const proratedSalary = (emp.base_salary || 0) / frequencyMultiplier;
      
      // Calculate overtime
      const overtimeHours = adjustment.overtimeHours || 0;
      const hourlyRate = (emp.base_salary || 0) / 160; // ~160 working hours per month
      const overtimePay = overtimeHours * hourlyRate * 1.5;
      
      // Calculate weekend pay
      const weekendHours = adjustment.weekendHours || 0;
      const weekendPay = weekendHours * hourlyRate * 2;
      
      // Calculate holiday pay
      const holidayHours = adjustment.holidayHours || 0;
      const holidayPay = holidayHours * hourlyRate * 2.5;
      
      // Sum allowances and bonuses
      const totalAllowances = allowances.reduce((sum, a) => sum + (a.amount || 0), 0);
      const totalBonuses = bonuses.reduce((sum, b) => sum + (b.amount || 0), 0);
      
      // Calculate adjusted salary
      const adjustedSalary = proratedSalary + totalAllowances + totalBonuses + overtimePay + weekendPay + holidayPay;
      
      // Apply tax calculations
      const breakdown = calculateSalaryBreakdown(adjustedSalary, {}, {});
      
      // Add custom deductions
      const customDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
      const finalTotalDeductions = breakdown.totalDeductions + customDeductions;
      const finalNetPay = breakdown.netSalary - customDeductions;

      return {
        organisation_id: orgId,
        employee_id: emp.id,
        employee_name: emp.full_name,
        employee_code: emp.employee_code,
        employee_role: emp.role,
        employee_location: emp.assigned_location_name,
        payroll_frequency: frequency,
        period_start: periodStart,
        period_end: periodEnd,
        payment_date: payDate,
        base_salary: emp.base_salary,
        prorated_salary: proratedSalary,
        salary_type: emp.salary_type || 'monthly',
        hours_worked: adjustment.hoursWorked || 0,
        days_worked: adjustment.daysWorked || 0,
        overtime_hours: overtimeHours,
        overtime_pay: overtimePay,
        overtime_rate_multiplier: 1.5,
        weekend_hours: weekendHours,
        weekend_pay: weekendPay,
        holiday_hours: holidayHours,
        holiday_pay: holidayPay,
        allowances: allowances,
        bonuses: bonuses,
        deductions: [...deductions, 
          { name: 'NASSIT (5%)', amount: breakdown.nassit.employee, type: 'statutory' },
          { name: 'PAYE Tax', amount: breakdown.paye.tax, type: 'statutory' }
        ],
        total_allowances: totalAllowances,
        total_bonuses: totalBonuses,
        gross_pay: breakdown.grossSalary,
        nassit_employee: breakdown.nassit.employee,
        nassit_employer: breakdown.nassit.employer,
        paye_tax: breakdown.paye.tax,
        total_statutory_deductions: breakdown.nassit.employee + breakdown.paye.tax,
        total_deductions: finalTotalDeductions,
        net_pay: finalNetPay,
        employer_cost: breakdown.employerCost,
        status: 'draft',
        calculation_details: {
          hourly_rate: hourlyRate,
          daily_rate: (emp.base_salary || 0) / 22,
          tax_bracket: breakdown.paye.taxableIncome > 0 ? 'As per SL rates' : 'Tax Free',
          effective_tax_rate: breakdown.paye.effectiveRate,
          annual_gross_equivalent: breakdown.grossSalary * 12,
          frequency_multiplier: frequencyMultiplier,
        },
      };
    }).filter(Boolean);

    setPayrollPreview(preview);
    setShowPreview(true);
  };

  const handleProcessPayroll = () => {
    processMutation.mutate(payrollPreview);
  };

  const totalGross = payrollPreview.reduce((sum, p) => sum + (p.gross_pay || 0), 0);
  const totalNet = payrollPreview.reduce((sum, p) => sum + (p.net_pay || 0), 0);
  const totalNASSIT = payrollPreview.reduce((sum, p) => sum + (p.nassit_employee || 0) + (p.nassit_employer || 0), 0);
  const totalPAYE = payrollPreview.reduce((sum, p) => sum + (p.paye_tax || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="h-1 flex -mx-6 -mt-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#1EB053]" />
            Process Payroll - Sierra Leone
          </DialogTitle>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Pay Period Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Pay Period (Month) *</Label>
                <Input
                  type="month"
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value)}
                />
              </div>
              <div>
                <Label>Pay Date *</Label>
                <Input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Payroll Frequency *</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi_weekly">Bi-Weekly (Every 2 weeks)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {payCycles.length > 0 && (
              <div>
                <Label>Pay Cycle (Optional)</Label>
                <Select value={payCycleId} onValueChange={setPayCycleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay cycle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {payCycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name} - {cycle.frequency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Allowances */}
            <div className="p-4 border rounded-lg bg-green-50/50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-green-700">Allowances (Added to all employees)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAllowances([...allowances, { name: '', amount: 0 }])}
                  className="h-7 text-xs border-green-600 text-green-600 hover:bg-green-50"
                >
                  + Add Allowance
                </Button>
              </div>
              {allowances.map((allowance, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Name (e.g., Transport)"
                    value={allowance.name}
                    onChange={(e) => {
                      const updated = [...allowances];
                      updated[idx].name = e.target.value;
                      setAllowances(updated);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={allowance.amount}
                    onChange={(e) => {
                      const updated = [...allowances];
                      updated[idx].amount = parseFloat(e.target.value) || 0;
                      setAllowances(updated);
                    }}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setAllowances(allowances.filter((_, i) => i !== idx))}
                    className="text-red-600"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            {/* Bonuses */}
            <div className="p-4 border rounded-lg bg-blue-50/50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-blue-700">Bonuses (Added to all employees)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setBonuses([...bonuses, { name: '', amount: 0, type: 'performance' }])}
                  className="h-7 text-xs border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  + Add Bonus
                </Button>
              </div>
              {bonuses.map((bonus, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Name (e.g., Performance)"
                    value={bonus.name}
                    onChange={(e) => {
                      const updated = [...bonuses];
                      updated[idx].name = e.target.value;
                      setBonuses(updated);
                    }}
                    className="flex-1"
                  />
                  <Select
                    value={bonus.type || 'performance'}
                    onValueChange={(value) => {
                      const updated = [...bonuses];
                      updated[idx].type = value;
                      setBonuses(updated);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="sales_commission">Commission</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="role_based">Role Based</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={bonus.amount}
                    onChange={(e) => {
                      const updated = [...bonuses];
                      updated[idx].amount = parseFloat(e.target.value) || 0;
                      setBonuses(updated);
                    }}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setBonuses(bonuses.filter((_, i) => i !== idx))}
                    className="text-red-600"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            {/* Deductions */}
            <div className="p-4 border rounded-lg bg-red-50/50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-red-700">Deductions (Added to all employees)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setDeductions([...deductions, { name: '', amount: 0, type: 'voluntary' }])}
                  className="h-7 text-xs border-red-600 text-red-600 hover:bg-red-50"
                >
                  + Add Deduction
                </Button>
              </div>
              {deductions.map((deduction, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Name (e.g., Loan Payment)"
                    value={deduction.name}
                    onChange={(e) => {
                      const updated = [...deductions];
                      updated[idx].name = e.target.value;
                      setDeductions(updated);
                    }}
                    className="flex-1"
                  />
                  <Select
                    value={deduction.type || 'voluntary'}
                    onValueChange={(value) => {
                      const updated = [...deductions];
                      updated[idx].type = value;
                      setDeductions(updated);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voluntary">Voluntary</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={deduction.amount}
                    onChange={(e) => {
                      const updated = [...deductions];
                      updated[idx].amount = parseFloat(e.target.value) || 0;
                      setDeductions(updated);
                    }}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))}
                    className="text-red-600"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            {/* Employee Selection */}
            <div>
              <Label className="mb-3 block">Select Employees *</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedEmployees.length === activeEmployees.length}
                    onCheckedChange={(checked) => {
                      setSelectedEmployees(checked ? activeEmployees.map(e => e.id) : []);
                    }}
                  />
                  <span className="font-semibold text-sm">Select All ({activeEmployees.length})</span>
                </div>
                {activeEmployees.map((emp) => (
                  <div key={emp.id} className="space-y-2 p-2 hover:bg-gray-50 rounded border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedEmployees.includes(emp.id)}
                          onCheckedChange={(checked) => {
                            setSelectedEmployees(
                              checked
                                ? [...selectedEmployees, emp.id]
                                : selectedEmployees.filter(id => id !== emp.id)
                            );
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">{emp.employee_code} • {emp.department}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#1EB053]">
                        {formatLeone(emp.base_salary || 0)}
                      </span>
                    </div>
                    {selectedEmployees.includes(emp.id) && (
                      <div className="ml-8 grid grid-cols-4 gap-2">
                        <Input
                          type="number"
                          placeholder="Days"
                          value={manualAdjustments[emp.id]?.daysWorked || ''}
                          onChange={(e) => setManualAdjustments({
                            ...manualAdjustments,
                            [emp.id]: { ...manualAdjustments[emp.id], daysWorked: parseFloat(e.target.value) || 0 }
                          })}
                          className="h-8 text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="OT Hours"
                          value={manualAdjustments[emp.id]?.overtimeHours || ''}
                          onChange={(e) => setManualAdjustments({
                            ...manualAdjustments,
                            [emp.id]: { ...manualAdjustments[emp.id], overtimeHours: parseFloat(e.target.value) || 0 }
                          })}
                          className="h-8 text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="Weekend Hrs"
                          value={manualAdjustments[emp.id]?.weekendHours || ''}
                          onChange={(e) => setManualAdjustments({
                            ...manualAdjustments,
                            [emp.id]: { ...manualAdjustments[emp.id], weekendHours: parseFloat(e.target.value) || 0 }
                          })}
                          className="h-8 text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="Holiday Hrs"
                          value={manualAdjustments[emp.id]?.holidayHours || ''}
                          onChange={(e) => setManualAdjustments({
                            ...manualAdjustments,
                            [emp.id]: { ...manualAdjustments[emp.id], holidayHours: parseFloat(e.target.value) || 0 }
                          })}
                          className="h-8 text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGeneratePreview}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gradient-to-br from-[#1EB053]/10 to-[#1EB053]/5 rounded-lg">
                <p className="text-xs text-gray-600">Employees</p>
                <p className="text-xl font-bold text-gray-900">{payrollPreview.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg">
                <p className="text-xs text-gray-600">Total Gross</p>
                <p className="text-sm font-bold text-gray-900">{formatLeone(totalGross)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#0072C6]/10 to-[#0072C6]/5 rounded-lg">
                <p className="text-xs text-gray-600">NASSIT</p>
                <p className="text-sm font-bold text-gray-900">{formatLeone(totalNASSIT)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg">
                <p className="text-xs text-gray-600">PAYE</p>
                <p className="text-sm font-bold text-gray-900">{formatLeone(totalPAYE)}</p>
              </div>
            </div>

            {/* Payroll List Preview */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {payrollPreview.map((record, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{record.employee_name}</p>
                      <p className="text-xs text-gray-500">{record.employee_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#1EB053]">{formatLeone(record.net_pay)}</p>
                      <p className="text-xs text-gray-500">Net Pay</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t text-xs">
                    <div>
                      <p className="text-gray-500">Gross</p>
                      <p className="font-semibold">{formatLeone(record.gross_pay)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">NASSIT</p>
                      <p className="font-semibold">{formatLeone(record.nassit_employee + record.nassit_employer)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">PAYE</p>
                      <p className="font-semibold">{formatLeone(record.paye_tax)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Deductions</p>
                      <p className="font-semibold">{formatLeone(record.total_deductions)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back
              </Button>
              <Button
                onClick={handleProcessPayroll}
                disabled={processMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {processMutation.isPending ? "Processing..." : `Process ${payrollPreview.length} Payrolls`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}