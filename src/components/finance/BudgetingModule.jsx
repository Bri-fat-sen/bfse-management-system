import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Target, Plus, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle2, Edit2, Trash2, Calendar, PiggyBank,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus, MapPin, Users
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ComposedChart, Area
} from "recharts";

const EXPENSE_CATEGORIES = [
  { value: "fuel", label: "Fuel" },
  { value: "maintenance", label: "Maintenance" },
  { value: "utilities", label: "Utilities" },
  { value: "supplies", label: "Supplies" },
  { value: "rent", label: "Rent" },
  { value: "salaries", label: "Salaries" },
  { value: "transport", label: "Transport" },
  { value: "marketing", label: "Marketing" },
  { value: "insurance", label: "Insurance" },
  { value: "petty_cash", label: "Petty Cash" },
  { value: "other", label: "Other" }
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BudgetingModule({ orgId, expenses = [], sales = [], currentEmployee }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriodType, setSelectedPeriodType] = useState("monthly");
  const [forecastYears, setForecastYears] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("all");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);

  const isAdmin = ['super_admin', 'org_admin'].includes(currentEmployee?.role);

  // Fetch budgets
  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', orgId],
    queryFn: () => base44.entities.Budget.filter({ organisation_id: orgId }),
    enabled: !!orgId
  });

  // Fetch locations (warehouses)
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses', orgId],
    queryFn: () => base44.entities.Warehouse.filter({ organisation_id: orgId }),
    enabled: !!orgId
  });

  // Fetch employees (warehouse managers)
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId
  });

  const warehouseManagers = employees.filter(e => e.role === 'warehouse_manager');

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    budget_type: "expense",
    category: "",
    location_id: "",
    location_name: "",
    assigned_to_id: "",
    assigned_to_name: "",
    period_type: "monthly",
    year: currentYear,
    month: currentMonth,
    quarter: currentQuarter,
    budgeted_amount: "",
    notes: ""
  });

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: (data) => base44.entities.Budget.create({ ...data, organisation_id: orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowBudgetDialog(false);
      resetForm();
      toast.success("Budget created successfully");
    }
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Budget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowBudgetDialog(false);
      setEditingBudget(null);
      resetForm();
      toast.success("Budget updated successfully");
    }
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id) => base44.entities.Budget.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success("Budget deleted");
    }
  });

  const resetForm = () => {
    setBudgetForm({
      budget_type: "expense",
      category: "",
      location_id: "",
      location_name: "",
      assigned_to_id: "",
      assigned_to_name: "",
      period_type: "monthly",
      year: currentYear,
      month: currentMonth,
      quarter: currentQuarter,
      budgeted_amount: "",
      notes: ""
    });
  };

  // Calculate actual spending by category and period
  const actualSpending = useMemo(() => {
    const spending = {};
    
    expenses.forEach(expense => {
      if (!expense.date) return;
      const expenseDate = new Date(expense.date);
      const year = expenseDate.getFullYear();
      const month = expenseDate.getMonth() + 1;
      const quarter = Math.ceil(month / 3);
      const category = expense.category || 'other';
      
      // Monthly key
      const monthKey = `${year}-${month}-${category}`;
      spending[monthKey] = (spending[monthKey] || 0) + (expense.amount || 0);
      
      // Quarterly key
      const quarterKey = `${year}-Q${quarter}-${category}`;
      spending[quarterKey] = (spending[quarterKey] || 0) + (expense.amount || 0);
      
      // Yearly key
      const yearKey = `${year}-${category}`;
      spending[yearKey] = (spending[yearKey] || 0) + (expense.amount || 0);
    });
    
    return spending;
  }, [expenses]);

  // Get actual amount for a budget
  const getActualAmount = (budget) => {
    let key;
    if (budget.period_type === 'monthly') {
      key = `${budget.year}-${budget.month}-${budget.category}`;
    } else if (budget.period_type === 'quarterly') {
      key = `${budget.year}-Q${budget.quarter}-${budget.category}`;
    } else {
      key = `${budget.year}-${budget.category}`;
    }
    return actualSpending[key] || 0;
  };

  // Calculate actual revenue by location
  const actualRevenue = useMemo(() => {
    const revenue = {};
    
    sales.forEach(sale => {
      if (!sale.created_date) return;
      const saleDate = new Date(sale.created_date);
      const year = saleDate.getFullYear();
      const month = saleDate.getMonth() + 1;
      const quarter = Math.ceil(month / 3);
      const locationId = sale.location_id || 'all';
      
      // Monthly key
      const monthKey = `${year}-${month}-${locationId}`;
      revenue[monthKey] = (revenue[monthKey] || 0) + (sale.total_amount || 0);
      
      // Quarterly key
      const quarterKey = `${year}-Q${quarter}-${locationId}`;
      revenue[quarterKey] = (revenue[quarterKey] || 0) + (sale.total_amount || 0);
      
      // Yearly key
      const yearKey = `${year}-${locationId}`;
      revenue[yearKey] = (revenue[yearKey] || 0) + (sale.total_amount || 0);
    });
    
    return revenue;
  }, [sales]);

  // Get actual revenue for a budget
  const getActualRevenue = (budget) => {
    let key;
    const locationId = budget.location_id || 'all';
    if (budget.period_type === 'monthly') {
      key = `${budget.year}-${budget.month}-${locationId}`;
    } else if (budget.period_type === 'quarterly') {
      key = `${budget.year}-Q${budget.quarter}-${locationId}`;
    } else {
      key = `${budget.year}-${locationId}`;
    }
    return actualRevenue[key] || 0;
  };

  // Budget vs Actual comparison data
  const budgetComparison = useMemo(() => {
    const filteredBudgets = budgets.filter(b => 
      b.year === selectedYear && 
      b.period_type === selectedPeriodType &&
      b.budget_type === 'expense' &&
      (selectedLocation === 'all' || b.location_id === selectedLocation || !b.location_id)
    );

    return EXPENSE_CATEGORIES.map(cat => {
      const categoryBudgets = filteredBudgets.filter(b => b.category === cat.value);
      const totalBudgeted = categoryBudgets.reduce((sum, b) => sum + (b.budgeted_amount || 0), 0);
      
      let totalActual = 0;
      if (selectedPeriodType === 'yearly') {
        totalActual = actualSpending[`${selectedYear}-${cat.value}`] || 0;
      } else {
        categoryBudgets.forEach(b => {
          totalActual += getActualAmount(b);
        });
      }

      const variance = totalBudgeted - totalActual;
      const variancePercent = totalBudgeted > 0 ? ((variance / totalBudgeted) * 100) : 0;

      return {
        category: cat.label,
        categoryValue: cat.value,
        budgeted: totalBudgeted,
        actual: totalActual,
        variance,
        variancePercent,
        status: variance >= 0 ? 'under' : 'over'
      };
    }).filter(item => item.budgeted > 0 || item.actual > 0);
  }, [budgets, selectedYear, selectedPeriodType, actualSpending, selectedLocation]);

  // Revenue targets by location
  const revenueTargets = useMemo(() => {
    const filteredBudgets = budgets.filter(b => 
      b.year === selectedYear && 
      b.period_type === selectedPeriodType &&
      b.budget_type === 'revenue_target'
    );

    return warehouses.map(loc => {
      const locationBudgets = filteredBudgets.filter(b => b.location_id === loc.id);
      const totalTarget = locationBudgets.reduce((sum, b) => sum + (b.budgeted_amount || 0), 0);
      
      let totalActual = 0;
      locationBudgets.forEach(b => {
        totalActual += getActualRevenue(b);
      });

      const variance = totalActual - totalTarget;
      const variancePercent = totalTarget > 0 ? ((variance / totalTarget) * 100) : 0;
      const progress = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

      return {
        location: loc.name,
        locationId: loc.id,
        target: totalTarget,
        actual: totalActual,
        variance,
        variancePercent,
        progress,
        status: progress >= 100 ? 'achieved' : progress >= 80 ? 'on_track' : 'behind'
      };
    }).filter(item => item.target > 0 || item.actual > 0);
  }, [budgets, selectedYear, selectedPeriodType, warehouses, actualRevenue]);

  // Monthly trend data for charts
  const monthlyTrendData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const monthNum = index + 1;
      const monthBudgets = budgets.filter(b => 
        b.year === selectedYear && 
        b.period_type === 'monthly' && 
        b.month === monthNum
      );
      
      const budgeted = monthBudgets.reduce((sum, b) => sum + (b.budgeted_amount || 0), 0);
      
      let actual = 0;
      EXPENSE_CATEGORIES.forEach(cat => {
        actual += actualSpending[`${selectedYear}-${monthNum}-${cat.value}`] || 0;
      });

      return {
        month: month.slice(0, 3),
        monthNum,
        budgeted,
        actual,
        variance: budgeted - actual
      };
    });
  }, [budgets, selectedYear, actualSpending]);

  // Financial forecast
  const forecastData = useMemo(() => {
    // Calculate average monthly spending by category from last 6 months
    const avgSpending = {};
    let monthsWithData = 0;
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      let hasData = false;
      EXPENSE_CATEGORIES.forEach(cat => {
        const amount = actualSpending[`${year}-${month}-${cat.value}`] || 0;
        if (amount > 0) hasData = true;
        avgSpending[cat.value] = (avgSpending[cat.value] || 0) + amount;
      });
      if (hasData) monthsWithData++;
    }

    // Calculate averages
    if (monthsWithData > 0) {
      Object.keys(avgSpending).forEach(key => {
        avgSpending[key] = avgSpending[key] / monthsWithData;
      });
    }

    // Generate forecast
    const forecast = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1);
    startDate.setDate(1);

    for (let i = 0; i < forecastYears * 12; i++) {
      const forecastDate = new Date(startDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const year = forecastDate.getFullYear();
      const month = forecastDate.getMonth() + 1;

      // Get budgeted amount for this month
      const monthBudgets = budgets.filter(b => 
        b.year === year && 
        b.period_type === 'monthly' && 
        b.month === month
      );
      const budgeted = monthBudgets.reduce((sum, b) => sum + (b.budgeted_amount || 0), 0);

      // Calculate projected (use budget if available, otherwise use historical average)
      let projected = budgeted > 0 ? budgeted : Object.values(avgSpending).reduce((sum, v) => sum + v, 0);
      
      // Add slight growth factor (2% annually)
      const growthFactor = 1 + (0.02 * (i / 12));
      projected = projected * growthFactor;

      forecast.push({
        period: format(forecastDate, 'MMM yyyy'),
        year,
        month,
        budgeted,
        projected: Math.round(projected),
        cumulative: forecast.length > 0 
          ? forecast[forecast.length - 1].cumulative + Math.round(projected)
          : Math.round(projected)
      });
    }

    return forecast;
  }, [budgets, actualSpending, forecastYears]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalBudgeted = budgetComparison.reduce((sum, item) => sum + item.budgeted, 0);
    const totalActual = budgetComparison.reduce((sum, item) => sum + item.actual, 0);
    const totalVariance = totalBudgeted - totalActual;
    const overBudgetCount = budgetComparison.filter(item => item.status === 'over').length;

    return { totalBudgeted, totalActual, totalVariance, overBudgetCount };
  }, [budgetComparison]);

  const handleSubmitBudget = () => {
    const data = {
      budget_type: budgetForm.budget_type,
      period_type: budgetForm.period_type,
      year: parseInt(budgetForm.year),
      budgeted_amount: parseFloat(budgetForm.budgeted_amount) || 0,
      notes: budgetForm.notes,
      created_by_id: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name
    };

    if (budgetForm.budget_type === 'expense') {
      data.category = budgetForm.category;
    }

    if (budgetForm.location_id) {
      data.location_id = budgetForm.location_id;
      data.location_name = budgetForm.location_name;
    }

    if (budgetForm.assigned_to_id) {
      data.assigned_to_id = budgetForm.assigned_to_id;
      data.assigned_to_name = budgetForm.assigned_to_name;
    }

    if (budgetForm.period_type === 'monthly') {
      data.month = parseInt(budgetForm.month);
    } else if (budgetForm.period_type === 'quarterly') {
      data.quarter = parseInt(budgetForm.quarter);
    }

    if (editingBudget) {
      updateBudgetMutation.mutate({ id: editingBudget.id, data });
    } else {
      createBudgetMutation.mutate(data);
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      budget_type: budget.budget_type || 'expense',
      category: budget.category || '',
      location_id: budget.location_id || '',
      location_name: budget.location_name || '',
      assigned_to_id: budget.assigned_to_id || '',
      assigned_to_name: budget.assigned_to_name || '',
      period_type: budget.period_type,
      year: budget.year,
      month: budget.month || currentMonth,
      quarter: budget.quarter || currentQuarter,
      budgeted_amount: budget.budgeted_amount?.toString() || "",
      notes: budget.notes || ""
    });
    setShowBudgetDialog(true);
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance) => {
    if (variance > 0) return <TrendingDown className="w-4 h-4 text-green-600" />;
    if (variance < 0) return <TrendingUp className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-[#1EB053]" />
            Budgeting & Forecasting
          </h2>
          <p className="text-sm text-gray-500">Set budgets, track spending, and forecast future expenses</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setEditingBudget(null); setShowBudgetDialog(true); }}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-t-4 border-t-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Budgeted</p>
                <p className="text-lg font-bold text-blue-600">Le {summaryStats.totalBudgeted.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Actual Spending</p>
                <p className="text-lg font-bold text-purple-600">Le {summaryStats.totalActual.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${summaryStats.totalVariance >= 0 ? 'from-green-50 border-t-[#1EB053]' : 'from-red-50 border-t-red-500'} to-white border-t-4`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${summaryStats.totalVariance >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                {summaryStats.totalVariance >= 0 ? (
                  <ArrowDownRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Variance</p>
                <p className={`text-lg font-bold ${summaryStats.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Le {Math.abs(summaryStats.totalVariance).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-t-4 border-t-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Over Budget</p>
                <p className="text-lg font-bold text-amber-600">{summaryStats.overBudgetCount} categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Expense Budgets</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Targets</TabsTrigger>
          <TabsTrigger value="tracking">Variance Tracking</TabsTrigger>
          <TabsTrigger value="forecast">Forecasting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriodType} onValueChange={setSelectedPeriodType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {warehouses.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget vs Actual Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetComparison} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="category" width={100} />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="budgeted" fill="#0072C6" name="Budgeted" />
                    <Bar dataKey="actual" fill="#1EB053" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Budget List */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Budgets</CardTitle>
              <CardDescription>Manage expense budgets by category and location</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Budgeted</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets
                      .filter(b => b.year === selectedYear && b.budget_type === 'expense')
                      .filter(b => selectedLocation === 'all' || b.location_id === selectedLocation || !b.location_id)
                      .map((budget) => {
                        const actual = getActualAmount(budget);
                        const variance = budget.budgeted_amount - actual;
                        const progress = budget.budgeted_amount > 0 ? (actual / budget.budgeted_amount) * 100 : 0;
                        const categoryLabel = EXPENSE_CATEGORIES.find(c => c.value === budget.category)?.label || budget.category;
                        
                        let periodLabel = budget.year.toString();
                        if (budget.period_type === 'monthly') {
                          periodLabel = `${MONTHS[budget.month - 1]} ${budget.year}`;
                        } else if (budget.period_type === 'quarterly') {
                          periodLabel = `Q${budget.quarter} ${budget.year}`;
                        }

                        return (
                          <TableRow key={budget.id}>
                            <TableCell className="font-medium">{categoryLabel}</TableCell>
                            <TableCell>
                              {budget.location_name ? (
                                <Badge variant="outline" className="gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {budget.location_name}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">All</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {budget.assigned_to_name ? (
                                <span className="text-sm">{budget.assigned_to_name}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{periodLabel}</Badge>
                            </TableCell>
                            <TableCell className="text-right">Le {budget.budgeted_amount?.toLocaleString()}</TableCell>
                            <TableCell className={`text-right ${getVarianceColor(variance)}`}>
                              Le {actual.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="w-20">
                                <Progress 
                                  value={Math.min(progress, 100)} 
                                  className={`h-2 ${progress > 100 ? '[&>div]:bg-red-500' : progress > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}%</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {isAdmin && (
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-600"
                                    onClick={() => deleteBudgetMutation.mutate(budget.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Targets Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriodType} onValueChange={setSelectedPeriodType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => { 
                  resetForm(); 
                  setBudgetForm(prev => ({...prev, budget_type: 'revenue_target'}));
                  setEditingBudget(null); 
                  setShowBudgetDialog(true); 
                }}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Set Revenue Target
              </Button>
            )}
          </div>

          {/* Revenue Targets by Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenueTargets.map((item) => (
              <Card key={item.locationId} className={`border-l-4 ${
                item.status === 'achieved' ? 'border-l-green-500' : 
                item.status === 'on_track' ? 'border-l-amber-500' : 'border-l-red-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <h3 className="font-semibold">{item.location}</h3>
                    </div>
                    <Badge className={
                      item.status === 'achieved' ? 'bg-green-100 text-green-700' : 
                      item.status === 'on_track' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }>
                      {item.progress.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Target</span>
                      <span className="font-medium">Le {item.target.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Actual</span>
                      <span className={`font-medium ${item.actual >= item.target ? 'text-green-600' : 'text-amber-600'}`}>
                        Le {item.actual.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(item.progress, 100)} 
                      className={`h-3 ${
                        item.status === 'achieved' ? '[&>div]:bg-green-500' : 
                        item.status === 'on_track' ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                      }`}
                    />
                    <div className={`flex justify-between text-sm font-semibold ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Variance</span>
                      <span>{item.variance >= 0 ? '+' : ''}Le {item.variance.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Targets List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#1EB053]" />
                Revenue Targets by Location
              </CardTitle>
              <CardDescription>Set and track revenue targets for each location</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets
                      .filter(b => b.year === selectedYear && b.budget_type === 'revenue_target')
                      .map((budget) => {
                        const actual = getActualRevenue(budget);
                        const progress = budget.budgeted_amount > 0 ? (actual / budget.budgeted_amount) * 100 : 0;
                        
                        let periodLabel = budget.year.toString();
                        if (budget.period_type === 'monthly') {
                          periodLabel = `${MONTHS[budget.month - 1]} ${budget.year}`;
                        } else if (budget.period_type === 'quarterly') {
                          periodLabel = `Q${budget.quarter} ${budget.year}`;
                        }

                        return (
                          <TableRow key={budget.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {budget.location_name || 'All Locations'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{periodLabel}</Badge>
                            </TableCell>
                            <TableCell className="text-right">Le {budget.budgeted_amount?.toLocaleString()}</TableCell>
                            <TableCell className={`text-right ${actual >= budget.budgeted_amount ? 'text-green-600' : 'text-amber-600'}`}>
                              Le {actual.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="w-24">
                                <Progress 
                                  value={Math.min(progress, 100)} 
                                  className={`h-2 ${progress >= 100 ? '[&>div]:bg-green-500' : progress >= 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}%</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {isAdmin && (
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-600"
                                    onClick={() => deleteBudgetMutation.mutate(budget.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend: Budget vs Actual</CardTitle>
              <CardDescription>Track spending patterns throughout {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="budgeted" fill="#0072C6" name="Budgeted" opacity={0.7} />
                    <Line type="monotone" dataKey="actual" stroke="#1EB053" strokeWidth={3} name="Actual" dot={{ fill: '#1EB053' }} />
                    <ReferenceLine y={0} stroke="#666" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Variance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetComparison.map((item) => (
              <Card key={item.categoryValue} className={`${item.status === 'over' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{item.category}</h3>
                      <p className="text-xs text-gray-500">
                        {item.status === 'over' ? 'Over budget' : 'Under budget'}
                      </p>
                    </div>
                    {item.status === 'over' ? (
                      <Badge variant="destructive">+{Math.abs(item.variancePercent).toFixed(1)}%</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">-{item.variancePercent.toFixed(1)}%</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budgeted</span>
                      <span className="font-medium">Le {item.budgeted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Actual</span>
                      <span className="font-medium">Le {item.actual.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={Math.min((item.actual / item.budgeted) * 100, 100)} 
                      className={`h-2 ${item.status === 'over' ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                    />
                    <div className={`flex justify-between text-sm font-semibold ${getVarianceColor(item.variance)}`}>
                      <span>Variance</span>
                      <span>Le {Math.abs(item.variance).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <div className="flex items-center gap-3">
            <Label>Forecast Period:</Label>
            <Select value={forecastYears.toString()} onValueChange={(v) => setForecastYears(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Year</SelectItem>
                <SelectItem value="2">2 Years</SelectItem>
                <SelectItem value="3">3 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0072C6]" />
                Expense Forecast
              </CardTitle>
              <CardDescription>
                Projected spending for the next {forecastYears} year{forecastYears > 1 ? 's' : ''} based on historical trends and budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" angle={-45} textAnchor="end" height={80} interval={forecastYears > 1 ? 2 : 0} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `Le ${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="budgeted" fill="#0072C6" name="Budgeted" opacity={0.5} />
                    <Line yAxisId="left" type="monotone" dataKey="projected" stroke="#1EB053" strokeWidth={2} name="Projected Spending" dot={false} />
                    <Area yAxisId="right" type="monotone" dataKey="cumulative" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" name="Cumulative" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Projected ({forecastYears}yr)</p>
                <p className="text-2xl font-bold text-[#0072C6]">
                  Le {forecastData.reduce((sum, d) => sum + d.projected, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Avg Monthly Projection</p>
                <p className="text-2xl font-bold text-[#1EB053]">
                  Le {Math.round(forecastData.reduce((sum, d) => sum + d.projected, 0) / forecastData.length).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Budget Coverage</p>
                <p className="text-2xl font-bold text-amber-600">
                  {forecastData.filter(d => d.budgeted > 0).length} / {forecastData.length} months
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'Edit Budget' : budgetForm.budget_type === 'revenue_target' ? 'Set Revenue Target' : 'Create Expense Budget'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Budget Type Selection */}
            <div className="space-y-2">
              <Label>Budget Type</Label>
              <Select 
                value={budgetForm.budget_type} 
                onValueChange={(v) => setBudgetForm({...budgetForm, budget_type: v, category: ''})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense Budget</SelectItem>
                  <SelectItem value="revenue_target">Revenue Target</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expense Category (only for expense budgets) */}
            {budgetForm.budget_type === 'expense' && (
              <div className="space-y-2">
                <Label>Expense Category</Label>
                <Select value={budgetForm.category} onValueChange={(v) => setBudgetForm({...budgetForm, category: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Location Selection */}
            <div className="space-y-2">
              <Label>Location (Warehouse/Store)</Label>
              <Select 
                value={budgetForm.location_id} 
                onValueChange={(v) => {
                  const loc = warehouses.find(w => w.id === v);
                  setBudgetForm({
                    ...budgetForm, 
                    location_id: v, 
                    location_name: loc?.name || ''
                  });
                }}
              >
                <SelectTrigger>
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Locations (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Locations</SelectItem>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assign to Warehouse Manager (for expense budgets) */}
            {budgetForm.budget_type === 'expense' && budgetForm.location_id && (
              <div className="space-y-2">
                <Label>Assign to Manager</Label>
                <Select 
                  value={budgetForm.assigned_to_id} 
                  onValueChange={(v) => {
                    const emp = warehouseManagers.find(e => e.id === v);
                    setBudgetForm({
                      ...budgetForm, 
                      assigned_to_id: v, 
                      assigned_to_name: emp?.full_name || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select manager (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>No Assignment</SelectItem>
                    {warehouseManagers.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period Type</Label>
                <Select value={budgetForm.period_type} onValueChange={(v) => setBudgetForm({...budgetForm, period_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={budgetForm.year.toString()} onValueChange={(v) => setBudgetForm({...budgetForm, year: parseInt(v)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {budgetForm.period_type === 'monthly' && (
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={budgetForm.month.toString()} onValueChange={(v) => setBudgetForm({...budgetForm, month: parseInt(v)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, idx) => (
                      <SelectItem key={idx} value={(idx + 1).toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {budgetForm.period_type === 'quarterly' && (
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={budgetForm.quarter.toString()} onValueChange={(v) => setBudgetForm({...budgetForm, quarter: parseInt(v)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{budgetForm.budget_type === 'revenue_target' ? 'Revenue Target (Le)' : 'Budget Amount (Le)'}</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={budgetForm.budgeted_amount}
                onChange={(e) => setBudgetForm({...budgetForm, budgeted_amount: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                placeholder="Add any notes..."
                value={budgetForm.notes}
                onChange={(e) => setBudgetForm({...budgetForm, notes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitBudget}
              disabled={(budgetForm.budget_type === 'expense' && !budgetForm.category) || !budgetForm.budgeted_amount}
              className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
            >
              {editingBudget ? 'Update' : budgetForm.budget_type === 'revenue_target' ? 'Set Target' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}