import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, subDays, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  UserMinus,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  Package,
  Truck,
  ShoppingCart,
  Calendar,
  Printer,
  Save,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Clock,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import SavedReportsManager from "@/components/analytics/SavedReportsManager";
import {
  GlowLineChart,
  ColorfulBarChart,
  GradientBarChart,
  DonutChart,
  AdvancedRadarChart,
  ProgressRing,
  SL_COLORS
} from "@/components/charts/AdvancedCharts";
import { SalesCharts, ExpenseCharts, TransportCharts, ProfitLossChart } from "@/components/reports/ReportCharts";
import { 
  printSalesReport, 
  printExpenseReport, 
  printTransportReport, 
  printInventoryReport,
  printProfitLossReport,
  exportReportCSV 
} from "@/components/reports/ReportPrintExport";
import SaveReportDialog from "@/components/reports/SaveReportDialog";
import AIInsightsPanel from "@/components/ai/AIInsightsPanel";
import AIReportSummary from "@/components/ai/AIReportSummary";

const COLORS = SL_COLORS.chart;

const SKILL_LEVELS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

export default function Analytics() {
  const [mainTab, setMainTab] = useState("overview");
  const [hrTab, setHrTab] = useState("performance");
  const [reportTab, setReportTab] = useState("sales");
  
  // HR Filters
  const [department, setDepartment] = useState("all");
  const [role, setRole] = useState("all");
  const [dateRange, setDateRange] = useState("12");
  
  // Report Filters
  const [reportDateRange, setReportDateRange] = useState("this_month");
  const [showCharts, setShowCharts] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Fetch current user and employee
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  // Fetch organisation
  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  // Fetch all data
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['allSales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 1000),
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

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['allEmployees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-created_date', 500),
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

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }, '-created_date', 500),
    enabled: !!orgId,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  // HR Analytics Calculations
  const hrDateRangeFilter = useMemo(() => {
    const months = parseInt(dateRange);
    const end = new Date();
    const start = subMonths(end, months);
    return { start, end };
  }, [dateRange]);

  const departments = useMemo(() => {
    return [...new Set(employees.map(e => e.department).filter(Boolean))];
  }, [employees]);

  const roles = useMemo(() => {
    return [...new Set(employees.map(e => e.role).filter(Boolean))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [employees, department, role]);

  const filteredReviews = useMemo(() => {
    return performanceReviews.filter(review => {
      if (!review.review_date) return false;
      const reviewDate = parseISO(review.review_date);
      if (!isWithinInterval(reviewDate, { start: hrDateRangeFilter.start, end: hrDateRangeFilter.end })) return false;
      
      const emp = employees.find(e => e.id === review.employee_id);
      if (!emp) return false;
      if (department !== "all" && emp.department !== department) return false;
      if (role !== "all" && emp.role !== role) return false;
      return true;
    });
  }, [performanceReviews, employees, department, role, hrDateRangeFilter]);

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

  const skillDistribution = useMemo(() => {
    const skills = {};
    
    filteredEmployees.forEach(emp => {
      (emp.skills || []).forEach(skill => {
        if (!skills[skill.name]) {
          skills[skill.name] = { name: skill.name, count: 0, totalLevel: 0 };
        }
        skills[skill.name].count++;
        skills[skill.name].totalLevel += SKILL_LEVELS[skill.level] || 1;
      });
    });

    return Object.values(skills)
      .map(s => ({ ...s, avgLevel: (s.totalLevel / s.count).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredEmployees]);

  const departmentPerformance = useMemo(() => {
    const deptData = {};
    
    filteredReviews.forEach(review => {
      const emp = employees.find(e => e.id === review.employee_id);
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
  }, [filteredReviews, employees]);

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

  // Reports date filtering
  const getReportDateRange = useMemo(() => {
    const today = new Date();
    switch (reportDateRange) {
      case "today": return { start: today, end: today };
      case "yesterday": return { start: subDays(today, 1), end: subDays(today, 1) };
      case "this_week": return { start: startOfWeek(today), end: endOfWeek(today) };
      case "last_week": const lw = subDays(today, 7); return { start: startOfWeek(lw), end: endOfWeek(lw) };
      case "this_month": return { start: startOfMonth(today), end: endOfMonth(today) };
      case "last_month": const lm = subDays(startOfMonth(today), 1); return { start: startOfMonth(lm), end: endOfMonth(lm) };
      case "this_quarter": return { start: startOfQuarter(today), end: endOfQuarter(today) };
      case "this_year": return { start: startOfYear(today), end: endOfYear(today) };
      default: return { start: startOfMonth(today), end: today };
    }
  }, [reportDateRange]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = new Date(s.created_date);
      return saleDate >= getReportDateRange.start && saleDate <= getReportDateRange.end;
    });
  }, [sales, getReportDateRange]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const expDate = new Date(e.date || e.created_date);
      return expDate >= getReportDateRange.start && expDate <= getReportDateRange.end;
    });
  }, [expenses, getReportDateRange]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const tripDate = new Date(t.date || t.created_date);
      return tripDate >= getReportDateRange.start && tripDate <= getReportDateRange.end;
    });
  }, [trips, getReportDateRange]);

  // Report calculations
  const salesMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const avgSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    return { totalRevenue, count: filteredSales.length, avgSale };
  }, [filteredSales]);

  const expenseMetrics = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return { totalExpenses, count: filteredExpenses.length };
  }, [filteredExpenses]);

  const transportMetrics = useMemo(() => {
    const totalRevenue = filteredTrips.reduce((sum, t) => sum + (t.ticket_revenue || 0), 0);
    const totalFuel = filteredTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
    return { totalRevenue, totalFuel, count: filteredTrips.length };
  }, [filteredTrips]);

  const inventoryMetrics = useMemo(() => {
    const totalStock = stockLevels.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const lowStock = products.filter(p => {
      const stock = stockLevels.find(s => s.product_id === p.id);
      return (stock?.quantity || 0) < (p.low_stock_threshold || 10);
    }).length;
    return { totalStock, totalProducts: products.length, lowStock };
  }, [products, stockLevels]);

  const handlePrint = () => {
    const org = organisation?.[0];
    const filters = {
      start_date: getReportDateRange.start,
      end_date: getReportDateRange.end
    };
    
    // Calculate analytics for reports
    const salesAnalytics = {
      totalRevenue: salesMetrics.totalRevenue,
      totalTransactions: salesMetrics.count,
      avgTransaction: salesMetrics.avgSale,
      byChannel: [],
      byPayment: Object.entries(
        filteredSales.reduce((acc, s) => {
          const method = s.payment_method || 'cash';
          acc[method] = (acc[method] || 0) + (s.total_amount || 0);
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    };
    
    const expenseAnalytics = {
      totalExpenses: expenseMetrics.totalExpenses,
      byCategory: Object.entries(
        filteredExpenses.reduce((acc, e) => {
          const cat = e.category || 'other';
          acc[cat] = (acc[cat] || 0) + (e.amount || 0);
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    };
    
    const transportAnalytics = {
      totalRevenue: transportMetrics.totalRevenue,
      totalTrips: transportMetrics.count,
      totalFuelCost: transportMetrics.totalFuel,
      netRevenue: transportMetrics.totalRevenue - transportMetrics.totalFuel,
      totalPassengers: filteredTrips.reduce((sum, t) => sum + (t.passengers_count || 0), 0),
      byRoute: Object.entries(
        filteredTrips.reduce((acc, t) => {
          const route = t.route_name || 'Unknown';
          acc[route] = (acc[route] || 0) + (t.ticket_revenue || 0);
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    };
    
    switch (reportTab) {
      case 'sales': 
        printSalesReport({ salesAnalytics, filters, organisation: org, filteredSales }); 
        break;
      case 'expenses': 
        printExpenseReport({ expenseAnalytics, filters, organisation: org, filteredExpenses }); 
        break;
      case 'transport': 
        printTransportReport({ transportAnalytics, filters, organisation: org, filteredTrips }); 
        break;
      case 'inventory': 
        printInventoryReport({ products, organisation: org }); 
        break;
    }
  };

  const handleExportCSV = () => {
    const org = organisation?.[0];
    switch (reportTab) {
      case 'sales': exportReportCSV({ type: 'sales', data: filteredSales, organisation: org }); break;
      case 'expenses': exportReportCSV({ type: 'expenses', data: filteredExpenses, organisation: org }); break;
      case 'transport': exportReportCSV({ type: 'transport', data: filteredTrips, organisation: org }); break;
      case 'inventory': exportReportCSV({ type: 'inventory', data: products, organisation: org }); break;
    }
  };

  if (!user) {
    return <LoadingSpinner message="Loading Analytics..." subtitle="Analyzing your business data" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (loadingSales || loadingEmployees) {
    return <LoadingSpinner message="Loading Analytics..." subtitle="Analyzing your business data" fullScreen={true} />;
  }

  return (
    <ProtectedPage module="dashboard">
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        subtitle="Comprehensive business insights, HR analytics, and reports"
        icon={<BarChart3 className="w-6 h-6" />}
      />

      {/* Main Navigation Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="hr" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">HR Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Business Analytics */}
        <TabsContent value="overview" className="mt-6">
          <AnalyticsDashboard
            sales={sales}
            expenses={expenses}
            products={products}
            employees={employees}
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-[#0072C6]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Employees</p>
                    <p className="text-2xl font-bold text-[#0072C6]">{hrMetrics.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#0072C6]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Turnover Rate</p>
                    <p className="text-2xl font-bold text-red-500">{hrMetrics.turnoverRate}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <UserMinus className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#f59e0b]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Performance</p>
                    <p className="text-2xl font-bold text-[#f59e0b]">{hrMetrics.avgRating}/5</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#1EB053]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Training Rate</p>
                    <p className="text-2xl font-bold text-[#1EB053]">{hrMetrics.trainingRate}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#1EB053]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#8b5cf6]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Certifications</p>
                    <p className="text-2xl font-bold text-[#8b5cf6]">{hrMetrics.totalCerts}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* HR Sub-tabs */}
          <Tabs value={hrTab} onValueChange={setHrTab} className="space-y-4">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="performance" className="data-[state=active]:bg-white">Performance</TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-white">Skills</TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-white">Training</TabsTrigger>
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

            <TabsContent value="skills" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#1EB053]/5 to-[#10B981]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#10B981]">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Top Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <GradientBarChart 
                      data={skillDistribution}
                      dataKey="count"
                      xKey="name"
                      height={300}
                      horizontal={true}
                      formatter={(v) => `${v} employees`}
                      barSize={20}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-[#0072C6]/5 to-[#6366F1]/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#0072C6] to-[#6366F1]">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Skill Proficiency Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['beginner', 'intermediate', 'advanced', 'expert'].map((level, i) => {
                        const count = filteredEmployees.reduce((sum, emp) => 
                          sum + (emp.skills || []).filter(s => s.level === level).length, 0
                        );
                        const total = filteredEmployees.reduce((sum, emp) => sum + (emp.skills || []).length, 0);
                        return (
                          <div key={level} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm">
                            <ProgressRing 
                              value={count} 
                              max={total || 1} 
                              size={60} 
                              strokeWidth={5}
                              color={COLORS[i]}
                              secondaryColor={COLORS[(i + 1) % COLORS.length]}
                            />
                            <div className="text-xl font-bold mt-2" style={{ color: COLORS[i] }}>{count}</div>
                            <div className="text-xs text-gray-600 capitalize">{level}</div>
                          </div>
                        );
                      })}
                    </div>
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
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6 space-y-6">
          {/* Report Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Period:</span>
                  </div>
                  <Select value={reportDateRange} onValueChange={setReportDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="this_quarter">This Quarter</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCharts(!showCharts)}>
                    {showCharts ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showCharts ? 'Hide Charts' : 'Show Charts'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button size="sm" onClick={handlePrint} className="bg-[#1EB053]">
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Type Tabs */}
          <Tabs value={reportTab} onValueChange={setReportTab}>
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="sales" className="gap-1 data-[state=active]:bg-white">
                <ShoppingCart className="w-4 h-4" />
                Sales
              </TabsTrigger>
              <TabsTrigger value="expenses" className="gap-1 data-[state=active]:bg-white">
                <DollarSign className="w-4 h-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="transport" className="gap-1 data-[state=active]:bg-white">
                <Truck className="w-4 h-4" />
                Transport
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-1 data-[state=active]:bg-white">
                <Package className="w-4 h-4" />
                Inventory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Revenue" value={`Le ${salesMetrics.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
                <StatCard title="Total Sales" value={salesMetrics.count} icon={ShoppingCart} color="blue" />
                <StatCard title="Avg Sale" value={`Le ${salesMetrics.avgSale.toLocaleString()}`} icon={TrendingUp} color="gold" />
              </div>
              <AIInsightsPanel 
                data={filteredSales.slice(0, 50)}
                type="sales"
                title="AI Sales Insights"
                orgId={orgId}
              />
              {showCharts && <SalesCharts sales={filteredSales} />}
            </TabsContent>

            <TabsContent value="expenses" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total Expenses" value={`Le ${expenseMetrics.totalExpenses.toLocaleString()}`} icon={DollarSign} color="red" />
                <StatCard title="Expense Count" value={expenseMetrics.count} icon={FileText} color="blue" />
              </div>
              <AIInsightsPanel 
                data={filteredExpenses.slice(0, 50)}
                type="expenses"
                title="AI Expense Insights"
                orgId={orgId}
              />
              {showCharts && <ExpenseCharts expenses={filteredExpenses} />}
            </TabsContent>

            <TabsContent value="transport" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Trip Revenue" value={`Le ${transportMetrics.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
                <StatCard title="Total Trips" value={transportMetrics.count} icon={Truck} color="blue" />
                <StatCard title="Fuel Costs" value={`Le ${transportMetrics.totalFuel.toLocaleString()}`} icon={TrendingDown} color="red" />
              </div>
              {showCharts && <TransportCharts trips={filteredTrips} />}
            </TabsContent>

            <TabsContent value="inventory" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Products" value={inventoryMetrics.totalProducts} icon={Package} color="blue" />
                <StatCard title="Total Stock" value={inventoryMetrics.totalStock.toLocaleString()} icon={Package} color="green" />
                <StatCard title="Low Stock Items" value={inventoryMetrics.lowStock} icon={TrendingDown} color="red" />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="saved" className="mt-6">
          <SavedReportsManager 
            orgId={orgId} 
            onLoadReport={(report) => {
              if (report.report_type) {
                setReportTab(report.report_type);
                setMainTab("reports");
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Save Report Dialog */}
      <SaveReportDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        orgId={orgId}
        currentEmployeeId={currentEmployee?.id}
        currentEmployeeName={currentEmployee?.full_name}
        filters={{ dateRange: reportDateRange }}
        reportType={reportTab}
      />
    </div>
    </ProtectedPage>
  );
}