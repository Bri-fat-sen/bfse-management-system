import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";

export default function TripReportExport({ trips = [], routes = [], vehicles = [], organisation }) {
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

  const handlePrint = () => {
    const summaryCards = [
      { label: 'Total Trips', value: trips.length.toString() },
      { label: 'Total Passengers', value: totalPassengers.toLocaleString() },
      { label: 'Total Revenue', value: `SLE ${totalRevenue.toLocaleString()}` },
      { label: 'Net Revenue', value: `SLE ${netRevenue.toLocaleString()}`, highlight: netRevenue >= 0 ? 'green' : 'red' }
    ];

    const sections = [{
      title: 'Trip Records',
      icon: '🚐',
      table: {
        columns: ['Date', 'Route', 'Vehicle', 'Driver', 'Passengers', 'Revenue', 'Fuel', 'Net (SLE)', 'Status'],
        rows: trips.map(t => [
          t.date ? format(new Date(t.date), 'dd MMM yyyy') : '-',
          t.route_name || 'N/A',
          t.vehicle_registration || 'N/A',
          t.driver_name || 'N/A',
          t.passengers_count || 0,
          `SLE ${(t.total_revenue || 0).toLocaleString()}`,
          `SLE ${(t.fuel_cost || 0).toLocaleString()}`,
          `SLE ${(t.net_revenue || 0).toLocaleString()}`,
          t.status || 'completed'
        ])
      }
    }];

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: 'Transport Trip Report',
      organisation: organisation,
      summaryCards: summaryCards,
      sections: sections
    });

    printUnifiedPDF(html, `trip-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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