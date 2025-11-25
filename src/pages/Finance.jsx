import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Plus,
  Download,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

const EXPENSE_CATEGORIES = [
  "fuel", "maintenance", "utilities", "supplies", "rent", 
  "salaries", "transport", "marketing", "insurance", "petty_cash", "other"
];

const CATEGORY_COLORS = {
  fuel: "#1EB053",
  maintenance: "#1D5FC3",
  utilities: "#D4AF37",
  supplies: "#8B5CF6",
  rent: "#EC4899",
  salaries: "#14B8A6",
  transport: "#F97316",
  marketing: "#6366F1",
  insurance: "#84CC16",
  petty_cash: "#06B6D4",
  other: "#6B7280"
};

export default function Finance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: employee } = useQuery({
    queryKey: ['employee', user?.email],
    queryFn: () => base44.entities.Employee.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const currentEmployee = employee?.[0];
  const orgId = currentEmployee?.organisation_id;

  const { data: expenses = [] } = useQuery({
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
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowExpenseDialog(false);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  // Calculate financial metrics
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0) +
                       trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // This month's data
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthExpenses = expenses.filter(e => 
    e.date && new Date(e.date) >= thisMonthStart && new Date(e.date) <= thisMonthEnd
  );
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Expense by category
  const expenseByCategory = EXPENSE_CATEGORIES.map(cat => ({
    name: cat.replace(/_/g, ' '),
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.amount || 0), 0),
    color: CATEGORY_COLORS[cat]
  })).filter(item => item.value > 0);

  // Revenue trend data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayRevenue = sales.filter(s => 
      s.created_date && format(new Date(s.created_date), 'yyyy-MM-dd') === dateStr
    ).reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const dayExpense = expenses.filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
      date: format(date, 'EEE'),
      revenue: dayRevenue,
      expense: dayExpense,
      profit: dayRevenue - dayExpense
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Finance" 
        subtitle="Track revenue, expenses, and profitability"
        action={() => setShowExpenseDialog(true)}
        actionLabel="Add Expense"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Le ${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
          trend="up"
          trendValue="+8.2%"
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
          color="blue"
          trend={netProfit >= 0 ? "up" : "down"}
          trendValue={`${profitMargin}% margin`}
        />
        <StatCard
          title="This Month"
          value={`Le ${thisMonthTotal.toLocaleString()}`}
          icon={Wallet}
          color="gold"
          subtitle="expenses"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue vs Expense Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue vs Expenses (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last7Days}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1EB053" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1EB053" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => `Le ${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#1EB053" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense by Category */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPie>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                    </RechartPie>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {expenseByCategory.slice(0, 6).map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="capitalize truncate">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm mt-6">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.slice(0, 10).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.date && format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge 
                          style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}20`, color: CATEGORY_COLORS[expense.category] }}
                          className="capitalize"
                        >
                          {expense.category?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.vendor || "-"}</TableCell>
                      <TableCell className="font-medium">Le {expense.amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          expense.status === 'approved' ? "bg-green-100 text-green-800" :
                          expense.status === 'rejected' ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {expense.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Expenses</CardTitle>
              <div className="flex gap-2">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.date && format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="capitalize">{expense.category?.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.vendor || "-"}</TableCell>
                      <TableCell className="capitalize">{expense.payment_method?.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="font-medium">Le {expense.amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          expense.status === 'approved' ? "bg-green-100 text-green-800" :
                          expense.status === 'rejected' ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => updateExpenseMutation.mutate({ 
                                id: expense.id, 
                                data: { status: 'approved', approved_by: currentEmployee?.full_name }
                              })}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => updateExpenseMutation.mutate({ 
                                id: expense.id, 
                                data: { status: 'rejected' }
                              })}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Profit Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip formatter={(value) => `Le ${value.toLocaleString()}`} />
                      <Bar dataKey="profit" fill="#1EB053" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-xl font-bold text-green-600">Le {totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-xl font-bold text-red-600">Le {totalExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Net Profit</p>
                      <p className="text-xl font-bold text-blue-600">Le {netProfit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="font-bold">{profitMargin}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm 
            orgId={orgId}
            employeeId={currentEmployee?.id}
            employeeName={currentEmployee?.full_name}
            onSave={(data) => createExpenseMutation.mutateAsync(data)}
            onCancel={() => setShowExpenseDialog(false)}
            isLoading={createExpenseMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExpenseForm({ orgId, employeeId, employeeName, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    vendor: "",
    payment_method: "cash",
    notes: ""
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Category</Label>
        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Description</Label>
        <Input 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Expense description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Amount (Le)</Label>
          <Input 
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input 
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Vendor</Label>
          <Input 
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            placeholder="Vendor name"
          />
        </div>
        <div>
          <Label>Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
            <SelectTrigger>
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
      </div>
      <div>
        <Label>Notes (optional)</Label>
        <Input 
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={() => onSave({
            ...formData,
            organisation_id: orgId,
            recorded_by: employeeId,
            recorded_by_name: employeeName,
            status: "pending"
          })}
          disabled={isLoading || !formData.category || !formData.amount}
          className="sl-gradient"
        >
          {isLoading ? "Saving..." : "Save Expense"}
        </Button>
      </div>
    </div>
  );
}