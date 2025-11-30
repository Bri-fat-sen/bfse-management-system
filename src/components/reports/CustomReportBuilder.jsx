import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Play,
  Calendar,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  GripVertical,
  BarChart3,
  PieChart,
  TrendingUp,
  Table,
  Filter,
  Download,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const REPORT_TYPES = [
  { value: "sales", label: "Sales Report", icon: BarChart3, color: "#1EB053" },
  { value: "inventory", label: "Inventory Report", icon: Table, color: "#0072C6" },
  { value: "payroll", label: "Payroll Report", icon: FileText, color: "#D4AF37" },
  { value: "transport", label: "Transport Report", icon: TrendingUp, color: "#8B5CF6" },
  { value: "expenses", label: "Expense Report", icon: PieChart, color: "#EF4444" },
];

const COLUMN_OPTIONS = {
  sales: [
    { id: "sale_number", label: "Sale Number" },
    { id: "created_date", label: "Date" },
    { id: "customer_name", label: "Customer" },
    { id: "employee_name", label: "Sales Person" },
    { id: "sale_type", label: "Sale Type" },
    { id: "items_count", label: "Items Count" },
    { id: "subtotal", label: "Subtotal" },
    { id: "discount", label: "Discount" },
    { id: "tax", label: "Tax" },
    { id: "total_amount", label: "Total Amount" },
    { id: "payment_method", label: "Payment Method" },
    { id: "payment_status", label: "Payment Status" },
  ],
  inventory: [
    { id: "name", label: "Product Name" },
    { id: "sku", label: "SKU" },
    { id: "category", label: "Category" },
    { id: "stock_quantity", label: "Stock Quantity" },
    { id: "unit_price", label: "Unit Price" },
    { id: "cost_price", label: "Cost Price" },
    { id: "stock_value", label: "Stock Value" },
    { id: "low_stock_threshold", label: "Reorder Level" },
    { id: "status", label: "Status" },
  ],
  payroll: [
    { id: "employee_name", label: "Employee Name" },
    { id: "employee_role", label: "Role" },
    { id: "period_start", label: "Period Start" },
    { id: "period_end", label: "Period End" },
    { id: "base_salary", label: "Base Salary" },
    { id: "total_allowances", label: "Allowances" },
    { id: "total_bonuses", label: "Bonuses" },
    { id: "gross_pay", label: "Gross Pay" },
    { id: "nassit_employee", label: "NASSIT (Employee)" },
    { id: "paye_tax", label: "PAYE Tax" },
    { id: "total_deductions", label: "Total Deductions" },
    { id: "net_pay", label: "Net Pay" },
    { id: "status", label: "Status" },
  ],
  transport: [
    { id: "date", label: "Date" },
    { id: "vehicle_registration", label: "Vehicle" },
    { id: "driver_name", label: "Driver" },
    { id: "route_name", label: "Route" },
    { id: "passengers", label: "Passengers" },
    { id: "ticket_revenue", label: "Revenue" },
    { id: "fuel_cost", label: "Fuel Cost" },
    { id: "other_expenses", label: "Other Expenses" },
    { id: "net_revenue", label: "Net Revenue" },
    { id: "status", label: "Status" },
  ],
  expenses: [
    { id: "date", label: "Date" },
    { id: "category", label: "Category" },
    { id: "description", label: "Description" },
    { id: "amount", label: "Amount" },
    { id: "payment_method", label: "Payment Method" },
    { id: "employee_name", label: "Recorded By" },
    { id: "status", label: "Status" },
    { id: "approved_by_name", label: "Approved By" },
  ],
};

const GROUP_BY_OPTIONS = {
  sales: [
    { value: "none", label: "No Grouping" },
    { value: "day", label: "By Day" },
    { value: "week", label: "By Week" },
    { value: "month", label: "By Month" },
    { value: "employee_name", label: "By Employee" },
    { value: "sale_type", label: "By Sale Type" },
    { value: "payment_method", label: "By Payment Method" },
  ],
  inventory: [
    { value: "none", label: "No Grouping" },
    { value: "category", label: "By Category" },
    { value: "status", label: "By Status" },
  ],
  payroll: [
    { value: "none", label: "No Grouping" },
    { value: "employee_role", label: "By Role" },
    { value: "status", label: "By Status" },
    { value: "month", label: "By Month" },
  ],
  transport: [
    { value: "none", label: "No Grouping" },
    { value: "day", label: "By Day" },
    { value: "week", label: "By Week" },
    { value: "driver_name", label: "By Driver" },
    { value: "vehicle_registration", label: "By Vehicle" },
    { value: "route_name", label: "By Route" },
  ],
  expenses: [
    { value: "none", label: "No Grouping" },
    { value: "day", label: "By Day" },
    { value: "month", label: "By Month" },
    { value: "category", label: "By Category" },
    { value: "employee_name", label: "By Employee" },
  ],
};

const DATE_RANGE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "custom", label: "Custom Range" },
];

export default function CustomReportBuilder({ 
  open, 
  onOpenChange, 
  orgId, 
  currentEmployee,
  employees = [],
  onReportGenerated 
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [reportConfig, setReportConfig] = useState({
    name: "",
    description: "",
    report_type: "sales",
    columns: ["created_date", "customer_name", "total_amount", "payment_method"],
    filters: {
      date_range: "last_30_days",
      start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      employee_ids: [],
      categories: [],
      statuses: [],
      payment_methods: [],
    },
    group_by: "none",
    sort_by: "created_date",
    sort_order: "desc",
    is_shared: false,
    schedule: {
      enabled: false,
      frequency: "weekly",
      day_of_week: 1,
      day_of_month: 1,
      time: "09:00",
      recipients: [],
    }
  });
  const [newRecipient, setNewRecipient] = useState("");

  const saveReportMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      toast.success("Report saved successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: () => toast.error("Failed to save report")
  });

  const resetForm = () => {
    setStep(1);
    setReportConfig({
      name: "",
      description: "",
      report_type: "sales",
      columns: ["created_date", "customer_name", "total_amount", "payment_method"],
      filters: {
        date_range: "last_30_days",
        start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        employee_ids: [],
        categories: [],
        statuses: [],
        payment_methods: [],
      },
      group_by: "none",
      sort_by: "created_date",
      sort_order: "desc",
      is_shared: false,
      schedule: {
        enabled: false,
        frequency: "weekly",
        day_of_week: 1,
        day_of_month: 1,
        time: "09:00",
        recipients: [],
      }
    });
  };

  const handleDateRangeChange = (preset) => {
    const today = new Date();
    let start, end;

    switch (preset) {
      case "today":
        start = end = format(today, 'yyyy-MM-dd');
        break;
      case "yesterday":
        start = end = format(subDays(today, 1), 'yyyy-MM-dd');
        break;
      case "last_7_days":
        start = format(subDays(today, 7), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case "last_30_days":
        start = format(subDays(today, 30), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case "this_month":
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case "last_month":
        const lastMonth = subMonths(today, 1);
        start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case "last_3_months":
        start = format(subMonths(today, 3), 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    setReportConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, date_range: preset, start_date: start, end_date: end }
    }));
  };

  const toggleColumn = (columnId) => {
    setReportConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(columnId)
        ? prev.columns.filter(c => c !== columnId)
        : [...prev.columns, columnId]
    }));
  };

  const addRecipient = () => {
    if (!newRecipient || !newRecipient.includes('@')) return;
    setReportConfig(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        recipients: [...prev.schedule.recipients, newRecipient]
      }
    }));
    setNewRecipient("");
  };

  const removeRecipient = (email) => {
    setReportConfig(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        recipients: prev.schedule.recipients.filter(r => r !== email)
      }
    }));
  };

  const handleSave = () => {
    if (!reportConfig.name.trim()) {
      toast.error("Please enter a report name");
      return;
    }
    if (reportConfig.columns.length === 0) {
      toast.error("Please select at least one column");
      return;
    }

    saveReportMutation.mutate({
      organisation_id: orgId,
      created_by_id: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name,
      ...reportConfig
    });
  };

  const handleGenerateNow = () => {
    if (onReportGenerated) {
      onReportGenerated(reportConfig);
    }
    onOpenChange(false);
  };

  const availableColumns = COLUMN_OPTIONS[reportConfig.report_type] || [];
  const groupByOptions = GROUP_BY_OPTIONS[reportConfig.report_type] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6]">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Custom Report Builder
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === s
                    ? "bg-gradient-to-r from-[#1EB053] to-[#0072C6] text-white"
                    : step > s
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {s}
              </button>
              {s < 3 && <div className={`w-12 h-1 mx-1 rounded ${step > s ? "bg-green-200" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-xs text-gray-500 mb-4">
          <span>Report Type</span>
          <span>Columns & Filters</span>
          <span>Schedule</span>
        </div>

        {/* Step 1: Report Type */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Name *</Label>
              <Input
                value={reportConfig.name}
                onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Monthly Sales Summary"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={reportConfig.description}
                onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this report..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Report Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {REPORT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setReportConfig(prev => ({
                        ...prev,
                        report_type: type.value,
                        columns: COLUMN_OPTIONS[type.value]?.slice(0, 4).map(c => c.id) || [],
                        group_by: "none"
                      }));
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      reportConfig.report_type === type.value
                        ? "border-[#1EB053] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <type.icon className="w-6 h-6 mx-auto mb-2" style={{ color: type.color }} />
                    <p className="text-sm font-medium">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Columns & Filters */}
        {step === 2 && (
          <div className="space-y-4">
            <Accordion type="multiple" defaultValue={["columns", "filters"]} className="space-y-2">
              <AccordionItem value="columns" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#1EB053]" />
                    <span>Select Columns ({reportConfig.columns.length} selected)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 py-2">
                    {availableColumns.map((col) => (
                      <div key={col.id} className="flex items-center gap-2">
                        <Checkbox
                          id={col.id}
                          checked={reportConfig.columns.includes(col.id)}
                          onCheckedChange={() => toggleColumn(col.id)}
                        />
                        <label htmlFor={col.id} className="text-sm cursor-pointer">{col.label}</label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filters" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#0072C6]" />
                    <span>Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Select
                          value={reportConfig.filters.date_range}
                          onValueChange={handleDateRangeChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DATE_RANGE_PRESETS.map((preset) => (
                              <SelectItem key={preset.value} value={preset.value}>
                                {preset.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {reportConfig.filters.date_range === "custom" && (
                        <>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={reportConfig.filters.start_date}
                              onChange={(e) => setReportConfig(prev => ({
                                ...prev,
                                filters: { ...prev.filters, start_date: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={reportConfig.filters.end_date}
                              onChange={(e) => setReportConfig(prev => ({
                                ...prev,
                                filters: { ...prev.filters, end_date: e.target.value }
                              }))}
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label>Group By</Label>
                        <Select
                          value={reportConfig.group_by}
                          onValueChange={(v) => setReportConfig(prev => ({ ...prev, group_by: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {groupByOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="options" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Display Options</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sort By</Label>
                        <Select
                          value={reportConfig.sort_by}
                          onValueChange={(v) => setReportConfig(prev => ({ ...prev, sort_by: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableColumns.map((col) => (
                              <SelectItem key={col.id} value={col.id}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Select
                          value={reportConfig.sort_order}
                          onValueChange={(v) => setReportConfig(prev => ({ ...prev, sort_order: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={reportConfig.is_shared}
                        onCheckedChange={(v) => setReportConfig(prev => ({ ...prev, is_shared: v }))}
                      />
                      <Label>Share with team members</Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#1EB053]" />
                <div>
                  <p className="font-medium">Schedule Automatic Reports</p>
                  <p className="text-sm text-gray-500">Receive reports via email on a regular basis</p>
                </div>
              </div>
              <Switch
                checked={reportConfig.schedule.enabled}
                onCheckedChange={(v) => setReportConfig(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, enabled: v }
                }))}
              />
            </div>

            {reportConfig.schedule.enabled && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={reportConfig.schedule.frequency}
                      onValueChange={(v) => setReportConfig(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, frequency: v }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reportConfig.schedule.frequency === "weekly" && (
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select
                        value={String(reportConfig.schedule.day_of_week)}
                        onValueChange={(v) => setReportConfig(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, day_of_week: parseInt(v) }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="0">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {reportConfig.schedule.frequency === "monthly" && (
                    <div className="space-y-2">
                      <Label>Day of Month</Label>
                      <Select
                        value={String(reportConfig.schedule.day_of_month)}
                        onValueChange={(v) => setReportConfig(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, day_of_month: parseInt(v) }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 5, 10, 15, 20, 25, 28].map((d) => (
                            <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={reportConfig.schedule.time}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, time: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      placeholder="Enter email address"
                      onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                    />
                    <Button type="button" onClick={addRecipient}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reportConfig.schedule.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {email}
                        <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <Card className="bg-gradient-to-br from-[#1EB053]/5 to-[#0072C6]/5">
              <CardHeader>
                <CardTitle className="text-base">Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{reportConfig.name || "Untitled"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{reportConfig.report_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Columns:</span>
                  <span className="font-medium">{reportConfig.columns.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Range:</span>
                  <span className="font-medium">{reportConfig.filters.start_date} to {reportConfig.filters.end_date}</span>
                </div>
                {reportConfig.schedule.enabled && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Schedule:</span>
                    <span className="font-medium capitalize">{reportConfig.schedule.frequency} at {reportConfig.schedule.time}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="bg-[#1EB053] hover:bg-[#178f43]">
              Next
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleGenerateNow}>
                <Play className="w-4 h-4 mr-2" />
                Generate Now
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveReportMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {saveReportMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Report
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}