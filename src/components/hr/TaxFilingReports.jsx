import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Building2, Calendar } from "lucide-react";
import { formatLeone } from "@/components/hr/sierraLeoneTaxCalculator";
import { format } from "date-fns";

export default function TaxFilingReports({ orgId, organisation }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId, selectedMonth],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const monthPayrolls = payrolls.filter(p => {
    const payrollMonth = p.period_start?.slice(0, 7) || p.payment_date?.slice(0, 7);
    return payrollMonth === selectedMonth && p.status === 'paid';
  });

  const totalNASSITEmployee = monthPayrolls.reduce((sum, p) => sum + (p.nassit_employee || 0), 0);
  const totalNASSITEmployer = monthPayrolls.reduce((sum, p) => sum + (p.nassit_employer || 0), 0);
  const totalNASSIT = totalNASSITEmployee + totalNASSITEmployer;
  const totalPAYE = monthPayrolls.reduce((sum, p) => sum + (p.paye_tax || 0), 0);
  const totalGrossPay = monthPayrolls.reduce((sum, p) => sum + (p.gross_pay || 0), 0);

  const generateNASSITReport = () => {
    if (monthPayrolls.length === 0) return;
    const reportLines = [
      'NASSIT MONTHLY CONTRIBUTION REPORT',
      `Organisation: ${organisation?.name || 'N/A'}`,
      `NASSIT Number: ${organisation?.nassit_number || 'N/A'}`,
      `Period: ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}`,
      `Generated: ${format(new Date(), 'PPP')}`,
      '',
      'EMPLOYEE CONTRIBUTIONS',
      '─'.repeat(80),
      'Employee Code | Employee Name | Gross Pay | Employee (5%) | Employer (10%) | Total',
      '─'.repeat(80),
    ];

    monthPayrolls.forEach(p => {
      reportLines.push(
        `${(p.employee_code || '').padEnd(13)} | ${(p.employee_name || '').padEnd(25)} | ${formatLeone(p.gross_pay || 0).padEnd(12)} | ${formatLeone(p.nassit_employee || 0).padEnd(13)} | ${formatLeone(p.nassit_employer || 0).padEnd(14)} | ${formatLeone((p.nassit_employee || 0) + (p.nassit_employer || 0))}`
      );
    });

    reportLines.push(
      '─'.repeat(80),
      `TOTALS: ${monthPayrolls.length} employees | Gross: ${formatLeone(totalGrossPay)} | Employee: ${formatLeone(totalNASSITEmployee)} | Employer: ${formatLeone(totalNASSITEmployer)} | Total: ${formatLeone(totalNASSIT)}`,
      '',
      'This report should be submitted to NASSIT along with payment.',
      'Payment must be made by the 15th of the following month.',
    );

    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NASSIT_Report_${selectedMonth}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePAYEReport = () => {
    if (monthPayrolls.length === 0) return;
    const reportLines = [
      'PAYE TAX DEDUCTION REPORT',
      `Organisation: ${organisation?.name || 'N/A'}`,
      `TIN Number: ${organisation?.tin_number || 'N/A'}`,
      `Period: ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}`,
      `Generated: ${format(new Date(), 'PPP')}`,
      '',
      'TAX DEDUCTIONS',
      '─'.repeat(80),
      'Employee Code | Employee Name | Gross Pay | Taxable Income | PAYE Tax',
      '─'.repeat(80),
    ];

    monthPayrolls.forEach(p => {
      const taxableIncome = (p.gross_pay || 0) - (p.nassit_employee || 0);
      reportLines.push(
        `${(p.employee_code || '').padEnd(13)} | ${(p.employee_name || '').padEnd(25)} | ${formatLeone(p.gross_pay || 0).padEnd(12)} | ${formatLeone(taxableIncome).padEnd(14)} | ${formatLeone(p.paye_tax || 0)}`
      );
    });

    reportLines.push(
      '─'.repeat(80),
      `TOTALS: ${monthPayrolls.length} employees | Total Gross Pay: ${formatLeone(totalGrossPay)} | Total PAYE Tax: ${formatLeone(totalPAYE)}`,
      '',
      'This report should be submitted to National Revenue Authority (NRA).',
      'Payment must be made by the 15th of the following month.',
      '',
      'Tax Brackets Applied (Sierra Leone):',
      'Le 0 - 600,000: 0% (Tax-free)',
      'Le 600,001 - 1,200,000: 15%',
      'Le 1,200,001 - 2,400,000: 20%',
      'Le 2,400,001 - 3,600,000: 25%',
      'Above Le 3,600,000: 30%'
    );

    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PAYE_Report_${selectedMonth}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = (type) => {
    let csvContent = '';
    
    if (type === 'nassit') {
      csvContent = 'Employee Code,Employee Name,Gross Pay,Employee Contribution (5%),Employer Contribution (10%),Total NASSIT\n';
      monthPayrolls.forEach(p => {
        csvContent += `${p.employee_code || ''},${p.employee_name || ''},${p.gross_pay || 0},${p.nassit_employee || 0},${p.nassit_employer || 0},${(p.nassit_employee || 0) + (p.nassit_employer || 0)}\n`;
      });
      csvContent += `\nTOTAL,${monthPayrolls.length} employees,${totalGrossPay},${totalNASSITEmployee},${totalNASSITEmployer},${totalNASSIT}\n`;
    } else {
      csvContent = 'Employee Code,Employee Name,Gross Pay,Taxable Income,PAYE Tax\n';
      monthPayrolls.forEach(p => {
        const taxableIncome = (p.gross_pay || 0) - (p.nassit_employee || 0);
        csvContent += `${p.employee_code || ''},${p.employee_name || ''},${p.gross_pay || 0},${taxableIncome},${p.paye_tax || 0}\n`;
      });
      csvContent += `\nTOTAL,${monthPayrolls.length} employees,${totalGrossPay},,${totalPAYE}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toUpperCase()}_Report_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="h-1 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tax Filing Reports</h2>
          <p className="text-sm text-gray-600">Generate NASSIT and PAYE reports for Sierra Leone tax authorities</p>
        </div>
        <Badge className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
          Sierra Leone
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1EB053]" />
            Select Reporting Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Month & Year</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                max={new Date().toISOString().slice(0, 7)}
              />
            </div>
            <div className="pt-6">
              <Badge variant="outline" className="text-lg">
                {monthPayrolls.length} paid payrolls
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {monthPayrolls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No paid payrolls found for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</p>
            <p className="text-sm text-gray-400 mt-1">Process and approve payroll first to generate tax reports</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* NASSIT Report */}
          <Card className="border-l-4 border-[#1EB053]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#1EB053]" />
                  NASSIT Contribution Report
                </div>
                <Badge className="bg-[#1EB053] text-white">{formatLeone(totalNASSIT)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Employee (5%)</p>
                  <p className="text-xl font-bold text-gray-900">{formatLeone(totalNASSITEmployee)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Employer (10%)</p>
                  <p className="text-xl font-bold text-gray-900">{formatLeone(totalNASSITEmployer)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#1EB053]/20 to-[#0072C6]/20 rounded-lg">
                  <p className="text-sm text-gray-600">Total Due</p>
                  <p className="text-xl font-bold text-[#1EB053]">{formatLeone(totalNASSIT)}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-semibold mb-1">Filing Deadline</p>
                <p className="text-sm text-amber-700">15th of the following month</p>
                <p className="text-xs text-amber-600 mt-2">Submit to: National Social Security and Insurance Trust (NASSIT)</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateNASSITReport}
                  className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Text Report
                </Button>
                <Button
                  onClick={() => generateCSVReport('nassit')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PAYE Report */}
          <Card className="border-l-4 border-[#0072C6]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0072C6]" />
                  PAYE Tax Report (NRA)
                </div>
                <Badge className="bg-[#0072C6] text-white">{formatLeone(totalPAYE)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Gross Pay</p>
                  <p className="text-xl font-bold text-gray-900">{formatLeone(totalGrossPay)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0072C6]/20 to-[#1EB053]/20 rounded-lg">
                  <p className="text-sm text-gray-600">Total PAYE Tax</p>
                  <p className="text-xl font-bold text-[#0072C6]">{formatLeone(totalPAYE)}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-semibold mb-1">Filing Deadline</p>
                <p className="text-sm text-amber-700">15th of the following month</p>
                <p className="text-xs text-amber-600 mt-2">Submit to: National Revenue Authority (NRA)</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generatePAYEReport}
                  className="flex-1 bg-gradient-to-r from-[#0072C6] to-[#1EB053] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Text Report
                </Button>
                <Button
                  onClick={() => generateCSVReport('paye')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}