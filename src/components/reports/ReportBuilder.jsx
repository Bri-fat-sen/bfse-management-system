import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Filter,
  Columns,
  BarChart3,
  Clock,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react";

const REPORT_TYPES = {
  sales: {
    label: "Sales Report",
    dataSources: ["Sale"],
    columns: [
      { field: "sale_number", label: "Sale #" },
      { field: "created_date", label: "Date" },
      { field: "employee_name", label: "Salesperson" },
      { field: "customer_name", label: "Customer" },
      { field: "sale_type", label: "Type" },
      { field: "total_amount", label: "Total", aggregate: "sum" },
      { field: "payment_method", label: "Payment" },
      { field: "payment_status", label: "Status" }
    ],
    groupByOptions: ["sale_type", "employee_name", "payment_method", "payment_status"]
  },
  inventory: {
    label: "Inventory Report",
    dataSources: ["Product", "StockLevel"],
    columns: [
      { field: "name", label: "Product" },
      { field: "sku", label: "SKU" },
      { field: "category", label: "Category" },
      { field: "quantity", label: "Stock", aggregate: "sum" },
      { field: "unit_price", label: "Unit Price" },
      { field: "cost_price", label: "Cost Price" },
      { field: "warehouse_name", label: "Location" }
    ],
    groupByOptions: ["category", "warehouse_name"]
  },
  payroll: {
    label: "Payroll Report",
    dataSources: ["Payroll"],
    columns: [
      { field: "employee_name", label: "Employee" },
      { field: "employee_role", label: "Role" },
      { field: "period_start", label: "Period Start" },
      { field: "period_end", label: "Period End" },
      { field: "base_salary", label: "Base Salary", aggregate: "sum" },
      { field: "gross_pay", label: "Gross Pay", aggregate: "sum" },
      { field: "total_deductions", label: "Deductions", aggregate: "sum" },
      { field: "net_pay", label: "Net Pay", aggregate: "sum" },
      { field: "status", label: "Status" }
    ],
    groupByOptions: ["employee_role", "status", "employee_location"]
  },
  transport: {
    label: "Transport Report",
    dataSources: ["Trip", "TruckContract"],
    columns: [
      { field: "date", label: "Date" },
      { field: "vehicle_registration", label: "Vehicle" },
      { field: "driver_name", label: "Driver" },
      { field: "route_name", label: "Route" },
      { field: "passengers", label: "Passengers", aggregate: "sum" },
      { field: "ticket_revenue", label: "Revenue", aggregate: "sum" },
      { field: "fuel_cost", label: "Fuel Cost", aggregate: "sum" },
      { field: "net_revenue", label: "Net Revenue", aggregate: "sum" },
      { field: "status", label: "Status" }
    ],
    groupByOptions: ["vehicle_registration", "driver_name", "route_name", "status"]
  }
};

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" }
];

export default function ReportBuilder({ 
  report, 
  onSave, 
  onCancel, 
  employees = [], 
  warehouses = [], 
  vehicles = [] 
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    report_type: "sales",
    filters: {
      date_range: "this_month",
      start_date: "",
      end_date: "",
      employee_ids: [],
      warehouse_ids: [],
      vehicle_ids: [],
      categories: [],
      statuses: [],
      payment_methods: [],
      sale_types: []
    },
    columns: [],
    group_by: "",
    sort_by: "",
    sort_order: "desc",
    chart_type: "none",
    chart_config: { x_axis: "", y_axis: "", series: [] },
    schedule: {
      enabled: false,
      frequency: "weekly",
      day_of_week: 1,
      day_of_month: 1,
      time: "08:00",
      recipients: []
    },
    is_shared: false,
    ...report
  });

  const [activeTab, setActiveTab] = useState("basics");
  const [newRecipient, setNewRecipient] = useState("");

  useEffect(() => {
    if (!report) {
      const typeConfig = REPORT_TYPES[formData.report_type];
      setFormData(prev => ({
        ...prev,
        columns: typeConfig.columns.map(col => ({ ...col, visible: true, aggregate: col.aggregate || "none" }))
      }));
    }
  }, [formData.report_type, report]);

  const handleTypeChange = (type) => {
    const typeConfig = REPORT_TYPES[type];
    setFormData(prev => ({
      ...prev,
      report_type: type,
      columns: typeConfig.columns.map(col => ({ ...col, visible: true, aggregate: col.aggregate || "none" })),
      group_by: "",
      sort_by: ""
    }));
  };

  const toggleColumn = (field) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.field === field ? { ...col, visible: !col.visible } : col
      )
    }));
  };

  const updateColumnAggregate = (field, aggregate) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.field === field ? { ...col, aggregate } : col
      )
    }));
  };

  const addRecipient = () => {
    if (newRecipient && !formData.schedule.recipients.includes(newRecipient)) {
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          recipients: [...prev.schedule.recipients, newRecipient]
        }
      }));
      setNewRecipient("");
    }
  };

  const removeRecipient = (email) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        recipients: prev.schedule.recipients.filter(r => r !== email)
      }
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const typeConfig = REPORT_TYPES[formData.report_type];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basics" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Basics</span>
          </TabsTrigger>
          <TabsTrigger value="filters" className="gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </TabsTrigger>
          <TabsTrigger value="columns" className="gap-2">
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">Columns</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Charts</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Report Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Monthly Sales Summary"
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type *</Label>
              <Select value={formData.report_type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this report tracks..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_shared}
              onCheckedChange={(checked) => setFormData({ ...formData, is_shared: checked })}
            />
            <Label>Share with team members</Label>
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Date Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={formData.filters.date_range} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  filters: { ...formData.filters, date_range: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.filters.date_range === "custom" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.filters.start_date}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, start_date: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.filters.end_date}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, end_date: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(formData.report_type === "sales" || formData.report_type === "payroll") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Employee Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employees.slice(0, 10).map(emp => (
                    <Badge
                      key={emp.id}
                      variant={formData.filters.employee_ids.includes(emp.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const ids = formData.filters.employee_ids.includes(emp.id)
                          ? formData.filters.employee_ids.filter(id => id !== emp.id)
                          : [...formData.filters.employee_ids, emp.id];
                        setFormData({
                          ...formData,
                          filters: { ...formData.filters, employee_ids: ids }
                        });
                      }}
                    >
                      {emp.full_name}
                    </Badge>
                  ))}
                  {formData.filters.employee_ids.length === 0 && (
                    <p className="text-sm text-gray-500">All employees (no filter)</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {formData.report_type === "inventory" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Warehouse Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {warehouses.map(wh => (
                    <Badge
                      key={wh.id}
                      variant={formData.filters.warehouse_ids.includes(wh.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const ids = formData.filters.warehouse_ids.includes(wh.id)
                          ? formData.filters.warehouse_ids.filter(id => id !== wh.id)
                          : [...formData.filters.warehouse_ids, wh.id];
                        setFormData({
                          ...formData,
                          filters: { ...formData.filters, warehouse_ids: ids }
                        });
                      }}
                    >
                      {wh.name}
                    </Badge>
                  ))}
                  {formData.filters.warehouse_ids.length === 0 && (
                    <p className="text-sm text-gray-500">All warehouses (no filter)</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {formData.report_type === "sales" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sale Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["retail", "warehouse", "vehicle"].map(type => (
                    <Badge
                      key={type}
                      variant={formData.filters.sale_types.includes(type) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        const types = formData.filters.sale_types.includes(type)
                          ? formData.filters.sale_types.filter(t => t !== type)
                          : [...formData.filters.sale_types, type];
                        setFormData({
                          ...formData,
                          filters: { ...formData.filters, sale_types: types }
                        });
                      }}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="columns" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.columns.map(col => (
                  <div key={col.field} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={col.visible}
                        onCheckedChange={() => toggleColumn(col.field)}
                      />
                      <span className={!col.visible ? "text-gray-400" : ""}>{col.label}</span>
                    </div>
                    {col.visible && (
                      <Select
                        value={col.aggregate}
                        onValueChange={(value) => updateColumnAggregate(col.field, value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sum">Sum</SelectItem>
                          <SelectItem value="avg">Average</SelectItem>
                          <SelectItem value="count">Count</SelectItem>
                          <SelectItem value="min">Min</SelectItem>
                          <SelectItem value="max">Max</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grouping & Sorting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Group By</Label>
                  <Select
                    value={formData.group_by}
                    onValueChange={(value) => setFormData({ ...formData, group_by: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No grouping</SelectItem>
                      {typeConfig?.groupByOptions?.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select
                    value={formData.sort_by}
                    onValueChange={(value) => setFormData({ ...formData, sort_by: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Default</SelectItem>
                      {formData.columns.filter(c => c.visible).map(col => (
                        <SelectItem key={col.field} value={col.field}>{col.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chart Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: "none", label: "None" },
                  { value: "bar", label: "Bar" },
                  { value: "line", label: "Line" },
                  { value: "pie", label: "Pie" },
                  { value: "area", label: "Area" }
                ].map(chart => (
                  <Button
                    key={chart.value}
                    variant={formData.chart_type === chart.value ? "default" : "outline"}
                    className="h-16 flex-col gap-1"
                    onClick={() => setFormData({ ...formData, chart_type: chart.value })}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs">{chart.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {formData.chart_type !== "none" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chart Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>X-Axis (Category)</Label>
                    <Select
                      value={formData.chart_config.x_axis}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        chart_config: { ...formData.chart_config, x_axis: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.columns.filter(c => c.visible).map(col => (
                          <SelectItem key={col.field} value={col.field}>{col.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Y-Axis (Value)</Label>
                    <Select
                      value={formData.chart_config.y_axis}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        chart_config: { ...formData.chart_config, y_axis: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.columns.filter(c => c.visible).map(col => (
                          <SelectItem key={col.field} value={col.field}>{col.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Schedule Report</span>
                <Switch
                  checked={formData.schedule.enabled}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, enabled: checked }
                  })}
                />
              </CardTitle>
            </CardHeader>
            {formData.schedule.enabled && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={formData.schedule.frequency}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        schedule: { ...formData.schedule, frequency: value }
                      })}
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
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.schedule.time}
                      onChange={(e) => setFormData({
                        ...formData,
                        schedule: { ...formData.schedule, time: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {formData.schedule.frequency === "weekly" && (
                  <div className="space-y-2">
                    <Label>Day of Week</Label>
                    <Select
                      value={String(formData.schedule.day_of_week)}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        schedule: { ...formData.schedule, day_of_week: Number(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.schedule.frequency === "monthly" && (
                  <div className="space-y-2">
                    <Label>Day of Month</Label>
                    <Select
                      value={String(formData.schedule.day_of_month)}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        schedule: { ...formData.schedule, day_of_month: Number(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 5, 10, 15, 20, 25, 28].map(day => (
                          <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      placeholder="email@example.com"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())}
                    />
                    <Button type="button" onClick={addRecipient}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.schedule.recipients.map(email => (
                      <Badge key={email} variant="secondary" className="gap-1">
                        {email}
                        <button onClick={() => removeRecipient(email)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!formData.name}
          className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          <Save className="w-4 h-4 mr-2" />
          {report ? "Update Report" : "Create Report"}
        </Button>
      </div>
    </div>
  );
}