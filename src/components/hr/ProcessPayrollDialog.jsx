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
  const [showPreview, setShowPreview] = useState(false);
  const [payrollPreview, setPayrollPreview] = useState([]);

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
  };

  const handleGeneratePreview = () => {
    if (selectedEmployees.length === 0) {
      toast.error("No Employees", "Please select at least one employee");
      return;
    }

    const preview = selectedEmployees.map(empId => {
      const emp = activeEmployees.find(e => e.id === empId);
      if (!emp) return null;

      const breakdown = calculateSalaryBreakdown(emp.base_salary || 0, {}, {});

      return {
        organisation_id: orgId,
        employee_id: emp.id,
        employee_name: emp.full_name,
        employee_code: emp.employee_code,
        pay_period: payPeriod,
        pay_date: payDate,
        pay_cycle_id: payCycleId || null,
        basic_salary: breakdown.basicSalary,
        allowances: breakdown.totalAllowances,
        gross_salary: breakdown.grossSalary,
        nassit_employee: breakdown.nassit.employee,
        nassit_employer: breakdown.nassit.employer,
        paye_tax: breakdown.paye.tax,
        other_deductions: breakdown.otherDeductions,
        total_deductions: breakdown.totalDeductions,
        net_salary: breakdown.netSalary,
        employer_cost: breakdown.employerCost,
        status: 'draft',
      };
    }).filter(Boolean);

    setPayrollPreview(preview);
    setShowPreview(true);
  };

  const handleProcessPayroll = () => {
    processMutation.mutate(payrollPreview);
  };

  const totalGross = payrollPreview.reduce((sum, p) => sum + p.gross_salary, 0);
  const totalNet = payrollPreview.reduce((sum, p) => sum + p.net_salary, 0);
  const totalNASSIT = payrollPreview.reduce((sum, p) => sum + p.nassit_employee + p.nassit_employer, 0);
  const totalPAYE = payrollPreview.reduce((sum, p) => sum + p.paye_tax, 0);

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
            <div className="grid grid-cols-2 gap-4">
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
                  <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
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
                      <p className="text-lg font-bold text-[#1EB053]">{formatLeone(record.net_salary)}</p>
                      <p className="text-xs text-gray-500">Net Pay</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t text-xs">
                    <div>
                      <p className="text-gray-500">Gross</p>
                      <p className="font-semibold">{formatLeone(record.gross_salary)}</p>
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