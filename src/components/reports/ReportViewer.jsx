import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  Download,
  Send,
  Printer,
  RefreshCw,
  Calendar,
  Filter,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

const COLORS = ["#1EB053", "#0072C6", "#D4AF37", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#6366F1"];

export default function ReportViewer({ 
  report, 
  data = [], 
  isLoading,
  onRefresh,
  onExport,
  onSendEmail
}) {
  const [exporting, setExporting] = useState(false);
  const [sending, setSending] = useState(false);

  const processedData = useMemo(() => {
    if (!data.length || !report?.columns) return [];

    let result = [...data];

    // Apply grouping
    if (report.group_by) {
      const grouped = result.reduce((acc, item) => {
        const key = item[report.group_by] || "Unknown";
        if (!acc[key]) {
          acc[key] = { _group: key, _items: [] };
        }
        acc[key]._items.push(item);
        return acc;
      }, {});

      result = Object.values(grouped).map(group => {
        const aggregated = { _group: group._group };
        report.columns.forEach(col => {
          if (col.aggregate && col.aggregate !== "none") {
            const values = group._items.map(item => Number(item[col.field]) || 0);
            switch (col.aggregate) {
              case "sum":
                aggregated[col.field] = values.reduce((a, b) => a + b, 0);
                break;
              case "avg":
                aggregated[col.field] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                break;
              case "count":
                aggregated[col.field] = values.length;
                break;
              case "min":
                aggregated[col.field] = Math.min(...values);
                break;
              case "max":
                aggregated[col.field] = Math.max(...values);
                break;
            }
          } else {
            aggregated[col.field] = group._items[0]?.[col.field];
          }
        });
        aggregated._count = group._items.length;
        return aggregated;
      });
    }

    // Apply sorting
    if (report.sort_by) {
      result.sort((a, b) => {
        const aVal = a[report.sort_by];
        const bVal = b[report.sort_by];
        const comparison = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return report.sort_order === "desc" ? -comparison : comparison;
      });
    }

    return result;
  }, [data, report]);

  const chartData = useMemo(() => {
    if (!report?.chart_config?.x_axis || !report?.chart_config?.y_axis) return [];
    
    return processedData.slice(0, 20).map(item => ({
      name: item[report.chart_config.x_axis] || item._group || "Unknown",
      value: Number(item[report.chart_config.y_axis]) || 0
    }));
  }, [processedData, report]);

  const totals = useMemo(() => {
    if (!report?.columns) return {};
    const result = {};
    report.columns.filter(c => c.visible && c.aggregate === "sum").forEach(col => {
      result[col.field] = data.reduce((sum, item) => sum + (Number(item[col.field]) || 0), 0);
    });
    return result;
  }, [data, report]);

  const visibleColumns = report?.columns?.filter(c => c.visible) || [];

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await onExport?.(format);
    } finally {
      setExporting(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await onSendEmail?.();
    } finally {
      setSending(false);
    }
  };

  const formatValue = (value, field) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number") {
      if (field?.includes("amount") || field?.includes("price") || field?.includes("salary") || field?.includes("pay") || field?.includes("cost") || field?.includes("revenue")) {
        return `SLE ${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }
    if (field?.includes("date") && value) {
      try {
        return format(new Date(value), "MMM d, yyyy");
      } catch {
        return value;
      }
    }
    return String(value);
  };

  const renderChart = () => {
    if (!chartData.length || report?.chart_type === "none") return null;

    const chartProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    switch (report.chart_type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatValue(value, report.chart_config.y_axis)} />
              <Bar dataKey="value" fill="#1EB053" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatValue(value, report.chart_config.y_axis)} />
              <Line type="monotone" dataKey="value" stroke="#1EB053" strokeWidth={2} dot={{ fill: "#1EB053" }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatValue(value, report.chart_config.y_axis)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatValue(value, report.chart_config.y_axis)} />
              <Area type="monotone" dataKey="value" stroke="#1EB053" fill="#1EB053" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1EB053]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{report?.name}</h2>
          {report?.description && (
            <p className="text-sm text-gray-500 mt-1">{report.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {report?.filters?.date_range?.replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline">
              {data.length} records
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting}>
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={exporting}>
            <Printer className="w-4 h-4 mr-1" />
            PDF
          </Button>
          <Button size="sm" onClick={handleSendEmail} disabled={sending} className="bg-[#1EB053]">
            {sending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            Email
          </Button>
        </div>
      </div>

      {/* Chart */}
      {report?.chart_type !== "none" && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chart View</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
      )}

      {/* Summary Totals */}
      {Object.keys(totals).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {visibleColumns.filter(c => totals[c.field] !== undefined).map(col => (
            <Card key={col.field} className="sl-card-green">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">{col.label}</p>
                <p className="text-2xl font-bold text-[#1EB053]">
                  {formatValue(totals[col.field], col.field)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {report?.group_by && <TableHead>Group</TableHead>}
                  {visibleColumns.map(col => (
                    <TableHead key={col.field}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + (report?.group_by ? 1 : 0)} className="text-center py-8 text-gray-500">
                      No data found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  processedData.map((row, idx) => (
                    <TableRow key={idx}>
                      {report?.group_by && (
                        <TableCell className="font-medium">
                          {row._group}
                          {row._count && <Badge variant="secondary" className="ml-2">{row._count}</Badge>}
                        </TableCell>
                      )}
                      {visibleColumns.map(col => (
                        <TableCell key={col.field}>
                          {formatValue(row[col.field], col.field)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}