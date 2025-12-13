import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Calendar, TrendingUp, DollarSign, 
  Package, Users, Truck, BarChart3, Sparkles, CheckCircle2 
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { motion } from "framer-motion";
import ModernExportDialog from "./ModernExportDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ConsolidatedReports({ orgId, orgData }) {
  const [dateRange, setDateRange] = useState("this_month");
  const [selectedReport, setSelectedReport] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState({ data: [], title: "" });

  const { startDate, endDate } = React.useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case "this_week":
        return { startDate: new Date(now.setDate(now.getDate() - 7)), endDate: new Date() };
      case "this_month":
        return { startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) };
      case "last_month":
        const lastMonth = subMonths(new Date(), 1);
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
      case "last_3_months":
        return { startDate: subMonths(new Date(), 3), endDate: new Date() };
      default:
        return { startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) };
    }
  }, [dateRange]);

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', orgId],
    queryFn: () => base44.entities.Sale.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', orgId],
    queryFn: () => base44.entities.Expense.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', orgId],
    queryFn: () => base44.entities.Trip.filter({ organisation_id: orgId }),
    enabled: !!orgId,
  });

  const reportTemplates = [
    {
      id: "sales_summary",
      title: "Sales Summary Report",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
      description: "Complete sales transactions and revenue analysis",
      getData: () => sales.map(s => ({
        Date: format(new Date(s.created_date), 'yyyy-MM-dd'),
        'Sale Number': s.sale_number,
        'Sale Type': s.sale_type,
        Customer: s.customer_name || 'N/A',
        'Total Amount': `Le ${s.total_amount}`,
        'Payment Method': s.payment_method,
        Status: s.payment_status,
      }))
    },
    {
      id: "financial_overview",
      title: "Financial Overview Report",
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-600",
      description: "Revenue, expenses, and profitability analysis",
      getData: () => {
        const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        return [{
          'Report Period': format(startDate, 'PPP') + ' to ' + format(endDate, 'PPP'),
          'Total Revenue': `Le ${totalRevenue.toLocaleString()}`,
          'Total Expenses': `Le ${totalExpenses.toLocaleString()}`,
          'Net Income': `Le ${(totalRevenue - totalExpenses).toLocaleString()}`,
          'Number of Sales': sales.length,
          'Number of Expenses': expenses.length,
          'Average Sale': `Le ${sales.length > 0 ? Math.round(totalRevenue / sales.length).toLocaleString() : 0}`,
        }];
      }
    },
    {
      id: "inventory_status",
      title: "Inventory Status Report",
      icon: Package,
      gradient: "from-purple-500 to-indigo-600",
      description: "Current stock levels and valuation",
      getData: () => products.map(p => ({
        Product: p.name,
        SKU: p.sku || 'N/A',
        Category: p.category || 'N/A',
        'Stock Quantity': p.stock_quantity || 0,
        'Unit Price': `Le ${p.unit_price}`,
        'Stock Value': `Le ${((p.stock_quantity || 0) * p.unit_price).toLocaleString()}`,
        'Low Stock': (p.stock_quantity || 0) < (p.low_stock_threshold || 10) ? 'Yes' : 'No',
        Status: p.is_active ? 'Active' : 'Inactive',
      }))
    },
    {
      id: "hr_summary",
      title: "HR Summary Report",
      icon: Users,
      gradient: "from-indigo-500 to-purple-600",
      description: "Employee roster and department breakdown",
      getData: () => employees.map(e => ({
        'Employee Code': e.employee_code,
        'Full Name': e.full_name,
        Role: e.role,
        Department: e.department || 'N/A',
        Position: e.position || 'N/A',
        'Employment Type': e.employment_type,
        'Hire Date': e.hire_date ? format(new Date(e.hire_date), 'yyyy-MM-dd') : 'N/A',
        Status: e.status,
      }))
    },
    {
      id: "transport_operations",
      title: "Transport Operations Report",
      icon: Truck,
      gradient: "from-orange-500 to-red-600",
      description: "Fleet trips and revenue tracking",
      getData: () => trips.map(t => ({
        Date: format(new Date(t.date), 'yyyy-MM-dd'),
        'Vehicle': t.vehicle_registration || 'N/A',
        Driver: t.driver_name,
        Route: t.route_name || 'N/A',
        Passengers: t.passengers_count || 0,
        Revenue: `Le ${t.total_revenue || 0}`,
        'Fuel Cost': `Le ${t.fuel_cost || 0}`,
        'Net Revenue': `Le ${t.net_revenue || 0}`,
        Status: t.status,
      }))
    },
    {
      id: "expense_breakdown",
      title: "Expense Breakdown Report",
      icon: BarChart3,
      gradient: "from-red-500 to-rose-600",
      description: "Detailed expense categorization and analysis",
      getData: () => expenses.map(e => ({
        Date: format(new Date(e.date), 'yyyy-MM-dd'),
        Category: e.category,
        Description: e.description || 'N/A',
        Amount: `Le ${e.amount}`,
        Vendor: e.vendor || 'N/A',
        'Payment Method': e.payment_method,
        'Recorded By': e.recorded_by_name || 'N/A',
        Status: e.status,
      }))
    },
  ];

  const handleExport = (report) => {
    const data = report.getData();
    setExportData({ data, title: report.title });
    setExportDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl">
        <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]"></div>
        <CardHeader className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6" />
                Consolidated Reports Center
              </CardTitle>
              <p className="text-sm text-gray-300 mt-1">Generate and export professional reports</p>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <div className="h-1 bg-gradient-to-r from-[#1EB053] via-white to-[#0072C6]"></div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all group cursor-pointer h-full">
              <div className={`h-1 bg-gradient-to-r ${report.gradient}`}></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${report.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <report.icon className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-gray-100 text-gray-700">
                    {report.getData().length} records
                  </Badge>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <p className="text-sm text-gray-600">{report.description}</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleExport(report)}
                  className={`w-full bg-gradient-to-r ${report.gradient} text-white hover:shadow-lg transition-all`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <ModernExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={exportData.data}
        reportTitle={exportData.title}
        orgData={orgData}
      />
    </div>
  );
}