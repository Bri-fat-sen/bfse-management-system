import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateProfessionalReport, printProfessionalReport } from "@/components/exports/ProfessionalReportGenerator";

export default function TripReportExport({ trips = [], routes = [], vehicles = [], organisation }) {
  // Calculate summary stats
  const totalRevenue = trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalPassengers = trips.reduce((sum, t) => sum + (t.passengers_count || 0), 0);
  const totalFuelCost = trips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
  const netRevenue = trips.reduce((sum, t) => sum + (t.net_revenue || 0), 0);
  const avgPassengers = trips.length > 0 ? Math.round(totalPassengers / trips.length) : 0;
  const profitMargin = totalRevenue > 0 ? Math.round((netRevenue / totalRevenue) * 100) : 0;

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
    const keyMetrics = [
      { icon: '🚌', label: 'Total Trips', value: trips.length.toString() },
      { icon: '👥', label: 'Passengers', value: totalPassengers.toLocaleString() },
      { icon: '💰', label: 'Revenue', value: `Le ${totalRevenue.toLocaleString()}` },
      { icon: '📈', label: 'Net Revenue', value: `Le ${netRevenue.toLocaleString()}`, trend: netRevenue >= 0 ? 'positive' : 'negative' }
    ];

    const columns = ['Date', 'Route', 'Vehicle', 'Driver', 'Passengers', 'Revenue', 'Fuel', 'Net', 'Status'];
    const rows = trips.map(t => [
      t.date ? format(new Date(t.date), 'dd MMM yyyy') : '-',
      t.route_name || 'N/A',
      t.vehicle_registration || 'N/A',
      t.driver_name || 'N/A',
      t.passengers_count || 0,
      `Le ${(t.total_revenue || 0).toLocaleString()}`,
      `Le ${(t.fuel_cost || 0).toLocaleString()}`,
      `Le ${(t.net_revenue || 0).toLocaleString()}`,
      t.status
    ]);
    rows.push(['', '', '', 'TOTALS', totalPassengers, `Le ${totalRevenue.toLocaleString()}`, `Le ${totalFuelCost.toLocaleString()}`, `Le ${netRevenue.toLocaleString()}`, '']);

    const insights = [
      `Completed ${trips.length} trips with ${totalPassengers.toLocaleString()} passengers`,
      `Average ${avgPassengers} passengers per trip`,
      `Profit margin of ${profitMargin}% after fuel costs`,
      `Total fuel expenditure: Le ${totalFuelCost.toLocaleString()}`
    ];

    const html = generateProfessionalReport({
      reportType: 'Transport Operations',
      title: 'Trip Report',
      subtitle: 'Detailed trip operations and revenue summary',
      organisation,
      dateRange: `As of ${format(new Date(), 'MMMM d, yyyy')}`,
      executiveSummary: `This report summarizes ${trips.length} transport trips. Total revenue was Le ${totalRevenue.toLocaleString()} with fuel costs of Le ${totalFuelCost.toLocaleString()}, resulting in net revenue of Le ${netRevenue.toLocaleString()} (${profitMargin}% margin).`,
      keyMetrics,
      tables: [{ title: 'Trip Details', icon: '🚌', columns, rows }],
      insights
    });

    printProfessionalReport(html);
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