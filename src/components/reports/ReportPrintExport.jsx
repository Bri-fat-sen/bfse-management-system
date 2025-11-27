import React from "react";
import { format } from "date-fns";
import { generateExportHTML, printDocument, exportToCSV } from "@/components/exports/SierraLeoneExportStyles";

export function printSalesReport({ salesAnalytics, filters, organisation, filteredSales = [] }) {
  const summary = [
    { label: "Total Revenue", value: `Le ${salesAnalytics.totalRevenue?.toLocaleString() || 0}` },
    { label: "Total Transactions", value: salesAnalytics.totalTransactions || 0 },
    { label: "Average Transaction", value: `Le ${Math.round(salesAnalytics.avgTransaction || 0).toLocaleString()}` },
    { label: "Period", value: `${format(new Date(filters.start_date), 'MMM d')} - ${format(new Date(filters.end_date), 'MMM d, yyyy')}` }
  ];

  // Payment method breakdown
  const paymentBreakdown = {};
  salesAnalytics.byPayment?.forEach(p => {
    paymentBreakdown[p.name] = p.value;
  });

  const columns = ["Date", "Sale #", "Customer", "Employee", "Payment", "Status", "Amount"];
  const rows = filteredSales.slice(0, 100).map(s => [
    format(new Date(s.created_date), 'MMM d, yyyy'),
    s.sale_number || '-',
    s.customer_name || 'Walk-in',
    s.employee_name || '-',
    (s.payment_method || 'cash').replace(/_/g, ' '),
    s.payment_status || 'paid',
    `Le ${(s.total_amount || 0).toLocaleString()}`
  ]);

  // Add totals row
  rows.push(['', '', '', '', '', 'TOTAL', `Le ${salesAnalytics.totalRevenue?.toLocaleString() || 0}`]);

  const html = generateExportHTML({
    title: "Sales Report",
    organisation,
    summary,
    columns,
    rows,
    categoryBreakdown: paymentBreakdown,
    dateRange: `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`,
    notes: filters.employee_ids?.length > 0 ? `Filtered by ${filters.employee_ids.length} employee(s)` : null
  });

  printDocument(html);
}

export function printExpenseReport({ expenseAnalytics, filters, organisation, filteredExpenses = [] }) {
  const summary = [
    { label: "Total Expenses", value: `Le ${expenseAnalytics.totalExpenses?.toLocaleString() || 0}` },
    { label: "Categories", value: expenseAnalytics.byCategory?.length || 0 },
    { label: "Records", value: filteredExpenses.length },
    { label: "Period", value: `${format(new Date(filters.start_date), 'MMM d')} - ${format(new Date(filters.end_date), 'MMM d, yyyy')}` }
  ];

  // Category breakdown
  const categoryBreakdown = {};
  expenseAnalytics.byCategory?.forEach(c => {
    categoryBreakdown[c.name] = c.value;
  });

  const columns = ["Date", "Category", "Description", "Vendor", "Payment", "Status", "Amount"];
  const rows = filteredExpenses.slice(0, 100).map(e => [
    format(new Date(e.date || e.created_date), 'MMM d, yyyy'),
    (e.category || 'other').replace(/_/g, ' '),
    e.description || '-',
    e.vendor || '-',
    (e.payment_method || 'cash').replace(/_/g, ' '),
    e.status || 'pending',
    `Le ${(e.amount || 0).toLocaleString()}`
  ]);

  // Add totals row
  rows.push(['', '', '', '', '', 'TOTAL', `Le ${expenseAnalytics.totalExpenses?.toLocaleString() || 0}`]);

  const html = generateExportHTML({
    title: "Expense Report",
    organisation,
    summary,
    columns,
    rows,
    categoryBreakdown,
    dateRange: `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`
  });

  printDocument(html);
}

export function printTransportReport({ transportAnalytics, filters, organisation, filteredTrips = [] }) {
  const summary = [
    { label: "Total Revenue", value: `Le ${transportAnalytics.totalRevenue?.toLocaleString() || 0}` },
    { label: "Total Trips", value: transportAnalytics.totalTrips || 0 },
    { label: "Passengers", value: transportAnalytics.totalPassengers || 0 },
    { label: "Net Revenue", value: `Le ${transportAnalytics.netRevenue?.toLocaleString() || 0}`, highlight: transportAnalytics.netRevenue >= 0 ? 'green' : 'red' }
  ];

  // Route breakdown
  const routeBreakdown = {};
  transportAnalytics.byRoute?.forEach(r => {
    routeBreakdown[r.name] = r.value;
  });

  const columns = ["Date", "Route", "Vehicle", "Driver", "Passengers", "Revenue", "Fuel Cost", "Net"];
  const rows = filteredTrips.slice(0, 100).map(t => [
    format(new Date(t.date || t.created_date), 'MMM d, yyyy'),
    t.route_name || '-',
    t.vehicle_registration || '-',
    t.driver_name || '-',
    t.passengers_count || 0,
    `Le ${(t.total_revenue || 0).toLocaleString()}`,
    `Le ${(t.fuel_cost || 0).toLocaleString()}`,
    `Le ${(t.net_revenue || 0).toLocaleString()}`
  ]);

  // Add totals row
  rows.push([
    '', '', '', 'TOTALS', 
    transportAnalytics.totalPassengers || 0,
    `Le ${transportAnalytics.totalRevenue?.toLocaleString() || 0}`,
    `Le ${transportAnalytics.totalFuelCost?.toLocaleString() || 0}`,
    `Le ${transportAnalytics.netRevenue?.toLocaleString() || 0}`
  ]);

  const html = generateExportHTML({
    title: "Transport Report",
    organisation,
    summary,
    columns,
    rows,
    categoryBreakdown: routeBreakdown,
    dateRange: `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`
  });

  printDocument(html);
}

export function printInventoryReport({ products = [], organisation }) {
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10) && p.stock_quantity > 0).length;
  const outOfStock = products.filter(p => p.stock_quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);

  const summary = [
    { label: "Total Products", value: totalProducts },
    { label: "Low Stock Items", value: lowStock, highlight: lowStock > 0 ? 'red' : 'green' },
    { label: "Out of Stock", value: outOfStock, highlight: outOfStock > 0 ? 'red' : 'green' },
    { label: "Total Stock Value", value: `Le ${totalValue.toLocaleString()}` }
  ];

  // Category breakdown
  const categoryBreakdown = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + ((p.stock_quantity || 0) * (p.unit_price || 0));
  });

  const columns = ["SKU", "Product Name", "Category", "Stock Qty", "Unit Price", "Stock Value", "Status"];
  const rows = products.slice(0, 100).map(p => {
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
      `Le ${(p.unit_price || 0).toLocaleString()}`,
      `Le ${(qty * (p.unit_price || 0)).toLocaleString()}`,
      status
    ];
  });

  // Add totals row
  rows.push(['', '', 'TOTAL', products.reduce((s, p) => s + (p.stock_quantity || 0), 0), '', `Le ${totalValue.toLocaleString()}`, '']);

  const html = generateExportHTML({
    title: "Inventory Report",
    organisation,
    summary,
    columns,
    rows,
    categoryBreakdown,
    dateRange: `As of ${format(new Date(), 'MMMM d, yyyy')}`,
    notes: `${lowStock} items need restocking. ${outOfStock} items are out of stock.`
  });

  printDocument(html);
}

export function printProfitLossReport({ profitLoss, salesAnalytics, transportAnalytics, expenseAnalytics, filters, organisation }) {
  const summary = [
    { label: "Total Revenue", value: `Le ${profitLoss.revenue?.toLocaleString() || 0}` },
    { label: "Total Expenses", value: `Le ${profitLoss.expenses?.toLocaleString() || 0}` },
    { label: "Net Profit", value: `Le ${profitLoss.profit?.toLocaleString() || 0}`, highlight: profitLoss.profit >= 0 ? 'green' : 'red' },
    { label: "Profit Margin", value: `${profitLoss.margin || 0}%` }
  ];

  const columns = ["Category", "Type", "Amount"];
  const rows = [
    ["Sales Revenue", "Income", `Le ${salesAnalytics.totalRevenue?.toLocaleString() || 0}`],
    ["Transport Revenue", "Income", `Le ${transportAnalytics.totalRevenue?.toLocaleString() || 0}`],
    ["", "", ""],
    ...expenseAnalytics.byCategory?.map(c => [
      c.name.replace(/\b\w/g, l => l.toUpperCase()),
      "Expense",
      `Le ${c.value.toLocaleString()}`
    ]) || [],
    ["", "", ""],
    ["Total Revenue", "Subtotal", `Le ${profitLoss.revenue?.toLocaleString() || 0}`],
    ["Total Expenses", "Subtotal", `Le ${profitLoss.expenses?.toLocaleString() || 0}`],
    ["Net Profit/Loss", "Total", `Le ${profitLoss.profit?.toLocaleString() || 0}`]
  ];

  const html = generateExportHTML({
    title: "Profit & Loss Statement",
    organisation,
    summary,
    columns,
    rows,
    dateRange: `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`,
    notes: profitLoss.profit >= 0 
      ? `Business is profitable with a ${profitLoss.margin}% margin.`
      : `Business is operating at a loss. Review expenses to improve profitability.`
  });

  printDocument(html);
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