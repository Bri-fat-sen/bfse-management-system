import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { 
  FileText, Download, Filter, TrendingUp, DollarSign, Users, 
  Building2, Calendar, Printer, Mail, BarChart3
} from "lucide-react";
import { formatSLE } from "./PayrollCalculator";
import { generateProfessionalReport, printProfessionalReport } from "@/components/exports/ProfessionalReportExport";

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#0F1F3C', '#ef4444', '#8b5cf6'];

const REPORT_TYPES = [
  { value: 'summary', label: 'Payroll Summary', icon: BarChart3 },
  { value: 'nassit', label: 'NASSIT Report', icon: Building2 },
  { value: 'paye', label: 'PAYE Tax Report', icon: DollarSign },
  { value: 'department', label: 'By Department', icon: Users },
  { value: 'employee', label: 'Employee Detail', icon: FileText },
  { value: 'compliance', label: 'Compliance Report', icon: FileText },
];

const PERIOD_OPTIONS = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export default function PayrollReportingModule({ orgId, employees = [], organisation }) {
  const [reportType, setReportType] = useState('summary');
  const [periodOption, setPeriodOption] = useState('this_month');
  const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Calculate date range based on period option
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (periodOption) {
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'this_quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { start: quarterStart, end: now };
      case 'last_quarter':
        const lastQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
        const lastQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0);
        return { start: lastQuarterStart, end: lastQuarterEnd };
      case 'this_year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return { start: parseISO(customStart), end: parseISO(customEnd) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [periodOption, customStart, customEnd]);

  // Fetch payroll data
  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['payrollReports', orgId, format(dateRange.start, 'yyyy-MM-dd'), format(dateRange.end, 'yyyy-MM-dd')],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Filter payrolls by date range
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const payrollDate = parseISO(p.period_end);
      const inDateRange = payrollDate >= dateRange.start && payrollDate <= dateRange.end;
      const inDepartment = departmentFilter === 'all' || 
        employees.find(e => e.id === p.employee_id)?.department === departmentFilter;
      return inDateRange && inDepartment && p.status !== 'cancelled';
    });
  }, [payrolls, dateRange, departmentFilter, employees]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const paidPayrolls = filteredPayrolls.filter(p => p.status === 'paid' || p.status === 'approved');
    return {
      totalGross: paidPayrolls.reduce((sum, p) => sum + (p.gross_pay || 0), 0),
      totalNet: paidPayrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0),
      totalNASSITEmployee: paidPayrolls.reduce((sum, p) => sum + (p.nassit_employee || 0), 0),
      totalNASSITEmployer: paidPayrolls.reduce((sum, p) => sum + (p.nassit_employer || 0), 0),
      totalPAYE: paidPayrolls.reduce((sum, p) => sum + (p.paye_tax || 0), 0),
      totalEmployerCost: paidPayrolls.reduce((sum, p) => sum + (p.employer_cost || 0), 0),
      totalAllowances: paidPayrolls.reduce((sum, p) => sum + (p.total_allowances || 0), 0),
      totalDeductions: paidPayrolls.reduce((sum, p) => sum + (p.total_deductions || 0), 0),
      employeeCount: new Set(paidPayrolls.map(p => p.employee_id)).size,
      payrollCount: paidPayrolls.length,
    };
  }, [filteredPayrolls]);

  // Group by department
  const departmentData = useMemo(() => {
    const deptMap = {};
    filteredPayrolls.filter(p => p.status === 'paid' || p.status === 'approved').forEach(p => {
      const emp = employees.find(e => e.id === p.employee_id);
      const dept = emp?.department || 'Unassigned';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, gross: 0, net: 0, nassit: 0, paye: 0, count: 0 };
      }
      deptMap[dept].gross += p.gross_pay || 0;
      deptMap[dept].net += p.net_pay || 0;
      deptMap[dept].nassit += (p.nassit_employee || 0) + (p.nassit_employer || 0);
      deptMap[dept].paye += p.paye_tax || 0;
      deptMap[dept].count++;
    });
    return Object.values(deptMap);
  }, [filteredPayrolls, employees]);

  // Tax bracket distribution
  const taxBracketData = useMemo(() => {
    const brackets = {};
    filteredPayrolls.filter(p => p.status === 'paid' || p.status === 'approved').forEach(p => {
      const bracket = p.calculation_details?.tax_bracket || '0%';
      if (!brackets[bracket]) {
        brackets[bracket] = { bracket, count: 0, totalTax: 0 };
      }
      brackets[bracket].count++;
      brackets[bracket].totalTax += p.paye_tax || 0;
    });
    return Object.values(brackets);
  }, [filteredPayrolls]);

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const handlePrint = () => {
    const reportTitle = REPORT_TYPES.find(r => r.value === reportType)?.label || 'Payroll Report';
    
    const summaryCards = [
      { label: 'Total Gross Pay', value: formatSLE(summaryStats.totalGross), subtext: `${summaryStats.employeeCount} employees` },
      { label: 'Total Net Pay', value: formatSLE(summaryStats.totalNet), subtext: `${summaryStats.payrollCount} payrolls` },
      { label: 'NASSIT Total', value: formatSLE(summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer), subtext: 'Employee + Employer' },
      { label: 'PAYE Tax', value: formatSLE(summaryStats.totalPAYE), subtext: 'Tax withheld', highlight: 'red' }
    ];
    
    const sections = [];
    
    // Build sections based on report type
    if (reportType === 'summary' || reportType === 'department') {
      sections.push({
        title: 'Payroll by Department',
        icon: '🏢',
        table: {
          columns: ['Department', 'Employees', 'Gross Pay', 'NASSIT', 'PAYE', 'Net Pay'],
          rows: [
            ...departmentData.map(d => [
              d.department,
              d.count,
              formatSLE(d.gross),
              formatSLE(d.nassit),
              formatSLE(d.paye),
              formatSLE(d.net)
            ]),
            ['TOTAL', summaryStats.employeeCount, formatSLE(summaryStats.totalGross), 
             formatSLE(summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer),
             formatSLE(summaryStats.totalPAYE), formatSLE(summaryStats.totalNet)]
          ]
        }
      });
    }
    
    if (reportType === 'nassit') {
      sections.push({
        title: 'NASSIT Contributions',
        icon: '🏛️',
        breakdown: {
          'Employee Contribution (5%)': summaryStats.totalNASSITEmployee,
          'Employer Contribution (10%)': summaryStats.totalNASSITEmployer,
          'Total Payable': summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer
        }
      });
      sections.push({
        title: 'Employee NASSIT Details',
        icon: '👥',
        table: {
          columns: ['Employee', 'Gross Pay', 'Employee (5%)', 'Employer (10%)', 'Total'],
          rows: filteredPayrolls.filter(p => p.status === 'paid' || p.status === 'approved').map(p => [
            p.employee_name,
            formatSLE(p.gross_pay),
            formatSLE(p.nassit_employee),
            formatSLE(p.nassit_employer),
            formatSLE((p.nassit_employee || 0) + (p.nassit_employer || 0))
          ])
        }
      });
      sections.push({
        infoBox: {
          type: 'warning',
          title: '⚠️ NASSIT Compliance Reminder',
          content: '<p>NASSIT contributions must be remitted by the 14th of the following month. Late payments incur penalties.</p>'
        }
      });
    }
    
    if (reportType === 'paye') {
      sections.push({
        title: 'PAYE Tax Summary',
        icon: '💰',
        breakdown: {
          'Total PAYE Withheld': summaryStats.totalPAYE,
          'Taxable Employees': taxBracketData.filter(b => b.bracket !== '0%').reduce((s, b) => s + b.count, 0),
          'Tax-Exempt Employees': taxBracketData.find(b => b.bracket === '0%')?.count || 0
        }
      });
      sections.push({
        title: 'Employee PAYE Details',
        icon: '📋',
        table: {
          columns: ['Employee', 'Gross Pay', 'Tax Bracket', 'Effective Rate', 'PAYE Tax'],
          rows: filteredPayrolls.filter(p => p.status === 'paid' || p.status === 'approved').map(p => [
            p.employee_name,
            formatSLE(p.gross_pay),
            p.calculation_details?.tax_bracket || 'N/A',
            `${p.calculation_details?.effective_tax_rate || 0}%`,
            formatSLE(p.paye_tax)
          ])
        }
      });
      sections.push({
        infoBox: {
          type: 'info',
          title: '📜 Sierra Leone PAYE Tax Brackets (Finance Act 2024)',
          content: '<ul><li>First SLE 500,000/month: 0%</li><li>SLE 500,001 - 1,000,000: 15%</li><li>SLE 1,000,001 - 1,500,000: 20%</li><li>SLE 1,500,001 - 2,000,000: 25%</li><li>Above SLE 2,000,000: 30%</li></ul>'
        }
      });
    }
    
    if (reportType === 'employee') {
      sections.push({
        title: 'Employee Payroll Details',
        icon: '👤',
        table: {
          columns: ['Employee', 'Period', 'Base', 'Allowances', 'Gross', 'Deductions', 'Net Pay', 'Status'],
          rows: filteredPayrolls.map(p => [
            p.employee_name,
            `${format(parseISO(p.period_start), 'MMM d')} - ${format(parseISO(p.period_end), 'MMM d')}`,
            formatSLE(p.base_salary),
            formatSLE(p.total_allowances),
            formatSLE(p.gross_pay),
            formatSLE(p.total_deductions),
            formatSLE(p.net_pay),
            p.status
          ])
        }
      });
    }
    
    if (reportType === 'compliance') {
      sections.push({
        title: 'NASSIT Compliance',
        icon: '🏛️',
        breakdown: {
          'Organisation': organisation?.name || 'N/A',
          'NASSIT Number': organisation?.nassit_number || 'Not set',
          'Employee Contributions (5%)': summaryStats.totalNASSITEmployee,
          'Employer Contributions (10%)': summaryStats.totalNASSITEmployer,
          'Total Payable to NASSIT': summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer
        }
      });
      sections.push({
        title: 'NRA Tax Compliance',
        icon: '💼',
        breakdown: {
          'TIN Number': organisation?.tin_number || 'Not set',
          'Total PAYE Withheld': summaryStats.totalPAYE,
          'Employees Taxed': taxBracketData.filter(b => b.bracket !== '0%').reduce((s, b) => s + b.count, 0),
          'Tax-Exempt Employees': taxBracketData.find(b => b.bracket === '0%')?.count || 0
        }
      });
      sections.push({
        infoBox: {
          type: 'warning',
          title: '📋 Compliance Checklist',
          content: '<ul><li>✓ NASSIT contributions calculated at 5% (employee) + 10% (employer)</li><li>✓ PAYE tax calculated per Finance Act 2024 brackets</li><li>✓ First SLE 500,000/month tax-free threshold applied</li><li>⚠️ Remit NASSIT contributions by 14th of following month</li><li>⚠️ Submit PAYE returns to NRA monthly</li></ul>'
        }
      });
    }
    
    const html = generateProfessionalReport({
      title: reportTitle,
      subtitle: 'Payroll Financial Summary and Compliance Report',
      organisation,
      dateRange: `${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`,
      summaryCards,
      sections,
      reportType: 'financial'
    });
    
    printProfessionalReport(html);
  };

  const handleExportCSV = () => {
    const headers = ['Employee', 'Department', 'Period', 'Gross Pay', 'NASSIT', 'PAYE', 'Net Pay', 'Status'];
    const rows = filteredPayrolls.map(p => [
      p.employee_name,
      employees.find(e => e.id === p.employee_id)?.department || '',
      `${p.period_start} to ${p.period_end}`,
      p.gross_pay,
      p.nassit_employee,
      p.paye_tax,
      p.net_pay,
      p.status
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0072C6]" />
            Payroll Reports & Compliance
          </h3>
          <p className="text-sm text-gray-500">Generate financial summaries and statutory reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(rt => (
                    <SelectItem key={rt.value} value={rt.value}>
                      <div className="flex items-center gap-2">
                        <rt.icon className="w-4 h-4" />
                        {rt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Period</Label>
              <Select value={periodOption} onValueChange={setPeriodOption}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(po => (
                    <SelectItem key={po.value} value={po.value}>{po.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {periodOption === 'custom' && (
              <>
                <div>
                  <Label className="text-xs text-gray-500">Start Date</Label>
                  <Input 
                    type="date" 
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">End Date</Label>
                  <Input 
                    type="date" 
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs text-gray-500">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 inline mr-1" />
            Showing data from {format(dateRange.start, 'MMM d, yyyy')} to {format(dateRange.end, 'MMM d, yyyy')}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="sl-card-green">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Gross Pay</p>
            <p className="text-2xl font-bold text-[#1EB053]">{formatSLE(summaryStats.totalGross)}</p>
            <p className="text-xs text-gray-400">{summaryStats.employeeCount} employees</p>
          </CardContent>
        </Card>
        <Card className="sl-card-blue">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Net Pay</p>
            <p className="text-2xl font-bold text-[#0072C6]">{formatSLE(summaryStats.totalNet)}</p>
            <p className="text-xs text-gray-400">{summaryStats.payrollCount} payrolls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">NASSIT (Total)</p>
            <p className="text-2xl font-bold">{formatSLE(summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer)}</p>
            <p className="text-xs text-gray-400">Emp: {formatSLE(summaryStats.totalNASSITEmployee)} | Empr: {formatSLE(summaryStats.totalNASSITEmployer)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">PAYE Tax</p>
            <p className="text-2xl font-bold text-red-600">{formatSLE(summaryStats.totalPAYE)}</p>
            <p className="text-xs text-gray-400">Total tax withheld</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsContent value="summary" className="mt-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Department Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payroll by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatSLE(v)} />
                    <Legend />
                    <Bar dataKey="gross" name="Gross Pay" fill="#1EB053" />
                    <Bar dataKey="net" name="Net Pay" fill="#0072C6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Net Pay', value: summaryStats.totalNet },
                        { name: 'NASSIT (Employee)', value: summaryStats.totalNASSITEmployee },
                        { name: 'NASSIT (Employer)', value: summaryStats.totalNASSITEmployer },
                        { name: 'PAYE Tax', value: summaryStats.totalPAYE },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatSLE(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nassit" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">🇸🇱</span>
                NASSIT Contribution Report
              </CardTitle>
              <p className="text-sm text-gray-500">National Social Security and Insurance Trust contributions</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employee Contribution (5%)</p>
                    <p className="text-xl font-bold text-[#0072C6]">{formatSLE(summaryStats.totalNASSITEmployee)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employer Contribution (10%)</p>
                    <p className="text-xl font-bold text-[#0072C6]">{formatSLE(summaryStats.totalNASSITEmployer)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total NASSIT Payable</p>
                    <p className="text-xl font-bold text-[#1EB053]">{formatSLE(summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer)}</p>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Employee (5%)</TableHead>
                    <TableHead>Employer (10%)</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.filter(p => p.status === 'paid' || p.status === 'approved').map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.employee_name}</TableCell>
                      <TableCell>{formatSLE(p.gross_pay)}</TableCell>
                      <TableCell>{formatSLE(p.nassit_employee)}</TableCell>
                      <TableCell>{formatSLE(p.nassit_employer)}</TableCell>
                      <TableCell className="font-medium">{formatSLE((p.nassit_employee || 0) + (p.nassit_employer || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paye" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                PAYE Tax Report
              </CardTitle>
              <p className="text-sm text-gray-500">Pay As You Earn income tax deductions (per Finance Act 2024)</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total PAYE Tax Withheld</p>
                  <p className="text-3xl font-bold text-red-600">{formatSLE(summaryStats.totalPAYE)}</p>
                  <p className="text-xs text-gray-500 mt-1">Payable to NRA</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Tax Bracket Distribution</p>
                  <div className="space-y-2">
                    {taxBracketData.map(b => (
                      <div key={b.bracket} className="flex justify-between items-center">
                        <Badge variant="outline">{b.bracket}</Badge>
                        <span className="text-sm">{b.count} employees • {formatSLE(b.totalTax)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Tax Bracket</TableHead>
                    <TableHead>Effective Rate</TableHead>
                    <TableHead>PAYE Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.filter(p => p.status === 'paid' || p.status === 'approved').map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.employee_name}</TableCell>
                      <TableCell>{formatSLE(p.gross_pay)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.calculation_details?.tax_bracket || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>{p.calculation_details?.effective_tax_rate || 0}%</TableCell>
                      <TableCell className="font-medium text-red-600">{formatSLE(p.paye_tax)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="department" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Payroll by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>NASSIT</TableHead>
                    <TableHead>PAYE</TableHead>
                    <TableHead>Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentData.map(d => (
                    <TableRow key={d.department}>
                      <TableCell className="font-medium">{d.department}</TableCell>
                      <TableCell>{d.count}</TableCell>
                      <TableCell>{formatSLE(d.gross)}</TableCell>
                      <TableCell>{formatSLE(d.nassit)}</TableCell>
                      <TableCell>{formatSLE(d.paye)}</TableCell>
                      <TableCell className="font-medium text-[#1EB053]">{formatSLE(d.net)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell>{summaryStats.employeeCount}</TableCell>
                    <TableCell>{formatSLE(summaryStats.totalGross)}</TableCell>
                    <TableCell>{formatSLE(summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer)}</TableCell>
                    <TableCell>{formatSLE(summaryStats.totalPAYE)}</TableCell>
                    <TableCell className="text-[#1EB053]">{formatSLE(summaryStats.totalNet)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.employee_name}</TableCell>
                      <TableCell className="text-xs">{format(parseISO(p.period_start), 'MMM d')} - {format(parseISO(p.period_end), 'MMM d')}</TableCell>
                      <TableCell>{formatSLE(p.base_salary)}</TableCell>
                      <TableCell className="text-green-600">+{formatSLE(p.total_allowances)}</TableCell>
                      <TableCell>{formatSLE(p.gross_pay)}</TableCell>
                      <TableCell className="text-red-600">-{formatSLE(p.total_deductions)}</TableCell>
                      <TableCell className="font-medium text-[#1EB053]">{formatSLE(p.net_pay)}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'paid' ? 'default' : 'secondary'}>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">🇸🇱</span>
                Sierra Leone Compliance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    NASSIT Compliance
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Organisation: {organisation?.name}</span>
                      <Badge>NASSIT Registered</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>NASSIT Number:</span>
                      <span>{organisation?.nassit_number || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Employee Contributions (5%):</span>
                      <span className="font-medium">{formatSLE(summaryStats.totalNASSITEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Employer Contributions (10%):</span>
                      <span className="font-medium">{formatSLE(summaryStats.totalNASSITEmployer)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Payable to NASSIT:</span>
                      <span className="font-bold text-[#1EB053]">{formatSLE(summaryStats.totalNASSITEmployee + summaryStats.totalNASSITEmployer)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    NRA Tax Compliance
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>TIN Number:</span>
                      <span>{organisation?.tin_number || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total PAYE Withheld:</span>
                      <span className="font-medium text-red-600">{formatSLE(summaryStats.totalPAYE)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employees Taxed:</span>
                      <span>{taxBracketData.filter(b => b.bracket !== '0%').reduce((s, b) => s + b.count, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax-Exempt Employees:</span>
                      <span>{taxBracketData.find(b => b.bracket === '0%')?.count || 0}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Payable to NRA:</span>
                      <span className="font-bold text-red-600">{formatSLE(summaryStats.totalPAYE)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">📋 Compliance Checklist</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>✓ NASSIT contributions calculated at 5% (employee) + 10% (employer)</li>
                  <li>✓ PAYE tax calculated per Finance Act 2024 brackets</li>
                  <li>✓ First SLE 500,000/month tax-free threshold applied</li>
                  <li>⚠️ Remit NASSIT contributions by 14th of following month</li>
                  <li>⚠️ Submit PAYE returns to NRA monthly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}