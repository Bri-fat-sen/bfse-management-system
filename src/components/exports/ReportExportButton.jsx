import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, Download, Printer, FileSpreadsheet, 
  ChevronDown, Loader2, FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { generateProfessionalReport, printProfessionalReport } from "./ProfessionalReportGenerator";
import { exportToCSV } from "./SierraLeoneExportStyles";

export default function ReportExportButton({
  reportType = "Report",
  title,
  subtitle,
  organisation,
  dateRange,
  preparedBy,
  executiveSummary,
  keyMetrics = [],
  tables = [],
  insights = [],
  recommendations = [],
  rawData = [],
  csvColumns = [],
  variant = "outline",
  size = "sm",
  className = ""
}) {
  const [exporting, setExporting] = useState(false);

  const handlePrintReport = async () => {
    setExporting(true);
    try {
      const html = generateProfessionalReport({
        reportType,
        title,
        subtitle,
        organisation,
        dateRange,
        preparedBy,
        executiveSummary,
        keyMetrics,
        tables,
        insights,
        recommendations,
        footer: true
      });
      
      printProfessionalReport(html);
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report", { description: error.message });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!rawData.length || !csvColumns.length) {
      toast.error("No data available for CSV export");
      return;
    }
    
    const filename = `${title?.replace(/\s+/g, '_').toLowerCase() || 'report'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    exportToCSV(csvColumns, rawData, filename, organisation);
    toast.success("CSV exported successfully");
  };

  const handleDownloadSummary = async () => {
    setExporting(true);
    try {
      const html = generateProfessionalReport({
        reportType,
        title,
        subtitle,
        organisation,
        dateRange,
        preparedBy,
        executiveSummary,
        keyMetrics,
        tables: [], // Summary only, no detailed tables
        insights,
        recommendations,
        footer: true
      });
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title?.replace(/\s+/g, '_').toLowerCase() || 'summary'}_${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Summary report downloaded");
    } catch (error) {
      toast.error("Failed to download summary");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handlePrintReport}>
          <Printer className="w-4 h-4 mr-3 text-[#1EB053]" />
          <div>
            <p className="font-medium">Print Full Report</p>
            <p className="text-xs text-gray-500">Professional PDF with cover</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDownloadSummary}>
          <FileCheck className="w-4 h-4 mr-3 text-[#0072C6]" />
          <div>
            <p className="font-medium">Download Summary</p>
            <p className="text-xs text-gray-500">Executive summary only</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleExportCSV} disabled={!rawData.length}>
          <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
          <div>
            <p className="font-medium">Export to CSV</p>
            <p className="text-xs text-gray-500">Raw data spreadsheet</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}