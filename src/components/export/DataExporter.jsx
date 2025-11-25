import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function DataExporter({ 
  data = [], 
  filename = "export", 
  columns = [],
  title = "Data Export"
}) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = () => {
    setExporting(true);
    try {
      // Header row
      const headers = columns.map(col => col.label).join(',');
      
      // Data rows
      const rows = data.map(row => {
        return columns.map(col => {
          let value = col.accessor ? col.accessor(row) : row[col.key];
          // Handle special characters and commas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',');
      });

      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${data.length} records exported to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setExporting(false);
  };

  const exportToJSON = () => {
    setExporting(true);
    try {
      const exportData = data.map(row => {
        const obj = {};
        columns.forEach(col => {
          obj[col.label] = col.accessor ? col.accessor(row) : row[col.key];
        });
        return obj;
      });

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${data.length} records exported to JSON`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setExporting(false);
  };

  const printReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          @media print {
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            body { -webkit-print-color-adjust: exact !important; }
            th { background: #1EB053 !important; color: white !important; }
            tr:nth-child(even) { background-color: #f0fdf4 !important; }
            .header-bar { background: linear-gradient(135deg, #1EB053, #0072C6) !important; }
          }
          body { font-family: Arial, sans-serif; padding: 0; margin: 0; }
          .header-bar { background: linear-gradient(135deg, #1EB053, #0072C6); color: white; padding: 20px; margin-bottom: 20px; }
          .header-bar h1 { margin: 0; font-size: 24px; }
          .header-bar p { margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 20px; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 15px; color: #666; font-size: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1EB053; color: white; padding: 12px 8px; text-align: left; font-weight: 600; }
          td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background-color: #f0fdf4; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 11px; border-top: 3px solid; border-image: linear-gradient(to right, #1EB053, #fff, #0072C6) 1; padding-top: 15px; }
          .flag-stripe { height: 6px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); }
        </style>
      </head>
      <body>
        <div class="flag-stripe"></div>
        <div class="header-bar">
          <h1>🇸🇱 BRI-FAT-SEN ENTERPRISE</h1>
          <p>${title}</p>
        </div>
        <div class="content">
          <div class="meta-info">
            <span>Total Records: ${data.length}</span>
            <span>Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}</span>
          </div>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${columns.map(col => {
                    const value = col.accessor ? col.accessor(row) : row[col.key];
                    return `<td>${value ?? '-'}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>🇸🇱 Proudly serving businesses in Sierra Leone</p>
            <p>BRI-FAT-SEN Enterprise Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting || data.length === 0}>
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={printReport}>
          <FileText className="w-4 h-4 mr-2" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}