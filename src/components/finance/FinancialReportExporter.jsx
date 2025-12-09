import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  Table as TableIcon,
  Loader2 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/Toast";
import jsPDF from "jspdf";

export default function FinancialReportExporter({ 
  reportType,
  reportData,
  dateRange,
  organisation 
}) {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 20;

      // Sierra Leone Flag Colors Header
      doc.setFillColor(30, 176, 83); // Green
      doc.rect(0, 0, pageWidth / 3, 8, 'F');
      doc.setFillColor(255, 255, 255); // White
      doc.rect(pageWidth / 3, 0, pageWidth / 3, 8, 'F');
      doc.setFillColor(0, 114, 198); // Blue
      doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 8, 'F');
      
      yPos = 18;

      // Organisation Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(organisation?.name || 'Financial Report', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(reportType, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(dateRange.label, pageWidth / 2, yPos, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos + 5, { align: 'center' });
      
      yPos += 15;
      doc.setTextColor(0, 0, 0);

      // Draw line separator
      doc.setDrawColor(30, 176, 83);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      if (reportType === "Profit & Loss Statement") {
        // Revenue Section
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(30, 176, 83);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('REVENUE', margin + 3, yPos + 5);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const revenueItems = [
          ['Sales Revenue', reportData.revenue.salesRevenue],
          ['Transport Revenue', reportData.revenue.transportRevenue],
          ['Contract Revenue', reportData.revenue.contractRevenue],
          ['Other Revenue', reportData.revenue.otherRevenue]
        ];

        revenueItems.forEach(([label, value]) => {
          doc.text(label, margin + 5, yPos);
          doc.text(`Le ${value.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: 'right' });
          yPos += 6;
        });

        doc.setFont(undefined, 'bold');
        yPos += 2;
        doc.text('Total Revenue', margin + 5, yPos);
        doc.text(`Le ${reportData.revenue.totalRevenue.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: 'right' });
        yPos += 12;

        // Expenses Section
        doc.setFillColor(239, 68, 68);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('EXPENSES', margin + 3, yPos + 5);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        doc.setFont(undefined, 'normal');
        const expenseItems = [
          ['Recorded Expenses', reportData.expenses.recordedExpenses],
          ['Fuel Costs', reportData.expenses.fuelCosts],
          ['Trip Expenses', reportData.expenses.tripOtherCosts],
          ['Contract Expenses', reportData.expenses.contractExpenses],
          ['Maintenance', reportData.expenses.maintenanceCosts]
        ];

        expenseItems.forEach(([label, value]) => {
          doc.text(label, margin + 5, yPos);
          doc.text(`Le ${value.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: 'right' });
          yPos += 6;
        });

        doc.setFont(undefined, 'bold');
        yPos += 2;
        doc.text('Total Expenses', margin + 5, yPos);
        doc.text(`Le ${reportData.expenses.totalExpenses.toLocaleString()}`, pageWidth - margin - 5, yPos, { align: 'right' });
        yPos += 12;

        // Net Profit
        const isProfit = reportData.netProfit >= 0;
        doc.setFillColor(isProfit ? 0 : 255, isProfit ? 114 : 165, isProfit ? 198 : 0);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('NET PROFIT', margin + 3, yPos + 7);
        doc.text(`Le ${reportData.netProfit.toLocaleString()}`, pageWidth - margin - 5, yPos + 7, { align: 'right' });
      }

      // Footer
      yPos = doc.internal.pageSize.height - 15;
      doc.setFillColor(30, 176, 83);
      doc.rect(0, yPos, pageWidth / 3, 5, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(pageWidth / 3, yPos, pageWidth / 3, 5, 'F');
      doc.setFillColor(0, 114, 198);
      doc.rect((pageWidth / 3) * 2, yPos, pageWidth / 3, 5, 'F');

      doc.save(`${reportType.replace(/\s+/g, '_')}_${dateRange.label.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Export failed", error.message);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      let csvContent = "";
      
      if (reportType === "Profit & Loss Statement") {
        csvContent = `${organisation?.name || 'Organisation'} - Profit & Loss Statement\n`;
        csvContent += `Period: ${dateRange.label}\n`;
        csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        csvContent += `REVENUE\n`;
        csvContent += `Sales Revenue,Le ${reportData.revenue.salesRevenue.toLocaleString()}\n`;
        csvContent += `Transport Revenue,Le ${reportData.revenue.transportRevenue.toLocaleString()}\n`;
        csvContent += `Contract Revenue,Le ${reportData.revenue.contractRevenue.toLocaleString()}\n`;
        csvContent += `Other Revenue,Le ${reportData.revenue.otherRevenue.toLocaleString()}\n`;
        csvContent += `Total Revenue,Le ${reportData.revenue.totalRevenue.toLocaleString()}\n\n`;
        
        csvContent += `EXPENSES\n`;
        csvContent += `Recorded Expenses,Le ${reportData.expenses.recordedExpenses.toLocaleString()}\n`;
        csvContent += `Fuel Costs,Le ${reportData.expenses.fuelCosts.toLocaleString()}\n`;
        csvContent += `Trip Expenses,Le ${reportData.expenses.tripOtherCosts.toLocaleString()}\n`;
        csvContent += `Contract Expenses,Le ${reportData.expenses.contractExpenses.toLocaleString()}\n`;
        csvContent += `Maintenance,Le ${reportData.expenses.maintenanceCosts.toLocaleString()}\n`;
        csvContent += `Total Expenses,Le ${reportData.expenses.totalExpenses.toLocaleString()}\n\n`;
        
        csvContent += `NET PROFIT,Le ${reportData.netProfit.toLocaleString()}\n`;
        csvContent += `Profit Margin,${reportData.profitMargin.toFixed(1)}%\n`;
      } else if (reportType === "Balance Sheet") {
        csvContent = `${organisation?.name || 'Organisation'} - Balance Sheet\n`;
        csvContent += `Period: ${dateRange.label}\n`;
        csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        csvContent += `ASSETS\n`;
        csvContent += `Cash on Hand,Le ${reportData.assets.current.cash.toLocaleString()}\n`;
        csvContent += `Bank Accounts,Le ${reportData.assets.current.bank.toLocaleString()}\n`;
        csvContent += `Accounts Receivable,Le ${reportData.assets.current.receivables.toLocaleString()}\n`;
        csvContent += `Inventory,Le ${reportData.assets.current.inventory.toLocaleString()}\n`;
        csvContent += `Total Assets,Le ${reportData.assets.total.toLocaleString()}\n\n`;
        
        csvContent += `LIABILITIES\n`;
        csvContent += `Accounts Payable,Le ${reportData.liabilities.current.payables.toLocaleString()}\n`;
        csvContent += `Total Liabilities,Le ${reportData.liabilities.total.toLocaleString()}\n\n`;
        
        csvContent += `EQUITY\n`;
        csvContent += `Owner Contributions,Le ${reportData.equity.contributions.toLocaleString()}\n`;
        csvContent += `Retained Earnings,Le ${reportData.equity.retained.toLocaleString()}\n`;
        csvContent += `Total Equity,Le ${reportData.equity.total.toLocaleString()}\n`;
      } else if (reportType === "Cash Flow Statement") {
        csvContent = `${organisation?.name || 'Organisation'} - Cash Flow Statement\n`;
        csvContent += `Period: ${dateRange.label}\n`;
        csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        csvContent += `OPERATING ACTIVITIES\n`;
        csvContent += `Cash from Sales,Le ${reportData.operating.inflows.sales.toLocaleString()}\n`;
        csvContent += `Cash from Transport,Le ${reportData.operating.inflows.transport.toLocaleString()}\n`;
        csvContent += `Payments to Suppliers,-Le ${reportData.operating.outflows.suppliers.toLocaleString()}\n`;
        csvContent += `Net Cash from Operating,Le ${reportData.operating.net.toLocaleString()}\n\n`;
        
        csvContent += `FINANCING ACTIVITIES\n`;
        csvContent += `Owner Investments,Le ${reportData.financing.inflows.investments.toLocaleString()}\n`;
        csvContent += `Loans,Le ${reportData.financing.inflows.loans.toLocaleString()}\n`;
        csvContent += `Net Cash from Financing,Le ${reportData.financing.net.toLocaleString()}\n\n`;
        
        csvContent += `SUMMARY\n`;
        csvContent += `Cash Beginning,Le ${reportData.summary.beginning.toLocaleString()}\n`;
        csvContent += `Net Change,Le ${reportData.summary.netChange.toLocaleString()}\n`;
        csvContent += `Cash Ending,Le ${reportData.summary.ending.toLocaleString()}\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${reportType.replace(/\s+/g, '_')}_${dateRange.label.replace(/\s+/g, '_')}.csv`;
      link.click();
      
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Export failed", error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className="border-[#0072C6] text-[#0072C6] hover:bg-[#0072C6]/10"
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          <span>PDF Document</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <TableIcon className="w-4 h-4 mr-2 text-green-600" />
          <span>CSV Spreadsheet</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}