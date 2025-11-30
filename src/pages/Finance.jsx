import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "@/components/permissions/ProtectedPage";
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
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
  Save,
  Eye,
  EyeOff,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import ReportGenerator from "@/components/finance/ReportGenerator";
import PrintableFormsDownload from "@/components/finance/PrintableFormsDownload";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { SalesCharts, ExpenseCharts, TransportCharts } from "@/components/reports/ReportCharts";
import { 
  printSalesReport, 
  printExpenseReport, 
  printTransportReport, 
  printInventoryReport,
  exportReportCSV 
} from "@/components/reports/ReportPrintExport";
import SaveReportDialog from "@/components/reports/SaveReportDialog";
import SavedReportsManager from "@/components/analytics/SavedReportsManager";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const expenseCategories = [
  "fuel", "maintenance", "utilities", "supplies", "rent", 
  "salaries", "transport", "marketing", "insurance", "petty_cash", "other"
];

const COLORS = ['#1EB053', '#1D5FC3', '#D4AF37', '#0F1F3C', '#9333ea', '#f59e0b', '#ef4444', '#10b981'];

export default function Finance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFormsDialog, setShowFormsDialog] = useState(false);
  const [reportTab, setReportTab] = useState("sales");
  const [reportDateRange, setReportDateRange] = useState("this_month");
  const [showCharts, setShowCharts] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }, '-date', 100),
    enabled: !!orgId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }, '-created_date', 100),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }, '-date', 100),
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

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels', orgId],
    queryFn: () => base44.entities.StockLevel.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowExpenseDialog(false);
      toast({ title: "Expense recorded successfully" });
    },
  });

  // Calculate totals - separate all revenue streams
  const retailSales = sales.filter(s => s.sale_type === 'retail');
  const warehouseSales = sales.filter(s => s.sale_type === 'warehouse');
  const vehicleSales = sales.filter(s => s.sale_type === 'vehicle');
  
  const totalRetailRevenue = retailSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalWarehouseRevenue = warehouseSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalVehicleSalesRevenue = vehicleSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalTransportRevenue = trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const completedContracts = truckContracts.filter(c => c.status === 'completed');
  const totalTruckContractRevenue = completedContracts.reduce((sum, c) => sum + (c.contract_amount || 0), 0);
  const totalRevenue = totalRetailRevenue + totalWarehouseRevenue + totalVehicleSalesRevenue + totalTransportRevenue + totalTruckContractRevenue;
  
  // Calculate ALL expenses from all sources
  const recordedExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const tripFuelExpenses = trips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
  const tripOtherExpenses = trips.reduce((sum, t) => sum + (t.other_expenses || 0), 0);
  const truckContractExpenses = truckContracts.reduce((sum, c) => sum + (c.total_expenses || 0), 0);
  const maintenanceExpenses = maintenanceRecords.reduce((sum, m) => sum + (m.cost || 0), 0);
  
  const totalExpenses = recordedExpenses + tripFuelExpenses + tripOtherExpenses + truckContractExpenses + maintenanceExpenses;
  const netProfit = totalRevenue - totalExpenses;

  // Expense breakdown by category (including all sources)
  const expensesByCategory = [
    ...expenseCategories.map(cat => ({
      name: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.amount || 0), 0)
    })),
    { name: 'Trip Fuel', value: tripFuelExpenses },
    { name: 'Trip Other', value: tripOtherExpenses },
    { name: 'Truck Contract Expenses', value: truckContractExpenses },
    { name: 'Vehicle Maintenance', value: maintenanceExpenses }
  ].filter(item => item.value > 0);

  // Monthly revenue data (includes ALL revenue sources)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    // Sales revenue
    const monthSales = sales.filter(s => {
      const saleDate = new Date(s.created_date);
      return saleDate >= monthStart && saleDate <= monthEnd;
    }).reduce((sum, s) => sum + (s.total_amount || 0), 0);
    
    // Transport trip revenue
    const monthTrips = trips.filter(t => {
      const tripDate = new Date(t.date);
      return tripDate >= monthStart && tripDate <= monthEnd;
    }).reduce((sum, t) => sum + (t.total_revenue || 0), 0);
    
    // Truck contract revenue (completed contracts)
    const monthContracts = truckContracts.filter(c => {
      const contractDate = new Date(c.contract_date);
      return contractDate >= monthStart && contractDate <= monthEnd && c.status === 'completed';
    }).reduce((sum, c) => sum + (c.contract_amount || 0), 0);
    
    monthlyData.push({
      month: format(date, 'MMM'),
      revenue: monthSales + monthTrips + monthContracts
    });
  }

  const filteredExpenses = categoryFilter === "all" 
    ? expenses 
    : expenses.filter(e => e.category === categoryFilter);

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

  const reportFilteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = new Date(s.created_date);
      return saleDate >= getReportDateRange.start && saleDate <= getReportDateRange.end;
    });
  }, [sales, getReportDateRange]);

  const reportFilteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const expDate = new Date(e.date || e.created_date);
      return expDate >= getReportDateRange.start && expDate <= getReportDateRange.end;
    });
  }, [expenses, getReportDateRange]);

  const reportFilteredTrips = useMemo(() => {
    return trips.filter(t => {
      const tripDate = new Date(t.date || t.created_date);
      return tripDate >= getReportDateRange.start && tripDate <= getReportDateRange.end;
    });
  }, [trips, getReportDateRange]);

  const salesMetrics = useMemo(() => {
    const totalRevenue = reportFilteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const avgSale = reportFilteredSales.length > 0 ? totalRevenue / reportFilteredSales.length : 0;
    return { totalRevenue, count: reportFilteredSales.length, avgSale };
  }, [reportFilteredSales]);

  const expenseReportMetrics = useMemo(() => {
    const totalExpenses = reportFilteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return { totalExpenses, count: reportFilteredExpenses.length };
  }, [reportFilteredExpenses]);

  const transportMetrics = useMemo(() => {
    const totalRevenue = reportFilteredTrips.reduce((sum, t) => sum + (t.ticket_revenue || 0), 0);
    const totalFuel = reportFilteredTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
    return { totalRevenue, totalFuel, count: reportFilteredTrips.length };
  }, [reportFilteredTrips]);

  const inventoryMetrics = useMemo(() => {
    const totalStock = stockLevels.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const lowStock = products.filter(p => {
      const stock = stockLevels.find(s => s.product_id === p.id);
      return (stock?.quantity || 0) < (p.low_stock_threshold || 10);
    }).length;
    return { totalStock, totalProducts: products.length, lowStock };
  }, [products, stockLevels]);

  const handlePrintReport = () => {
    const org = organisation?.[0];
    switch (reportTab) {
      case 'sales': printSalesReport(reportFilteredSales, org, getReportDateRange); break;
      case 'expenses': printExpenseReport(reportFilteredExpenses, org, getReportDateRange); break;
      case 'transport': printTransportReport(reportFilteredTrips, org, getReportDateRange); break;
      case 'inventory': printInventoryReport(products, stockLevels, org); break;
    }
  };

  const handleExportCSV = () => {
    switch (reportTab) {
      case 'sales': exportReportCSV(reportFilteredSales, 'sales'); break;
      case 'expenses': exportReportCSV(reportFilteredExpenses, 'expenses'); break;
      case 'transport': exportReportCSV(reportFilteredTrips, 'transport'); break;
      case 'inventory': exportReportCSV(products, 'inventory'); break;
    }
  };

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

  if (!user || !currentEmployee || !orgId || loadingExpenses) {
    return <LoadingSpinner message="Loading Finance..." subtitle="Fetching financial data" fullScreen={true} />;
  }

  return (
    <ProtectedPage module="finance">
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        subtitle="Track revenue, expenses, and profitability"
        action={() => setShowExpenseDialog(true)}
        actionLabel="Add Expense"
      >
        <Button 
          variant="outline" 
          onClick={() => setShowFormsDialog(true)}
          className="border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/10 hover:text-[#0072C6]"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Forms
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Le ${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="Total Expenses"
          value={`Le ${totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Net Profit"
          value={`Le ${netProfit.toLocaleString()}`}
          icon={DollarSign}
          color={netProfit >= 0 ? "green" : "red"}
        />
        <StatCard
          title="Pending Expenses"
          value={expenses.filter(e => e.status === 'pending').length}
          icon={Receipt}
          color="gold"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Reports
          </TabsTrigger>
          <TabsTrigger value="saved" className="text-xs sm:text-sm px-2 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EB053] data-[state=active]:to-[#0072C6] data-[state=active]:text-white">
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Trend (6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`Le ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1EB053" />
                        <stop offset="100%" stopColor="#1D5FC3" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expensesByCategory.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No expenses recorded
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Revenue Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Retail Sales</p>
                        <p className="text-sm text-gray-500">{retailSales.length} transactions</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">Le {totalRetailRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Warehouse Sales</p>
                        <p className="text-sm text-gray-500">{warehouseSales.length} transactions</p>
                      </div>
                    </div>
                    <p className="font-bold text-amber-600">Le {totalWarehouseRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Vehicle Sales</p>
                        <p className="text-sm text-gray-500">{vehicleSales.length} sales</p>
                      </div>
                    </div>
                    <p className="font-bold text-purple-600">Le {totalVehicleSalesRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Transport Revenue</p>
                        <p className="text-sm text-gray-500">{trips.length} trips</p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">Le {totalTransportRevenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium">Truck Contract Revenue</p>
                        <p className="text-sm text-gray-500">{completedContracts.length} contracts completed</p>
                      </div>
                    </div>
                    <p className="font-bold text-teal-600">Le {totalTruckContractRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Recorded Expenses</p>
                        <p className="text-sm text-gray-500">{expenses.length} entries</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600">Le {recordedExpenses.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Trip Expenses</p>
                        <p className="text-sm text-gray-500">Fuel & other trip costs</p>
                      </div>
                    </div>
                    <p className="font-bold text-orange-600">Le {(tripFuelExpenses + tripOtherExpenses).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium">Contract Expenses</p>
                        <p className="text-sm text-gray-500">Truck contract costs</p>
                      </div>
                    </div>
                    <p className="font-bold text-violet-600">Le {truckContractExpenses.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium">Vehicle Maintenance</p>
                        <p className="text-sm text-gray-500">{maintenanceRecords.length} service records</p>
                      </div>
                    </div>
                    <p className="font-bold text-cyan-600">Le {maintenanceExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{expense.description || expense.category}</p>
                        <p className="text-sm text-gray-500">{format(new Date(expense.date), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-500">-Le {expense.amount?.toLocaleString()}</p>
                        <Badge variant={expense.status === 'approved' ? 'secondary' : 'outline'}>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>All Expenses</CardTitle>
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
                  <Button onClick={() => setShowExpenseDialog(true)} className="sl-gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingExpenses ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredExpenses.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No Expenses Found"
                  description="Record your first expense to start tracking"
                  action={() => setShowExpenseDialog(true)}
                  actionLabel="Add Expense"
                />
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description || expense.vendor || 'Expense'}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {expense.category?.replace(/_/g, ' ')}
                            </Badge>
                            <span>•</span>
                            <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
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
                  <Button size="sm" onClick={handlePrintReport} className="bg-[#1EB053]">
                    <Printer className="w-4 h-4 mr-1" />
                    Print
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
                <StatCard title="Total Revenue" value={`SLE ${salesMetrics.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
                <StatCard title="Total Sales" value={salesMetrics.count} icon={ShoppingCart} color="blue" />
                <StatCard title="Avg Sale" value={`SLE ${Math.round(salesMetrics.avgSale).toLocaleString()}`} icon={TrendingUp} color="gold" />
              </div>
              {showCharts && <SalesCharts sales={reportFilteredSales} />}
            </TabsContent>

            <TabsContent value="expenses" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total Expenses" value={`SLE ${expenseReportMetrics.totalExpenses.toLocaleString()}`} icon={DollarSign} color="red" />
                <StatCard title="Expense Count" value={expenseReportMetrics.count} icon={FileText} color="blue" />
              </div>
              {showCharts && <ExpenseCharts expenses={reportFilteredExpenses} />}
            </TabsContent>

            <TabsContent value="transport" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Trip Revenue" value={`SLE ${transportMetrics.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
                <StatCard title="Total Trips" value={transportMetrics.count} icon={Truck} color="blue" />
                <StatCard title="Fuel Costs" value={`SLE ${transportMetrics.totalFuel.toLocaleString()}`} icon={TrendingDown} color="red" />
              </div>
              {showCharts && <TransportCharts trips={reportFilteredTrips} />}
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

        <TabsContent value="saved" className="mt-6">
          <SavedReportsManager 
            orgId={orgId} 
            onLoadReport={(report) => {
              if (report.report_type) {
                setReportTab(report.report_type);
                setActiveTab("reports");
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

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
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
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:from-[#178f43] hover:to-[#005a9e] w-full sm:w-auto">
                Record Expense
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