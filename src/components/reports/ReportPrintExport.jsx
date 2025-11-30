import React from "react";
import { format } from "date-fns";
import { generateExportHTML, printDocument, exportToCSV } from "@/components/exports/SierraLeoneExportStyles";
import { generateProfessionalReport, printProfessionalReport } from "@/components/exports/ProfessionalReportGenerator";

export function printSalesReport({ salesAnalytics, filters, organisation, filteredSales = [] }) {
  const dateRange = `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`;
  
  // Calculate insights
  const avgSale = salesAnalytics.avgTransaction || 0;
  const topPayment = salesAnalytics.byPayment?.sort((a, b) => b.value - a.value)[0];
  const cashSales = salesAnalytics.byPayment?.find(p => p.name.toLowerCase() === 'cash')?.value || 0;
  const creditSales = salesAnalytics.byPayment?.find(p => p.name.toLowerCase() === 'credit')?.value || 0;

  const keyMetrics = [
    { 
      icon: '💰', 
      label: 'Total Revenue', 
      value: `Le ${(salesAnalytics.totalRevenue || 0).toLocaleString()}`,
      trend: 'positive'
    },
    { 
      icon: '🧾', 
      label: 'Transactions', 
      value: (salesAnalytics.totalTransactions || 0).toLocaleString()
    },
    { 
      icon: '📊', 
      label: 'Average Sale', 
      value: `Le ${Math.round(avgSale).toLocaleString()}`
    },
    { 
      icon: '💳', 
      label: 'Top Payment Method', 
      value: topPayment?.name || 'Cash'
    }
  ];

  const columns = ["Date", "Sale #", "Customer", "Employee", "Payment", "Status", "Amount"];
  const rows = filteredSales.slice(0, 50).map(s => [
    format(new Date(s.created_date), 'MMM d, yyyy'),
    s.sale_number || '-',
    s.customer_name || 'Walk-in',
    s.employee_name || '-',
    (s.payment_method || 'cash').replace(/_/g, ' '),
    s.payment_status || 'paid',
    `Le ${(s.total_amount || 0).toLocaleString()}`
  ]);
  rows.push(['', '', '', '', '', 'TOTAL', `Le ${salesAnalytics.totalRevenue?.toLocaleString() || 0}`]);

  const insights = [
    `Total of ${salesAnalytics.totalTransactions || 0} transactions processed during this period`,
    `Average transaction value is Le ${Math.round(avgSale).toLocaleString()}`,
    topPayment ? `${topPayment.name} is the most popular payment method (Le ${topPayment.value?.toLocaleString()})` : null,
    creditSales > 0 ? `Credit sales account for Le ${creditSales.toLocaleString()} - monitor collection` : null
  ].filter(Boolean);

  const recommendations = [
    avgSale < 50000 ? 'Consider upselling strategies to increase average transaction value' : null,
    creditSales > cashSales * 0.3 ? 'Review credit policy - credit sales are significant' : null,
    salesAnalytics.totalTransactions < 10 ? 'Focus on customer acquisition to increase transaction volume' : null,
    'Continue monitoring payment method trends for cash flow planning'
  ].filter(Boolean);

  const html = generateProfessionalReport({
    reportType: 'Sales Analysis',
    title: 'Sales Report',
    subtitle: 'Comprehensive sales performance analysis and transaction summary',
    organisation,
    dateRange,
    executiveSummary: `This report provides a detailed analysis of sales performance for the period ${dateRange}. Total revenue generated was Le ${(salesAnalytics.totalRevenue || 0).toLocaleString()} from ${salesAnalytics.totalTransactions || 0} transactions, with an average transaction value of Le ${Math.round(avgSale).toLocaleString()}.`,
    keyMetrics,
    tables: [{
      title: 'Sales Transactions',
      icon: '🧾',
      columns,
      rows
    }],
    insights,
    recommendations
  });

  printProfessionalReport(html);
}

export function printExpenseReport({ expenseAnalytics, filters, organisation, filteredExpenses = [] }) {
  const dateRange = `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`;
  
  const topCategory = expenseAnalytics.byCategory?.sort((a, b) => b.value - a.value)[0];
  const avgExpense = filteredExpenses.length > 0 
    ? (expenseAnalytics.totalExpenses || 0) / filteredExpenses.length 
    : 0;

  const keyMetrics = [
    { 
      icon: '💸', 
      label: 'Total Expenses', 
      value: `Le ${(expenseAnalytics.totalExpenses || 0).toLocaleString()}`,
      trend: 'negative'
    },
    { 
      icon: '📁', 
      label: 'Categories', 
      value: expenseAnalytics.byCategory?.length || 0
    },
    { 
      icon: '📋', 
      label: 'Records', 
      value: filteredExpenses.length
    },
    { 
      icon: '🏷️', 
      label: 'Top Category', 
      value: topCategory?.name?.replace(/_/g, ' ') || 'N/A'
    }
  ];

  const columns = ["Date", "Category", "Description", "Vendor", "Payment", "Status", "Amount"];
  const rows = filteredExpenses.slice(0, 50).map(e => [
    format(new Date(e.date || e.created_date), 'MMM d, yyyy'),
    (e.category || 'other').replace(/_/g, ' '),
    e.description || '-',
    e.vendor || '-',
    (e.payment_method || 'cash').replace(/_/g, ' '),
    e.status || 'pending',
    `Le ${(e.amount || 0).toLocaleString()}`
  ]);
  rows.push(['', '', '', '', '', 'TOTAL', `Le ${expenseAnalytics.totalExpenses?.toLocaleString() || 0}`]);

  const insights = [
    `Total of ${filteredExpenses.length} expense records during this period`,
    `Average expense amount is Le ${Math.round(avgExpense).toLocaleString()}`,
    topCategory ? `${topCategory.name.replace(/_/g, ' ')} is the largest expense category (Le ${topCategory.value?.toLocaleString()})` : null,
    `${expenseAnalytics.byCategory?.length || 0} different expense categories tracked`
  ].filter(Boolean);

  const recommendations = [
    topCategory && topCategory.value > (expenseAnalytics.totalExpenses || 0) * 0.4 
      ? `Review ${topCategory.name.replace(/_/g, ' ')} expenses - they represent over 40% of total` : null,
    'Ensure all expenses have proper receipts and documentation',
    'Consider negotiating bulk discounts with frequent vendors',
    'Regular expense audits help identify cost-saving opportunities'
  ].filter(Boolean);

  const html = generateProfessionalReport({
    reportType: 'Expense Analysis',
    title: 'Expense Report',
    subtitle: 'Detailed breakdown of business expenses and cost analysis',
    organisation,
    dateRange,
    executiveSummary: `This report summarizes all business expenses for the period ${dateRange}. Total expenses amounted to Le ${(expenseAnalytics.totalExpenses || 0).toLocaleString()} across ${expenseAnalytics.byCategory?.length || 0} categories, with an average expense of Le ${Math.round(avgExpense).toLocaleString()}.`,
    keyMetrics,
    tables: [{
      title: 'Expense Records',
      icon: '💸',
      columns,
      rows
    }],
    insights,
    recommendations
  });

  printProfessionalReport(html);
}

export function printTransportReport({ transportAnalytics, filters, organisation, filteredTrips = [] }) {
  const dateRange = `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`;
  
  const topRoute = transportAnalytics.byRoute?.sort((a, b) => b.value - a.value)[0];
  const avgPassengers = filteredTrips.length > 0 
    ? Math.round((transportAnalytics.totalPassengers || 0) / filteredTrips.length) 
    : 0;
  const profitMargin = transportAnalytics.totalRevenue > 0 
    ? Math.round((transportAnalytics.netRevenue / transportAnalytics.totalRevenue) * 100) 
    : 0;

  const keyMetrics = [
    { 
      icon: '💰', 
      label: 'Total Revenue', 
      value: `Le ${(transportAnalytics.totalRevenue || 0).toLocaleString()}`
    },
    { 
      icon: '🚌', 
      label: 'Total Trips', 
      value: transportAnalytics.totalTrips || 0
    },
    { 
      icon: '👥', 
      label: 'Passengers', 
      value: (transportAnalytics.totalPassengers || 0).toLocaleString()
    },
    { 
      icon: '📈', 
      label: 'Net Revenue', 
      value: `Le ${(transportAnalytics.netRevenue || 0).toLocaleString()}`,
      trend: transportAnalytics.netRevenue >= 0 ? 'positive' : 'negative'
    }
  ];

  const columns = ["Date", "Route", "Vehicle", "Driver", "Passengers", "Revenue", "Fuel Cost", "Net"];
  const rows = filteredTrips.slice(0, 50).map(t => [
    format(new Date(t.date || t.created_date), 'MMM d, yyyy'),
    t.route_name || '-',
    t.vehicle_registration || '-',
    t.driver_name || '-',
    t.passengers_count || 0,
    `Le ${(t.total_revenue || 0).toLocaleString()}`,
    `Le ${(t.fuel_cost || 0).toLocaleString()}`,
    `Le ${(t.net_revenue || 0).toLocaleString()}`
  ]);
  rows.push([
    '', '', '', 'TOTALS', 
    transportAnalytics.totalPassengers || 0,
    `Le ${transportAnalytics.totalRevenue?.toLocaleString() || 0}`,
    `Le ${transportAnalytics.totalFuelCost?.toLocaleString() || 0}`,
    `Le ${transportAnalytics.netRevenue?.toLocaleString() || 0}`
  ]);

  const insights = [
    `Completed ${transportAnalytics.totalTrips || 0} trips carrying ${(transportAnalytics.totalPassengers || 0).toLocaleString()} passengers`,
    `Average ${avgPassengers} passengers per trip`,
    topRoute ? `${topRoute.name} is the most profitable route (Le ${topRoute.value?.toLocaleString()})` : null,
    `Profit margin of ${profitMargin}% after fuel costs`
  ].filter(Boolean);

  const recommendations = [
    profitMargin < 30 ? 'Consider reviewing fuel efficiency and route optimization' : null,
    avgPassengers < 10 ? 'Explore ways to increase passenger load per trip' : null,
    transportAnalytics.totalFuelCost > transportAnalytics.totalRevenue * 0.4 
      ? 'Fuel costs are high - consider fuel-efficient vehicles or route optimization' : null,
    'Regular vehicle maintenance helps reduce unexpected repair costs'
  ].filter(Boolean);

  const html = generateProfessionalReport({
    reportType: 'Transport Operations',
    title: 'Transport Report',
    subtitle: 'Trip operations, revenue analysis, and fleet performance summary',
    organisation,
    dateRange,
    executiveSummary: `This report covers transport operations for ${dateRange}. A total of ${transportAnalytics.totalTrips || 0} trips were completed, generating Le ${(transportAnalytics.totalRevenue || 0).toLocaleString()} in revenue. After fuel costs of Le ${(transportAnalytics.totalFuelCost || 0).toLocaleString()}, net revenue was Le ${(transportAnalytics.netRevenue || 0).toLocaleString()} with a ${profitMargin}% profit margin.`,
    keyMetrics,
    tables: [{
      title: 'Trip Details',
      icon: '🚌',
      columns,
      rows
    }],
    insights,
    recommendations
  });

  printProfessionalReport(html);
}

export function printInventoryReport({ products = [], organisation }) {
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10) && p.stock_quantity > 0).length;
  const outOfStock = products.filter(p => p.stock_quantity === 0).length;
  const inStock = totalProducts - lowStock - outOfStock;
  const totalValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);
  const totalUnits = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);

  const keyMetrics = [
    { 
      icon: '📦', 
      label: 'Total Products', 
      value: totalProducts
    },
    { 
      icon: '✅', 
      label: 'In Stock', 
      value: inStock,
      trend: 'positive'
    },
    { 
      icon: '⚠️', 
      label: 'Low Stock', 
      value: lowStock,
      trend: lowStock > 0 ? 'warning' : ''
    },
    { 
      icon: '💎', 
      label: 'Stock Value', 
      value: `Le ${totalValue.toLocaleString()}`
    }
  ];

  const columns = ["SKU", "Product Name", "Category", "Stock Qty", "Unit Price", "Stock Value", "Status"];
  const rows = products.slice(0, 50).map(p => {
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
  rows.push(['', '', 'TOTAL', totalUnits, '', `Le ${totalValue.toLocaleString()}`, '']);

  const insights = [
    `Total of ${totalProducts} products tracked in inventory`,
    `${inStock} items have healthy stock levels`,
    lowStock > 0 ? `${lowStock} items are running low and need restocking` : 'All items have adequate stock levels',
    outOfStock > 0 ? `${outOfStock} items are out of stock - immediate attention required` : null
  ].filter(Boolean);

  const recommendations = [
    outOfStock > 0 ? 'Prioritize restocking out-of-stock items to avoid lost sales' : null,
    lowStock > 5 ? 'Review reorder schedules for low stock items' : null,
    'Consider setting up automated low stock alerts',
    'Regular stock audits help maintain inventory accuracy'
  ].filter(Boolean);

  const html = generateProfessionalReport({
    reportType: 'Inventory Analysis',
    title: 'Inventory Report',
    subtitle: 'Stock levels, valuation, and inventory health assessment',
    organisation,
    dateRange: `As of ${format(new Date(), 'MMMM d, yyyy')}`,
    executiveSummary: `Current inventory consists of ${totalProducts} products with a total stock value of Le ${totalValue.toLocaleString()}. ${inStock} items are well-stocked, ${lowStock} items are low on stock, and ${outOfStock} items are out of stock.`,
    keyMetrics,
    tables: [{
      title: 'Product Inventory',
      icon: '📦',
      columns,
      rows
    }],
    insights,
    recommendations
  });

  printProfessionalReport(html);
}

export function printProfitLossReport({ profitLoss, salesAnalytics, transportAnalytics, expenseAnalytics, filters, organisation }) {
  const dateRange = `${format(new Date(filters.start_date), 'MMMM d, yyyy')} - ${format(new Date(filters.end_date), 'MMMM d, yyyy')}`;
  
  const salesRevenue = salesAnalytics.totalRevenue || 0;
  const transportRevenue = transportAnalytics.totalRevenue || 0;
  const isProfitable = (profitLoss.profit || 0) >= 0;
  const topExpense = expenseAnalytics.byCategory?.sort((a, b) => b.value - a.value)[0];

  const keyMetrics = [
    { 
      icon: '💵', 
      label: 'Total Revenue', 
      value: `Le ${(profitLoss.revenue || 0).toLocaleString()}`,
      trend: 'positive'
    },
    { 
      icon: '💸', 
      label: 'Total Expenses', 
      value: `Le ${(profitLoss.expenses || 0).toLocaleString()}`,
      trend: 'negative'
    },
    { 
      icon: isProfitable ? '📈' : '📉', 
      label: 'Net Profit/Loss', 
      value: `Le ${(profitLoss.profit || 0).toLocaleString()}`,
      trend: isProfitable ? 'positive' : 'negative'
    },
    { 
      icon: '🎯', 
      label: 'Profit Margin', 
      value: `${profitLoss.margin || 0}%`
    }
  ];

  const columns = ["Category", "Type", "Amount"];
  const rows = [
    ["Sales Revenue", "Income", `Le ${salesRevenue.toLocaleString()}`],
    ["Transport Revenue", "Income", `Le ${transportRevenue.toLocaleString()}`],
    ["", "", ""],
    ...expenseAnalytics.byCategory?.map(c => [
      c.name.replace(/\b\w/g, l => l.toUpperCase()).replace(/_/g, ' '),
      "Expense",
      `Le ${c.value.toLocaleString()}`
    ]) || [],
    ["", "", ""],
    ["Total Revenue", "Subtotal", `Le ${(profitLoss.revenue || 0).toLocaleString()}`],
    ["Total Expenses", "Subtotal", `Le ${(profitLoss.expenses || 0).toLocaleString()}`],
    ["Net Profit/Loss", "Total", `Le ${(profitLoss.profit || 0).toLocaleString()}`]
  ];

  const insights = [
    `Revenue breakdown: Sales Le ${salesRevenue.toLocaleString()} (${Math.round(salesRevenue / (profitLoss.revenue || 1) * 100)}%), Transport Le ${transportRevenue.toLocaleString()} (${Math.round(transportRevenue / (profitLoss.revenue || 1) * 100)}%)`,
    topExpense ? `Largest expense category: ${topExpense.name.replace(/_/g, ' ')} at Le ${topExpense.value.toLocaleString()}` : null,
    isProfitable 
      ? `Business is profitable with a ${profitLoss.margin}% margin` 
      : `Business is operating at a loss of Le ${Math.abs(profitLoss.profit || 0).toLocaleString()}`,
    `Expense ratio: ${Math.round((profitLoss.expenses / (profitLoss.revenue || 1)) * 100)}% of revenue`
  ].filter(Boolean);

  const recommendations = isProfitable ? [
    profitLoss.margin < 15 ? 'Consider strategies to improve profit margin above 15%' : null,
    'Maintain current cost control measures',
    'Explore opportunities for revenue growth',
    'Consider reinvesting profits for business expansion'
  ].filter(Boolean) : [
    'Urgent: Review and reduce non-essential expenses',
    'Analyze revenue streams for improvement opportunities',
    topExpense ? `Focus on reducing ${topExpense.name.replace(/_/g, ' ')} costs` : null,
    'Consider price adjustments if market conditions allow'
  ].filter(Boolean);

  const html = generateProfessionalReport({
    reportType: 'Financial Statement',
    title: 'Profit & Loss Statement',
    subtitle: 'Comprehensive financial performance analysis',
    organisation,
    dateRange,
    executiveSummary: `This Profit & Loss statement covers the period ${dateRange}. Total revenue was Le ${(profitLoss.revenue || 0).toLocaleString()} with expenses of Le ${(profitLoss.expenses || 0).toLocaleString()}, resulting in a ${isProfitable ? 'profit' : 'loss'} of Le ${Math.abs(profitLoss.profit || 0).toLocaleString()} (${profitLoss.margin || 0}% margin).`,
    keyMetrics,
    tables: [{
      title: 'Profit & Loss Breakdown',
      icon: '📊',
      columns,
      rows
    }],
    insights,
    recommendations
  });

  printProfessionalReport(html);
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