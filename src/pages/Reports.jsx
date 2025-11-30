import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  FileText,
  Star,
  Clock,
  Share2,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

import PageHeader from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ReportBuilder from "@/components/reports/ReportBuilder";
import ReportViewer from "@/components/reports/ReportViewer";
import ReportsList from "@/components/reports/ReportsList";
import SendReportEmailDialog from "@/components/reports/SendReportEmailDialog";

function getDateRange(dateRange, startDate, endDate) {
  const today = new Date();
  switch (dateRange) {
    case "today":
      return { start: today, end: today };
    case "yesterday":
      const yesterday = subDays(today, 1);
      return { start: yesterday, end: yesterday };
    case "this_week":
      return { start: startOfWeek(today), end: endOfWeek(today) };
    case "last_week":
      const lastWeek = subDays(today, 7);
      return { start: startOfWeek(lastWeek), end: endOfWeek(lastWeek) };
    case "this_month":
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "last_month":
      const lastMonth = subDays(startOfMonth(today), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    case "this_quarter":
      return { start: startOfQuarter(today), end: endOfQuarter(today) };
    case "last_quarter":
      const lastQuarter = subDays(startOfQuarter(today), 1);
      return { start: startOfQuarter(lastQuarter), end: endOfQuarter(lastQuarter) };
    case "this_year":
      return { start: startOfYear(today), end: endOfYear(today) };
    case "custom":
      return { start: new Date(startDate), end: new Date(endDate) };
    default:
      return { start: startOfMonth(today), end: today };
  }
}

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [deleteReport, setDeleteReport] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Fetch current user and employee
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employees[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch saved reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["savedReports", orgId],
    queryFn: () => base44.entities.SavedReport.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Fetch reference data
  const { data: allEmployees = [] } = useQuery({
    queryKey: ["allEmployees", orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses", orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles", orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedReport.create({
      ...data,
      organisation_id: orgId,
      created_by_id: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedReports"] });
      toast.success("Report created successfully");
      setShowBuilder(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedReports"] });
      toast.success("Report updated successfully");
      setShowBuilder(false);
      setEditingReport(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedReports"] });
      toast.success("Report deleted");
      setDeleteReport(null);
    },
  });

  // Filter reports
  const filteredReports = useMemo(() => {
    let result = reports;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    switch (activeTab) {
      case "favorites":
        result = result.filter(r => r.is_favorite);
        break;
      case "scheduled":
        result = result.filter(r => r.schedule?.enabled);
        break;
      case "shared":
        result = result.filter(r => r.is_shared);
        break;
    }

    return result;
  }, [reports, searchQuery, activeTab]);

  // Run report
  const runReport = async (report) => {
    setViewingReport(report);
    setLoadingData(true);

    try {
      const { start, end } = getDateRange(
        report.filters?.date_range,
        report.filters?.start_date,
        report.filters?.end_date
      );

      let data = [];
      const filter = { organisation_id: orgId };

      switch (report.report_type) {
        case "sales":
          data = await base44.entities.Sale.filter(filter);
          break;
        case "inventory":
          const [products, stockLevels] = await Promise.all([
            base44.entities.Product.filter(filter),
            base44.entities.StockLevel.filter(filter)
          ]);
          data = products.map(p => {
            const stock = stockLevels.find(s => s.product_id === p.id);
            return { ...p, quantity: stock?.quantity || 0, warehouse_name: stock?.warehouse_name };
          });
          break;
        case "payroll":
          data = await base44.entities.Payroll.filter(filter);
          break;
        case "transport":
          data = await base44.entities.Trip.filter(filter);
          break;
      }

      // Apply date filter
      if (start && end) {
        data = data.filter(item => {
          const itemDate = new Date(item.created_date || item.date || item.period_start);
          return itemDate >= start && itemDate <= end;
        });
      }

      // Apply additional filters
      if (report.filters?.employee_ids?.length) {
        data = data.filter(item => 
          report.filters.employee_ids.includes(item.employee_id)
        );
      }

      if (report.filters?.warehouse_ids?.length) {
        data = data.filter(item => 
          report.filters.warehouse_ids.includes(item.warehouse_id)
        );
      }

      if (report.filters?.sale_types?.length) {
        data = data.filter(item => 
          report.filters.sale_types.includes(item.sale_type)
        );
      }

      setReportData(data);
    } catch (error) {
      toast.error("Failed to load report data");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  // Export report
  const exportReport = async (format) => {
    if (!viewingReport || !reportData.length) return;

    if (format === "csv") {
      const visibleColumns = viewingReport.columns?.filter(c => c.visible) || [];
      const headers = visibleColumns.map(c => c.label).join(",");
      const rows = reportData.map(row => 
        visibleColumns.map(c => `"${row[c.field] || ""}"`).join(",")
      ).join("\n");
      
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${viewingReport.name}_${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } else {
      toast.info("PDF export coming soon");
    }
  };

  // Send email
  const sendReportEmail = async ({ recipients, subject, message }) => {
    try {
      const visibleColumns = viewingReport.columns?.filter(c => c.visible) || [];
      const headers = visibleColumns.map(c => c.label).join(" | ");
      const rows = reportData.slice(0, 50).map(row => 
        visibleColumns.map(c => row[c.field] || "-").join(" | ")
      ).join("\n");

      const emailBody = `
        <h2>${viewingReport.name}</h2>
        ${message ? `<p>${message}</p>` : ""}
        <p>Report generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
        <p>Total records: ${reportData.length}</p>
        <hr/>
        <pre style="font-family: monospace; font-size: 12px; overflow-x: auto;">
${headers}
${"-".repeat(80)}
${rows}
        </pre>
        ${reportData.length > 50 ? "<p><em>Showing first 50 records...</em></p>" : ""}
      `;

      for (const recipient of recipients) {
        await base44.integrations.Core.SendEmail({
          to: recipient,
          subject,
          body: emailBody
        });
      }

      toast.success(`Report sent to ${recipients.length} recipient(s)`);
    } catch (error) {
      toast.error("Failed to send report");
      console.error(error);
    }
  };

  // Handlers
  const handleSave = (data) => {
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setShowBuilder(true);
  };

  const handleDuplicate = (report) => {
    const { id, created_date, updated_date, ...rest } = report;
    createMutation.mutate({ ...rest, name: `${report.name} (Copy)` });
  };

  const handleToggleFavorite = (report) => {
    updateMutation.mutate({ 
      id: report.id, 
      data: { is_favorite: !report.is_favorite } 
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  // Show report viewer
  if (viewingReport) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => { setViewingReport(null); setReportData([]); }}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Button>

        <ReportViewer
          report={viewingReport}
          data={reportData}
          isLoading={loadingData}
          onRefresh={() => runReport(viewingReport)}
          onExport={exportReport}
          onSendEmail={() => setEmailDialogOpen(true)}
        />

        <SendReportEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          report={viewingReport}
          onSend={sendReportEmail}
          defaultRecipients={viewingReport.schedule?.recipients || []}
        />
      </div>
    );
  }

  // Show builder
  if (showBuilder) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => { setShowBuilder(false); setEditingReport(null); }}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Button>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-6">
              {editingReport ? "Edit Report" : "Create New Report"}
            </h2>
            <ReportBuilder
              report={editingReport}
              onSave={handleSave}
              onCancel={() => { setShowBuilder(false); setEditingReport(null); }}
              employees={allEmployees}
              warehouses={warehouses}
              vehicles={vehicles}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Create and manage custom reports"
        icon={<BarChart3 className="w-6 h-6" />}
        actions={
          <Button onClick={() => setShowBuilder(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="sl-card-green">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#1EB053]" />
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-gray-500">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.is_favorite).length}</p>
                <p className="text-sm text-gray-500">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.schedule?.enabled).length}</p>
                <p className="text-sm text-gray-500">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Share2 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.is_shared).length}</p>
                <p className="text-sm text-gray-500">Shared</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <ReportsList
            reports={filteredReports}
            onRun={runReport}
            onEdit={handleEdit}
            onDelete={setDeleteReport}
            onDuplicate={handleDuplicate}
            onToggleFavorite={handleToggleFavorite}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReport} onOpenChange={() => setDeleteReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteReport?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteReport.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}