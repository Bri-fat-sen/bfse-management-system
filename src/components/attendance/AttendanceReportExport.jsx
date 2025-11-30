import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateProfessionalReport, printProfessionalReport } from "@/components/exports/ProfessionalReportGenerator";

export default function AttendanceReportExport({ attendance = [], employee, employees, organisation }) {
  // Calculate summary stats
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const avgHours = attendance.length > 0 ? totalHours / attendance.length : 0;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays + lateDays) / attendance.length * 100) : 0;

  const handleExportCSV = () => {
    const columns = employees ? 
      ['Date', 'Employee', 'Department', 'Clock In', 'Clock Out', 'Location', 'Hours', 'Status'] :
      ['Date', 'Employee', 'Clock In', 'Clock Out', 'Hours', 'Status'];
    
    const rows = employees ?
      attendance.map(a => {
        const emp = employees.find(e => e.id === a.employee_id);
        return [
          a.date,
          a.employee_name || 'N/A',
          emp?.department || '-',
          a.clock_in_time || '-',
          a.clock_out_time || '-',
          a.clock_in_location || '-',
          a.total_hours?.toFixed(2) || '0',
          a.status
        ];
      }) :
      attendance.map(a => [
        a.date,
        a.employee_name || employee?.full_name || 'N/A',
        a.clock_in_time || '-',
        a.clock_out_time || '-',
        a.total_hours?.toFixed(2) || '0',
        a.status
      ]);
    
    exportToCSV(columns, rows, `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, organisation);
  };

  const handlePrint = () => {
    const keyMetrics = [
      { icon: '📋', label: 'Total Records', value: attendance.length.toString() },
      { icon: '✅', label: 'Present', value: presentDays.toString(), trend: 'positive' },
      { icon: '⏰', label: 'Late', value: lateDays.toString(), trend: lateDays > 0 ? 'warning' : '' },
      { icon: '🕐', label: 'Total Hours', value: `${totalHours.toFixed(1)} hrs` }
    ];

    const columns = employees ?
      ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status'] :
      ['Date', 'Day', 'Clock In', 'Clock Out', 'Hours Worked', 'Status'];
    
    const rows = employees ?
      attendance.map(a => {
        const emp = employees.find(e => e.id === a.employee_id);
        return [
          a.employee_name || 'Unknown',
          emp?.department || '-',
          a.date ? format(new Date(a.date), 'dd MMM yyyy') : '-',
          a.clock_in_time || '-',
          a.clock_out_time || '-',
          a.total_hours ? `${a.total_hours.toFixed(2)} hrs` : '-',
          a.status
        ];
      }) :
      attendance.map(a => [
        a.date ? format(new Date(a.date), 'dd MMM yyyy') : '-',
        a.date ? format(new Date(a.date), 'EEEE') : '-',
        a.clock_in_time || '-',
        a.clock_out_time || '-',
        a.total_hours ? `${a.total_hours.toFixed(2)} hrs` : '-',
        a.status
      ]);

    const reportTitle = employees ? 'Staff Attendance Report' : `Attendance Report - ${employee?.full_name || 'Employee'}`;

    const insights = [
      `${attendanceRate}% attendance rate (${presentDays + lateDays} present out of ${attendance.length} records)`,
      `Average hours per day: ${avgHours.toFixed(1)} hours`,
      lateDays > 0 ? `${lateDays} late arrivals recorded` : 'No late arrivals - excellent punctuality!',
      absentDays > 0 ? `${absentDays} absences recorded` : null
    ].filter(Boolean);

    const recommendations = [
      lateDays > attendance.length * 0.1 ? 'Review punctuality policies - late arrivals exceed 10%' : null,
      absentDays > attendance.length * 0.05 ? 'Monitor absenteeism trends and address root causes' : null,
      avgHours < 7 ? 'Review work hour expectations with employees' : null,
      'Continue tracking attendance for workforce planning'
    ].filter(Boolean);

    const html = generateProfessionalReport({
      reportType: 'HR & Attendance',
      title: reportTitle,
      subtitle: 'Employee attendance tracking and time analysis',
      organisation,
      dateRange: `As of ${format(new Date(), 'MMMM d, yyyy')}`,
      executiveSummary: `This attendance report covers ${attendance.length} records with an attendance rate of ${attendanceRate}%. Total hours worked: ${totalHours.toFixed(1)} hours (average ${avgHours.toFixed(1)} hours/day). ${presentDays} days present, ${lateDays} days late, ${absentDays} days absent.`,
      keyMetrics,
      tables: [{ title: 'Attendance Records', icon: '📋', columns, rows }],
      insights,
      recommendations
    });

    printProfessionalReport(html);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportCSV}>
        <Download className="w-4 h-4 mr-1" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-1" />
        Print
      </Button>
    </div>
  );
}