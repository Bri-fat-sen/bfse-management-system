import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  BookOpen,
  UserMinus,
  Filter,
  Download,
  RefreshCw,
  Package,
  Truck,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, parseISO, isWithinInterval } from "date-fns";

import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatCard from "@/components/ui/StatCard";
import ReportBuilder from "@/components/reports/ReportBuilder";
import ReportViewer from "@/components/reports/ReportViewer";
import ReportsList from "@/components/reports/ReportsList";
import SendReportEmailDialog from "@/components/reports/SendReportEmailDialog";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import {
  GlowLineChart,
  ColorfulBarChart,
  GradientBarChart,
  DonutChart,
  AdvancedRadarChart,
  ProgressRing,
  SL_COLORS
} from "@/components/charts/AdvancedCharts";

const COLORS = SL_COLORS.chart;

const SKILL_LEVELS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

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
  const [mainTab, setMainTab] = useState("analytics");
  const [reportsSubTab, setReportsSubTab] = useState("all");
  const [hrSubTab, setHrSubTab] = useState("performance");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [deleteReport, setDeleteReport] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // HR Analytics filters
  const [department, setDepartment] = useState("all");
  const [role, setRole] = useState("all");
  const [dateRange, setDateRange] = useState("12");

  // Fetch current user and employee
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: employee } = useQuery({
    queryKey: ["employee", user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch all data
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ["savedReports", orgId],
    queryFn: () => base44.entities.SavedReport.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

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

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['allSales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['allExpenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 200),
    enabled: !!orgId,
  });

  const { data: truckContracts = [] } = useQuery({
    queryKey: ['truckContracts', orgId],
    queryFn: () => base44.entities.TruckContract.filter({ organisation_id: orgId }, '-contract_date', 200),
    enabled: !!orgId,
  });

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['vehicleMaintenance', orgId],
    queryFn: () => base44.entities.VehicleMaintenance.filter({ organisation_id: orgId }, '-date_performed', 200),
    enabled: !!orgId,
  });

  const { data: performanceReviews = [] } = useQuery({
    queryKey: ['allReviews', orgId],
    queryFn: () => base44.entities.PerformanceReview.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Report mutations
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

  // HR Analytics calculations
  const dateRangeFilter = useMemo(() => {
    const months = parseInt(dateRange);
    const end = new Date();
    const start = subMonths(end, months);
    return { start, end };
  }, [dateRange]);

  const departments = useMemo(() => {
    return [...new Set(allEmployees.map(e => e.department).filter(Boolean))];
  }, [allEmployees]);

  const roles = useMemo(() => {
    return [...new Set(allEmployees.map(e => e.role).filter(Boolean))];
  }, [allEmployees]);

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp => {
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [allEmployees, department, role]);

  const filteredReviews = useMemo(() => {
    return performanceReviews.filter(review => {
      if (!review.review_date) return false;
      const reviewDate = parseISO(review.review_date);
      if (!isWithinInterval(reviewDate, { start: dateRangeFilter.start, end: dateRangeFilter.end })) return false;
      
      const emp = allEmployees.find(e => e.id === review.employee_id);
      if (!emp) return false;
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [performanceReviews, allEmployees, department, role, dateRangeFilter]);

  const hrMetrics = useMemo(() => {
    const total = filteredEmployees.length;
    const terminated = filteredEmployees.filter(e => e.status === 'terminated').length;
    const turnoverRate = total > 0 ? ((terminated / total) * 100).toFixed(1) : 0;

    const reviewsWithRating = filteredReviews.filter(r => r.overall_rating);
    const avgRating = reviewsWithRating.length > 0
      ? (reviewsWithRating.reduce((sum, r) => sum + r.overall_rating, 0) / reviewsWithRating.length).toFixed(2)
      : 0;

    const employeesWithTraining = filteredEmployees.filter(e => e.training_history?.length > 0);
    const trainingRate = total > 0 ? ((employeesWithTraining.length / total) * 100).toFixed(1) : 0;

    const totalCerts = filteredEmployees.reduce((sum, e) => sum + (e.certifications?.length || 0), 0);

    return { total, turnoverRate, avgRating, trainingRate, totalCerts };
  }, [filteredEmployees, filteredReviews]);

  const performanceTrend = useMemo(() => {
    const monthlyData = {};
    
    for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const key = format(month, 'MMM yyyy');
      monthlyData[key] = { month: key, avgRating: 0, count: 0, total: 0 };
    }

    filteredReviews.forEach(review => {
      if (!review.review_date || !review.overall_rating) return;
      const month = format(parseISO(review.review_date), 'MMM yyyy');
      if (monthlyData[month]) {
        monthlyData[month].total += review.overall_rating;
        monthlyData[month].count++;
      }
    });

    return Object.values(monthlyData).map(m => ({
      ...m,
      avgRating: m.count > 0 ? (m.total / m.count).toFixed(2) : null
    }));
  }, [filteredReviews, dateRange]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    filteredReviews.forEach(review => {
      if (review.overall_rating) {
        const rounded = Math.round(review.overall_rating);
        distribution[rounded]++;
      }
    });

    return Object.entries(distribution).map(([rating, count]) => ({
      rating: `${rating} Star`,
      count,
      fill: COLORS[parseInt(rating) - 1]
    }));
  }, [filteredReviews]);

  const departmentPerformance = useMemo(() => {
    const deptData = {};
    
    filteredReviews.forEach(review => {
      const emp = allEmployees.find(e => e.id === review.employee_id);
      if (!emp?.department || !review.overall_rating) return;
      
      if (!deptData[emp.department]) {
        deptData[emp.department] = { department: emp.department, total: 0, count: 0 };
      }
      deptData[emp.department].total += review.overall_rating;
      deptData[emp.department].count++;
    });

    return Object.values(deptData).map(d => ({
      ...d,
      avgRating: (d.total / d.count).toFixed(2)
    }));
  }, [filteredReviews, allEmployees]);

  const trainingByDepartment = useMemo(() => {
    const deptData = {};
    
    filteredEmployees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!deptData[dept]) {
        deptData[dept] = { department: dept, trained: 0, total: 0 };
      }
      deptData[dept].total++;
      if (emp.training_history?.length > 0) {
        deptData[dept].trained++;
      }
    });

    return Object.values(deptData).map(d => ({
      ...d,
      rate: ((d.trained / d.total) * 100).toFixed(0)
    }));
  }, [filteredEmployees]);

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

    switch (reportsSubTab) {
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
  }, [reports, searchQuery, reportsSubTab]);

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
          const [prods, stockLevels] = await Promise.all([
            base44.entities.Product.filter(filter),
            base44.entities.StockLevel.filter(filter)
          ]);
          data = prods.map(p => {
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

      if (start && end) {
        data = data.filter(item => {
          const itemDate = new Date(item.created_date || item.date || item.period_start);
          return itemDate >= start && itemDate <= end;
        });
      }

      if (report.filters?.employee_ids?.length) {
        data = data.filter(item => report.filters.employee_ids.includes(item.employee_id));
      }

      if (report.filters?.warehouse_ids?.length) {
        data = data.filter(item => report.filters.warehouse_ids.includes(item.warehouse_id));
      }

      if (report.filters?.sale_types?.length) {
        data = data.filter(item => report.filters.sale_types.includes(item.sale_type));
      }

      setReportData(data);
    } catch (error) {
      toast.error("Failed to load report data");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const exportReport = async (fmt) => {
    if (!viewingReport || !reportData.length) return;

    if (fmt === "csv") {
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
    updateMutation.mutate({ id: report.id, data: { is_favorite: !report.is_favorite } });
  };

  if (!orgId || loadingSales) {
    return <LoadingSpinner message="Loading Analytics & Reports..." fullScreen={true} />;
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
        title="Analytics & Reports"
        subtitle="Business intelligence, HR insights, and custom reports"
        icon={<BarChart3 className="w-6 h-6" />}
        actions={
          <Button onClick={() => setShowBuilder(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        }
      />

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" />
            Business Analytics
          </TabsTrigger>
          <TabsTrigger value="hr" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Users className="w-4 h-4" />
            HR Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <FileText className="w-4 h-4" />
            Custom Reports
          </TabsTrigger>
        </TabsList>

        {/* Business Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard
            sales={sales}
            expenses={expenses}
            products={products}
            employees={allEmployees}
            trips={trips}
            truckContracts={truckContracts}
            maintenanceRecords={maintenanceRecords}
          />
        </TabsContent>

        {/* HR Analytics Tab */}
        <TabsContent value="hr" className="mt-6 space-y-6">
          {/* HR Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(r => (
                      <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Last 3 Months</SelectItem>
                    <SelectItem value="6">Last 6 Months</SelectItem>
                    <SelectItem value="12">Last 12 Months</SelectItem>
                    <SelectItem value="24">Last 24 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => { setDepartment("all"); setRole("all"); setDateRange("12"); }}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* HR Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Employees" value={hrMetrics.total} icon={Users} color="blue" />
            <StatCard
              title="Turnover Rate"
              value={`${hrMetrics.turnoverRate}%`}
              icon={UserMinus}
              color="red"
              trend={parseFloat(hrMetrics.turnoverRate) < 10 ? "down" : "up"}
              trendValue={parseFloat(hrMetrics.turnoverRate) < 10 ? "Good" : "High"}
            />
            <StatCard title="Avg Performance" value={`${hrMetrics.avgRating}/5`} icon={Award} color="gold" />
            <StatCard title="Training Rate" value={`${hrMetrics.trainingRate}%`} icon={BookOpen} color="green" />
            <StatCard title="Certifications" value={hrMetrics.totalCerts} icon={Award} color="purple" />
          </div>

          {/* HR Sub Tabs */}
          <Tabs value={hrSubTab} onValueChange={setHrSubTab} className="space-y-4">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
                Performance
              </TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
                Training
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#0072C6]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Performance Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <GlowLineChart 
                      data={performanceTrend}
                      xKey="month"
                      height={300}
                      lines={[{ dataKey: "avgRating", name: "Avg Rating", color: "#1EB053" }]}
                      formatter={(v) => `${v}/5`}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#D4AF37]/5 to-[#F59E0B]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F59E0B]">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Rating Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ColorfulBarChart 
                      data={ratingDistribution}
                      dataKey="count"
                      xKey="rating"
                      height={300}
                      formatter={(v) => `${v} reviews`}
                    />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#6366F1]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#6366F1]">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Performance by Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <GradientBarChart 
                      data={departmentPerformance}
                      dataKey="avgRating"
                      xKey="department"
                      height={300}
                      horizontal={true}
                      formatter={(v) => `${v}/5 rating`}
                      barSize={24}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#10B981]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#10B981]">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      Training by Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ColorfulBarChart 
                      data={trainingByDepartment}
                      dataKey="trained"
                      xKey="department"
                      height={300}
                      formatter={(v) => `${v} trained`}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#6366F1]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#6366F1]">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Overall Training Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <DonutChart 
                      data={[
                        { name: 'Trained', value: filteredEmployees.filter(e => e.training_history?.length > 0).length },
                        { name: 'Not Trained', value: filteredEmployees.filter(e => !e.training_history?.length).length }
                      ]}
                      height={300}
                      innerRadius={70}
                      outerRadius={110}
                      colors={['#1EB053', '#E5E7EB']}
                      centerValue={`${hrMetrics.trainingRate}%`}
                      centerLabel="Trained"
                    />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#D4AF37]/5 to-[#F59E0B]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F59E0B]">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Certification Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-[#1EB053]/10 to-[#0072C6]/10 rounded-2xl p-6 text-center">
                        <ProgressRing value={hrMetrics.totalCerts} max={hrMetrics.total * 2 || 1} size={100} strokeWidth={8} color="#1EB053" secondaryColor="#0072C6" />
                        <div className="text-3xl font-bold text-[#1EB053] mt-4">{hrMetrics.totalCerts}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Certifications</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#0072C6]/10 to-[#9333EA]/10 rounded-2xl p-6 text-center">
                        <ProgressRing value={filteredEmployees.filter(e => e.certifications?.length > 0).length} max={hrMetrics.total || 1} size={100} strokeWidth={8} color="#0072C6" secondaryColor="#9333EA" />
                        <div className="text-3xl font-bold text-[#0072C6] mt-4">{filteredEmployees.filter(e => e.certifications?.length > 0).length}</div>
                        <div className="text-sm text-gray-600 mt-1">Certified Employees</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#F59E0B]/10 rounded-2xl p-6 text-center">
                        <ProgressRing value={hrMetrics.total > 0 ? (filteredEmployees.filter(e => e.certifications?.length > 0).length / hrMetrics.total) * 100 : 0} max={100} size={100} strokeWidth={8} color="#D4AF37" secondaryColor="#F59E0B" />
                        <div className="text-3xl font-bold text-[#D4AF37] mt-4">
                          {hrMetrics.total > 0 ? ((filteredEmployees.filter(e => e.certifications?.length > 0).length / hrMetrics.total) * 100).toFixed(0) : 0}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Certification Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="reports" className="mt-6 space-y-6">
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

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Reports Sub Tabs */}
          <Tabs value={reportsSubTab} onValueChange={setReportsSubTab}>
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>

            <TabsContent value={reportsSubTab} className="mt-6">
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