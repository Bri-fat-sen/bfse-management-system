import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { generateExportHTML, printDocument, exportToCSV } from "@/components/exports/SierraLeoneExportStyles";

export default function AttendanceReportExport({ attendance = [], employee, organisation }) {
  // Calculate summary stats
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);

  const handleExportCSV = () => {
    const columns = ['Date', 'Employee', 'Clock In', 'Clock Out', 'Hours', 'Status'];
    const rows = attendance.map(a => [
      a.date,
      a.employee_name || employee?.full_name || 'N/A',
      a.clock_in_time || '-',
      a.clock_out_time || '-',
      a.total_hours?.toFixed(2) || '0',
      a.status
    ]);
    
    exportToCSV(columns, rows, `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const handlePrint = () => {
    const summary = [
      { label: 'Total Days', value: attendance.length.toString() },
      { label: 'Present', value: presentDays.toString(), highlight: 'green' },
      { label: 'Late', value: lateDays.toString(), highlight: lateDays > 0 ? 'gold' : undefined },
      { label: 'Total Hours', value: `${totalHours.toFixed(1)} hrs` }
    ];

    const columns = ['Date', 'Day', 'Clock In', 'Clock Out', 'Hours Worked', 'Status'];
    const rows = attendance.map(a => [
      a.date ? format(new Date(a.date), 'dd MMM yyyy') : '-',
      a.date ? format(new Date(a.date), 'EEEE') : '-',
      a.clock_in_time || '-',
      a.clock_out_time || '-',
      a.total_hours ? `${a.total_hours.toFixed(2)} hrs` : '-',
      a.status
    ]);

    const html = generateExportHTML({
      title: `Attendance Report - ${employee?.full_name || 'Employee'}`,
      organisation: organisation,
      summary: summary,
      columns: columns,
      rows: rows
    });

    printDocument(html);
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