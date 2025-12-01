import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays, parseISO, isWithinInterval } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Users, Calculator, CheckCircle2, AlertCircle, Loader2, 
  ChevronDown, ChevronUp, DollarSign, Package, Clock, Calendar,
  TrendingUp, Info
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calculateFullPayroll,
  formatSLE,
  PAYROLL_FREQUENCIES
} from "./PayrollCalculator";
import { safeNumber } from "@/components/utils/calculations";

export default function BulkPayrollDialog({ 
  open, 
  onOpenChange, 
  employees = [],
  orgId,
  currentEmployee 
}) {
  const queryClient = useQueryClient();
  const lastMonth = subMonths(new Date(), 1);
  const [periodStart, setPeriodStart] = useState(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
  const [periodEnd, setPeriodEnd] = useState(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch benefit/deduction templates
  const { data: templates = [] } = useQuery({
    queryKey: ['benefitDeductionTemplates', orgId],
    queryFn: () => base44.entities.BenefitDeductionTemplate.filter({ 
      organisation_id: orgId, 
      is_active: true 
    }),
    enabled: !!orgId,
  });

  const activeEmployees = employees.filter(e => e.status === 'active');

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === activeEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(activeEmployees.map(e => e.id));
    }
  };

  // Calculate payroll preview for selected employees
  const payrollPreviews = useMemo(() => {
    return selectedEmployees.map(empId => {
      const employee = employees.find(e => e.id === empId);
      if (!employee) return null;

      // Get applicable templates for this employee
      const empTemplates = templates.filter(t => {
        if (t.applies_to_employees?.length > 0) {
          return t.applies_to_employees.includes(empId);
        }
        if (t.applies_to_roles?.length > 0) {
          return t.applies_to_roles.includes(employee.role);
        }
        return true;
      });

      return calculateFullPayroll({
        employee,
        periodStart,
        periodEnd,
        templates: empTemplates,
        applyNASSIT: true,
        applyPAYE: true
      });
    }).filter(Boolean);
  }, [selectedEmployees, employees, periodStart, periodEnd, templates]);

  const totals = useMemo(() => {
    return payrollPreviews.reduce((acc, p) => ({
      gross: acc.gross + safeNumber(p.gross_pay),
      deductions: acc.deductions + safeNumber(p.total_deductions),
      net: acc.net + safeNumber(p.net_pay),
      employerCost: acc.employerCost + safeNumber(p.employer_cost)
    }), { gross: 0, deductions: 0, net: 0, employerCost: 0 });
  }, [payrollPreviews]);

  const processBulkPayroll = async () => {
    setProcessing(true);
    setProgress(0);
    setResults([]);
    const processedResults = [];

    for (let i = 0; i < payrollPreviews.length; i++) {
      const payroll = payrollPreviews[i];
      try {
        const created = await base44.entities.Payroll.create({
          ...payroll,
          organisation_id: orgId,
          status: 'pending_approval'
        });

        // Create audit log
        await base44.entities.PayrollAudit.create({
          organisation_id: orgId,
          payroll_id: created.id,
          employee_id: payroll.employee_id,
          employee_name: payroll.employee_name,
          action: 'created',
          changed_by_id: currentEmployee?.id,
          changed_by_name: currentEmployee?.full_name,
          new_values: {
            gross_pay: payroll.gross_pay,
            net_pay: payroll.net_pay,
            period: `${periodStart} to ${periodEnd}`
          },
          reason: 'Bulk payroll processing'
        });

        processedResults.push({ 
          employee: payroll.employee_name, 
          status: 'success',
          netPay: payroll.net_pay 
        });
      } catch (error) {
        processedResults.push({ 
          employee: payroll.employee_name, 
          status: 'error',
          error: error.message 
        });
      }
      setProgress(((i + 1) / payrollPreviews.length) * 100);
    }

    setResults(processedResults);
    setShowResults(true);
    setProcessing(false);
    queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    
    const successCount = processedResults.filter(r => r.status === 'success').length;
    toast.success(`Processed ${successCount} of ${processedResults.length} payrolls`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1EB053]" />
            Bulk Payroll Processing
          </DialogTitle>
        </DialogHeader>

        {showResults ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Processing Results</h3>
              <Badge variant={results.every(r => r.status === 'success') ? 'default' : 'destructive'}>
                {results.filter(r => r.status === 'success').length}/{results.length} Successful
              </Badge>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {results.map((result, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                    result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.employee}</span>
                    </div>
                    {result.status === 'success' ? (
                      <span className="text-green-600 font-semibold">{formatSLE(result.netPay)}</span>
                    ) : (
                      <span className="text-red-600 text-sm">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => { setShowResults(false); onOpenChange(false); }}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Period Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Period Start</Label>
                <Input 
                  type="date" 
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Period End</Label>
                <Input 
                  type="date" 
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Employee Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Select Employees ({selectedEmployees.length} selected)</Label>
                <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                  {selectedEmployees.length === activeEmployees.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-lg p-2">
                <div className="space-y-2">
                  {activeEmployees.map(emp => (
                    <div 
                      key={emp.id} 
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedEmployees.includes(emp.id) ? 'bg-[#1EB053]/10' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedEmployees.includes(emp.id)}
                          onCheckedChange={() => toggleEmployee(emp.id)}
                        />
                        <div>
                          <p className="font-medium text-sm">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">{emp.role?.replace('_', ' ')} • {emp.department}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{formatSLE(emp.base_salary)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Preview Summary */}
            {selectedEmployees.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Preview Summary ({selectedEmployees.length} employees)
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600">Total Gross</p>
                      <p className="text-lg font-bold">{formatSLE(totals.gross)}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xs text-red-600">Total Deductions</p>
                      <p className="text-lg font-bold">{formatSLE(totals.deductions)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600">Total Net Pay</p>
                      <p className="text-lg font-bold text-[#1EB053]">{formatSLE(totals.net)}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-purple-600">Employer Cost</p>
                      <p className="text-lg font-bold">{formatSLE(totals.employerCost)}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Progress Bar */}
            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing payrolls...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={processBulkPayroll}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                disabled={selectedEmployees.length === 0 || processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Process {selectedEmployees.length} Payrolls
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}