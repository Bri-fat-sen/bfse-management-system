import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer, Eye, Truck } from "lucide-react";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateUnifiedPDF, printUnifiedPDF } from "@/components/exports/UnifiedPDFStyles";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TripReportExport({ trips = [], routes = [], vehicles = [], organisation }) {
  const [showPreview, setShowPreview] = useState(false);
  const primaryColor = organisation?.primary_color || '#1EB053';
  const secondaryColor = organisation?.secondary_color || '#0072C6';
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

    // Route breakdown
    const routeBreakdown = {};
    trips.forEach(t => {
      const route = t.route_name || 'Unknown Route';
      if (!routeBreakdown[route]) routeBreakdown[route] = 0;
      routeBreakdown[route] += t.total_revenue || 0;
    });

    const sections = [
      {
        title: 'Revenue by Route',
        icon: '🛣️',
        breakdown: routeBreakdown
      },
      {
        title: 'Trip Records',
        icon: '🚐',
        table: {
          columns: ['Date', 'Route', 'Vehicle', 'Driver', 'Passengers', 'Revenue', 'Fuel', 'Net (SLE)', 'Status'],
          rows: [
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
          ]
        }
      }
    ];

    const html = generateUnifiedPDF({
      documentType: 'report',
      title: 'Transport Trip Report',
      organisation,
      infoBar: [{ label: 'Generated', value: format(new Date(), 'MMMM d, yyyy') }],
      summaryCards,
      sections
    });

    printUnifiedPDF(html, 'trip-report.pdf');
  };

  const getPreviewHTML = () => {
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
        columns: ['Date', 'Route', 'Vehicle', 'Driver', 'Passengers', 'Revenue', 'Fuel', 'Net', 'Status'],
        rows: trips.slice(0, 20).map(t => [
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

    return generateUnifiedPDF({
      documentType: 'report',
      title: 'Transport Trip Report',
      organisation,
      infoBar: [{ label: 'Generated', value: format(new Date(), 'MMMM d, yyyy') }],
      summaryCards,
      sections
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
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Trip Report</h2>
                <p className="text-white/80 text-sm">{trips.length} trips • SLE {netRevenue.toLocaleString()} net</p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-4">
            <iframe
              srcDoc={getPreviewHTML()}
              className="w-full h-[450px] border rounded-lg"
              title="Trip Report Preview"
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