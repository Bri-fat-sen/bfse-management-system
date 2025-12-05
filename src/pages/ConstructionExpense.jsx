import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  HardHat,
  Hammer,
  Truck,
  Package,
  Users,
  FileText,
  Filter,
  Download,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const CONSTRUCTION_CATEGORIES = [
  { value: "materials", label: "Building Materials", icon: Package },
  { value: "labor", label: "Labor & Wages", icon: Users },
  { value: "equipment", label: "Equipment Rental", icon: Truck },
  { value: "permits", label: "Permits & Fees", icon: FileText },
  { value: "foundation", label: "Foundation Work", icon: Building2 },
  { value: "roofing", label: "Roofing", icon: HardHat },
  { value: "electrical", label: "Electrical", icon: Hammer },
  { value: "plumbing", label: "Plumbing", icon: Hammer },
  { value: "finishing", label: "Finishing & Painting", icon: Hammer },
  { value: "landscaping", label: "Landscaping", icon: Hammer },
  { value: "transport", label: "Transport & Delivery", icon: Truck },
  { value: "other", label: "Other", icon: FileText }
];

const COLORS = ['#1EB053', '#0072C6', '#D4AF37', '#0F1F3C', '#9333ea', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];

export default function ConstructionExpense() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
  const isAdmin = ['super_admin', 'org_admin'].includes(currentEmployee?.role);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['constructionExpenses', orgId],
    queryFn: async () => {
      const allExpenses = await base44.entities.Expense.filter({ organisation_id: orgId }, '-date', 500);
      // Filter for construction-related categories
      return allExpenses.filter(e => 
        CONSTRUCTION_CATEGORIES.some(cat => cat.value === e.category) ||
        e.category === 'construction' ||
        e.notes?.toLowerCase().includes('construction') ||
        e.description?.toLowerCase().includes('construction') ||
        e.description?.toLowerCase().includes('building')
      );
    },
    enabled: !!orgId && isAdmin,
  });

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  // Date range calculation
  const getDateRange = useMemo(() => {
    const today = new Date();
    switch (dateRange) {
      case "today": return { start: today, end: today };
      case "this_week": 
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: today };
      case "this_month": return { start: startOfMonth(today), end: today };
      case "last_month": 
        const lm = subMonths(today, 1);
        return { start: startOfMonth(lm), end: endOfMonth(lm) };
      case "last_3_months":
        return { start: startOfMonth(subMonths(today, 2)), end: today };
      case "this_year": 
        return { start: new Date(today.getFullYear(), 0, 1), end: today };
      default: return { start: startOfMonth(today), end: today };
    }
  }, [dateRange]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date || e.created_date);
      const dateMatch = d >= getDateRange.start && d <= getDateRange.end;
      const categoryMatch = categoryFilter === "all" || e.category === categoryFilter;
      const statusMatch = statusFilter === "all" || e.status === statusFilter;
      return dateMatch && categoryMatch && statusMatch;
    });
  }, [expenses, getDateRange, categoryFilter, statusFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const approved = filteredExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.amount || 0), 0);
    const pending = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0);
    const rejected = filteredExpenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + (e.amount || 0), 0);

    // By category
    const byCategory = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
    });

    return { total, approved, pending, rejected, byCategory };
  }, [filteredExpenses]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date || e.created_date);
        return d >= monthStart && d <= monthEnd;
      });

      const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      data.push({
        month: format(date, 'MMM'),
        total,
        count: monthExpenses.length
      });
    }
    return data;
  }, [expenses]);

  // Category pie data
  const categoryPieData = useMemo(() => {
    return Object.entries(totals.byCategory)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: CONSTRUCTION_CATEGORIES.find(c => c.value === name)?.label || name,
        value
      }));
  }, [totals.byCategory]);

  // Mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constructionExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowExpenseDialog(false);
      setEditingExpense(null);
      toast.success("Expense recorded", "Construction expense has been added");
    },
    onError: (error) => {
      toast.error("Failed to record expense", error.message);
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constructionExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowExpenseDialog(false);
      setEditingExpense(null);
      toast.success("Expense updated");
    },
    onError: (error) => {
      toast.error("Failed to update expense", error.message);
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constructionExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Expense deleted");
    }
  });

  const handleSubmitExpense = (e) => {
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
      status: formData.get('status') || 'pending',
      notes: formData.get('notes'),
    };

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseDialog(true);
  };

  const handleApproveExpense = (expense) => {
    updateExpenseMutation.mutate({
      id: expense.id,
      data: { 
        status: 'approved',
        approved_by: currentEmployee?.full_name
      }
    });
  };

  const handleRejectExpense = (expense) => {
    updateExpenseMutation.mutate({
      id: expense.id,
      data: { status: 'rejected' }
    });
  };

  if (!user || isLoading) {
    return <LoadingSpinner message="Loading Construction Expenses..." fullScreen={true} />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Access Restricted</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          This page is only accessible to Organisation Admins and Super Admins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Construction Expenses</h1>
              <p className="text-sm text-gray-500">Track and manage all construction-related expenses</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingExpense(null); setShowExpenseDialog(true); }}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Expense
        </Button>
      </div>

      {/* Sierra Leone Flag Stripe */}
      <div className="h-1.5 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CONSTRUCTION_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Expenses</p>
                <p className="text-2xl font-bold text-[#0072C6]">Le {totals.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{filteredExpenses.length} records</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#0072C6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1EB053]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Approved</p>
                <p className="text-2xl font-bold text-[#1EB053]">Le {totals.approved.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{filteredExpenses.filter(e => e.status === 'approved').length} records</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Pending</p>
                <p className="text-2xl font-bold text-amber-600">Le {totals.pending.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{filteredExpenses.filter(e => e.status === 'pending').length} records</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Rejected</p>
                <p className="text-2xl font-bold text-red-500">Le {totals.rejected.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{filteredExpenses.filter(e => e.status === 'rejected').length} records</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="overflow-hidden">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0072C6]" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `Le ${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  <Bar dataKey="total" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1EB053" />
                      <stop offset="100%" stopColor="#0072C6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="overflow-hidden">
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1EB053]" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPieData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-gray-500">
                No data for this period
              </div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card className="overflow-hidden">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0072C6]" />
            Expense Records
          </CardTitle>
          <CardDescription>All construction-related expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <HardHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No construction expenses found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => {
                    const CategoryIcon = CONSTRUCTION_CATEGORIES.find(c => c.value === expense.category)?.icon || FileText;
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm">
                          {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{expense.description || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {CONSTRUCTION_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{expense.vendor || '-'}</TableCell>
                        <TableCell className="text-right font-bold">Le {expense.amount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={
                            expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                            expense.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }>
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {expense.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                                  onClick={() => handleApproveExpense(expense)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                                  onClick={() => handleRejectExpense(expense)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => deleteExpenseMutation.mutate(expense.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
          {/* Sierra Leone Flag Header */}
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          {/* Header with gradient */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingExpense ? 'Edit Construction Expense' : 'Record Construction Expense'}
                </h2>
                <p className="text-white/80 text-sm">Track construction-related costs</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitExpense} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Category</Label>
                <Select name="category" defaultValue={editingExpense?.category || ""} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSTRUCTION_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>Description</Label>
                <Input 
                  name="description" 
                  required 
                  className="mt-1" 
                  placeholder="What was this expense for?"
                  defaultValue={editingExpense?.description || ""}
                />
              </div>

              <div>
                <Label>Amount (Le)</Label>
                <Input 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  required 
                  className="mt-1"
                  defaultValue={editingExpense?.amount || ""}
                />
              </div>

              <div>
                <Label>Date</Label>
                <Input 
                  name="date" 
                  type="date" 
                  defaultValue={editingExpense?.date || format(new Date(), 'yyyy-MM-dd')} 
                  required 
                  className="mt-1" 
                />
              </div>

              <div>
                <Label>Vendor/Supplier</Label>
                <Input 
                  name="vendor" 
                  className="mt-1" 
                  placeholder="Vendor name"
                  defaultValue={editingExpense?.vendor || ""}
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select name="payment_method" defaultValue={editingExpense?.payment_method || "cash"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={editingExpense?.status || "pending"}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea 
                  name="notes" 
                  className="mt-1" 
                  placeholder="Additional details..."
                  defaultValue={editingExpense?.notes || ""}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowExpenseDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] w-full sm:w-auto">
                {editingExpense ? 'Update Expense' : 'Record Expense'}
              </Button>
            </DialogFooter>
          </form>

          {/* Bottom flag stripe */}
          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}