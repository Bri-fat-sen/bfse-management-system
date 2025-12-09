import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/Toast";
import jsPDF from "jspdf";

export default function ReportExporter({ 
  reportData, 
  reportType = "profit_loss",
  organisation,
  dateRange 
}) {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 20;

      // Header with Sierra Leone colors
      doc.setFillColor(30, 176, 83);
      doc.rect(0, 0, pageWidth / 3, 5, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(pageWidth / 3, 0, pageWidth / 3, 5, 'F');
      doc.setFillColor(0, 114, 198);
      doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 5, 'F');

      // Organisation name
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(organisation?.name || 'Organisation', pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Report title
      doc.setFontSize(14);
      const titles = {
        profit_loss: 'PROFIT & LOSS STATEMENT',
        balance_sheet: 'BALANCE SHEET',
        cash_flow: 'CASH FLOW STATEMENT'
      };
      doc.text(titles[reportType] || 'FINANCIAL REPORT', pageWidth / 2, y, { align: 'center' });
      y += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(dateRange?.label || 'Current Period', pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Line separator
      doc.setDrawColor(30, 176, 83);
      doc.setLineWidth(0.5);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;

      if (reportType === 'profit_loss' && reportData.revenue) {
        // Revenue Section
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 176, 83);
        doc.text('REVENUE', 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        const revenueItems = [
          ['Sales Revenue', reportData.revenue.salesRevenue],
          ['Transport Revenue', reportData.revenue.transportRevenue],
          ['Contract Revenue', reportData.revenue.contractRevenue],
          ['Other Revenue', reportData.revenue.otherRevenue]
        ];

        revenueItems.forEach(([label, amount]) => {
          doc.text(label, 30, y);
          doc.text(`Le ${amount.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
          y += 6;
        });

        doc.setFont(undefined, 'bold');
        doc.text('Total Revenue', 30, y);
        doc.text(`Le ${reportData.revenue.totalRevenue.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 10;

        // Expenses Section
        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38);
        doc.text('EXPENSES', 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);

        const expenseItems = [
          ['Recorded Expenses', reportData.expenses.recordedExpenses],
          ['Fuel Costs', reportData.expenses.fuelCosts],
          ['Trip Expenses', reportData.expenses.tripOtherCosts],
          ['Contract Expenses', reportData.expenses.contractExpenses],
          ['Maintenance', reportData.expenses.maintenanceCosts]
        ];

        expenseItems.forEach(([label, amount]) => {
          doc.text(label, 30, y);
          doc.text(`Le ${amount.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
          y += 6;
        });

        doc.setFont(undefined, 'bold');
        doc.text('Total Expenses', 30, y);
        doc.text(`Le ${reportData.expenses.totalExpenses.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 15;

        // Net Profit
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y - 5, pageWidth - 40, 12, 'F');
        doc.setFontSize(14);
        doc.setTextColor(0, 114, 198);
        doc.text('NET PROFIT', 30, y);
        doc.text(`Le ${reportData.netProfit.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Profit Margin: ${reportData.profitMargin.toFixed(1)}%`, 30, y);
      } else if (reportType === 'balance_sheet' && reportData.assets) {
        // Assets
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 176, 83);
        doc.text('ASSETS', 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);

        doc.text('Current Assets', 30, y);
        doc.text(`Le ${reportData.assets.current.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 6;
        doc.text('Fixed Assets', 30, y);
        doc.text(`Le ${reportData.assets.fixed.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 6;

        doc.setFont(undefined, 'bold');
        doc.text('Total Assets', 30, y);
        doc.text(`Le ${reportData.assets.total.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 10;

        // Liabilities
        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38);
        doc.text('LIABILITIES', 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);

        doc.text('Current Liabilities', 30, y);
        doc.text(`Le ${reportData.liabilities.current.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 6;
        doc.text('Long-term Liabilities', 30, y);
        doc.text(`Le ${reportData.liabilities.longTerm.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 6;

        doc.setFont(undefined, 'bold');
        doc.text('Total Liabilities', 30, y);
        doc.text(`Le ${reportData.liabilities.total.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
        y += 10;

        // Equity
        doc.setFontSize(12);
        doc.setTextColor(0, 114, 198);
        doc.text('EQUITY', 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);

        doc.setFont(undefined, 'bold');
        doc.text('Total Equity', 30, y);
        doc.text(`Le ${reportData.equity.total.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
      } else if (reportType === 'cash_flow' && reportData.operating) {
        const sections = [
          { title: 'Operating Activities', data: reportData.operating, color: [30, 176, 83] },
          { title: 'Investing Activities', data: reportData.investing, color: [0, 114, 198] },
          { title: 'Financing Activities', data: reportData.financing, color: [147, 51, 234] }
        ];

        sections.forEach(section => {
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(...section.color);
          doc.text(section.title.toUpperCase(), 20, y);
          y += 8;

          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);

          Object.entries(section.data).forEach(([key, value]) => {
            if (key !== 'total') {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              doc.text(label, 30, y);
              doc.text(`Le ${value.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
              y += 6;
            }
          });

          doc.setFont(undefined, 'bold');
          doc.text(`Net Cash from ${section.title.split(' ')[0]}`, 30, y);
          doc.text(`Le ${section.data.total.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
          y += 10;
        });

        // Net change
        y += 5;
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y - 5, pageWidth - 40, 12, 'F');
        doc.setFontSize(14);
        doc.setTextColor(0, 114, 198);
        doc.text('NET CHANGE IN CASH', 30, y);
        doc.text(`Le ${reportData.netCashChange.toLocaleString()}`, pageWidth - 30, y, { align: 'right' });
      }

      // Footer
      y = pageHeight - 15;
      doc.setFillColor(30, 176, 83);
      doc.rect(0, pageHeight - 10, pageWidth / 3, 10, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(pageWidth / 3, pageHeight - 10, pageWidth / 3, 10, 'F');
      doc.setFillColor(0, 114, 198);
      doc.rect((pageWidth / 3) * 2, pageHeight - 10, pageWidth / 3, 10, 'F');

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, pageWidth / 2, y, { align: 'center' });

      const fileName = `${reportType}_${dateRange?.label?.replace(/\s+/g, '_') || 'report'}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      doc.save(fileName);

      toast.success("PDF exported", fileName);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Export failed", error.message);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      let csvContent = '';
      const orgName = organisation?.name || 'Organisation';
      const period = dateRange?.label || 'Current Period';

      if (reportType === 'profit_loss' && reportData.revenue) {
        csvContent = `${orgName}\nPROFIT & LOSS STATEMENT\n${period}\n\n`;
        csvContent += 'REVENUE\n';
        csvContent += `Sales Revenue,Le ${reportData.revenue.salesRevenue.toLocaleString()}\n`;
        csvContent += `Transport Revenue,Le ${reportData.revenue.transportRevenue.toLocaleString()}\n`;
        csvContent += `Contract Revenue,Le ${reportData.revenue.contractRevenue.toLocaleString()}\n`;
        csvContent += `Other Revenue,Le ${reportData.revenue.otherRevenue.toLocaleString()}\n`;
        csvContent += `Total Revenue,Le ${reportData.revenue.totalRevenue.toLocaleString()}\n\n`;

        csvContent += 'EXPENSES\n';
        csvContent += `Recorded Expenses,Le ${reportData.expenses.recordedExpenses.toLocaleString()}\n`;
        csvContent += `Fuel Costs,Le ${reportData.expenses.fuelCosts.toLocaleString()}\n`;
        csvContent += `Trip Expenses,Le ${reportData.expenses.tripOtherCosts.toLocaleString()}\n`;
        csvContent += `Contract Expenses,Le ${reportData.expenses.contractExpenses.toLocaleString()}\n`;
        csvContent += `Maintenance,Le ${reportData.expenses.maintenanceCosts.toLocaleString()}\n`;
        csvContent += `Total Expenses,Le ${reportData.expenses.totalExpenses.toLocaleString()}\n\n`;

        csvContent += `NET PROFIT,Le ${reportData.netProfit.toLocaleString()}\n`;
        csvContent += `Profit Margin,${reportData.profitMargin.toFixed(1)}%\n`;
      } else if (reportType === 'balance_sheet' && reportData.assets) {
        csvContent = `${orgName}\nBALANCE SHEET\nAs of ${period}\n\n`;
        csvContent += 'ASSETS\n';
        csvContent += `Current Assets,Le ${reportData.assets.current.toLocaleString()}\n`;
        csvContent += `Fixed Assets,Le ${reportData.assets.fixed.toLocaleString()}\n`;
        csvContent += `Total Assets,Le ${reportData.assets.total.toLocaleString()}\n\n`;

        csvContent += 'LIABILITIES\n';
        csvContent += `Current Liabilities,Le ${reportData.liabilities.current.toLocaleString()}\n`;
        csvContent += `Long-term Liabilities,Le ${reportData.liabilities.longTerm.toLocaleString()}\n`;
        csvContent += `Total Liabilities,Le ${reportData.liabilities.total.toLocaleString()}\n\n`;

        csvContent += 'EQUITY\n';
        csvContent += `Total Equity,Le ${reportData.equity.total.toLocaleString()}\n`;
      } else if (reportType === 'cash_flow' && reportData.operating) {
        csvContent = `${orgName}\nCASH FLOW STATEMENT\n${period}\n\n`;
        csvContent += 'OPERATING ACTIVITIES\n';
        Object.entries(reportData.operating).forEach(([key, val]) => {
          if (key !== 'total') {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
            csvContent += `${label},Le ${val.toLocaleString()}\n`;
          }
        });
        csvContent += `Net Cash from Operations,Le ${reportData.operating.total.toLocaleString()}\n\n`;

        csvContent += 'INVESTING ACTIVITIES\n';
        Object.entries(reportData.investing).forEach(([key, val]) => {
          if (key !== 'total') {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
            csvContent += `${label},Le ${val.toLocaleString()}\n`;
          }
        });
        csvContent += `Net Cash from Investing,Le ${reportData.investing.total.toLocaleString()}\n\n`;

        csvContent += 'FINANCING ACTIVITIES\n';
        Object.entries(reportData.financing).forEach(([key, val]) => {
          if (key !== 'total') {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
            csvContent += `${label},Le ${val.toLocaleString()}\n`;
          }
        });
        csvContent += `Net Cash from Financing,Le ${reportData.financing.total.toLocaleString()}\n\n`;

        csvContent += `NET CHANGE IN CASH,Le ${reportData.netCashChange.toLocaleString()}\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${reportType}_${dateRange?.label?.replace(/\s+/g, '_') || 'report'}_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV exported", fileName);
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Export failed", error.message);
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    toast.info("Excel export", "Use CSV format - compatible with Excel");
    exportToCSV();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="border-[#1EB053] text-[#1EB053] hover:bg-[#1EB053]/10"
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2 text-red-500" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <Table className="w-4 h-4 mr-2 text-green-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToExcel}>
          <Table className="w-4 h-4 mr-2 text-blue-600" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}