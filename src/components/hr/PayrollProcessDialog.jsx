import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
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
import { DollarSign, Plus, Minus, Calculator, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Sierra Leone Statutory Deductions (2024 rates)
const SL_TAX_BRACKETS = [
  { min: 0, max: 500000, rate: 0 },           // First SLE 500,000 - 0%
  { min: 500001, max: 1000000, rate: 0.15 },  // Next SLE 500,000 - 15%
  { min: 1000001, max: 1500000, rate: 0.20 }, // Next SLE 500,000 - 20%
  { min: 1500001, max: 2000000, rate: 0.25 }, // Next SLE 500,000 - 25%
  { min: 2000001, max: Infinity, rate: 0.30 } // Above SLE 2,000,000 - 30%
];

const NASSIT_EMPLOYEE_RATE = 0.05;  // 5% employee contribution
const NASSIT_EMPLOYER_RATE = 0.10;  // 10% employer contribution (for reference)

// Common Sierra Leone allowances
const SL_COMMON_ALLOWANCES = [
  { name: "Transport Allowance", description: "Monthly transport to work" },
  { name: "Housing Allowance", description: "Accommodation support" },
  { name: "Medical Allowance", description: "Health care support" },
  { name: "Risk Allowance", description: "For hazardous work conditions" },
  { name: "Meal Allowance", description: "Daily meal subsidy" },
  { name: "Communication Allowance", description: "Phone/internet allowance" },
  { name: "Leave Allowance", description: "Annual leave bonus" },
];

// Calculate PAYE Tax for Sierra Leone
const calculatePAYE = (annualIncome) => {
  let tax = 0;
  let remainingIncome = annualIncome;
  
  for (const bracket of SL_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min + 1);
    if (annualIncome > bracket.min) {
      tax += Math.max(0, Math.min(taxableInBracket, remainingIncome)) * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
  }
  return tax / 12; // Monthly PAYE
};

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
  const [applyNASSIT, setApplyNASSIT] = useState(true);
  const [applyPAYE, setApplyPAYE] = useState(true);

  const lastMonth = subMonths(new Date(), 1);
  const defaultPeriodStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
  const defaultPeriodEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

  const createPayrollMutation = useMutation({
    mutationFn: (data) => base44.entities.Payroll.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      onOpenChange(false);
      setAllowances([]);
      setDeductions([]);
      setSelectedEmployee("");
      toast({ title: "Payroll processed successfully" });
    },
  });

  const employee = employees.find(e => e.id === selectedEmployee);
  const baseSalary = employee?.base_salary || 0;
  const totalAllowances = allowances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
  const manualDeductions = deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const grossPay = baseSalary + totalAllowances;
  
  // Calculate statutory deductions
  const nassitDeduction = applyNASSIT ? grossPay * NASSIT_EMPLOYEE_RATE : 0;
  const annualGross = grossPay * 12;
  const payeDeduction = applyPAYE ? calculatePAYE(annualGross) : 0;
  
  const totalStatutory = nassitDeduction + payeDeduction;
  const totalDeductions = manualDeductions + totalStatutory;
  const netPay = grossPay - totalDeductions;

  const addAllowance = (preset = null) => {
    if (preset) {
      setAllowances([...allowances, { name: preset.name, amount: 0 }]);
    } else {
      setAllowances([...allowances, { name: "", amount: 0 }]);
    }
  };

  const addDeduction = () => {
    setDeductions([...deductions, { name: "", amount: 0 }]);
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

  const removeAllowance = (index) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  const removeDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Build deductions array including statutory
    const allDeductions = [...deductions.filter(d => d.name && d.amount)];
    if (applyNASSIT && nassitDeduction > 0) {
      allDeductions.push({ name: "NASSIT (5%)", amount: nassitDeduction, statutory: true });
    }
    if (applyPAYE && payeDeduction > 0) {
      allDeductions.push({ name: "PAYE Tax", amount: payeDeduction, statutory: true });
    }
    
    const data = {
      organisation_id: orgId,
      employee_id: selectedEmployee,
      employee_name: employee?.full_name,
      period_start: formData.get('period_start'),
      period_end: formData.get('period_end'),
      base_salary: baseSalary,
      overtime_hours: parseFloat(formData.get('overtime_hours')) || 0,
      overtime_rate: parseFloat(formData.get('overtime_rate')) || 0,
      overtime_pay: (parseFloat(formData.get('overtime_hours')) || 0) * (parseFloat(formData.get('overtime_rate')) || 0),
      allowances: allowances.filter(a => a.name && a.amount),
      total_allowances: totalAllowances,
      deductions: allDeductions,
      total_deductions: totalDeductions,
      gross_pay: grossPay,
      net_pay: netPay,
      status: 'pending_approval',
    };

    createPayrollMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
                      {e.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period Start</Label>
              <Input 
                name="period_start" 
                type="date" 
                defaultValue={defaultPeriodStart}
                required 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Period End</Label>
              <Input 
                name="period_end" 
                type="date" 
                defaultValue={defaultPeriodEnd}
                required 
                className="mt-1" 
              />
            </div>
          </div>

          {employee && (
            <div className="p-4 bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{employee.full_name}</p>
                  <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Base Salary</p>
                  <p className="text-xl font-bold text-[#1EB053]">SLE {baseSalary.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Overtime */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Overtime Hours</Label>
              <Input name="overtime_hours" type="number" step="0.5" defaultValue="0" className="mt-1" />
            </div>
            <div>
              <Label>Overtime Rate (SLE/hr)</Label>
              <Input name="overtime_rate" type="number" step="0.01" defaultValue="0" className="mt-1" />
            </div>
          </div>

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
                  <Input 
                    type="number" 
                    placeholder="Amount"
                    value={deduction.amount}
                    onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                    className="w-32"
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
              <span>SLE {baseSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>+ Allowances</span>
              <span>SLE {totalAllowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Gross Pay</span>
              <span>SLE {grossPay.toLocaleString()}</span>
            </div>
            {applyNASSIT && (
              <div className="flex justify-between text-red-500 text-sm">
                <span>- NASSIT (5%)</span>
                <span>SLE {nassitDeduction.toLocaleString()}</span>
              </div>
            )}
            {applyPAYE && (
              <div className="flex justify-between text-red-500 text-sm">
                <span>- PAYE Tax</span>
                <span>SLE {payeDeduction.toLocaleString()}</span>
              </div>
            )}
            {manualDeductions > 0 && (
              <div className="flex justify-between text-red-500 text-sm">
                <span>- Other Deductions</span>
                <span>SLE {manualDeductions.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-red-600">
              <span>Total Deductions</span>
              <span>SLE {totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t bg-gradient-to-r from-[#1EB053]/10 to-[#0072C6]/10 -mx-4 px-4 py-3 rounded-lg">
              <span>Net Pay</span>
              <span className="text-[#1EB053]">SLE {netPay.toLocaleString()}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1EB053] hover:bg-[#178f43]"
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