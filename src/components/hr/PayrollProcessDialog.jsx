import React, { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Plus, Minus, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const totalDeductions = deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const grossPay = baseSalary + totalAllowances;
  const netPay = grossPay - totalDeductions;

  const addAllowance = () => {
    setAllowances([...allowances, { name: "", amount: 0 }]);
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
      deductions: deductions.filter(d => d.name && d.amount),
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
              <Button type="button" variant="outline" size="sm" onClick={addAllowance}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
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

          {/* Deductions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-red-600">Deductions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDeduction}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {deductions.map((deduction, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="Deduction name" 
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
                <p className="text-sm text-gray-400 text-center py-2">No deductions added</p>
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
            <div className="flex justify-between font-medium">
              <span>Gross Pay</span>
              <span>SLE {grossPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>- Deductions</span>
              <span>SLE {totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
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