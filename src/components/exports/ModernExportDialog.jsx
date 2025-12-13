import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, FileSpreadsheet, Download, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ModernExportDialog({ 
  open, 
  onOpenChange, 
  data, 
  reportTitle,
  reportType = "general",
  orgData = null 
}) {
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 2000);
    }, 500);
  };

  const exportToPDF = async () => {
    setExporting(true);
    
    try {
      // Dynamic import to reduce bundle size
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF('p', 'mm', 'a4');
    
    // Sierra Leone flag stripe at top
    doc.setFillColor(30, 176, 83);
    doc.rect(0, 0, 70, 8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(70, 0, 70, 8, 'F');
    doc.setFillColor(0, 114, 198);
    doc.rect(140, 0, 70, 8, 'F');

    // Header section with gradient background
    doc.setFillColor(15, 31, 60);
    doc.rect(0, 8, 210, 35, 'F');

    // Organisation logo (if available)
    if (orgData?.logo_url) {
      try {
        doc.addImage(orgData.logo_url, 'PNG', 15, 13, 25, 25);
      } catch (e) {
        console.log('Logo not added');
      }
    }

    // Report title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(reportTitle, orgData?.logo_url ? 45 : 15, 23);

    // Organisation info
    if (orgData) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(orgData.name || '', orgData?.logo_url ? 45 : 15, 30);
      doc.text(`Generated: ${format(new Date(), 'PPP')}`, orgData?.logo_url ? 45 : 15, 36);
    }

    // Sierra Leone flag stripe separator
    doc.setFillColor(30, 176, 83);
    doc.rect(0, 43, 70, 3, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(70, 43, 70, 3, 'F');
    doc.setFillColor(0, 114, 198);
    doc.rect(140, 43, 70, 3, 'F');

    // Table data
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    let y = 55;

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const pageWidth = 190;
      const startX = 10;
      
      // Calculate column widths based on content
      const colWidths = headers.map(() => pageWidth / headers.length);
      
      // Table headers
      doc.setFillColor(240, 240, 240);
      doc.rect(startX, y - 5, pageWidth, 8, 'F');
      doc.setFont(undefined, 'bold');
      
      let xPos = startX + 2;
      headers.forEach((header, i) => {
        const headerText = header.replace(/_/g, ' ').toUpperCase();
        doc.text(headerText, xPos, y, { maxWidth: colWidths[i] - 4 });
        xPos += colWidths[i];
      });

      // Table rows
      doc.setFont(undefined, 'normal');
      y += 10;
      
      data.slice(0, 40).forEach((row, rowIndex) => {
        if (y > 270) {
          doc.addPage();
          
          // Add flag stripe on new page
          doc.setFillColor(30, 176, 83);
          doc.rect(0, 0, 70, 3, 'F');
          doc.setFillColor(255, 255, 255);
          doc.rect(70, 0, 70, 3, 'F');
          doc.setFillColor(0, 114, 198);
          doc.rect(140, 0, 70, 3, 'F');
          
          y = 15;
        }
        
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(startX, y - 4, pageWidth, 8, 'F');
        }
        
        xPos = startX + 2;
        headers.forEach((header, i) => {
          const cellText = String(row[header] || '');
          // Truncate long text and wrap if needed
          const truncated = cellText.length > 40 ? cellText.substring(0, 40) + '...' : cellText;
          doc.text(truncated, xPos, y, { maxWidth: colWidths[i] - 4 });
          xPos += colWidths[i];
        });
        y += 8;
      });
    }

    // Footer with flag stripe
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Bottom flag stripe
      doc.setFillColor(30, 176, 83);
      doc.rect(0, 287, 70, 10, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(70, 287, 70, 10, 'F');
      doc.setFillColor(0, 114, 198);
      doc.rect(140, 287, 70, 10, 'F');
      
      // Page number
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 293, { align: 'center' });
    }

      doc.save(`${reportTitle}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      setExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 2000);
    } catch (error) {
      console.error('PDF export error:', error);
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6] -mt-6 -mx-6"></div>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Export Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-900 mb-1">{reportTitle}</h4>
            <p className="text-sm text-gray-600">{data.length} records • {format(new Date(), 'PPP')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={exportToCSV}
                disabled={exporting}
                className="w-full h-auto flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all"
              >
                {exporting ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : exportComplete ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <FileSpreadsheet className="w-8 h-8" />
                )}
                <div className="text-center">
                  <p className="font-bold">Excel / CSV</p>
                  <p className="text-xs text-green-100">Spreadsheet format</p>
                </div>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={exportToPDF}
                disabled={exporting}
                className="w-full h-auto flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:shadow-xl transition-all"
              >
                {exporting ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : exportComplete ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
                <div className="text-center">
                  <p className="font-bold">PDF Document</p>
                  <p className="text-xs text-blue-100">Print-ready format</p>
                </div>
              </Button>
            </motion.div>
          </div>

          {exportComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 border border-green-200 rounded-xl text-center"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-800">Export completed successfully!</p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}