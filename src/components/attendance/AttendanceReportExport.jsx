import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer, Eye, Calendar } from "lucide-react";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AttendanceReportExport({ attendance = [], employee, employees, organisation }) {
  const [showPreview, setShowPreview] = useState(false);
  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
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

    const sections = [];
    
    if (employees) {
      const deptBreakdown = {};
      attendance.forEach(a => {
        const emp = employees.find(e => e.id === a.employee_id);
        const dept = emp?.department || 'Unassigned';
        if (!deptBreakdown[dept]) deptBreakdown[dept] = 0;
        deptBreakdown[dept] += a.total_hours || 0;
      });
      
      sections.push({
        title: 'Hours by Department',
        icon: '🏢',
        breakdown: deptBreakdown
      });
    }

    sections.push({
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
              a.date ? format(new Date(a.date), 'MMM d, yyyy') : '-',
              a.clock_in_time || '-',
              a.clock_out_time || '-',
              a.clock_in_location?.substring(0, 20) || '-',
              a.total_hours ? `${a.total_hours.toFixed(2)} hrs` : '-',
              a.status
            ];
          }) :
          attendance.map(a => [
            a.date ? format(new Date(a.date), 'MMM d, yyyy') : '-',
            a.date ? format(new Date(a.date), 'EEEE') : '-',
            a.clock_in_time || '-',
            a.clock_out_time || '-',
            a.total_hours ? `${a.total_hours.toFixed(2)} hrs` : '-',
            a.status
          ])
      }
    });

    if (absentDays > 0) {
      sections.push({
        title: '',
        content: `
          <div class="totals-box">
            <div class="totals-row">
              <span>Days Present</span>
              <span>${presentDays}</span>
            </div>
            <div class="totals-row">
              <span>Days Late</span>
              <span>${lateDays}</span>
            </div>
            <div class="totals-row">
              <span>Days Absent</span>
              <span>${absentDays}</span>
            </div>
            <div class="totals-row grand">
              <span>Total Hours Worked</span>
              <span>${totalHours.toFixed(1)} hrs</span>
            </div>
          </div>
        `
      });
    }

    let notes = null;
    if (lateDays > 0 || absentDays > 0) {
      notes = `${lateDays > 0 ? `${lateDays} late arrival(s) recorded. ` : ''}${absentDays > 0 ? `${absentDays} absence(s) recorded.` : ''}`;
    }

    const reportTitle = employees ? 
      'Staff Attendance Report' : 
      `Attendance Report - ${employee?.full_name || 'Employee'}`;

    const dateRange = attendance.length > 0 
      ? `${format(new Date(attendance[attendance.length - 1]?.date || new Date()), 'MMM d')} - ${format(new Date(attendance[0]?.date || new Date()), 'MMM d, yyyy')}`
      : format(new Date(), 'MMMM d, yyyy');

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: reportTitle,
      organisation,
      infoBar: [{ label: 'Period', value: dateRange }],
      summaryCards,
      sections,
      notes
    });

    printUnifiedPDF(html, `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const getPreviewHTML = () => {
    const reportTitle = employees ? 
      'Staff Attendance Report (Preview)' : 
      `Attendance Report - ${employee?.full_name || 'Employee'} (Preview)`;

    const dateRange = attendance.length > 0 
      ? `${format(new Date(attendance[attendance.length - 1]?.date || new Date()), 'MMM d')} - ${format(new Date(attendance[0]?.date || new Date()), 'MMM d, yyyy')}`
      : format(new Date(), 'MMMM d, yyyy');

    const summaryCards = [
      { label: 'Total Records', value: attendance.length.toString() },
      { label: 'Present', value: presentDays.toString(), highlight: 'green' },
      { label: 'Late Arrivals', value: lateDays.toString(), highlight: lateDays > 0 ? 'gold' : 'green' },
      { label: 'Total Hours', value: `${totalHours.toFixed(1)} hrs` }
    ];

    return generateUnifiedPDF({
      documentType: 'report',
      title: reportTitle,
      organisation,
      infoBar: [{ label: 'Period', value: dateRange }],
      summaryCards,
      sections: [{
        title: 'Attendance Records (First 20)',
        icon: '📅',
        table: {
          columns: employees ?
            ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status'] :
            ['Date', 'Day', 'Clock In', 'Clock Out', 'Hours', 'Status'],
          rows: employees ?
            attendance.slice(0, 20).map(a => {
              const emp = employees.find(e => e.id === a.employee_id);
              return [
                a.employee_name || 'Unknown',
                emp?.department || '-',
                a.date ? format(new Date(a.date), 'MMM d, yyyy') : '-',
                a.clock_in_time || '-',
                a.clock_out_time || '-',
                a.total_hours ? `${a.total_hours.toFixed(2)} hrs` : '-',
                a.status
              ];
            }) :
            attendance.slice(0, 20).map(a => [
              a.date ? format(new Date(a.date), 'MMM d, yyyy') : '-',
              a.date ? format(new Date(a.date), 'EEEE') : '-',
              a.clock_in_time || '-',
              a.clock_out_time || '-',
              a.total_hours ? `${a.total_hours.toFixed(2)} hrs` : '-',
              a.status
            ])
        }
      }]
    });
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
      
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
          {/* Sierra Leone Flag Header */}
          <div className="h-2 flex">
            <div className="flex-1" style={{ backgroundColor: primaryColor }} />
            <div className="flex-1 bg-white" />
            <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>

          {/* Header with gradient */}
          <div className="px-6 py-4 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Attendance Report</h2>
                <p className="text-white/80 text-sm">{attendance.length} records</p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-4">
            <iframe
              srcDoc={getPreviewHTML()}
              className="w-full h-[450px] border rounded-lg"
              title="Attendance Report Preview"
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
            <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">Close</Button>
            <Button onClick={handlePrint} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Bottom flag stripe */}
          <div className="h-1 flex">
            <div className="flex-1" style={{ backgroundColor: primaryColor }} />
            <div className="flex-1 bg-white" />
            <div className="flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}