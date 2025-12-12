import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  FileText, Download, Printer, Plus, Search, BarChart3, 
  TrendingUp, DollarSign, Users, Package, Truck, Calendar, Star,
  Play, Edit, Trash2, Copy, MoreVertical, Clock, PieChart, Briefcase,
  AlertTriangle, ChevronRight, Layers, ArrowUpRight, ArrowDownRight
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
import { downloadProfessionalReportAsPDF } from "@/components/exports/ProfessionalReportExport";

const QUICK_REPORTS = [
  { id: "daily_sales", name: "Daily Sales", category: "sales", icon: TrendingUp, color: "green", description: "Today's sales performance" },
  { id: "monthly_revenue", name: "Monthly Revenue", category: "financial", icon: DollarSign, color: "blue", description: "This month's revenue breakdown" },
  { id: "inventory_status", name: "Inventory Status", category: "inventory", icon: Package, color: "purple", description: "Stock levels overview" },
  { id: "payroll_summary", name: "Payroll Summary", category: "hr", icon: Users, color: "orange", description: "Payroll costs this period" },
  { id: "transport_trips", name: "Transport Trips", category: "transport", icon: Truck, color: "cyan", description: "Fleet activity summary" },
  { id: "expense_report", name: "Expense Report", category: "financial", icon: Briefcase, color: "red", description: "Expenses by category" },
  { id: "profit_loss", name: "Profit & Loss", category: "financial", icon: PieChart, color: "indigo", description: "Net profit analysis" },
  { id: "employee_attendance", name: "Attendance", category: "hr", icon: Clock, color: "amber", description: "Staff attendance rates" },
];

export default function Reports() {
  const [activeView, setActiveView] = useState("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showConsolidatedPrint, setShowConsolidatedPrint] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [dateRange, setDateRange] = useState("this_month");
  const [customDateStart, setCustomDateStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customDateEnd, setCustomDateEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const queryClient = useQueryClient();

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

  const { data: savedReports = [] } = useQuery({
    queryKey: ['savedReports', orgId],
    queryFn: () => base44.entities.SavedReport.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

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
      toast.success("Report created");
    }
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      setShowBuilder(false);
      setEditingReport(null);
      toast.success("Report updated");
    }
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      toast.success("Report deleted");
    }
  });

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthSales = sales.filter(s => new Date(s.created_date) >= monthStart);
    const lastMonthSales = sales.filter(s => {
      const d = new Date(s.created_date);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });
    const thisMonthRevenue = thisMonthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

    const thisMonthExpenses = expenses.filter(e => new Date(e.date || e.created_date) >= monthStart);
    const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const netProfit = thisMonthRevenue - totalExpenses;
    const lowStock = products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10)).length;

    return {
      revenue: thisMonthRevenue,
      revenueChange,
      expenses: totalExpenses,
      netProfit,
      lowStock,
      employees: allEmployees.filter(e => e.status === 'active').length,
      salesCount: thisMonthSales.length,
    };
  }, [sales, expenses, products, allEmployees]);

  const filteredReports = useMemo(() => {
    return savedReports.filter(r => 
      !searchQuery || r.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedReports, searchQuery]);

  const handleSaveReport = (data) => {
    if (editingReport) {
      updateReportMutation.mutate({ id: editingReport.id, data });
    } else {
      createReportMutation.mutate(data);
    }
  };

  const handleToggleFavorite = async (report) => {
    await base44.entities.SavedReport.update(report.id, { is_favorite: !report.is_favorite });
    queryClient.invalidateQueries({ queryKey: ['savedReports'] });
  };

  const handleDuplicate = async (report) => {
    const { id, created_date, updated_date, ...data } = report;
    await base44.entities.SavedReport.create({ ...data, name: `${report.name} (Copy)`, is_favorite: false });
    queryClient.invalidateQueries({ queryKey: ['savedReports'] });
    toast.success("Report duplicated");
  };

  const handleGenerateQuickReport = async (reportType) => {
    const reportConfig = generateQuickReportConfig(reportType, { 
      sales, expenses, payrolls, trips, products, employees: allEmployees, organisation: currentOrg, dateRange
    });
    if (reportConfig) {
      await downloadProfessionalReportAsPDF(reportConfig, reportConfig.title.replace(/\s+/g, '_'));
    }
  };

  const toggleReportSelection = (id) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Generate and export business reports</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowConsolidatedPrint(true)}
            className="gap-1.5 sm:gap-2"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Bundle</span>
          </Button>
          <Button 
            size="sm"
            onClick={() => { setEditingReport(null); setShowBuilder(true); }}
            className="gap-1.5 sm:gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Custom</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Monthly Revenue" 
          value={`SLE ${stats.revenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={TrendingUp}
          color="green"
        />
        <StatCard 
          label="Net Profit" 
          value={`SLE ${stats.netProfit.toLocaleString()}`}
          icon={DollarSign}
          color={stats.netProfit >= 0 ? "blue" : "red"}
        />
        <StatCard 
          label="Active Staff" 
          value={stats.employees}
          icon={Users}
          color="purple"
        />
        <StatCard 
          label="Low Stock Items" 
          value={stats.lowStock}
          icon={AlertTriangle}
          color="orange"
          alert={stats.lowStock > 0}
        />
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-1 sm:gap-4 border-b overflow-x-auto">
        {[
          { id: 'quick', label: 'Quick', fullLabel: 'Quick Reports', icon: Play },
          { id: 'saved', label: 'Saved', fullLabel: 'Saved Reports', icon: FileText, count: savedReports.length },
          { id: 'scheduled', label: 'Scheduled', fullLabel: 'Scheduled', icon: Clock, count: savedReports.filter(r => r.schedule?.enabled).length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === tab.id 
                ? 'border-[#1EB053] text-[#1EB053]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.fullLabel}</span>
            <span className="sm:hidden">{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Quick Reports View */}
      {activeView === 'quick' && (
        <div className="space-y-4">
          {/* Date Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-36 sm:w-44">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {dateRange === 'custom' && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Input type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} className="flex-1 sm:w-36" />
                <Input type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} className="flex-1 sm:w-36" />
              </div>
            )}
          </div>

          {/* Quick Report Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {QUICK_REPORTS.map(report => (
              <QuickReportCard 
                key={report.id} 
                report={report} 
                onGenerate={() => handleGenerateQuickReport(report.id)}
                isSelected={selectedReports.includes(report.id)}
                onToggle={() => toggleReportSelection(report.id)}
              />
            ))}
          </div>

          {selectedReports.length > 0 && (
            <div className="flex justify-center sm:justify-end">
              <Button size="sm" onClick={() => setShowConsolidatedPrint(true)} className="gap-2 w-full sm:w-auto">
                <Printer className="w-4 h-4" />
                Print {selectedReports.length} Selected
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Saved Reports View */}
      {activeView === 'saved' && (
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search saved reports..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {filteredReports.length === 0 ? (
            <EmptyState 
              icon={FileText}
              title="No saved reports"
              description="Create custom reports to save them here"
              action={<Button variant="outline" size="sm" onClick={() => setShowBuilder(true)}>Create Report</Button>}
            />
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map(report => (
                <SavedReportCard 
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
        </div>
      )}

      {/* Scheduled View */}
      {activeView === 'scheduled' && (
        <div className="space-y-3">
          {savedReports.filter(r => r.schedule?.enabled).length === 0 ? (
            <EmptyState 
              icon={Clock}
              title="No scheduled reports"
              description="Set up automatic report delivery by creating a scheduled report"
            />
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {savedReports.filter(r => r.schedule?.enabled).map(report => (
                <Card key={report.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{report.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {report.schedule.frequency} • {report.schedule.recipients?.length || 0} recipients
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px] sm:text-xs flex-shrink-0">{report.schedule.frequency}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Builder Sheet */}
      <Sheet open={showBuilder} onOpenChange={setShowBuilder}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle className="text-lg">{editingReport ? "Edit Report" : "Create Report"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 sm:mt-6">
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
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              Print Report Bundle
            </DialogTitle>
          </DialogHeader>
          <ConsolidatedReportPrint
            organisation={currentOrg}
            selectedReports={selectedReports}
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

// Stat Card Component
function StatCard({ label, value, change, icon: Icon, color, alert }) {
  const colors = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
  };

  return (
    <Card className={`overflow-hidden ${alert ? 'ring-2 ring-orange-200' : ''}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-medium truncate">{label}</p>
            <p className="text-base sm:text-xl font-bold mt-1 truncate">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(change).toFixed(1)}%
              </div>
            )}
          </div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Report Card
function QuickReportCard({ report, onGenerate, isSelected, onToggle }) {
  const colors = {
    green: 'hover:border-green-300 hover:bg-green-50',
    blue: 'hover:border-blue-300 hover:bg-blue-50',
    purple: 'hover:border-purple-300 hover:bg-purple-50',
    orange: 'hover:border-orange-300 hover:bg-orange-50',
    cyan: 'hover:border-cyan-300 hover:bg-cyan-50',
    red: 'hover:border-red-300 hover:bg-red-50',
    indigo: 'hover:border-indigo-300 hover:bg-indigo-50',
    amber: 'hover:border-amber-300 hover:bg-amber-50',
  };

  const iconBg = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  const Icon = report.icon;

  return (
    <Card className={`transition-all cursor-pointer ${colors[report.color]} ${isSelected ? 'ring-2 ring-[#1EB053] bg-green-50' : ''}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${iconBg[report.color]} flex items-center justify-center`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <Checkbox checked={isSelected} onCheckedChange={onToggle} onClick={e => e.stopPropagation()} />
        </div>
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{report.name}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1 sm:line-clamp-2">{report.description}</p>
        <Button 
          size="sm" 
          variant="ghost" 
          className="mt-2 sm:mt-3 w-full justify-between text-gray-600 hover:text-[#1EB053] h-8 text-xs sm:text-sm"
          onClick={e => { e.stopPropagation(); onGenerate(); }}
        >
          <span className="hidden sm:inline">Generate PDF</span>
          <span className="sm:hidden">PDF</span>
          <Download className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Saved Report Card
function SavedReportCard({ report, onEdit, onDelete, onDuplicate, onToggleFavorite }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="font-semibold truncate text-sm sm:text-base">{report.name}</h4>
            {report.is_favorite && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Star className="w-4 h-4 mr-2" />{report.is_favorite ? 'Unfavorite' : 'Favorite'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize">{report.report_type}</Badge>
        {report.description && <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">{report.description}</p>}
        <div className="flex items-center gap-2 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {report.created_date && format(new Date(report.created_date), "MMM d, yyyy")}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-10 sm:py-16 px-4">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      {action && <div className="mt-3 sm:mt-4">{action}</div>}
    </div>
  );
}

// Generate Quick Report Config
function generateQuickReportConfig(type, { sales, expenses, payrolls, trips, products, employees, organisation, dateRange }) {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const configs = {
    daily_sales: {
      title: 'Daily Sales Report',
      dateRange: format(now, 'MMMM d, yyyy'),
      organisation,
      summaryCards: [
        { label: 'Total Sales', value: sales.filter(s => format(new Date(s.created_date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')).length, highlight: 'blue' },
        { label: 'Revenue', value: `SLE ${sales.filter(s => format(new Date(s.created_date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')).reduce((sum, s) => sum + (s.total_amount || 0), 0).toLocaleString()}`, highlight: 'green' },
      ],
      sections: [{
        title: 'Sales Today',
        table: {
          columns: ['#', 'Customer', 'Items', 'Amount', 'Payment'],
          rows: sales.filter(s => format(new Date(s.created_date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')).slice(0, 20).map((s, i) => [
            i + 1, s.customer_name || 'Walk-in', s.items?.length || 0, `SLE ${(s.total_amount || 0).toLocaleString()}`, s.payment_method
          ])
        }
      }]
    },
    monthly_revenue: {
      title: 'Monthly Revenue Report',
      dateRange: format(now, 'MMMM yyyy'),
      organisation,
      summaryCards: [
        { label: 'Total Revenue', value: `SLE ${sales.filter(s => new Date(s.created_date) >= monthStart).reduce((sum, s) => sum + (s.total_amount || 0), 0).toLocaleString()}`, highlight: 'green' },
        { label: 'Sales Count', value: sales.filter(s => new Date(s.created_date) >= monthStart).length, highlight: 'blue' },
      ],
      sections: [{
        title: 'Revenue Breakdown',
        table: {
          columns: ['Payment Method', 'Count', 'Amount'],
          rows: ['cash', 'card', 'mobile_money', 'credit'].map(method => {
            const filtered = sales.filter(s => new Date(s.created_date) >= monthStart && s.payment_method === method);
            return [method.replace('_', ' ').toUpperCase(), filtered.length, `SLE ${filtered.reduce((sum, s) => sum + (s.total_amount || 0), 0).toLocaleString()}`];
          })
        }
      }]
    },
    inventory_status: {
      title: 'Inventory Status Report',
      dateRange: format(now, 'MMMM d, yyyy'),
      organisation,
      summaryCards: [
        { label: 'Total Products', value: products.length, highlight: 'blue' },
        { label: 'Low Stock', value: products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10)).length, highlight: 'red' },
      ],
      sections: [{
        title: 'Low Stock Items',
        table: {
          columns: ['Product', 'SKU', 'Current Stock', 'Threshold'],
          rows: products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10)).slice(0, 15).map(p => [
            p.name, p.sku || '-', p.stock_quantity || 0, p.low_stock_threshold || 10
          ])
        }
      }]
    },
    payroll_summary: {
      title: 'Payroll Summary',
      dateRange: format(now, 'MMMM yyyy'),
      organisation,
      summaryCards: [
        { label: 'Total Payroll', value: `SLE ${payrolls.filter(p => new Date(p.period_end) >= monthStart).reduce((sum, p) => sum + (p.net_pay || 0), 0).toLocaleString()}`, highlight: 'green' },
        { label: 'Employees Paid', value: payrolls.filter(p => new Date(p.period_end) >= monthStart && p.status === 'paid').length, highlight: 'blue' },
      ],
      sections: [{
        title: 'Payroll Records',
        table: {
          columns: ['Employee', 'Gross', 'Deductions', 'Net Pay', 'Status'],
          rows: payrolls.filter(p => new Date(p.period_end) >= monthStart).slice(0, 15).map(p => [
            p.employee_name || '-', `SLE ${(p.gross_pay || 0).toLocaleString()}`, `SLE ${(p.total_deductions || 0).toLocaleString()}`, `SLE ${(p.net_pay || 0).toLocaleString()}`, p.status
          ])
        }
      }]
    },
    transport_trips: {
      title: 'Transport Trips Report',
      dateRange: format(now, 'MMMM yyyy'),
      organisation,
      summaryCards: [
        { label: 'Total Trips', value: trips.filter(t => new Date(t.date) >= monthStart).length, highlight: 'blue' },
        { label: 'Revenue', value: `SLE ${trips.filter(t => new Date(t.date) >= monthStart).reduce((sum, t) => sum + (t.total_revenue || 0), 0).toLocaleString()}`, highlight: 'green' },
      ],
      sections: [{
        title: 'Trip Details',
        table: {
          columns: ['Date', 'Driver', 'Route', 'Passengers', 'Revenue'],
          rows: trips.filter(t => new Date(t.date) >= monthStart).slice(0, 15).map(t => [
            t.date, t.driver_name || '-', t.route_name || '-', t.passengers_count || 0, `SLE ${(t.total_revenue || 0).toLocaleString()}`
          ])
        }
      }]
    },
    expense_report: {
      title: 'Expense Report',
      dateRange: format(now, 'MMMM yyyy'),
      organisation,
      summaryCards: [
        { label: 'Total Expenses', value: `SLE ${expenses.filter(e => new Date(e.date || e.created_date) >= monthStart).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}`, highlight: 'red' },
      ],
      sections: [{
        title: 'Expenses by Category',
        table: {
          columns: ['Category', 'Count', 'Amount'],
          rows: [...new Set(expenses.map(e => e.category))].map(cat => {
            const filtered = expenses.filter(e => new Date(e.date || e.created_date) >= monthStart && e.category === cat);
            return [cat, filtered.length, `SLE ${filtered.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}`];
          })
        }
      }]
    },
    profit_loss: {
      title: 'Profit & Loss Statement',
      dateRange: format(now, 'MMMM yyyy'),
      organisation,
      summaryCards: (() => {
        const rev = sales.filter(s => new Date(s.created_date) >= monthStart).reduce((sum, s) => sum + (s.total_amount || 0), 0);
        const exp = expenses.filter(e => new Date(e.date || e.created_date) >= monthStart).reduce((sum, e) => sum + (e.amount || 0), 0);
        return [
          { label: 'Revenue', value: `SLE ${rev.toLocaleString()}`, highlight: 'green' },
          { label: 'Expenses', value: `SLE ${exp.toLocaleString()}`, highlight: 'red' },
          { label: 'Net Profit', value: `SLE ${(rev - exp).toLocaleString()}`, highlight: rev - exp >= 0 ? 'green' : 'red' },
        ];
      })(),
      sections: []
    },
    employee_attendance: {
      title: 'Attendance Report',
      dateRange: format(now, 'MMMM yyyy'),
      organisation,
      summaryCards: [
        { label: 'Active Employees', value: employees.filter(e => e.status === 'active').length, highlight: 'blue' },
      ],
      sections: [{
        title: 'Employee List',
        table: {
          columns: ['Name', 'Department', 'Role', 'Status'],
          rows: employees.slice(0, 20).map(e => [e.full_name, e.department || '-', e.role, e.status])
        }
      }]
    },
  };

  return configs[type];
}