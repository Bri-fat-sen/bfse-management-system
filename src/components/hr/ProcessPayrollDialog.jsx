import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { calculateSalaryBreakdown, formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function ProcessPayrollDialog({ open, onOpenChange, orgId, employees, payCycles }) {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [payDate, setPayDate] = useState(new Date());
  const [payPeriod, setPayPeriod] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const employee = employees.find(e => e.id === selectedEmployee);
  const breakdown = employee ? calculateSalaryBreakdown(employee.base_salary || 0) : null;

  const processMutation = useMutation({
    mutationFn: (payrollData) => base44.entities.Payroll.create(payrollData),
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      toast.success("Payroll Processed");
      onOpenChange(false);
    },
  });

  const handleProcess = () => {
    if (!employee || !payPeriod) {
      toast.error("Missing Fields", "Please select employee and pay period");
      return;
    }

    processMutation.mutate({
      organisation_id: orgId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      pay_date: payDate.toISOString(),
      pay_period: payPeriod,
      basic_salary: breakdown.basicSalary,
      gross_salary: breakdown.grossSalary,
      nassit_employee: breakdown.nassit.employee,
      nassit_employer: breakdown.nassit.employer,
      paye_tax: breakdown.paye.tax,
      total_deductions: breakdown.totalDeductions,
      net_salary: breakdown.netSalary,
      status: "pending",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="h-1 flex -mt-6 -mx-6">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <DialogHeader>
          <DialogTitle>Process Payroll</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Employee *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(e => e.status === 'active').map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.employee_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pay Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(payDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={payDate} onSelect={setPayDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Pay Period *</Label>
              <Input
                placeholder="e.g., December 2024"
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
              />
            </div>
          </div>

          {breakdown && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900">Salary Breakdown</h4>
              <div className="flex justify-between">
                <span>Gross Salary:</span>
                <span className="font-semibold">{formatLeone(breakdown.grossSalary)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>NASSIT (Employee 5%):</span>
                <span>-{formatLeone(breakdown.nassit.employee)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>PAYE Tax:</span>
                <span>-{formatLeone(breakdown.paye.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-lg">
                <span className="font-semibold">Net Salary:</span>
                <span className="font-bold text-[#1EB053]">{formatLeone(breakdown.netSalary)}</span>
              </div>
              <div className="flex justify-between text-amber-600 text-xs pt-2 border-t">
                <span>Employer Cost (incl. NASSIT 10%):</span>
                <span className="font-semibold">{formatLeone(breakdown.employerCost)}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleProcess} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
            Process Payroll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}