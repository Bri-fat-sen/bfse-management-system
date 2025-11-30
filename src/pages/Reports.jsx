import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  FileText, Download, Printer, Plus, Search, Filter, BarChart3, 
  TrendingUp, DollarSign, Users, Package, Truck, Calendar, Star,
  Play, Edit, Trash2, Copy, MoreVertical, Clock, Share2, Mail,
  ChevronRight, FileSpreadsheet, PieChart, Building2, Briefcase,
  AlertTriangle, CheckCircle, Eye, Layers
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import ReportBuilder from "@/components/reports/ReportBuilder";
import ConsolidatedReportPrint from "@/components/reports/ConsolidatedReportPrint";
import QuickReportCards from "@/components/reports/QuickReportCards";

const REPORT_CATEGORIES = [
  { id: "all", label: "All Reports", icon: Layers },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "hr", label: "HR & Payroll", icon: Users },
  { id: "transport", label: "Transport", icon: Truck },
];

const QUICK_REPORTS = [
  { id: "daily_sales", name: "Daily Sales Summary", category: "sales", icon: TrendingUp, color: "green" },
  { id: "monthly_revenue", name: "Monthly Revenue", category: "financial", icon: DollarSign, color: "blue" },
  { id: "inventory_status", name: "Inventory Status", category: "inventory", icon: Package, color: "purple" },
  { id: "payroll_summary", name: "Payroll Summary", category: "hr", icon: Users, color: "orange" },
  { id: "transport_trips", name: "Transport Trips", category: "transport", icon: Truck, color: "cyan" },
  { id: "expense_report", name: "Expense Report", category: "financial", icon: Briefcase, color: "red" },
  { id: "profit_loss", name: "Profit & Loss", category: "financial", icon: PieChart, color: "indigo" },
  { id: "employee_attendance", name: "Attendance Report", category: "hr", icon: Clock, color: "amber" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showConsolidatedPrint, setShowConsolidatedPrint] = useState(false);
  const [selectedReportsForPrint, setSelectedReportsForPrint] = useState([]);
  const [dateRange, setDateRange] = useState("this_month");
  const [customDateStart, setCustomDateStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customDateEnd, setCustomDateEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const queryClient = useQueryClient();

  // Fetch user and organization data
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employees[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const currentOrg = organisation?.[0];

  // Fetch saved reports
  const { data: savedReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['savedReports', orgId],
    queryFn: () => base44.entities.SavedReport.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Fetch data for reports
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', orgId],
    queryFn: () => base44.entities.Vehicle.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // Mutations
  const createReportMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedReport.create({
      ...data,
      organisation_id: orgId,
      created_by_id: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      setShowBuilder(false);
      toast.success("Report created successfully");
    }
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      setShowBuilder(false);
      setEditingReport(null);
      toast.success("Report updated successfully");
    }
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      toast.success("Report deleted");
    }
  });

  // Filter reports
  const filteredReports = useMemo(() => {
    return savedReports.filter(report => {
      const matchesCategory = selectedCategory === "all" || report.report_type === selectedCategory;
      const matchesSearch = !searchQuery || 
        report.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [savedReports, selectedCategory, searchQuery]);

  const favoriteReports = savedReports.filter(r => r.is_favorite);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const yearStart = startOfYear(now);

    const thisMonthSales = sales.filter(s => new Date(s.created_date) >= monthStart);
    const thisMonthRevenue = thisMonthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    
    const thisMonthExpenses = expenses.filter(e => new Date(e.date || e.created_date) >= monthStart);
    const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const thisMonthPayrolls = payrolls.filter(p => new Date(p.period_end) >= monthStart && p.status === 'paid');
    const totalPayroll = thisMonthPayrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0);

    const activeProducts = products.filter(p => p.is_active);
    const lowStockProducts = products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10));

    return {
      monthlyRevenue: thisMonthRevenue,
      monthlyExpenses: totalExpenses,
      monthlyPayroll: totalPayroll,
      netProfit: thisMonthRevenue - totalExpenses,
      totalProducts: activeProducts.length,
      lowStockCount: lowStockProducts.length,
      totalEmployees: allEmployees.filter(e => e.status === 'active').length,
      totalTrips: trips.filter(t => new Date(t.date) >= monthStart).length,
    };
  }, [sales, expenses, payrolls, products, allEmployees, trips]);

  const handleSaveReport = (reportData) => {
    if (editingReport) {
      updateReportMutation.mutate({ id: editingReport.id, data: reportData });
    } else {
      createReportMutation.mutate(reportData);
    }
  };

  const handleToggleFavorite = async (report) => {
    await base44.entities.SavedReport.update(report.id, { is_favorite: !report.is_favorite });
    queryClient.invalidateQueries({ queryKey: ['savedReports'] });
  };

  const handleDuplicate = async (report) => {
    const { id, created_date, updated_date, ...reportData } = report;
    await base44.entities.SavedReport.create({
      ...reportData,
      name: `${report.name} (Copy)`,
      is_favorite: false
    });
    queryClient.invalidateQueries({ queryKey: ['savedReports'] });
    toast.success("Report duplicated");
  };

  const toggleReportForPrint = (reportId) => {
    setSelectedReportsForPrint(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectAllForPrint = () => {
    if (selectedReportsForPrint.length === QUICK_REPORTS.length) {
      setSelectedReportsForPrint([]);
    } else {
      setSelectedReportsForPrint(QUICK_REPORTS.map(r => r.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#1EB053]" />
            Reports Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">Generate, customize, and export business reports</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowConsolidatedPrint(true)}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Consolidated Print</span>
          </Button>
          <Button 
            onClick={() => { setEditingReport(null); setShowBuilder(true); }}
            className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Report</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Revenue</p>
                <p className="text-2xl font-bold text-[#1EB053]">SLE {summaryStats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#1EB053]/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Net Profit</p>
                <p className={`text-2xl font-bold ${summaryStats.netProfit >= 0 ? 'text-[#1EB053]' : 'text-red-500'}`}>
                  SLE {summaryStats.netProfit.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#0072C6]/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Active Employees</p>
                <p className="text-2xl font-bold text-purple-600">{summaryStats.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.lowStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="quick" className="gap-2">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Quick</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Scheduled</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Favorite Reports */}
          {favoriteReports.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Favorite Reports
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoriteReports.slice(0, 3).map(report => (
                  <ReportCard 
                    key={report.id} 
                    report={report}
                    onEdit={() => { setEditingReport(report); setShowBuilder(true); }}
                    onDelete={() => deleteReportMutation.mutate(report.id)}
                    onDuplicate={() => handleDuplicate(report)}
                    onToggleFavorite={() => handleToggleFavorite(report)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Report Cards */}
          <QuickReportCards 
            organisation={currentOrg}
            sales={sales}
            expenses={expenses}
            payrolls={payrolls}
            trips={trips}
            products={products}
            employees={allEmployees}
            dateRange={dateRange}
            customDateStart={customDateStart}
            customDateEnd={customDateEnd}
          />
        </TabsContent>

        {/* Quick Reports Tab */}
        <TabsContent value="quick" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              {dateRange === 'custom' && (
                <>
                  <Input 
                    type="date" 
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className="w-36"
                  />
                  <Input 
                    type="date" 
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className="w-36"
                  />
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllForPrint}>
                <Checkbox checked={selectedReportsForPrint.length === QUICK_REPORTS.length} className="mr-2" />
                Select All
              </Button>
              <Button 
                size="sm" 
                disabled={selectedReportsForPrint.length === 0}
                onClick={() => setShowConsolidatedPrint(true)}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Selected ({selectedReportsForPrint.length})
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {QUICK_REPORTS.map(report => (
              <QuickReportItem 
                key={report.id}
                report={report}
                isSelected={selectedReportsForPrint.includes(report.id)}
                onToggleSelect={() => toggleReportForPrint(report.id)}
                organisation={currentOrg}
                sales={sales}
                expenses={expenses}
                payrolls={payrolls}
                trips={trips}
                products={products}
                employees={allEmployees}
              />
            ))}
          </div>
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="saved" className="space-y-4">
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
            <div className="flex gap-2 overflow-x-auto pb-2">
              {REPORT_CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-2 whitespace-nowrap"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved reports found</p>
              <Button 
                variant="link" 
                onClick={() => { setEditingReport(null); setShowBuilder(true); }}
              >
                Create your first report
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map(report => (
                <ReportCard 
                  key={report.id} 
                  report={report}
                  onEdit={() => { setEditingReport(report); setShowBuilder(true); }}
                  onDelete={() => deleteReportMutation.mutate(report.id)}
                  onDuplicate={() => handleDuplicate(report)}
                  onToggleFavorite={() => handleToggleFavorite(report)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          {savedReports.filter(r => r.schedule?.enabled).length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No scheduled reports</p>
              <p className="text-sm text-gray-400">Create a report and enable scheduling to automate delivery</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedReports.filter(r => r.schedule?.enabled).map(report => (
                <Card key={report.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-gray-500">
                          {report.schedule.frequency} at {report.schedule.time}
                          {report.schedule.recipients?.length > 0 && (
                            <span> • {report.schedule.recipients.length} recipients</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{report.schedule.frequency}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setEditingReport(report); setShowBuilder(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Report Builder Sheet */}
      <Sheet open={showBuilder} onOpenChange={setShowBuilder}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingReport ? "Edit Report" : "Create New Report"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ReportBuilder
              report={editingReport}
              onSave={handleSaveReport}
              onCancel={() => { setShowBuilder(false); setEditingReport(null); }}
              employees={allEmployees}
              warehouses={warehouses}
              vehicles={vehicles}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Consolidated Print Dialog */}
      <Dialog open={showConsolidatedPrint} onOpenChange={setShowConsolidatedPrint}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Consolidated Report Print
            </DialogTitle>
          </DialogHeader>
          <ConsolidatedReportPrint
            organisation={currentOrg}
            selectedReports={selectedReportsForPrint}
            allReports={QUICK_REPORTS}
            sales={sales}
            expenses={expenses}
            payrolls={payrolls}
            trips={trips}
            products={products}
            employees={allEmployees}
            dateRange={dateRange}
            customDateStart={customDateStart}
            customDateEnd={customDateEnd}
            onClose={() => setShowConsolidatedPrint(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Report Card Component
function ReportCard({ report, onEdit, onDelete, onDuplicate, onToggleFavorite }) {
  const typeColors = {
    sales: "bg-green-100 text-green-800 border-green-200",
    inventory: "bg-blue-100 text-blue-800 border-blue-200",
    payroll: "bg-purple-100 text-purple-800 border-purple-200",
    transport: "bg-orange-100 text-orange-800 border-orange-200",
    custom: "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{report.name}</h3>
              {report.is_favorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>
            <Badge className={typeColors[report.report_type] || typeColors.custom}>
              {report.report_type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFavorite}>
                {report.is_favorite ? (
                  <><Star className="w-4 h-4 mr-2" />Remove Favorite</>
                ) : (
                  <><Star className="w-4 h-4 mr-2" />Add to Favorites</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {report.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{report.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {report.created_date && format(new Date(report.created_date), "MMM d, yyyy")}
          {report.schedule?.enabled && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Clock className="w-3 h-3" />
              Scheduled
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Report Item Component
function QuickReportItem({ report, isSelected, onToggleSelect, organisation, sales, expenses, payrolls, trips, products, employees }) {
  const colorClasses = {
    green: "bg-green-50 border-green-200 hover:bg-green-100",
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    cyan: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
    red: "bg-red-50 border-red-200 hover:bg-red-100",
    indigo: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    amber: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  };

  const iconColors = {
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    cyan: "text-cyan-600",
    red: "text-red-600",
    indigo: "text-indigo-600",
    amber: "text-amber-600",
  };

  const Icon = report.icon;

  return (
    <Card 
      className={`cursor-pointer transition-all ${colorClasses[report.color]} ${isSelected ? 'ring-2 ring-[#1EB053]' : ''}`}
      onClick={onToggleSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${iconColors[report.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <Checkbox checked={isSelected} />
        </div>
        <h4 className="font-semibold text-sm">{report.name}</h4>
        <p className="text-xs text-gray-500 capitalize mt-1">{report.category}</p>
      </CardContent>
    </Card>
  );
}