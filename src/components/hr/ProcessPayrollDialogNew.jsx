import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calculator, Users, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { calculateSalaryBreakdown, formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";
import WageEmployeeTimesheetApproval from "./WageEmployeeTimesheetApproval";

export default function ProcessPayrollDialog({ open, onOpenChange, orgId, currentEmployee, employees, payCycles }) {
  const [activeStep, setActiveStep] = useState("config");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState("monthly");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("all");
  const [payrollPreview, setPayrollPreview] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [deductions, setDeductions] = useState([]);

  const queryClient = useQueryClient();
  const toast = useToast();

  const [year, month] = payPeriod.split('-');
  const periodStart = `${year}-${month}-01`;
  const periodEnd = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

  const activeEmployees = employees.filter(e => e.status === 'active');

  const filteredEmployees = useMemo(() => {
    if (employmentTypeFilter === "all") return activeEmployees;
    if (employmentTypeFilter === "wage") return activeEmployees.filter(e => e.employment_type === 'wage');
    return activeEmployees.filter(e => e.employment_type !== 'wage');
  }, [activeEmployees, employmentTypeFilter]);

  const wageEmployees = useMemo(() => {
    return activeEmployees.filter(e => e.employment_type === 'wage');
  }, [activeEmployees]);

  const processMutation = useMutation({
    mutationFn: async (payrollRecords) => {
      return await Promise.all(
        payrollRecords.map(record => base44.entities.Payroll.create(record))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payrolls']);
      toast.success("Payroll Processed", `Successfully processed ${payrollPreview.length} payrolls`);
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Processing Failed", error.message);
    },
  });

  const resetForm = () => {
    setActiveStep("config");
    setSelectedEmployees([]);
    setPayrollPreview([]);
    setAllowances([]);
    setBonuses([]);
    setDeductions([]);
  };

  const handleGeneratePreview = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("No employees selected");
      return;
    }

    const hasWageEmployees = selectedEmployees.some(id => {
      const emp = activeEmployees.find(e => e.id === id);
      return emp?.employment_type === 'wage';
    });

    if (hasWageEmployees) {
      setActiveStep("timesheet");
      return;
    }

    await generatePayrollPreview();
  };

  const generatePayrollPreview = async () => {
    const allAttendance = wageEmployees.length > 0 
      ? await base44.entities.Attendance.filter({ organisation_id: orgId })
      : [];

    const preview = [];

    for (const empId of selectedEmployees) {
      const emp = activeEmployees.find(e => e.id === empId);
      if (!emp) continue;

      const isWageEmployee = emp.employment_type === 'wage';

      let baseSalary = 0;
      let approvedHours = 0;

      if (isWageEmployee) {
        const empAttendance = allAttendance.filter(a => {
          const aDate = new Date(a.date);
          return a.employee_id === empId && 
                 aDate >= new Date(periodStart) && 
                 aDate <= new Date(periodEnd) &&
                 (a.timesheet_status === 'approved' || a.timesheet_status === 'overridden');
        });
        
        approvedHours = empAttendance.reduce((sum, a) => sum + (a.approved_hours || a.total_hours || 0), 0);
        
        if (emp.salary_type === 'hourly') {
          baseSalary = (emp.hourly_rate || 0) * approvedHours;
        } else if (emp.salary_type === 'daily') {
          const daysWorked = Math.floor(approvedHours / 8);
          baseSalary = (emp.daily_rate || 0) * daysWorked;
        }
      } else {
        baseSalary = emp.base_salary || 0;
      }

      const totalAllowances = allowances.reduce((sum, a) => sum + (a.amount || 0), 0);
      const totalBonuses = bonuses.reduce((sum, b) => sum + (b.amount || 0), 0);
      
      const grossBeforeTax = baseSalary + totalAllowances + totalBonuses;
      const taxCalc = calculateSalaryBreakdown(grossBeforeTax, {}, {});
      
      const customDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
      const totalDeductions = taxCalc.totalDeductions + customDeductions;
      const netPay = taxCalc.netSalary - customDeductions;

      preview.push({
        organisation_id: orgId,
        employee_id: emp.id,
        employee_name: emp.full_name,
        employee_role: emp.role,
        employment_type: emp.employment_type || 'salary',
        payroll_frequency: frequency,
        period_start: periodStart,
        period_end: periodEnd,
        payment_date: payDate,
        base_salary: baseSalary,
        salary_type: emp.salary_type,
        hours_worked: isWageEmployee ? approvedHours : 0,
        hours_approved: isWageEmployee ? approvedHours : 0,
        timesheet_approved: isWageEmployee,
        allowances,
        bonuses,
        deductions: [
          ...deductions,
          { name: 'NASSIT (5%)', amount: taxCalc.nassit.employee, type: 'statutory' },
          { name: 'PAYE Tax', amount: taxCalc.paye.tax, type: 'statutory' }
        ],
        total_allowances: totalAllowances,
        total_bonuses: totalBonuses,
        gross_pay: taxCalc.grossSalary,
        nassit_employee: taxCalc.nassit.employee,
        nassit_employer: taxCalc.nassit.employer,
        paye_tax: taxCalc.paye.tax,
        total_statutory_deductions: taxCalc.nassit.employee + taxCalc.paye.tax,
        total_deductions: totalDeductions,
        net_pay: netPay,
        employer_cost: taxCalc.employerCost,
        status: 'draft',
        calculation_details: {
          hourly_rate: emp.hourly_rate || 0,
          daily_rate: emp.daily_rate || 0,
          effective_tax_rate: taxCalc.paye.effectiveRate,
        },
      });
    }

    setPayrollPreview(preview);
    setActiveStep("preview");
  };

  const totalGross = payrollPreview.reduce((sum, p) => sum + (p.gross_pay || 0), 0);
  const totalNet = payrollPreview.reduce((sum, p) => sum + (p.net_pay || 0), 0);

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

        {activeStep === "config" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pay Period *</Label>
                <Input type="month" value={payPeriod} onChange={(e) => setPayPeriod(e.target.value)} />
              </div>
              <div>
                <Label>Pay Date *</Label>
                <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 border rounded-lg bg-green-50/50">
              <div className="flex justify-between mb-3">
                <Label className="text-green-700">Allowances</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setAllowances([...allowances, { name: '', amount: 0 }])}>+ Add</Button>
              </div>
              {allowances.map((a, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input placeholder="Name" value={a.name} onChange={(e) => {
                    const u = [...allowances]; u[idx].name = e.target.value; setAllowances(u);
                  }} />
                  <Input type="number" placeholder="Amount" value={a.amount} onChange={(e) => {
                    const u = [...allowances]; u[idx].amount = parseFloat(e.target.value) || 0; setAllowances(u);
                  }} className="w-32" />
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAllowances(allowances.filter((_, i) => i !== idx))} className="text-red-600">✕</Button>
                </div>
              ))}
            </div>

            <div className="p-4 border rounded-lg bg-blue-50/50">
              <div className="flex justify-between mb-3">
                <Label className="text-blue-700">Bonuses</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setBonuses([...bonuses, { name: '', amount: 0, type: 'performance' }])}>+ Add</Button>
              </div>
              {bonuses.map((b, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input placeholder="Name" value={b.name} onChange={(e) => {
                    const u = [...bonuses]; u[idx].name = e.target.value; setBonuses(u);
                  }} />
                  <Input type="number" placeholder="Amount" value={b.amount} onChange={(e) => {
                    const u = [...bonuses]; u[idx].amount = parseFloat(e.target.value) || 0; setBonuses(u);
                  }} className="w-32" />
                  <Button type="button" size="sm" variant="ghost" onClick={() => setBonuses(bonuses.filter((_, i) => i !== idx))} className="text-red-600">✕</Button>
                </div>
              ))}
            </div>

            <div className="p-4 border rounded-lg bg-red-50/50">
              <div className="flex justify-between mb-3">
                <Label className="text-red-700">Deductions</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setDeductions([...deductions, { name: '', amount: 0, type: 'voluntary' }])}>+ Add</Button>
              </div>
              {deductions.map((d, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input placeholder="Name" value={d.name} onChange={(e) => {
                    const u = [...deductions]; u[idx].name = e.target.value; setDeductions(u);
                  }} />
                  <Input type="number" placeholder="Amount" value={d.amount} onChange={(e) => {
                    const u = [...deductions]; u[idx].amount = parseFloat(e.target.value) || 0; setDeductions(u);
                  }} className="w-32" />
                  <Button type="button" size="sm" variant="ghost" onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))} className="text-red-600">✕</Button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Select Employees *</Label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={employmentTypeFilter === "all" ? "default" : "outline"} onClick={() => setEmploymentTypeFilter("all")}>
                    All
                  </Button>
                  <Button type="button" size="sm" variant={employmentTypeFilter === "salary" ? "default" : "outline"} onClick={() => setEmploymentTypeFilter("salary")}>
                    Salary
                  </Button>
                  <Button type="button" size="sm" variant={employmentTypeFilter === "wage" ? "default" : "outline"} onClick={() => setEmploymentTypeFilter("wage")}>
                    Wage
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onCheckedChange={(checked) => {
                      setSelectedEmployees(checked ? filteredEmployees.map(e => e.id) : []);
                    }}
                  />
                  <span className="font-semibold text-sm">Select All ({filteredEmployees.length})</span>
                </div>
                {filteredEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={(checked) => {
                          setSelectedEmployees(checked ? [...selectedEmployees, emp.id] : selectedEmployees.filter(id => id !== emp.id));
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{emp.full_name}</p>
                          {emp.employment_type === 'wage' && <Badge variant="outline" className="text-xs">Wage</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">{emp.employee_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {emp.employment_type === 'wage' ? (
                        <p className="font-semibold text-[#0072C6] text-sm">
                          Le {emp.salary_type === 'hourly' ? (emp.hourly_rate || 0).toLocaleString() : (emp.daily_rate || 0).toLocaleString()}/{emp.salary_type === 'hourly' ? 'hr' : 'day'}
                        </p>
                      ) : (
                        <p className="font-semibold text-[#1EB053] text-sm">Le {(emp.base_salary || 0).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleGeneratePreview} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                <Calculator className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </div>
        )}

        {activeStep === "timesheet" && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Wage Employee Timesheets:</strong> Review and approve hours before processing payroll. Only approved hours will be paid.
              </p>
            </div>

            <WageEmployeeTimesheetApproval
              periodStart={periodStart}
              periodEnd={periodEnd}
              orgId={orgId}
              currentEmployee={currentEmployee}
            />

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setActiveStep("config")}>Back</Button>
              <Button onClick={generatePayrollPreview} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
                Continue to Preview
              </Button>
            </div>
          </div>
        )}

        {activeStep === "preview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Employees</p>
                <p className="text-xl font-bold">{payrollPreview.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Total Gross</p>
                <p className="text-sm font-bold">{formatLeone(totalGross)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600">Total Net</p>
                <p className="text-sm font-bold">{formatLeone(totalNet)}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-gray-600">Employer Cost</p>
                <p className="text-sm font-bold">{formatLeone(payrollPreview.reduce((s, p) => s + p.employer_cost, 0))}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {payrollPreview.map((record, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{record.employee_name}</p>
                        {record.employment_type === 'wage' && <Badge className="bg-blue-100 text-blue-700 text-xs">Wage</Badge>}
                      </div>
                      {record.employment_type === 'wage' && (
                        <p className="text-xs text-gray-500 mt-1">{record.hours_approved}h approved</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#1EB053]">{formatLeone(record.net_pay)}</p>
                      <p className="text-xs text-gray-500">Net Pay</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t text-xs">
                    <div><p className="text-gray-500">Gross</p><p className="font-semibold">{formatLeone(record.gross_pay)}</p></div>
                    <div><p className="text-gray-500">NASSIT</p><p className="font-semibold">{formatLeone(record.nassit_employee)}</p></div>
                    <div><p className="text-gray-500">PAYE</p><p className="font-semibold">{formatLeone(record.paye_tax)}</p></div>
                    <div><p className="text-gray-500">Total Ded.</p><p className="font-semibold">{formatLeone(record.total_deductions)}</p></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setActiveStep(wageEmployees.length > 0 ? "timesheet" : "config")}>Back</Button>
              <Button onClick={() => processMutation.mutate(payrollPreview)} disabled={processMutation.isPending} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
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