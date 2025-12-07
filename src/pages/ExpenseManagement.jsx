import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Filter,
  Calendar,
  AlertTriangle,
  FileText,
  Shield,
  Eye,
  Upload,
  Plus,
  Edit2,
  Printer
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import AIFormAssistant from "@/components/ai/AIFormAssistant";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdvancedDocumentExtractor from "@/components/finance/AdvancedDocumentExtractor";
import ExpenseEntryTemplate from "@/components/templates/ExpenseEntryTemplate";
import PrintableFormsDownload from "@/components/finance/PrintableFormsDownload";

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
  { value: "materials", label: "Building Materials" },
  { value: "labor", label: "Labor & Wages" },
  { value: "equipment", label: "Equipment Rental" },
  { value: "permits", label: "Permits & Fees" },
  { value: "foundation", label: "Foundation Work" },
  { value: "roofing", label: "Roofing" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "finishing", label: "Finishing & Painting" },
  { value: "landscaping", label: "Landscaping" },
  { value: "other", label: "Other" }
];

function ExpenseFormFields({ editingExpense, categories, orgId }) {
  const [formData, setFormData] = React.useState({
    category: editingExpense?.category || 'other',
    description: editingExpense?.description || '',
    vendor: editingExpense?.vendor || '',
    amount: editingExpense?.amount || ''
  });

  const { data: pastExpenses = [] } = useQuery({
    queryKey: ['pastExpenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId, expense_type: 'regular' }, '-created_date', 30),
    enabled: !!orgId,
  });

  const handleAISuggestion = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Category</Label>
        <Select 
          name="category" 
          value={formData.category}
          onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
          required
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
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
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* AI Assistant - auto-suggests category as user types */}
      <div className="col-span-2">
        <AIFormAssistant
          formType="expense"
          formData={formData}
          onSuggestion={handleAISuggestion}
          pastEntries={pastExpenses}
          categories={categories}
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
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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
          value={formData.vendor}
          onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
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
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
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
  );
}

export default function ExpenseManagement() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [dateRange, setDateRange] = useState("this_month");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showFormsDialog, setShowFormsDialog] = useState(false);

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

  const { data: organisation } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => base44.entities.Organisation.filter({ id: orgId }),
    enabled: !!orgId,
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['allExpenses', orgId],
    queryFn: async () => {
      const allExpenses = await base44.entities.Expense.filter({ organisation_id: orgId }, '-date', 5000);
      // Show only regular expenses (explicitly 'regular' or no expense_type set)
      return allExpenses.filter(e => e.expense_type === 'regular' || !e.expense_type);
    },
    enabled: !!orgId && isAdmin,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
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
      case "last_year":
        return { start: new Date(today.getFullYear() - 1, 0, 1), end: new Date(today.getFullYear() - 1, 11, 31) };
      case "all_time":
        return { start: new Date(2020, 0, 1), end: today };
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
    return { total, approved, pending, rejected };
  }, [filteredExpenses]);

  // Mutations
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allExpenses', orgId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', orgId] });
      queryClient.invalidateQueries({ queryKey: ['constructionExpenses', orgId] });
      toast.success("Expense updated");
    },
    onError: (error) => {
      toast.error("Failed to update expense", error.message);
    }
  });

  const handleApprove = (expense) => {
    updateExpenseMutation.mutate({
      id: expense.id,
      data: { 
        status: 'approved',
        approved_by: currentEmployee?.full_name
      }
    });
  };

  const handleReject = (expense) => {
    updateExpenseMutation.mutate({
      id: expense.id,
      data: { status: 'rejected' }
    });
  };

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setShowDetailDialog(true);
  };

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allExpenses', orgId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', orgId] });
      setShowExpenseDialog(false);
      setEditingExpense(null);
      toast.success("Expense recorded", "Expense has been added");
    },
    onError: (error) => {
      toast.error("Failed to record expense", error.message);
    }
  });

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      organisation_id: orgId,
      expense_type: 'regular',
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

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      const expensesToDelete = filteredExpenses;
      for (const expense of expensesToDelete) {
        await base44.entities.Expense.delete(expense.id);
      }
      queryClient.invalidateQueries({ queryKey: ['allExpenses', orgId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', orgId] });
      toast.success("Bulk delete complete", `Deleted ${expensesToDelete.length} expense(s)`);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      toast.error("Bulk delete failed", error.message);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  if (!user || isLoading) {
    return <LoadingSpinner message="Loading Expenses..." fullScreen={true} />;
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
      <div className="flex items-center justify-between">
        <PageHeader
          title="Expense Management"
          subtitle="Review and approve all expense submissions"
          icon={Shield}
        />
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => setShowFormsDialog(true)}
            className="border-[#0072C6]/30 hover:border-[#0072C6] hover:bg-[#0072C6]/10"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Forms
          </Button>
          {filteredExpenses.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(true)}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Delete All ({filteredExpenses.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowUploadDialog(true)}
            className="border-[#0072C6] text-[#0072C6] hover:bg-[#0072C6]/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
          <Button
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseDialog(true);
            }}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Expense
          </Button>
        </div>
      </div>

      {/* Sierra Leone Flag Stripe */}
      <div className="h-1.5 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1EB053]" />
        <div className="flex-1 bg-white border-y" />
        <div className="flex-1 bg-[#0072C6]" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#0072C6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total</p>
                <p className="text-2xl font-bold text-[#0072C6]">Le {totals.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{filteredExpenses.length} items</p>
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
                <p className="text-xs text-gray-500">{filteredExpenses.filter(e => e.status === 'approved').length} items</p>
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
                <p className="text-xs text-gray-500">{filteredExpenses.filter(e => e.status === 'pending').length} items</p>
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
                <p className="text-xs text-gray-500">{filteredExpenses.filter(e => e.status === 'rejected').length} items</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0072C6]" />
            Expense Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Expenses Found"
              description="No expenses match the current filters"
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-sm">
                            {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{expense.description || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{expense.recorded_by_name || '-'}</TableCell>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetails(expense)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {expense.status === 'pending' && isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                                  onClick={() => handleApprove(expense)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(expense)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#0072C6] hover:bg-blue-50"
                                onClick={() => {
                                  setEditingExpense(expense);
                                  setShowExpenseDialog(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                <ScrollArea className="h-[500px]">
                  {filteredExpenses.map((expense) => (
                    <Card key={expense.id} className="mb-3 border-l-4" style={{
                      borderLeftColor: expense.status === 'approved' ? '#1EB053' :
                                      expense.status === 'rejected' ? '#ef4444' : '#f59e0b'
                    }}>
                      <CardContent className="p-4 space-y-3">
                        {/* Header - Description and Amount */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{expense.description || '-'}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                              </Badge>
                              <Badge className={
                                expense.status === 'approved' ? 'bg-green-100 text-green-700 text-xs' :
                                expense.status === 'rejected' ? 'bg-red-100 text-red-700 text-xs' :
                                'bg-amber-100 text-amber-700 text-xs'
                              }>
                                {expense.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-gray-900">Le {expense.amount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">
                              {expense.date ? format(new Date(expense.date), 'MMM d') : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Vendor</p>
                            <p className="font-medium text-gray-700 truncate">{expense.vendor || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Submitted by</p>
                            <p className="font-medium text-gray-700 truncate">{expense.recorded_by_name || '-'}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDetails(expense)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {expense.status === 'pending' && isAdmin && (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApprove(expense)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleReject(expense)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {isAdmin && expense.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-[#0072C6] text-[#0072C6]"
                              onClick={() => {
                                setEditingExpense(expense);
                                setShowExpenseDialog(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{selectedExpense.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-bold text-[#1EB053]">Le {selectedExpense.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{EXPENSE_CATEGORIES.find(c => c.value === selectedExpense.category)?.label || selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedExpense.date ? format(new Date(selectedExpense.date), 'MMM d, yyyy') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium">{selectedExpense.vendor || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{selectedExpense.payment_method?.replace('_', ' ') || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted By</p>
                  <p className="font-medium">{selectedExpense.recorded_by_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={
                    selectedExpense.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedExpense.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }>
                    {selectedExpense.status}
                  </Badge>
                </div>
              </div>
              {selectedExpense.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedExpense.notes}</p>
                </div>
              )}
              {selectedExpense.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedExpense);
                      setShowDetailDialog(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      handleReject(selectedExpense);
                      setShowDetailDialog(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog - Advanced */}
      <AdvancedDocumentExtractor
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        type="auto"
        expenseType="regular"
        orgId={orgId}
        currentEmployee={currentEmployee}
        categories={EXPENSE_CATEGORIES}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['allExpenses', orgId] });
          queryClient.invalidateQueries({ queryKey: ['expenses', orgId] });
        }}
      />

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
          <div className="h-2 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          <div className="px-6 py-4 bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingExpense ? 'Edit Expense' : 'Record Regular Expense'}
                </h2>
                <p className="text-white/80 text-sm">Track operational expenses</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            <ExpenseFormFields 
              editingExpense={editingExpense}
              categories={EXPENSE_CATEGORIES}
              orgId={orgId}
            />

            <div className="flex gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setShowExpenseDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#1EB053] to-[#0072C6] w-full sm:w-auto">
                {editingExpense ? 'Update Expense' : 'Record Expense'}
              </Button>
            </div>
          </form>

          <div className="h-1 flex">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable Forms Dialog */}
      <PrintableFormsDownload
        open={showFormsDialog}
        onOpenChange={setShowFormsDialog}
        organisation={organisation?.[0]}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Bulk Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{filteredExpenses.length} expense record(s)</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">⚠️ This action cannot be undone!</p>
              <p className="text-xs text-red-600 mt-1">All selected expense records will be permanently deleted.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBulkDeleteDialog(false)}
                disabled={bulkDeleteLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
              >
                {bulkDeleteLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Delete All
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}