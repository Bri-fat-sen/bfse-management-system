import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, subMonths, parseISO } from "date-fns";
import { 
  Printer, Download, FileText, TrendingUp, DollarSign, Users, 
  Package, Truck, PieChart, Clock, CheckCircle
} from "lucide-react";
import { generateProfessionalReport, downloadProfessionalReportAsPDF } from "@/components/exports/ProfessionalReportExport";

const REPORT_CONFIGS = {
  daily_sales: {
    name: "Daily Sales Summary",
    icon: TrendingUp,
    color: "green",
    generate: (data) => generateSalesSection(data)
  },
  monthly_revenue: {
    name: "Monthly Revenue",
    icon: DollarSign,
    color: "blue",
    generate: (data) => generateRevenueSection(data)
  },
  inventory_status: {
    name: "Inventory Status",
    icon: Package,
    color: "purple",
    generate: (data) => generateInventorySection(data)
  },
  payroll_summary: {
    name: "Payroll Summary",
    icon: Users,
    color: "orange",
    generate: (data) => generatePayrollSection(data)
  },
  transport_trips: {
    name: "Transport Trips",
    icon: Truck,
    color: "cyan",
    generate: (data) => generateTransportSection(data)
  },
  expense_report: {
    name: "Expense Report",
    icon: DollarSign,
    color: "red",
    generate: (data) => generateExpenseSection(data)
  },
  profit_loss: {
    name: "Profit & Loss",
    icon: PieChart,
    color: "indigo",
    generate: (data) => generateProfitLossSection(data)
  },
  employee_attendance: {
    name: "Attendance Report",
    icon: Clock,
    color: "amber",
    generate: (data) => generateAttendanceSection(data)
  }
};

// Section generators
function generateSalesSection({ sales, startDate, endDate }) {
  const filteredSales = sales.filter(s => {
    const date = new Date(s.created_date);
    return date >= startDate && date <= endDate;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const byPayment = {};
  filteredSales.forEach(s => {
    const method = s.payment_method || 'cash';
    byPayment[method] = (byPayment[method] || 0) + (s.total_amount || 0);
  });

  return {
    summaryCards: [
      { label: 'Total Revenue', value: `SLE ${totalRevenue.toLocaleString()}`, subtext: `${filteredSales.length} transactions` },
      { label: 'Avg. Transaction', value: `SLE ${filteredSales.length > 0 ? Math.round(totalRevenue / filteredSales.length).toLocaleString() : 0}` }
    ],
    sections: [
      {
        title: 'Payment Method Breakdown',
        icon: '💳',
        breakdown: byPayment
      },
      {
        title: 'Recent Sales',
        icon: '🛒',
        table: {
          columns: ['Date', 'Sale #', 'Customer', 'Payment', 'Amount (SLE)'],
          rows: filteredSales.slice(0, 20).map(s => [
            format(new Date(s.created_date), 'MMM d, yyyy'),
            s.sale_number || '-',
            s.customer_name || 'Walk-in',
            (s.payment_method || 'cash').replace(/_/g, ' '),
            `SLE ${(s.total_amount || 0).toLocaleString()}`
          ])
        }
      }
    ]
  };
}

function generateRevenueSection({ sales, expenses, trips, startDate, endDate }) {
  const filteredSales = sales.filter(s => new Date(s.created_date) >= startDate && new Date(s.created_date) <= endDate);
  const filteredTrips = trips.filter(t => new Date(t.date || t.created_date) >= startDate && new Date(t.date || t.created_date) <= endDate);
  
  const salesRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const transportRevenue = filteredTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalRevenue = salesRevenue + transportRevenue;

  return {
    summaryCards: [
      { label: 'Total Revenue', value: `SLE ${totalRevenue.toLocaleString()}` },
      { label: 'Sales Revenue', value: `SLE ${salesRevenue.toLocaleString()}` },
      { label: 'Transport Revenue', value: `SLE ${transportRevenue.toLocaleString()}` }
    ],
    sections: [
      {
        title: 'Revenue Breakdown',
        icon: '💰',
        breakdown: {
          'Sales Revenue': salesRevenue,
          'Transport Revenue': transportRevenue,
          'Total Revenue': totalRevenue
        }
      }
    ]
  };
}

function generateInventorySection({ products }) {
  const activeProducts = products.filter(p => p.is_active !== false);
  const lowStock = activeProducts.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10) && (p.stock_quantity || 0) > 0);
  const outOfStock = activeProducts.filter(p => (p.stock_quantity || 0) === 0);
  const totalValue = activeProducts.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);

  return {
    summaryCards: [
      { label: 'Total Products', value: activeProducts.length.toString() },
      { label: 'Stock Value', value: `SLE ${totalValue.toLocaleString()}` },
      { label: 'Low Stock', value: lowStock.length.toString(), highlight: lowStock.length > 0 ? 'red' : 'green' },
      { label: 'Out of Stock', value: outOfStock.length.toString(), highlight: outOfStock.length > 0 ? 'red' : 'green' }
    ],
    sections: [
      lowStock.length > 0 && {
        title: 'Low Stock Items',
        icon: '⚠️',
        table: {
          columns: ['Product', 'SKU', 'Stock', 'Threshold', 'Status'],
          rows: lowStock.slice(0, 15).map(p => [
            p.name,
            p.sku || '-',
            p.stock_quantity || 0,
            p.low_stock_threshold || 10,
            (p.stock_quantity || 0) === 0 ? 'Out of Stock' : 'Low Stock'
          ])
        }
      },
      {
        title: 'Inventory Summary',
        icon: '📦',
        table: {
          columns: ['Product', 'Category', 'Stock Qty', 'Unit Price', 'Stock Value'],
          rows: activeProducts.slice(0, 25).map(p => [
            p.name,
            p.category || 'Uncategorized',
            p.stock_quantity || 0,
            `SLE ${(p.unit_price || 0).toLocaleString()}`,
            `SLE ${((p.stock_quantity || 0) * (p.unit_price || 0)).toLocaleString()}`
          ])
        }
      }
    ].filter(Boolean)
  };
}

function generatePayrollSection({ payrolls, startDate, endDate }) {
  const filtered = payrolls.filter(p => {
    const date = new Date(p.period_end);
    return date >= startDate && date <= endDate && (p.status === 'paid' || p.status === 'approved');
  });

  const totalGross = filtered.reduce((sum, p) => sum + (p.gross_pay || 0), 0);
  const totalNet = filtered.reduce((sum, p) => sum + (p.net_pay || 0), 0);
  const totalNassit = filtered.reduce((sum, p) => sum + (p.nassit_employee || 0) + (p.nassit_employer || 0), 0);
  const totalPaye = filtered.reduce((sum, p) => sum + (p.paye_tax || 0), 0);

  return {
    summaryCards: [
      { label: 'Total Gross', value: `SLE ${totalGross.toLocaleString()}` },
      { label: 'Total Net', value: `SLE ${totalNet.toLocaleString()}` },
      { label: 'NASSIT', value: `SLE ${totalNassit.toLocaleString()}` },
      { label: 'PAYE Tax', value: `SLE ${totalPaye.toLocaleString()}`, highlight: 'red' }
    ],
    sections: [
      {
        title: 'Payroll Details',
        icon: '👥',
        table: {
          columns: ['Employee', 'Role', 'Gross Pay', 'Deductions', 'Net Pay', 'Status'],
          rows: filtered.slice(0, 25).map(p => [
            p.employee_name,
            p.employee_role || '-',
            `SLE ${(p.gross_pay || 0).toLocaleString()}`,
            `SLE ${(p.total_deductions || 0).toLocaleString()}`,
            `SLE ${(p.net_pay || 0).toLocaleString()}`,
            p.status
          ])
        }
      }
    ]
  };
}

function generateTransportSection({ trips, startDate, endDate }) {
  const filtered = trips.filter(t => {
    const date = new Date(t.date || t.created_date);
    return date >= startDate && date <= endDate;
  });

  const totalRevenue = filtered.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalFuel = filtered.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
  const totalPassengers = filtered.reduce((sum, t) => sum + (t.passengers_count || 0), 0);

  return {
    summaryCards: [
      { label: 'Total Trips', value: filtered.length.toString() },
      { label: 'Passengers', value: totalPassengers.toLocaleString() },
      { label: 'Revenue', value: `SLE ${totalRevenue.toLocaleString()}` },
      { label: 'Net Revenue', value: `SLE ${(totalRevenue - totalFuel).toLocaleString()}`, highlight: (totalRevenue - totalFuel) >= 0 ? 'green' : 'red' }
    ],
    sections: [
      {
        title: 'Trip Details',
        icon: '🚐',
        table: {
          columns: ['Date', 'Route', 'Vehicle', 'Driver', 'Passengers', 'Revenue', 'Fuel', 'Net'],
          rows: filtered.slice(0, 20).map(t => [
            t.date ? format(new Date(t.date), 'MMM d') : '-',
            t.route_name || '-',
            t.vehicle_registration || '-',
            t.driver_name || '-',
            t.passengers_count || 0,
            `SLE ${(t.total_revenue || 0).toLocaleString()}`,
            `SLE ${(t.fuel_cost || 0).toLocaleString()}`,
            `SLE ${((t.total_revenue || 0) - (t.fuel_cost || 0)).toLocaleString()}`
          ])
        }
      }
    ]
  };
}

function generateExpenseSection({ expenses, startDate, endDate }) {
  const filtered = expenses.filter(e => {
    const date = new Date(e.date || e.created_date);
    return date >= startDate && date <= endDate;
  });

  const totalExpenses = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);
  const byCategory = {};
  filtered.forEach(e => {
    const cat = e.category || 'other';
    byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
  });

  return {
    summaryCards: [
      { label: 'Total Expenses', value: `SLE ${totalExpenses.toLocaleString()}`, highlight: 'red' },
      { label: 'Categories', value: Object.keys(byCategory).length.toString() },
      { label: 'Transactions', value: filtered.length.toString() }
    ],
    sections: [
      {
        title: 'Expense by Category',
        icon: '📊',
        breakdown: byCategory
      },
      {
        title: 'Expense Details',
        icon: '📋',
        table: {
          columns: ['Date', 'Category', 'Description', 'Vendor', 'Amount'],
          rows: filtered.slice(0, 20).map(e => [
            e.date ? format(new Date(e.date), 'MMM d, yyyy') : '-',
            (e.category || 'other').replace(/_/g, ' '),
            e.description || '-',
            e.vendor || '-',
            `SLE ${(e.amount || 0).toLocaleString()}`
          ])
        }
      }
    ]
  };
}

function generateProfitLossSection({ sales, expenses, trips, startDate, endDate }) {
  const filteredSales = sales.filter(s => new Date(s.created_date) >= startDate && new Date(s.created_date) <= endDate);
  const filteredExpenses = expenses.filter(e => new Date(e.date || e.created_date) >= startDate && new Date(e.date || e.created_date) <= endDate);
  const filteredTrips = trips.filter(t => new Date(t.date || t.created_date) >= startDate && new Date(t.date || t.created_date) <= endDate);

  const salesRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const transportRevenue = filteredTrips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
  const totalRevenue = salesRevenue + transportRevenue;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const fuelCosts = filteredTrips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
  const totalCosts = totalExpenses + fuelCosts;
  const netProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  return {
    summaryCards: [
      { label: 'Total Revenue', value: `SLE ${totalRevenue.toLocaleString()}` },
      { label: 'Total Expenses', value: `SLE ${totalCosts.toLocaleString()}`, highlight: 'red' },
      { label: 'Net Profit/Loss', value: `SLE ${netProfit.toLocaleString()}`, highlight: netProfit >= 0 ? 'green' : 'red' },
      { label: 'Profit Margin', value: `${margin}%` }
    ],
    sections: [
      {
        title: 'Profit & Loss Summary',
        icon: '📈',
        table: {
          columns: ['Category', 'Type', 'Amount (SLE)'],
          rows: [
            ['Sales Revenue', 'Income', `SLE ${salesRevenue.toLocaleString()}`],
            ['Transport Revenue', 'Income', `SLE ${transportRevenue.toLocaleString()}`],
            ['Operating Expenses', 'Expense', `SLE ${totalExpenses.toLocaleString()}`],
            ['Fuel Costs', 'Expense', `SLE ${fuelCosts.toLocaleString()}`],
            ['TOTAL REVENUE', 'Subtotal', `SLE ${totalRevenue.toLocaleString()}`],
            ['TOTAL EXPENSES', 'Subtotal', `SLE ${totalCosts.toLocaleString()}`],
            ['NET PROFIT/LOSS', 'Total', `SLE ${netProfit.toLocaleString()}`]
          ]
        }
      },
      {
        infoBox: {
          type: netProfit >= 0 ? 'success' : 'warning',
          title: netProfit >= 0 ? '✅ Profitable Period' : '⚠️ Loss Period',
          content: netProfit >= 0 
            ? `<p>The business achieved a profit margin of <strong>${margin}%</strong> during this period.</p>`
            : `<p>The business operated at a loss. Review expenses to improve profitability.</p>`
        }
      }
    ]
  };
}

function generateAttendanceSection({ employees }) {
  const activeEmployees = employees.filter(e => e.status === 'active');
  
  return {
    summaryCards: [
      { label: 'Total Employees', value: activeEmployees.length.toString() },
      { label: 'Active', value: activeEmployees.length.toString(), highlight: 'green' }
    ],
    sections: [
      {
        title: 'Employee List',
        icon: '👥',
        table: {
          columns: ['Employee', 'Department', 'Position', 'Status'],
          rows: activeEmployees.slice(0, 30).map(e => [
            e.full_name || `${e.first_name} ${e.last_name}`,
            e.department || '-',
            e.position || '-',
            e.status || 'active'
          ])
        }
      }
    ]
  };
}

export default function ConsolidatedReportPrint({
  organisation,
  selectedReports = [],
  allReports = [],
  sales = [],
  expenses = [],
  payrolls = [],
  trips = [],
  products = [],
  employees = [],
  dateRange = "this_month",
  customDateStart,
  customDateEnd,
  onClose
}) {
  const [reportsToInclude, setReportsToInclude] = useState(
    selectedReports.length > 0 ? selectedReports : allReports.map(r => r.id)
  );
  const [isPrinting, setIsPrinting] = useState(false);

  // Calculate date range
  const { startDate, endDate, dateLabel } = useMemo(() => {
    const now = new Date();
    let start, end;
    switch (dateRange) {
      case 'today':
        start = end = now;
        break;
      case 'this_week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'this_quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        end = now;
        break;
      case 'this_year':
        start = startOfYear(now);
        end = now;
        break;
      case 'custom':
        start = customDateStart ? parseISO(customDateStart) : startOfMonth(now);
        end = customDateEnd ? parseISO(customDateEnd) : endOfMonth(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }
    return {
      startDate: start,
      endDate: end,
      dateLabel: `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`
    };
  }, [dateRange, customDateStart, customDateEnd]);

  const toggleReport = (reportId) => {
    setReportsToInclude(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    
    const data = { sales, expenses, payrolls, trips, products, employees, startDate, endDate };
    
    // Collect all sections from selected reports
    let allSummaryCards = [];
    let allSections = [];
    
    for (const reportId of reportsToInclude) {
      const config = REPORT_CONFIGS[reportId];
      if (config && config.generate) {
        const result = config.generate(data);
        
        // Add report title as section header
        allSections.push({
          title: config.name,
          icon: '📊'
        });
        
        // Add summary cards for this report
        if (result.summaryCards?.length > 0) {
          allSummaryCards = [...allSummaryCards, ...result.summaryCards.slice(0, 4)];
        }
        
        // Add sections
        if (result.sections?.length > 0) {
          allSections = [...allSections, ...result.sections];
        }
      }
    }

    // Take first 4 summary cards for the main summary
    const mainSummaryCards = allSummaryCards.slice(0, 4);

    const orgName = organisation?.name || 'Business Report';
    
    await downloadProfessionalReportAsPDF({
      title: `${orgName} - Consolidated Report`,
      subtitle: `Comprehensive report covering ${reportsToInclude.length} areas`,
      organisation: organisation || {},
      dateRange: dateLabel,
      summaryCards: mainSummaryCards,
      sections: allSections,
      reportType: 'financial'
    }, 'consolidated-report');
    setIsPrinting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Select reports to include in the consolidated print</p>
          <p className="text-xs text-gray-400 mt-1">Period: {dateLabel}</p>
        </div>
        <Badge variant="outline">{reportsToInclude.length} selected</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allReports.map(report => {
          const config = REPORT_CONFIGS[report.id];
          const Icon = config?.icon || FileText;
          const isSelected = reportsToInclude.includes(report.id);
          
          return (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-[#1EB053] bg-green-50' : 'hover:bg-gray-50'}`}
              onClick={() => toggleReport(report.id)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <Checkbox checked={isSelected} />
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#1EB053]' : 'text-gray-400'}`} />
                <span className="text-sm font-medium truncate">{report.name}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handlePrint}
          disabled={reportsToInclude.length === 0 || isPrinting}
          className="gap-2 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
        >
          {isPrinting ? (
            <>Generating...</>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              Print Consolidated Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}