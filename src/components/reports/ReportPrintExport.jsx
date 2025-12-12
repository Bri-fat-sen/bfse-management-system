import { format } from "date-fns";
import { exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateProfessionalReport, downloadProfessionalReportAsPDF } from "@/components/exports/ProfessionalReportExport";

export function printSalesReport({ salesAnalytics = {}, filters = {}, organisation, filteredSales = [] }) {
  const analytics = salesAnalytics || {};
  const summaryCards = [
    { label: "Total Revenue", value: `SLE ${(analytics.totalRevenue || 0).toLocaleString()}`, subtext: 'Gross sales revenue' },
    { label: "Transactions", value: analytics.totalTransactions || 0, subtext: 'Total orders' },
    { label: "Avg Transaction", value: `SLE ${Math.round(analytics.avgTransaction || 0).toLocaleString()}`, subtext: 'Per order' },
    { label: "Top Channel", value: analytics.byChannel?.[0]?.name || 'N/A', subtext: 'Best performer' }
  ];

  // Payment method breakdown
  const paymentBreakdown = {};
  (analytics.byPayment || []).forEach(p => {
    if (p?.name) {
      paymentBreakdown[p.name.charAt(0).toUpperCase() + p.name.slice(1)] = p.value || 0;
    }
  });

  const sections = [
    {
      title: 'Payment Method Breakdown',
      icon: '💳',
      breakdown: paymentBreakdown
    },
    {
      title: 'Sales Transactions',
      icon: '🛒',
      table: {
        columns: ["Date", "Sale #", "Customer", "Employee", "Payment", "Status", "Amount (SLE)"],
        rows: [
          ...filteredSales.slice(0, 100).map(s => [
            s.created_date ? format(new Date(s.created_date), 'MMM d, yyyy') : '-',
            s.sale_number || '-',
            s.customer_name || 'Walk-in',
            s.employee_name || '-',
            (s.payment_method || 'cash').replace(/_/g, ' ').charAt(0).toUpperCase() + (s.payment_method || 'cash').replace(/_/g, ' ').slice(1),
            s.payment_status || 'paid',
            `SLE ${(s.total_amount || 0).toLocaleString()}`
          ]),
          ['GRAND TOTAL', '', '', '', '', '', `SLE ${(analytics.totalRevenue || 0).toLocaleString()}`]
        ]
      }
    }
  ];

  if (filters.employee_ids?.length > 0) {
    sections.push({
      infoBox: {
        type: 'info',
        title: '🔍 Filter Applied',
        content: `<p>This report is filtered by ${filters.employee_ids.length} employee(s)</p>`
      }
    });
  }

  const startDate = filters.start_date ? new Date(filters.start_date) : new Date();
  const endDate = filters.end_date ? new Date(filters.end_date) : new Date();
  const dateRange = (startDate instanceof Date && !isNaN(startDate) && endDate instanceof Date && !isNaN(endDate))
    ? `${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`
    : `As of ${format(new Date(), 'MMMM d, yyyy')}`;

  const html = generateProfessionalReport({
    title: "Sales Report",
    subtitle: "Revenue and transaction summary",
    organisation,
    dateRange,
    summaryCards,
    sections,
    reportType: 'financial'
  });

  downloadProfessionalReportAsPDF(html);
}

export function printExpenseReport({ expenseAnalytics = {}, filters = {}, organisation, filteredExpenses = [] }) {
  const analytics = expenseAnalytics || {};
  const summaryCards = [
    { label: "Total Expenses", value: `SLE ${(analytics.totalExpenses || 0).toLocaleString()}`, subtext: 'All categories', highlight: 'red' },
    { label: "Categories", value: analytics.byCategory?.length || 0, subtext: 'Expense types' },
    { label: "Records", value: filteredExpenses.length, subtext: 'Total entries' },
    { label: "Highest Category", value: analytics.byCategory?.[0]?.name || 'N/A', subtext: 'Top expense' }
  ];

  // Category breakdown
  const categoryBreakdown = {};
  (analytics.byCategory || []).forEach(c => {
    if (c?.name) {
      const name = c.name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      categoryBreakdown[name] = c.value || 0;
    }
  });

  const sections = [
    {
      title: 'Expense by Category',
      icon: '📊',
      breakdown: categoryBreakdown
    },
    {
      title: 'Expense Records',
      icon: '📋',
      table: {
        columns: ["Date", "Category", "Description", "Vendor", "Payment", "Status", "Amount (SLE)"],
        rows: [
          ...filteredExpenses.slice(0, 100).map(e => {
            const expDate = e.date || e.created_date;
            const formattedDate = expDate ? format(new Date(expDate), 'MMM d, yyyy') : '-';
            return [
            formattedDate,
            (e.category || 'other').replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            e.description || '-',
            e.vendor || '-',
            (e.payment_method || 'cash').replace(/_/g, ' ').charAt(0).toUpperCase() + (e.payment_method || 'cash').replace(/_/g, ' ').slice(1),
            e.status || 'pending',
            `SLE ${(e.amount || 0).toLocaleString()}`
          ]; }),
          ['GRAND TOTAL', '', '', '', '', '', `SLE ${(analytics.totalExpenses || 0).toLocaleString()}`]
        ]
      }
    }
  ];

  const startDate = filters.start_date ? new Date(filters.start_date) : new Date();
  const endDate = filters.end_date ? new Date(filters.end_date) : new Date();
  const dateRange = (startDate instanceof Date && !isNaN(startDate) && endDate instanceof Date && !isNaN(endDate))
    ? `${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`
    : `As of ${format(new Date(), 'MMMM d, yyyy')}`;

  const html = generateProfessionalReport({
    title: "Expense Report",
    subtitle: "Expenditure summary and breakdown by category",
    organisation,
    dateRange,
    summaryCards,
    sections,
    reportType: 'financial'
  });

  downloadProfessionalReportAsPDF(html);
}

export function printTransportReport({ transportAnalytics = {}, filters = {}, organisation, filteredTrips = [] }) {
  const analytics = transportAnalytics || {};
  const summaryCards = [
    { label: "Total Revenue", value: `SLE ${(analytics.totalRevenue || 0).toLocaleString()}`, subtext: 'Gross revenue' },
    { label: "Total Trips", value: analytics.totalTrips || 0, subtext: 'Completed trips' },
    { label: "Passengers", value: analytics.totalPassengers || 0, subtext: 'Total carried' },
    { label: "Net Revenue", value: `SLE ${(analytics.netRevenue || 0).toLocaleString()}`, subtext: 'After fuel costs', highlight: (analytics.netRevenue || 0) >= 0 ? 'green' : 'red' }
  ];

  // Route breakdown
  const routeBreakdown = {};
  (analytics.byRoute || []).forEach(r => {
    if (r?.name) {
      routeBreakdown[r.name] = r.value || 0;
    }
  });

  const sections = [
    {
      title: 'Revenue by Route',
      icon: '🛣️',
      breakdown: routeBreakdown
    },
    {
      title: 'Trip Details',
      icon: '🚐',
      table: {
        columns: ["Date", "Route", "Vehicle", "Driver", "Passengers", "Revenue", "Fuel Cost", "Net (SLE)"],
        rows: [
          ...filteredTrips.slice(0, 100).map(t => {
            const tripDate = t.date || t.created_date;
            const formattedDate = tripDate ? format(new Date(tripDate), 'MMM d, yyyy') : '-';
            return [
            formattedDate,
            t.route_name || '-',
            t.vehicle_registration || '-',
            t.driver_name || '-',
            t.passengers_count || 0,
            `SLE ${(t.total_revenue || 0).toLocaleString()}`,
            `SLE ${(t.fuel_cost || 0).toLocaleString()}`,
            `SLE ${(t.net_revenue || 0).toLocaleString()}`
          ]; }),
          ['GRAND TOTAL', '', '', '', 
            analytics.totalPassengers || 0,
            `SLE ${(analytics.totalRevenue || 0).toLocaleString()}`,
            `SLE ${(analytics.totalFuelCost || 0).toLocaleString()}`,
            `SLE ${(analytics.netRevenue || 0).toLocaleString()}`
          ]
        ]
      }
    }
  ];

  const startDate = filters.start_date ? new Date(filters.start_date) : new Date();
  const endDate = filters.end_date ? new Date(filters.end_date) : new Date();
  const dateRange = (startDate instanceof Date && !isNaN(startDate) && endDate instanceof Date && !isNaN(endDate))
    ? `${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`
    : `As of ${format(new Date(), 'MMMM d, yyyy')}`;

  const html = generateProfessionalReport({
    title: "Transport Report",
    subtitle: "Trip revenue, fuel costs, and route performance",
    organisation,
    dateRange,
    summaryCards,
    sections,
    reportType: 'standard'
  });

  downloadProfessionalReportAsPDF(html);
}

export function printInventoryReport({ products = [], organisation }) {
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10) && p.stock_quantity > 0).length;
  const outOfStock = products.filter(p => p.stock_quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);

  const summaryCards = [
    { label: "Total Products", value: totalProducts, subtext: 'Active items' },
    { label: "Low Stock Items", value: lowStock, subtext: 'Need restocking', highlight: lowStock > 0 ? 'red' : 'green' },
    { label: "Out of Stock", value: outOfStock, subtext: 'Unavailable', highlight: outOfStock > 0 ? 'red' : 'green' },
    { label: "Stock Value", value: `SLE ${totalValue.toLocaleString()}`, subtext: 'Total inventory value' }
  ];

  // Category breakdown
  const categoryBreakdown = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + ((p.stock_quantity || 0) * (p.unit_price || 0));
  });

  const sections = [
    {
      title: 'Stock Value by Category',
      icon: '📦',
      breakdown: categoryBreakdown
    }
  ];

  // Add warning if stock issues
  if (lowStock > 0 || outOfStock > 0) {
    sections.push({
      infoBox: {
        type: 'warning',
        title: '⚠️ Stock Alerts',
        content: `<ul><li>${lowStock} items are running low and need restocking</li><li>${outOfStock} items are completely out of stock</li></ul>`
      }
    });
  }

  sections.push({
    title: 'Inventory Details',
    icon: '📋',
    table: {
      columns: ["SKU", "Product Name", "Category", "Stock Qty", "Unit Price", "Stock Value", "Status"],
      rows: [
        ...products.slice(0, 100).map(p => {
          const qty = p.stock_quantity || 0;
          const threshold = p.low_stock_threshold || 10;
          let status = 'In Stock';
          if (qty === 0) status = 'Out of Stock';
          else if (qty <= threshold) status = 'Low Stock';
          
          return [
            p.sku || '-',
            p.name || '-',
            p.category || 'Uncategorized',
            qty,
            `SLE ${(p.unit_price || 0).toLocaleString()}`,
            `SLE ${(qty * (p.unit_price || 0)).toLocaleString()}`,
            status
          ];
        }),
        ['GRAND TOTAL', '', '', products.reduce((s, p) => s + (p.stock_quantity || 0), 0), '', `SLE ${totalValue.toLocaleString()}`, '']
      ]
    }
  });

  const html = generateProfessionalReport({
    title: "Inventory Report",
    subtitle: "Stock levels, values, and category breakdown",
    organisation,
    dateRange: `As of ${format(new Date(), 'MMMM d, yyyy h:mm a')}`,
    summaryCards,
    sections,
    reportType: 'standard'
  });

  downloadProfessionalReportAsPDF(html);
}

export function printProfitLossReport({ profitLoss = {}, salesAnalytics = {}, transportAnalytics = {}, expenseAnalytics = {}, filters = {}, organisation }) {
  const pl = profitLoss || {};
  const sales = salesAnalytics || {};
  const transport = transportAnalytics || {};
  const expenses = expenseAnalytics || {};
  
  const summaryCards = [
    { label: "Total Revenue", value: `SLE ${(pl.revenue || 0).toLocaleString()}`, subtext: 'All income sources' },
    { label: "Total Expenses", value: `SLE ${(pl.expenses || 0).toLocaleString()}`, subtext: 'All expenditures', highlight: 'red' },
    { label: "Net Profit/Loss", value: `SLE ${(pl.profit || 0).toLocaleString()}`, subtext: (pl.profit || 0) >= 0 ? 'Profitable ✓' : 'Operating at loss', highlight: (pl.profit || 0) >= 0 ? 'green' : 'red' },
    { label: "Profit Margin", value: `${pl.margin || 0}%`, subtext: 'Efficiency ratio' }
  ];

  const revenueBreakdown = {
    'Sales Revenue': sales.totalRevenue || 0,
    'Transport Revenue': transport.totalRevenue || 0
  };

  const expenseBreakdown = {};
  (expenses.byCategory || []).forEach(c => {
    if (c?.name) {
      const name = c.name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      expenseBreakdown[name] = c.value || 0;
    }
  });

  const sections = [
    {
      title: 'Revenue Breakdown',
      icon: '💰',
      breakdown: revenueBreakdown
    },
    {
      title: 'Expense Breakdown',
      icon: '📉',
      breakdown: expenseBreakdown
    },
    {
      title: 'Profit & Loss Summary',
      icon: '📊',
      table: {
        columns: ["Category", "Type", "Amount (SLE)"],
        rows: [
          ["Sales Revenue", "Income", `SLE ${(sales.totalRevenue || 0).toLocaleString()}`],
          ["Transport Revenue", "Income", `SLE ${(transport.totalRevenue || 0).toLocaleString()}`],
          ...(expenses.byCategory || []).map(c => [
            (c?.name || 'Other').replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            "Expense",
            `SLE ${(c?.value || 0).toLocaleString()}`
          ]),
          ["Total Revenue", "Subtotal", `SLE ${(pl.revenue || 0).toLocaleString()}`],
          ["Total Expenses", "Subtotal", `SLE ${(pl.expenses || 0).toLocaleString()}`],
          ["NET PROFIT/LOSS", "Total", `SLE ${(pl.profit || 0).toLocaleString()}`]
        ]
      }
    },
    {
      infoBox: {
        type: (pl.profit || 0) >= 0 ? 'success' : 'warning',
        title: (pl.profit || 0) >= 0 ? '✅ Profitability Analysis' : '⚠️ Profitability Alert',
        content: (pl.profit || 0) >= 0 
          ? `<p>Business is profitable with a <strong>${pl.margin || 0}%</strong> profit margin. Continue monitoring expenses to maintain healthy margins.</p>`
          : `<p>Business is currently operating at a <strong>loss</strong>. Review expense categories and identify areas for cost reduction to improve profitability.</p>`
      }
    }
  ];

  const startDate = filters.start_date ? new Date(filters.start_date) : new Date();
  const endDate = filters.end_date ? new Date(filters.end_date) : new Date();
  const dateRange = (startDate instanceof Date && !isNaN(startDate) && endDate instanceof Date && !isNaN(endDate))
    ? `${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`
    : `As of ${format(new Date(), 'MMMM d, yyyy')}`;

  const html = generateProfessionalReport({
    title: "Profit & Loss Statement",
    subtitle: "Financial performance summary",
    organisation,
    dateRange,
    summaryCards,
    sections,
    reportType: 'financial'
  });

  downloadProfessionalReportAsPDF(html);
}

export function exportReportCSV({ type, data, organisation }) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  
  switch(type) {
    case 'sales':
      exportToCSV(
        ["Date", "Sale #", "Customer", "Employee", "Payment", "Status", "Amount"],
        data.map(s => [
          format(new Date(s.created_date), 'yyyy-MM-dd'),
          s.sale_number || '',
          s.customer_name || 'Walk-in',
          s.employee_name || '',
          s.payment_method || 'cash',
          s.payment_status || 'paid',
          s.total_amount || 0
        ]),
        `sales_report_${dateStr}.csv`,
        organisation
      );
      break;
    case 'expenses':
      exportToCSV(
        ["Date", "Category", "Description", "Vendor", "Payment", "Status", "Amount"],
        data.map(e => [
          format(new Date(e.date || e.created_date), 'yyyy-MM-dd'),
          e.category || 'other',
          e.description || '',
          e.vendor || '',
          e.payment_method || 'cash',
          e.status || 'pending',
          e.amount || 0
        ]),
        `expense_report_${dateStr}.csv`,
        organisation
      );
      break;
    case 'transport':
      exportToCSV(
        ["Date", "Route", "Vehicle", "Driver", "Passengers", "Revenue", "Fuel Cost", "Net"],
        data.map(t => [
          format(new Date(t.date || t.created_date), 'yyyy-MM-dd'),
          t.route_name || '',
          t.vehicle_registration || '',
          t.driver_name || '',
          t.passengers_count || 0,
          t.total_revenue || 0,
          t.fuel_cost || 0,
          t.net_revenue || 0
        ]),
        `transport_report_${dateStr}.csv`,
        organisation
      );
      break;
    case 'inventory':
      exportToCSV(
        ["SKU", "Product", "Category", "Stock Qty", "Unit Price", "Stock Value"],
        data.map(p => [
          p.sku || '',
          p.name || '',
          p.category || 'Uncategorized',
          p.stock_quantity || 0,
          p.unit_price || 0,
          (p.stock_quantity || 0) * (p.unit_price || 0)
        ]),
        `inventory_report_${dateStr}.csv`,
        organisation
      );
      break;
  }
}