import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateProfessionalReport, downloadProfessionalReportAsPDF } from "@/components/exports/ProfessionalReportExport";

export default function AttendanceReportExport({ attendance = [], employee, employees, organisation }) {
  const [isPrinting, setIsPrinting] = useState(false);
  
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

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const summaryCards = [
        { label: 'Total Records', value: attendance.length.toString(), subtext: 'Attendance days' },
        { label: 'Present', value: presentDays.toString(), subtext: 'Days present', highlight: 'green' },
        { label: 'Late Arrivals', value: lateDays.toString(), subtext: 'Days late', highlight: lateDays > 0 ? 'gold' : 'green' },
        { label: 'Total Hours', value: `${totalHours.toFixed(1)} hrs`, subtext: 'Hours worked' }
      ];

      const columns = employees ?
        ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status'] :
        ['Date', 'Day', 'Clock In', 'Clock Out', 'Hours', 'Status'];
      
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

      const reportTitle = employees ? 
        'Staff Attendance Report' : 
        `Attendance Report - ${employee?.full_name || 'Employee'}`;

      const response = await base44.functions.invoke('generateDocumentPDF', {
        documentType: 'report',
        data: {
          title: reportTitle,
          dateRange: `${format(new Date(attendance[attendance.length - 1]?.date || new Date()), 'MMM d')} - ${format(new Date(attendance[0]?.date || new Date()), 'MMM d, yyyy')}`,
          summaryCards,
          sections: [{
            title: employees ? 'Staff Attendance Records' : 'My Attendance Records',
            table: { columns, rows }
          }]
        },
        organisation
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attendance-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch (error) {
      console.error('PDF error:', error);
      // Fallback to HTML
      const html = generateProfessionalReport({
        title: 'Attendance Report',
        organisation,
        summaryCards: [],
        sections: []
      });
      downloadProfessionalReportAsPDF(html);
    }
    setIsPrinting(false);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportCSV}>
        <Download className="w-4 h-4 mr-1" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
        {isPrinting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Printer className="w-4 h-4 mr-1" />}
        {isPrinting ? 'PDF...' : 'Print'}
      </Button>
    </div>
  );
}