import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, subMonths } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  PieChart,
  BarChart3,
  Filter,
  Download,
  Calendar,
  Truck,
  Wrench,
  Fuel,
  FileText,
  Printer,
  ShoppingCart,
  Package,
  Eye,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Landmark,
  Upload,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PrintableFormsDownload from "@/components/finance/PrintableFormsDownload";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend } from 'recharts';
import AIInsightsPanel from "@/components/ai/AIInsightsPanel";
import AIReportSummary from "@/components/ai/AIReportSummary";
import AIFormAssistant, { QuickSuggestionChips } from "@/components/ai/AIFormAssistant";

const expenseCategories = [
  "fuel", "maintenance", "utilities", "supplies", "rent", 
  "salaries", "transport", "marketing", "insurance", "petty_cash", "other"
];

const revenueSources = [
  { value: "owner_contribution", label: "Owner Contribution" },
  { value: "ceo_contribution", label: "CEO Contribution" },
  { value: "investor_funding", label: "Investor Funding" },
  { value: "loan", label: "Loan" },
  { value: "grant", label: "Grant" },
  { value: "dividend", label: "Dividend Return" },
  { value: "other", label: "Other" }
];

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#0F1F3C', '#9333ea', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];

export default function Finance() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);
  const [showBankDepositDialog, setShowBankDepositDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFormsDialog, setShowFormsDialog] = useState(false);
  const [dateRange, setDateRange] = useState("this_month");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-date', 200),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 200),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-date', 200),
    enabled: !!orgId,
  });

  const { data: truckContracts = [] } = useQuery({
    queryKey: ['truckContracts', orgId],
    queryFn: () => base44.entities.TruckContract.filter({ organisation_id: orgId }, '-contract_date', 100),
    enabled: !!orgId,
  });

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['vehicleMaintenance', orgId],
    queryFn: () => base44.entities.VehicleMaintenance.filter({ organisation_id: orgId }, '-date_performed', 200),
    enabled: !!orgId,
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', orgId],
    queryFn: () => base44.entities.Payroll.filter({ organisation_id: orgId }, '-period_start', 100),
    enabled: !!orgId,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: revenues = [] } = useQuery({
    queryKey: ['revenues', orgId],
    queryFn: () => base44.entities.Revenue.filter({ organisation_id: orgId }, '-date', 200),
    enabled: !!orgId,
  });

  const { data: bankDeposits = [] } = useQuery({
    queryKey: ['bankDeposits', orgId],
    queryFn: () => base44.entities.BankDeposit.filter({ organisation_id: orgId }, '-date', 200),
    enabled: !!orgId,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowExpenseDialog(false);
    },
  });

  const createRevenueMutation = useMutation({
    mutationFn: (data) => base44.entities.Revenue.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
      setShowRevenueDialog(false);
    },
  });

  const createBankDepositMutation = useMutation({
    mutationFn: (data) => base44.entities.BankDeposit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDeposits'] });
      setShowBankDepositDialog(false);
    },
  });

  const updateBankDepositMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BankDeposit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDeposits'] });
    },
  });

  // Date range calculation
  const getDateRange = useMemo(() => {
    const today = new Date();
    switch (dateRange) {
      case "today": return { start: today, end: today };
      case "this_week": return { start: startOfWeek(today), end: today };
      case "this_month": return { start: startOfMonth(today), end: today };
      case "last_month": 
        const lm = subMonths(today, 1);
        return { start: startOfMonth(lm), end: endOfMonth(lm) };
      case "this_quarter": return { start: startOfQuarter(today), end: today };
      case "this_year": return { start: startOfYear(today), end: today };
      default: return { start: startOfMonth(today), end: today };
    }
  }, [dateRange]);

  // Filter data by date range
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.created_date);
      return d >= getDateRange.start && d <= getDateRange.end;
    });
  }, [sales, getDateRange]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date || e.created_date);
      return d >= getDateRange.start && d <= getDateRange.end;
    });
  }, [expenses, getDateRange]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const d = new Date(t.date || t.created_date);
      return d >= getDateRange.start && d <= getDateRange.end;
    });
  }, [trips, getDateRange]);

  const filteredContracts = useMemo(() => {
    return truckContracts.filter(c => {
      const d = new Date(c.contract_date || c.created_date);
      return d >= getDateRange.start && d <= getDateRange.end;
    });
  }, [truckContracts, getDateRange]);

  const filteredRevenues = useMemo(() => {
    return revenues.filter(r => {
      const d = new Date(r.date || r.created_date);
      return d >= getDateRange.start && d <= getDateRange.end;
    });
  }, [revenues, getDateRange]);

  const filteredBankDeposits = useMemo(() => {
    return bankDeposits.filter(d => {
      const date = new Date(d.date || d.created_date);
      return date >= getDateRange.start && date <= getDateRange.end;
    });
  }, [bankDeposits, getDateRange]);

  // Calculate comprehensive financials
  const financials = useMemo(() => {
    // Revenue streams
    const salesRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const transportRevenue = filteredTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    const contractRevenue = filteredContracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.contract_amount || 0), 0);
    // Include all revenues (pending and confirmed) in owner contributions
    const ownerContributions = filteredRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalRevenue = salesRevenue + transportRevenue + contractRevenue + ownerContributions;

    // Revenue by type
    const retailSales = filteredSales.filter(s => s.sale_type === 'retail').reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const wholesaleSales = filteredSales.filter(s => s.sale_type === 'warehouse').reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const vehicleSales = filteredSales.filter(s => s.sale_type === 'vehicle').reduce((sum, s) => sum + (s.total_amount || 0), 0);

    // Expenses
    const recordedExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const tripFuelCosts = filteredTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
    const tripOtherCosts = filteredTrips.reduce((sum, t) => sum + (t.other_expenses || 0), 0);
    const contractExpenses = filteredContracts.reduce((sum, c) => sum + (c.total_expenses || 0), 0);
    const maintenanceCosts = maintenanceRecords.filter(m => {
      const d = new Date(m.date_performed);
      return d >= getDateRange.start && d <= getDateRange.end;
    }).reduce((sum, m) => sum + (m.cost || 0), 0);
    const totalExpenses = recordedExpenses + tripFuelCosts + tripOtherCosts + contractExpenses + maintenanceCosts;

    // Profit
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Payment method breakdown
    const paymentMethods = {};
    filteredSales.forEach(s => {
      const method = s.payment_method || 'cash';
      paymentMethods[method] = (paymentMethods[method] || 0) + (s.total_amount || 0);
    });

    // Expense by category
    const expensesByCategory = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || 'other';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0);
    });

    // Bank deposits
    const totalBankDeposits = filteredBankDeposits.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + (d.amount || 0), 0);
    const pendingBankDeposits = filteredBankDeposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + (d.amount || 0), 0);
    const cashOnHand = totalRevenue - totalBankDeposits;

    return {
      totalRevenue,
      salesRevenue,
      transportRevenue,
      contractRevenue,
      retailSales,
      wholesaleSales,
      vehicleSales,
      totalExpenses,
      recordedExpenses,
      tripFuelCosts,
      tripOtherCosts,
      contractExpenses,
      maintenanceCosts,
      netProfit,
      profitMargin,
      paymentMethods,
      expensesByCategory,
      ownerContributions,
      transactionCount: filteredSales.length,
      tripCount: filteredTrips.length,
      contractCount: filteredContracts.length,
      revenueCount: filteredRevenues.length,
      totalBankDeposits,
      pendingBankDeposits,
      cashOnHand,
      depositCount: filteredBankDeposits.length
    };
  }, [filteredSales, filteredExpenses, filteredTrips, filteredContracts, maintenanceRecords, filteredRevenues, filteredBankDeposits, getDateRange]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthSales = sales.filter(s => {
        const d = new Date(s.created_date);
        return d >= monthStart && d <= monthEnd;
      }).reduce((sum, s) => sum + (s.total_amount || 0), 0);

      const monthTransport = trips.filter(t => {
        const d = new Date(t.date || t.created_date);
        return d >= monthStart && d <= monthEnd;
      }).reduce((sum, t) => sum + (t.total_revenue || 0), 0);

      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date || e.created_date);
        return d >= monthStart && d <= monthEnd;
      }).reduce((sum, e) => sum + (e.amount || 0), 0);

      data.push({
        month: format(date, 'MMM'),
        revenue: monthSales + monthTransport,
        expenses: monthExpenses,
        profit: (monthSales + monthTransport) - monthExpenses
      });
    }
    return data;
  }, [sales, trips, expenses]);

  // Expense pie chart data
  const expensePieData = useMemo(() => {
    return Object.entries(financials.expensesByCategory)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
      }));
  }, [financials.expensesByCategory]);

  // Revenue breakdown for pie
  const revenuePieData = useMemo(() => {
    const data = [];
    if (financials.retailSales > 0) data.push({ name: 'Retail Sales', value: financials.retailSales });
    if (financials.wholesaleSales > 0) data.push({ name: 'Wholesale', value: financials.wholesaleSales });
    if (financials.vehicleSales > 0) data.push({ name: 'Vehicle Sales', value: financials.vehicleSales });
    if (financials.transportRevenue > 0) data.push({ name: 'Transport', value: financials.transportRevenue });
    if (financials.contractRevenue > 0) data.push({ name: 'Contracts', value: financials.contractRevenue });
    if (financials.ownerContributions > 0) data.push({ name: 'Owner/CEO', value: financials.ownerContributions });
    return data;
  }, [financials]);

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      category: formData.get('category'),
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount')) || 0,
      date: formData.get('date'),
      vendor: formData.get('vendor'),
      payment_method: formData.get('payment_method'),
      recorded_by: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      status: 'pending',
      notes: formData.get('notes'),
    };
    createExpenseMutation.mutate(data);
  };

  const categoryFilteredExpenses = categoryFilter === "all" 
    ? expenses 
    : expenses.filter(e => e.category === categoryFilter);

  const handleRevenueSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      source: formData.get('source'),
      contributor_name: formData.get('contributor_name'),
      amount: parseFloat(formData.get('amount')) || 0,
      date: formData.get('date'),
      payment_method: formData.get('payment_method'),
      reference_number: formData.get('reference_number'),
      purpose: formData.get('purpose'),
      notes: formData.get('notes'),
      recorded_by: currentEmployee?.id,
      recorded_by_name: currentEmployee?.full_name,
      status: 'confirmed',
    };
    createRevenueMutation.mutate(data);
  };

  if (!user) {
    return <LoadingSpinner message="Loading Finance..." subtitle="Fetching financial data" fullScreen={true} />;
  }

  if (!currentEmployee || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Employee Record</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account is not linked to an employee record yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  if (loadingExpenses) {
    return <LoadingSpinner message="Loading Finance..." subtitle="Fetching financial data" fullScreen={true} />;
  }

  return (
    <ProtectedPage module="finance">
      <div className="space-y-6">
        <PageHeader
          title="Finance"
          subtitle="Complete financial overview and management"
          action={() => setShowExpenseDialog(true)}
          actionLabel="Record Expense"
        >
          <Button 
            variant="outline" 
            onClick={() => setShowFormsDialog(true)}
            className="border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/10"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Forms
          </Button>
        </PageHeader>

        {/* Date Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Period:</span>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border-l-4 border-l-[#1EB053]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Revenue</p>
                  <p className="text-base sm:text-2xl font-bold text-[#1EB053] truncate">Le {financials.totalRevenue.toLocaleString()}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{financials.transactionCount + financials.tripCount} txns</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-[#1EB053]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Expenses</p>
                  <p className="text-base sm:text-2xl font-bold text-red-500 truncate">Le {financials.totalExpenses.toLocaleString()}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{filteredExpenses.length} records</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${financials.netProfit >= 0 ? 'border-l-[#0072C6]' : 'border-l-orange-500'}`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Net Profit</p>
                  <p className={`text-base sm:text-2xl font-bold truncate ${financials.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-500'}`}>
                    Le {financials.netProfit.toLocaleString()}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{financials.profitMargin}%</p>
                </div>
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${financials.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                  <DollarSign className={`w-4 h-4 sm:w-6 sm:h-6 ${financials.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#D4AF37]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Pending</p>
                  <p className="text-base sm:text-2xl font-bold text-[#D4AF37]">{expenses.filter(e => e.status === 'pending').length}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">expenses</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 p-1 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="contributions" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              Owner/CEO
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="banking" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
              <Landmark className="w-4 h-4 mr-1" />
              Banking
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIInsightsPanel 
                  data={filteredExpenses.slice(0, 30)}
                  type="expenses"
                  title="AI Expense Insights"
                  orgId={orgId}
                />
                <AIReportSummary
                  reportData={{
                    revenue: financials.totalRevenue,
                    expenses: financials.totalExpenses,
                    profit: financials.netProfit,
                    margin: financials.profitMargin,
                    period: dateRange,
                    breakdown: {
                      sales_revenue: financials.salesRevenue,
                      transport_revenue: financials.transportRevenue,
                      contract_revenue: financials.contractRevenue
                    }
                  }}
                  reportType="financial"
                  title="AI P&L Summary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#1EB053]" />
                    Financial Trend (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1EB053" fill="#1EB053" fillOpacity={0.6} name="Revenue" />
                      <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Profit Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0072C6]" />
                    Profit Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                      <Line type="monotone" dataKey="profit" stroke="#0072C6" strokeWidth={3} dot={{ fill: '#0072C6', strokeWidth: 2 }} name="Net Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#1EB053]" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {revenuePieData.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-gray-500">
                      No revenue data for this period
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <RePieChart>
                        <Pie
                          data={revenuePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {revenuePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                      </RePieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-red-500" />
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expensePieData.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center text-gray-500">
                      No expense data for this period
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <RePieChart>
                        <Pie
                          data={expensePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                      </RePieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="mt-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Retail Sales</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">Le {financials.retailSales.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Wholesale</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">Le {financials.wholesaleSales.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Vehicle</p>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600 truncate">Le {financials.vehicleSales.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-teal-50 to-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Transport</p>
                      <p className="text-lg sm:text-2xl font-bold text-teal-600 truncate">Le {financials.transportRevenue.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{financials.tripCount} trips</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Contracts</p>
                      <p className="text-lg sm:text-2xl font-bold text-amber-600 truncate">Le {financials.contractRevenue.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{financials.contractCount} contracts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(financials.paymentMethods).map(([method, amount]) => {
                    const percentage = financials.salesRevenue > 0 ? (amount / financials.salesRevenue) * 100 : 0;
                    const icons = {
                      cash: Wallet,
                      card: CreditCard,
                      mobile_money: DollarSign,
                      credit: Receipt
                    };
                    const Icon = icons[method] || DollarSign;
                    return (
                      <div key={method} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium capitalize">{method.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="font-bold">Le {amount.toLocaleString()}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="mt-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <Card className="bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500">Recorded</p>
                      <p className="text-sm sm:text-lg font-bold truncate">Le {financials.recordedExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500">Fuel</p>
                      <p className="text-sm sm:text-lg font-bold truncate">Le {financials.tripFuelCosts.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500">Maint.</p>
                      <p className="text-sm sm:text-lg font-bold truncate">Le {financials.maintenanceCosts.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500">Contract</p>
                      <p className="text-sm sm:text-lg font-bold truncate">Le {financials.contractExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expense Records</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowExpenseDialog(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {categoryFilteredExpenses.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No expenses found</p>
                      </div>
                    ) : (
                      categoryFilteredExpenses.slice(0, 50).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <ArrowDownRight className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">{expense.description || expense.vendor || 'Expense'}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Badge variant="outline" className="text-xs">
                                  {expense.category?.replace(/_/g, ' ')}
                                </Badge>
                                <span>•</span>
                                <span>{expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-500">-Le {expense.amount?.toLocaleString()}</p>
                            <Badge variant={
                              expense.status === 'approved' ? 'secondary' :
                              expense.status === 'rejected' ? 'destructive' : 'outline'
                            }>
                              {expense.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Owner/CEO Contributions Tab */}
          <TabsContent value="contributions" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-[#1EB053]/10 to-white border-t-4 border-t-[#1EB053]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                      <Users className="w-7 h-7 text-[#1EB053]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Contributions</p>
                      <p className="text-2xl font-bold text-[#1EB053]">Le {financials.ownerContributions.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{financials.revenueCount} records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Owner</p>
                      <p className="text-2xl font-bold text-blue-600">
                        Le {filteredRevenues.filter(r => r.source === 'owner_contribution').reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Users className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CEO</p>
                      <p className="text-2xl font-bold text-purple-600">
                        Le {filteredRevenues.filter(r => r.source === 'ceo_contribution').reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#1EB053]" />
                  Revenue from Owners & CEO
                </CardTitle>
                <Button onClick={() => setShowRevenueDialog(true)} className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contribution
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {revenues.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No contributions recorded yet</p>
                        <p className="text-sm mt-1">Record money received from owners or CEO</p>
                      </div>
                    ) : (
                      revenues.map((revenue) => (
                        <div key={revenue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <ArrowUpRight className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{revenue.contributor_name || revenueSources.find(s => s.value === revenue.source)?.label || 'Contribution'}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  {revenueSources.find(s => s.value === revenue.source)?.label || revenue.source}
                                </Badge>
                                <span>•</span>
                                <span>{revenue.date ? format(new Date(revenue.date), 'MMM d, yyyy') : '-'}</span>
                              </div>
                              {revenue.purpose && (
                                <p className="text-xs text-gray-400 mt-1">{revenue.purpose}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#1EB053]">+Le {revenue.amount?.toLocaleString()}</p>
                            <Badge variant={revenue.status === 'confirmed' ? 'secondary' : 'outline'} className="bg-green-100 text-green-700">
                              {revenue.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-t-4 border-t-[#1EB053]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Cash Inflow</p>
                      <p className="text-3xl font-bold text-[#1EB053]">Le {financials.totalRevenue.toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-[#1EB053]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-red-500">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Cash Outflow</p>
                      <p className="text-3xl font-bold text-red-500">Le {financials.totalExpenses.toLocaleString()}</p>
                    </div>
                    <ArrowDownRight className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-t-4 ${financials.netProfit >= 0 ? 'border-t-[#0072C6]' : 'border-t-orange-500'}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Net Cash Flow</p>
                      <p className={`text-3xl font-bold ${financials.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-500'}`}>
                        Le {financials.netProfit.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className={`w-8 h-8 ${financials.netProfit >= 0 ? 'text-[#0072C6]' : 'text-orange-500'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#1EB053" name="Inflow" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" name="Outflow" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profit Summary */}
            <Card className={financials.netProfit >= 0 ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {financials.netProfit >= 0 ? (
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-orange-600" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${financials.netProfit >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                      {financials.netProfit >= 0 ? 'Profitable Period' : 'Operating at Loss'}
                    </h3>
                    <p className="text-gray-600">
                      {financials.netProfit >= 0 
                        ? `Your business achieved a ${financials.profitMargin}% profit margin this period.`
                        : `Review expenses to improve profitability. Current margin: ${financials.profitMargin}%`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Expense Dialog */}
        <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full [&>button]:hidden">
            <DialogHeader>
              <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white border-y border-gray-200" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <DialogTitle>Record New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Category</Label>
                  <Select name="category" required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Input name="description" required className="mt-1" placeholder="What was this expense for?" />
                </div>
                <div>
                  <Label>Amount (Le)</Label>
                  <Input name="amount" type="number" step="0.01" required className="mt-1" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="mt-1" />
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Input name="vendor" className="mt-1" placeholder="Optional" />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select name="payment_method" defaultValue="cash">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea name="notes" className="mt-1" placeholder="Additional details..." />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setShowExpenseDialog(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] w-full sm:w-auto">
                  Record Expense
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Revenue Dialog */}
        <Dialog open={showRevenueDialog} onOpenChange={setShowRevenueDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full [&>button]:hidden">
            <DialogHeader>
              <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white border-y border-gray-200" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
              <DialogTitle>Record Owner/CEO Contribution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRevenueSubmit} className="space-y-4">
              {/* Quick Fill Chips */}
              <div>
                <Label className="text-gray-500 text-xs mb-2 block">Quick Fill</Label>
                <QuickSuggestionChips 
                  type="revenue" 
                  onSelect={(item) => {
                    const sourceSelect = document.querySelector('[name="source"]');
                    if (sourceSelect && item.source) {
                      // Trigger change on the hidden select
                      const event = new Event('change', { bubbles: true });
                      sourceSelect.value = item.source;
                      sourceSelect.dispatchEvent(event);
                    }
                  }} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Source Type</Label>
                  <Select name="source" required defaultValue="owner_contribution">
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueSources.map(src => (
                        <SelectItem key={src.value} value={src.value}>
                          {src.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Contributor Name</Label>
                  <Input name="contributor_name" required className="mt-1" placeholder="Name of owner, CEO, or investor" />
                </div>
                <div>
                  <Label>Amount (Le)</Label>
                  <Input name="amount" type="number" step="0.01" required className="mt-1" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required className="mt-1" />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select name="payment_method" defaultValue="bank_transfer">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reference Number</Label>
                  <Input name="reference_number" className="mt-1" placeholder="Bank ref or transaction ID" />
                </div>
                <div className="col-span-2">
                  <Label>Purpose</Label>
                  <Input name="purpose" className="mt-1" placeholder="e.g., Capital injection, Working capital" />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea name="notes" className="mt-1" placeholder="Additional details..." />
                </div>
              </div>

              {/* AI Validation for Revenue */}
              <AIFormAssistant
                formType="revenue"
                formData={{
                  amount: document.querySelector('[name="amount"]')?.value || '',
                  date: document.querySelector('[name="date"]')?.value || '',
                  description: document.querySelector('[name="purpose"]')?.value || ''
                }}
                onSuggestion={(field, value) => {
                  const input = document.querySelector(`[name="${field}"]`);
                  if (input) input.value = value;
                }}
                pastEntries={revenues}
                categories={revenueSources}
              />

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setShowRevenueDialog(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] w-full sm:w-auto" disabled={createRevenueMutation.isPending}>
                  {createRevenueMutation.isPending ? 'Recording...' : 'Record Contribution'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Printable Forms Dialog */}
        <PrintableFormsDownload
          open={showFormsDialog}
          onOpenChange={setShowFormsDialog}
          organisation={organisation?.[0]}
        />
      </div>
    </ProtectedPage>
  );
}