import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateProfessionalReport, downloadProfessionalReportAsPDF } from "@/components/exports/ProfessionalReportExport";

export default function TripReportExport({ trips = [], routes = [], vehicles = [], organisation }) {
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Calculate summary stats
  const totalRevenue = trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalPassengers = trips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
  const totalFuelCost = trips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
  const netRevenue = trips.reduce((sum, t) => sum + (t.net_revenue || 0), 0);

  const handleExportCSV = () => {
    const columns = ['Date', 'Route', 'Vehicle', 'Driver', 'Passengers', 'Revenue', 'Fuel Cost', 'Net Revenue', 'Status'];
    const rows = trips.map(t => [
      t.date,
      t.route_name || 'N/A',
      t.vehicle_registration || 'N/A',
      t.driver_name || 'N/A',
      t.passengers_count || 0,
      t.total_revenue || 0,
      t.fuel_cost || 0,
      t.net_revenue || 0,
      t.status
    ]);
    
    exportToCSV(columns, rows, `trip-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, organisation);
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const summaryCards = [
        { label: 'Total Trips', value: trips.length.toString(), subtext: 'Completed trips' },
        { label: 'Total Passengers', value: totalPassengers.toLocaleString(), subtext: 'Passengers carried' },
        { label: 'Total Revenue', value: `SLE ${totalRevenue.toLocaleString()}`, subtext: 'Gross income' },
        { label: 'Net Revenue', value: `SLE ${netRevenue.toLocaleString()}`, subtext: 'After fuel costs', highlight: netRevenue >= 0 ? 'green' : 'red' }
      ];

      const columns = ['Date', 'Route', 'Vehicle', 'Driver', 'Passengers', 'Revenue', 'Fuel', 'Net', 'Status'];
      const rows = [
        ...trips.map(t => [
          t.date ? format(new Date(t.date), 'dd MMM yyyy') : '-',
          t.route_name || 'N/A',
          t.vehicle_registration || 'N/A',
          t.driver_name || 'N/A',
          t.passengers_count || 0,
          `SLE ${(t.total_revenue || 0).toLocaleString()}`,
          `SLE ${(t.fuel_cost || 0).toLocaleString()}`,
          `SLE ${(t.net_revenue || 0).toLocaleString()}`,
          t.status || 'completed'
        ]),
        ['GRAND TOTAL', '', '', '', totalPassengers, `SLE ${totalRevenue.toLocaleString()}`, `SLE ${totalFuelCost.toLocaleString()}`, `SLE ${netRevenue.toLocaleString()}`, '']
      ];

      const response = await base44.functions.invoke('generateDocumentPDF', {
        documentType: 'report',
        data: {
          title: 'Transport Trip Report',
          dateRange: format(new Date(), 'MMMM d, yyyy'),
          summaryCards,
          sections: [{
            title: 'Trip Records',
            table: { columns, rows }
          }]
        },
        organisation
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Trip-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch (error) {
      console.error('PDF error:', error);
      // Fallback
      const html = generateProfessionalReport({
        title: 'Transport Trip Report',
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