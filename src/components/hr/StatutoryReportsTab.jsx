import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Calendar, Building2, Users, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/Toast";
import { formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";
import { format } from "date-fns";

export default function StatutoryReportsTab({ orgId, organisation }) {
  const [reportType, setReportType] = useState("nassit");
  const [periodStart, setPeriodStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
  const toast = useToast();

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['payrolls-statutory', orgId, periodStart, periodEnd],
    queryFn: async () => {
      const all = await base44.entities.Payroll.filter({ 
        organisation_id: orgId,
        status: 'paid'
      });
      return all.filter(p => 
        p.period_start >= periodStart && p.period_end <= periodEnd
      );
    },
    enabled: !!orgId && !!periodStart && !!periodEnd,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Calculate totals
  const totalEmployees = new Set(payrolls.map(p => p.employee_id)).size;
  const totalNassitEmployee = payrolls.reduce((sum, p) => sum + (p.nassit_employee || 0), 0);
  const totalNassitEmployer = payrolls.reduce((sum, p) => sum + (p.nassit_employer || 0), 0);
  const totalNassit = totalNassitEmployee + totalNassitEmployer;
  const totalPaye = payrolls.reduce((sum, p) => sum + (p.paye_tax || 0), 0);
  const totalGrossPay = payrolls.reduce((sum, p) => sum + (p.gross_pay || 0), 0);

  const generateNASSITReport = () => {
    const reportData = {
      organisation: {
        name: organisation?.name || '',
        nassit_number: organisation?.nassit_number || 'N/A',
        address: organisation?.address || '',
        phone: organisation?.phone || '',
      },
      period: {
        start: periodStart,
        end: periodEnd,
        month: format(new Date(periodStart), 'MMMM yyyy'),
      },
      employees: payrolls.map(p => {
        const emp = employees.find(e => e.id === p.employee_id);
        return {
          employee_code: emp?.employee_code || p.employee_code,
          employee_name: p.employee_name,
          gross_salary: p.gross_pay,
          employee_contribution: p.nassit_employee,
          employer_contribution: p.nassit_employer,
          total_contribution: p.nassit_employee + p.nassit_employer,
        };
      }),
      totals: {
        total_gross: totalGrossPay,
        total_employee: totalNassitEmployee,
        total_employer: totalNassitEmployer,
        total_contribution: totalNassit,
        employee_count: totalEmployees,
      }
    };

    exportToCSV(reportData, 'nassit');
  };

  const generatePAYEReport = () => {
    const reportData = {
      organisation: {
        name: organisation?.name || '',
        tin_number: organisation?.tin_number || 'N/A',
        address: organisation?.address || '',
        phone: organisation?.phone || '',
      },
      period: {
        start: periodStart,
        end: periodEnd,
        month: format(new Date(periodStart), 'MMMM yyyy'),
      },
      employees: payrolls.map(p => {
        const emp = employees.find(e => e.id === p.employee_id);
        return {
          employee_code: emp?.employee_code || p.employee_code,
          employee_name: p.employee_name,
          gross_salary: p.gross_pay,
          nassit_deduction: p.nassit_employee,
          taxable_income: p.gross_pay - p.nassit_employee,
          paye_tax: p.paye_tax,
        };
      }),
      totals: {
        total_gross: totalGrossPay,
        total_taxable: totalGrossPay - totalNassitEmployee,
        total_paye: totalPaye,
        employee_count: totalEmployees,
      }
    };

    exportToCSV(reportData, 'paye');
  };

  const exportToCSV = (data, type) => {
    let csv = '';
    const periodMonth = format(new Date(periodStart), 'MMMM yyyy');

    if (type === 'nassit') {
      csv = `NASSIT Monthly Return - ${data.organisation.name}\n`;
      csv += `NASSIT Number: ${data.organisation.nassit_number}\n`;
      csv += `Period: ${periodMonth}\n`;
      csv += `\n`;
      csv += `Employee Code,Employee Name,Gross Salary (Le),Employee 5% (Le),Employer 10% (Le),Total Contribution (Le)\n`;
      
      data.employees.forEach(emp => {
        csv += `${emp.employee_code},"${emp.employee_name}",${emp.gross_salary},${emp.employee_contribution},${emp.employer_contribution},${emp.total_contribution}\n`;
      });
      
      csv += `\n`;
      csv += `TOTALS,${data.totals.employee_count} Employees,${data.totals.total_gross},${data.totals.total_employee},${data.totals.total_employer},${data.totals.total_contribution}\n`;
    } else {
      csv = `PAYE Monthly Return - ${data.organisation.name}\n`;
      csv += `TIN Number: ${data.organisation.tin_number}\n`;
      csv += `Period: ${periodMonth}\n`;
      csv += `\n`;
      csv += `Employee Code,Employee Name,Gross Salary (Le),NASSIT Deduction (Le),Taxable Income (Le),PAYE Tax (Le)\n`;
      
      data.employees.forEach(emp => {
        csv += `${emp.employee_code},"${emp.employee_name}",${emp.gross_salary},${emp.nassit_deduction},${emp.taxable_income},${emp.paye_tax}\n`;
      });
      
      csv += `\n`;
      csv += `TOTALS,${data.totals.employee_count} Employees,${data.totals.total_gross},${totalNassitEmployee},${data.totals.total_taxable},${data.totals.total_paye}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toUpperCase()}_${format(new Date(periodStart), 'yyyy-MM')}_${organisation?.name?.replace(/\s/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Report Generated", `${type.toUpperCase()} report exported successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="h-1 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Statutory Reports</h3>
        <p className="text-gray-600 mt-1">NASSIT and PAYE filing reports for Sierra Leone tax authorities</p>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            Select Reporting Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nassit">NASSIT Monthly Return</SelectItem>
                  <SelectItem value="paye">PAYE Monthly Return</SelectItem>
                  <SelectItem value="both">Both Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period Start</Label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div>
              <Label>Period End</Label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1EB053]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#1EB053]" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Employees</p>
                <p className="text-xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Gross Pay</p>
                <p className="text-lg font-bold text-gray-900">{formatLeone(totalGrossPay)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0072C6]/10 rounded-lg">
                <Building2 className="w-5 h-5 text-[#0072C6]" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total NASSIT</p>
                <p className="text-lg font-bold text-gray-900">{formatLeone(totalNassit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total PAYE</p>
                <p className="text-lg font-bold text-gray-900">{formatLeone(totalPaye)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* NASSIT Report */}
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1EB053]" />
                NASSIT Monthly Return
              </div>
              <Button
                size="sm"
                onClick={generateNASSITReport}
                disabled={payrolls.length === 0}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">NASSIT Number</p>
              <p className="font-semibold text-sm">{organisation?.nassit_number || 'Not Set'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-green-50 rounded">
                <p className="text-xs text-gray-600">Employee (5%)</p>
                <p className="font-bold text-green-700">{formatLeone(totalNassitEmployee)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-gray-600">Employer (10%)</p>
                <p className="font-bold text-blue-700">{formatLeone(totalNassitEmployer)}</p>
              </div>
            </div>
            <div className="p-3 bg-[#1EB053]/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Contribution</span>
                <span className="text-lg font-bold text-[#1EB053]">{formatLeone(totalNassit)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              This report includes all paid payrolls for the selected period and is formatted for submission to NASSIT.
            </p>
          </CardContent>
        </Card>

        {/* PAYE Report */}
        <Card className="border-t-4 border-t-amber-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                PAYE Monthly Return
              </div>
              <Button
                size="sm"
                onClick={generatePAYEReport}
                disabled={payrolls.length === 0}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">TIN Number</p>
              <p className="font-semibold text-sm">{organisation?.tin_number || 'Not Set'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-gray-600">Gross Salaries</p>
                <p className="font-bold text-blue-700">{formatLeone(totalGrossPay)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <p className="text-xs text-gray-600">NASSIT Deducted</p>
                <p className="font-bold text-red-700">{formatLeone(totalNassitEmployee)}</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded">
              <p className="text-xs text-gray-600">Taxable Income</p>
              <p className="font-semibold">{formatLeone(totalGrossPay - totalNassitEmployee)}</p>
            </div>
            <div className="p-3 bg-amber-600/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total PAYE Tax</span>
                <span className="text-lg font-bold text-amber-700">{formatLeone(totalPaye)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              This report includes PAYE tax calculations following Sierra Leone's progressive tax brackets for NRA submission.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5">
        <CardHeader>
          <CardTitle className="text-lg">Filing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-[#1EB053] mb-1">NASSIT Filing:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Submit monthly returns by the 14th of the following month</li>
              <li>Payment must accompany the return submission</li>
              <li>Keep records for at least 6 years</li>
              <li>File online at <a href="https://nassit.org" target="_blank" className="text-blue-600 hover:underline">nassit.org</a> or in person</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-amber-600 mb-1">PAYE Filing (NRA):</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Submit monthly PAYE returns by the 14th of the following month</li>
              <li>Payment should be made to NRA before submission</li>
              <li>Annual reconciliation required by March 31st</li>
              <li>File online at <a href="https://www.nra.gov.sl" target="_blank" className="text-blue-600 hover:underline">nra.gov.sl</a></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}