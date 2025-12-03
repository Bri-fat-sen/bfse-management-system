import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

export default function AttendanceReportExport({ attendance = [], employee, employees, organisation }) {
  // Calculate summary stats
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);

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
    const summaryCards = [
      { label: 'Total Records', value: attendance.length.toString() },
      { label: 'Present', value: presentDays.toString(), highlight: 'green' },
      { label: 'Late Arrivals', value: lateDays.toString(), highlight: lateDays > 0 ? 'gold' : 'green' },
      { label: 'Total Hours', value: `${totalHours.toFixed(1)} hrs` }
    ];

    const sections = [{
      title: employees ? 'Staff Attendance Records' : 'My Attendance Records',
      icon: '📅',
      table: {
        columns: employees ?
          ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Location', 'Hours', 'Status'] :
          ['Date', 'Day', 'Clock In', 'Clock Out', 'Hours Worked', 'Status'],
        rows: employees ?
          attendance.map(a => {
            const emp = employees.find(e => e.id === a.employee_id);
            return [
              a.employee_name || 'Unknown',
              emp?.department || '-',
              a.date ? format(new Date(a.date), 'dd MMM yyyy') : '-',
              a.clock_in_time || '-',
              a.clock_out_time || '-',
              a.clock_in_location?.substring(0, 20) || '-',
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
          ])
      }
    }];

    const reportTitle = employees ? 
      'Staff Attendance Report' : 
      `Attendance Report - ${employee?.full_name || 'Employee'}`;

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: reportTitle,
      organisation: organisation,
      summaryCards: summaryCards,
      sections: sections,
      notes: lateDays > 0 || absentDays > 0 
        ? `Attendance Alerts: ${lateDays > 0 ? `${lateDays} late arrival(s) recorded. ` : ''}${absentDays > 0 ? `${absentDays} absence(s) recorded.` : ''}`
        : null
    });

    printUnifiedPDF(html, `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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