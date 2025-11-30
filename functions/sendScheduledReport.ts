import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const MAILERSEND_API_KEY = Deno.env.get("MAILERSEND_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { reportId, manual } = await req.json();

    // Get the saved report
    const report = await base44.asServiceRole.entities.SavedReport.filter({ id: reportId });
    if (!report || report.length === 0) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    const savedReport = report[0];
    const schedule = savedReport.schedule || {};

    if (!schedule.enabled && !manual) {
      return Response.json({ error: 'Schedule not enabled' }, { status: 400 });
    }

    if (!schedule.recipients || schedule.recipients.length === 0) {
      return Response.json({ error: 'No recipients configured' }, { status: 400 });
    }

    // Get organisation details
    const orgs = await base44.asServiceRole.entities.Organisation.filter({ id: savedReport.organisation_id });
    const organisation = orgs?.[0] || {};

    // Calculate date range based on report filters
    const dateRange = calculateDateRange(savedReport.filters?.date_range || 'this_month');

    // Fetch report data based on type
    const reportData = await fetchReportData(base44, savedReport, dateRange);

    // Generate report content
    const format = schedule.format || 'pdf';
    const reportContent = generateReportContent(savedReport, reportData, organisation, dateRange, format);

    // Send email to each recipient
    const results = [];
    for (const recipient of schedule.recipients) {
      const emailResult = await sendReportEmail({
        to: recipient,
        subject: schedule.subject || `${savedReport.name} - ${organisation.name || 'Report'}`,
        message: schedule.message || `Please find attached your scheduled ${savedReport.name} report.`,
        reportName: savedReport.name,
        organisation,
        reportContent,
        format,
        dateRange
      });
      results.push({ recipient, success: emailResult.success, error: emailResult.error });
    }

    // Update report with last sent info
    const now = new Date().toISOString();
    const nextRun = calculateNextRun(schedule);
    
    await base44.asServiceRole.entities.SavedReport.update(reportId, {
      schedule: {
        ...schedule,
        last_sent: now,
        next_run: nextRun,
        last_status: results.every(r => r.success) ? 'success' : 'failed',
        last_error: results.find(r => !r.success)?.error || null
      }
    });

    return Response.json({ 
      success: true, 
      results,
      next_run: nextRun
    });

  } catch (error) {
    console.error('Error sending scheduled report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateDateRange(dateRangeType) {
  const now = new Date();
  let start, end;

  switch (dateRangeType) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'yesterday':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      break;
    case 'this_week':
      const dayOfWeek = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      end = now;
      break;
    case 'last_week':
      const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
      start = lastWeekStart;
      end = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate() + 6, 23, 59, 59);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'this_quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStart, 1);
      end = now;
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
  }

  return { start, end, label: formatDateRange(start, end) };
}

function formatDateRange(start, end) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-GB', options)} - ${end.toLocaleDateString('en-GB', options)}`;
}

async function fetchReportData(base44, report, dateRange) {
  const orgId = report.organisation_id;
  const data = {};

  switch (report.report_type) {
    case 'sales':
      const sales = await base44.asServiceRole.entities.Sale.filter({ organisation_id: orgId });
      data.sales = sales.filter(s => {
        const d = new Date(s.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });
      data.totalRevenue = data.sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      data.transactionCount = data.sales.length;
      break;

    case 'expenses':
      const expenses = await base44.asServiceRole.entities.Expense.filter({ organisation_id: orgId });
      data.expenses = expenses.filter(e => {
        const d = new Date(e.date || e.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });
      data.totalExpenses = data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      break;

    case 'transport':
      const trips = await base44.asServiceRole.entities.Trip.filter({ organisation_id: orgId });
      data.trips = trips.filter(t => {
        const d = new Date(t.date || t.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });
      data.totalRevenue = data.trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
      data.totalFuel = data.trips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
      break;

    case 'payroll':
      const payrolls = await base44.asServiceRole.entities.Payroll.filter({ organisation_id: orgId });
      data.payrolls = payrolls.filter(p => {
        const d = new Date(p.period_end);
        return d >= dateRange.start && d <= dateRange.end;
      });
      data.totalGross = data.payrolls.reduce((sum, p) => sum + (p.gross_pay || 0), 0);
      data.totalNet = data.payrolls.reduce((sum, p) => sum + (p.net_pay || 0), 0);
      break;

    case 'inventory':
      data.products = await base44.asServiceRole.entities.Product.filter({ organisation_id: orgId });
      data.totalProducts = data.products.length;
      data.lowStock = data.products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10)).length;
      data.totalValue = data.products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);
      break;

    case 'profit_loss':
      const allSales = await base44.asServiceRole.entities.Sale.filter({ organisation_id: orgId });
      const allExpenses = await base44.asServiceRole.entities.Expense.filter({ organisation_id: orgId });
      const allTrips = await base44.asServiceRole.entities.Trip.filter({ organisation_id: orgId });
      
      data.sales = allSales.filter(s => {
        const d = new Date(s.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });
      data.expenses = allExpenses.filter(e => {
        const d = new Date(e.date || e.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });
      data.trips = allTrips.filter(t => {
        const d = new Date(t.date || t.created_date);
        return d >= dateRange.start && d <= dateRange.end;
      });
      
      data.totalRevenue = data.sales.reduce((sum, s) => sum + (s.total_amount || 0), 0) +
                          data.trips.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
      data.totalExpenses = data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0) +
                           data.trips.reduce((sum, t) => sum + (t.fuel_cost || 0), 0);
      data.netProfit = data.totalRevenue - data.totalExpenses;
      break;
  }

  return data;
}

function generateReportContent(report, data, organisation, dateRange, format) {
  if (format === 'csv') {
    return generateCSVContent(report, data);
  }
  return generateHTMLContent(report, data, organisation, dateRange);
}

function generateCSVContent(report, data) {
  let csv = '';
  
  switch (report.report_type) {
    case 'sales':
      csv = 'Date,Sale Number,Customer,Payment Method,Status,Amount\n';
      (data.sales || []).forEach(s => {
        csv += `"${s.created_date}","${s.sale_number || ''}","${s.customer_name || 'Walk-in'}","${s.payment_method || 'cash'}","${s.payment_status || 'paid'}",${s.total_amount || 0}\n`;
      });
      csv += `\nTotal Revenue,,,,,${data.totalRevenue || 0}\n`;
      break;

    case 'expenses':
      csv = 'Date,Category,Description,Vendor,Payment Method,Status,Amount\n';
      (data.expenses || []).forEach(e => {
        csv += `"${e.date || e.created_date}","${e.category || ''}","${e.description || ''}","${e.vendor || ''}","${e.payment_method || 'cash'}","${e.status || 'pending'}",${e.amount || 0}\n`;
      });
      csv += `\nTotal Expenses,,,,,,${data.totalExpenses || 0}\n`;
      break;

    case 'transport':
      csv = 'Date,Route,Vehicle,Driver,Passengers,Revenue,Fuel Cost,Net\n';
      (data.trips || []).forEach(t => {
        const net = (t.total_revenue || 0) - (t.fuel_cost || 0);
        csv += `"${t.date || t.created_date}","${t.route_name || ''}","${t.vehicle_registration || ''}","${t.driver_name || ''}",${t.passengers_count || 0},${t.total_revenue || 0},${t.fuel_cost || 0},${net}\n`;
      });
      csv += `\nTotals,,,,,${data.totalRevenue || 0},${data.totalFuel || 0},${(data.totalRevenue || 0) - (data.totalFuel || 0)}\n`;
      break;

    case 'payroll':
      csv = 'Employee,Role,Gross Pay,Deductions,Net Pay,Status\n';
      (data.payrolls || []).forEach(p => {
        csv += `"${p.employee_name || ''}","${p.employee_role || ''}",${p.gross_pay || 0},${p.total_deductions || 0},${p.net_pay || 0},"${p.status || ''}"\n`;
      });
      csv += `\nTotals,,${data.totalGross || 0},,${data.totalNet || 0}\n`;
      break;

    case 'inventory':
      csv = 'SKU,Product Name,Category,Stock Qty,Unit Price,Stock Value,Status\n';
      (data.products || []).forEach(p => {
        const value = (p.stock_quantity || 0) * (p.unit_price || 0);
        const status = p.stock_quantity === 0 ? 'Out of Stock' : p.stock_quantity <= (p.low_stock_threshold || 10) ? 'Low Stock' : 'In Stock';
        csv += `"${p.sku || ''}","${p.name || ''}","${p.category || ''}",${p.stock_quantity || 0},${p.unit_price || 0},${value},"${status}"\n`;
      });
      csv += `\nTotal Value,,,,,${data.totalValue || 0}\n`;
      break;

    case 'profit_loss':
      csv = 'Category,Type,Amount\n';
      csv += `"Sales Revenue","Income",${(data.sales || []).reduce((s, x) => s + (x.total_amount || 0), 0)}\n`;
      csv += `"Transport Revenue","Income",${(data.trips || []).reduce((s, x) => s + (x.total_revenue || 0), 0)}\n`;
      csv += `"Expenses","Expense",${(data.expenses || []).reduce((s, x) => s + (x.amount || 0), 0)}\n`;
      csv += `"Fuel Costs","Expense",${(data.trips || []).reduce((s, x) => s + (x.fuel_cost || 0), 0)}\n`;
      csv += `\n"Total Revenue",,${data.totalRevenue || 0}\n`;
      csv += `"Total Expenses",,${data.totalExpenses || 0}\n`;
      csv += `"Net Profit/Loss",,${data.netProfit || 0}\n`;
      break;
  }

  return csv;
}

function generateHTMLContent(report, data, organisation, dateRange) {
  const orgName = organisation.name || 'Business Report';
  const orgAddress = organisation.address || '';
  const orgPhone = organisation.phone || '';
  const orgEmail = organisation.email || '';

  let summaryHTML = '';
  let tableHTML = '';

  switch (report.report_type) {
    case 'sales':
      summaryHTML = `
        <div class="summary-grid">
          <div class="summary-card"><div class="label">Total Revenue</div><div class="value">SLE ${(data.totalRevenue || 0).toLocaleString()}</div></div>
          <div class="summary-card"><div class="label">Transactions</div><div class="value">${data.transactionCount || 0}</div></div>
          <div class="summary-card"><div class="label">Avg Transaction</div><div class="value">SLE ${data.transactionCount ? Math.round(data.totalRevenue / data.transactionCount).toLocaleString() : 0}</div></div>
        </div>
      `;
      tableHTML = `
        <table>
          <thead><tr><th>Date</th><th>Sale #</th><th>Customer</th><th>Payment</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            ${(data.sales || []).slice(0, 50).map(s => `
              <tr>
                <td>${new Date(s.created_date).toLocaleDateString('en-GB')}</td>
                <td>${s.sale_number || '-'}</td>
                <td>${s.customer_name || 'Walk-in'}</td>
                <td>${s.payment_method || 'cash'}</td>
                <td><span class="status-badge ${s.payment_status === 'paid' ? 'success' : 'warning'}">${s.payment_status || 'paid'}</span></td>
                <td class="amount">SLE ${(s.total_amount || 0).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row"><td colspan="5">TOTAL</td><td class="amount">SLE ${(data.totalRevenue || 0).toLocaleString()}</td></tr>
          </tbody>
        </table>
      `;
      break;

    case 'expenses':
      summaryHTML = `
        <div class="summary-grid">
          <div class="summary-card highlight-red"><div class="label">Total Expenses</div><div class="value">SLE ${(data.totalExpenses || 0).toLocaleString()}</div></div>
          <div class="summary-card"><div class="label">Records</div><div class="value">${(data.expenses || []).length}</div></div>
        </div>
      `;
      tableHTML = `
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Vendor</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            ${(data.expenses || []).slice(0, 50).map(e => `
              <tr>
                <td>${new Date(e.date || e.created_date).toLocaleDateString('en-GB')}</td>
                <td>${(e.category || 'other').replace(/_/g, ' ')}</td>
                <td>${e.description || '-'}</td>
                <td>${e.vendor || '-'}</td>
                <td><span class="status-badge ${e.status === 'approved' ? 'success' : 'warning'}">${e.status || 'pending'}</span></td>
                <td class="amount">SLE ${(e.amount || 0).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row"><td colspan="5">TOTAL</td><td class="amount">SLE ${(data.totalExpenses || 0).toLocaleString()}</td></tr>
          </tbody>
        </table>
      `;
      break;

    case 'profit_loss':
      const margin = data.totalRevenue > 0 ? ((data.netProfit / data.totalRevenue) * 100).toFixed(1) : 0;
      summaryHTML = `
        <div class="summary-grid">
          <div class="summary-card"><div class="label">Total Revenue</div><div class="value">SLE ${(data.totalRevenue || 0).toLocaleString()}</div></div>
          <div class="summary-card highlight-red"><div class="label">Total Expenses</div><div class="value">SLE ${(data.totalExpenses || 0).toLocaleString()}</div></div>
          <div class="summary-card ${data.netProfit >= 0 ? 'highlight-green' : 'highlight-red'}"><div class="label">Net Profit</div><div class="value">SLE ${(data.netProfit || 0).toLocaleString()}</div></div>
          <div class="summary-card"><div class="label">Margin</div><div class="value">${margin}%</div></div>
        </div>
      `;
      break;

    default:
      summaryHTML = '<p>Report data not available</p>';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${report.name} - ${orgName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a1a; font-size: 12px; line-height: 1.5; }
        .header { background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%); color: white; padding: 24px 32px; }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header p { opacity: 0.85; font-size: 11px; }
        .flag-bar { height: 6px; display: flex; }
        .flag-bar .g { flex: 1; background: #1EB053; }
        .flag-bar .w { flex: 1; background: #FFFFFF; }
        .flag-bar .b { flex: 1; background: #0072C6; }
        .title-bar { background: linear-gradient(90deg, rgba(30,176,83,0.08), rgba(0,114,198,0.04)); padding: 16px 32px; border-bottom: 3px solid; border-image: linear-gradient(90deg, #1EB053, #0072C6) 1; }
        .title-bar h2 { font-size: 18px; color: #0F1F3C; }
        .title-bar .date { font-size: 11px; color: #666; margin-top: 4px; }
        .content { padding: 32px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .summary-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-top: 4px solid #1EB053; border-radius: 8px; padding: 16px; text-align: center; }
        .summary-card:nth-child(2) { border-top-color: #0072C6; }
        .summary-card:nth-child(3) { border-top-color: #D4AF37; }
        .summary-card.highlight-green { border-top-color: #1EB053; background: #ecfdf5; }
        .summary-card.highlight-red { border-top-color: #ef4444; background: #fef2f2; }
        .summary-card .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 6px; }
        .summary-card .value { font-size: 20px; font-weight: 700; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #0F1F3C; color: white; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 10px 8px; border-bottom: 1px solid #e0e0e0; }
        tr:nth-child(even) td { background: #f9f9f9; }
        .amount { text-align: right; font-weight: 600; }
        .total-row { background: #0F1F3C !important; }
        .total-row td { color: white; font-weight: 700; border: none; }
        .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #fffbeb; color: #d97706; }
        .footer { background: #0F1F3C; color: white; padding: 20px 32px; text-align: center; margin-top: 32px; }
        .footer p { font-size: 11px; opacity: 0.8; }
      </style>
    </head>
    <body>
      <div class="flag-bar"><div class="g"></div><div class="w"></div><div class="b"></div></div>
      <div class="header">
        <h1>${orgName}</h1>
        <p>${orgAddress} ${orgPhone ? '• ' + orgPhone : ''} ${orgEmail ? '• ' + orgEmail : ''}</p>
      </div>
      <div class="title-bar">
        <h2>📊 ${report.name}</h2>
        <div class="date">Period: ${dateRange.label} • Generated: ${new Date().toLocaleString('en-GB')}</div>
      </div>
      <div class="content">
        ${summaryHTML}
        ${tableHTML}
      </div>
      <div class="footer">
        <p>This is an automated report from ${orgName}. 🇸🇱</p>
      </div>
    </body>
    </html>
  `;
}

async function sendReportEmail({ to, subject, message, reportName, organisation, reportContent, format, dateRange }) {
  if (!MAILERSEND_API_KEY) {
    return { success: false, error: 'Email service not configured' };
  }

  const orgName = organisation.name || 'Business Report';
  const isCSV = format === 'csv';

  const emailBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="height: 6px; display: flex;">
        <div style="flex: 1; background: #1EB053;"></div>
        <div style="flex: 1; background: #FFFFFF; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;"></div>
        <div style="flex: 1; background: #0072C6;"></div>
      </div>
      <div style="background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%); color: white; padding: 24px;">
        <h1 style="margin: 0; font-size: 22px;">${orgName}</h1>
        <p style="margin: 8px 0 0; opacity: 0.85; font-size: 13px;">Scheduled Report</p>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        <h2 style="color: #0F1F3C; margin: 0 0 16px;">📊 ${reportName}</h2>
        <p style="color: #555; margin: 0 0 16px;">${message}</p>
        <div style="background: #f8f9fa; border-left: 4px solid #1EB053; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px;"><strong>Report Period:</strong> ${dateRange.label}</p>
          <p style="margin: 4px 0 0; font-size: 13px;"><strong>Format:</strong> ${isCSV ? 'CSV Spreadsheet' : 'PDF Document'}</p>
          <p style="margin: 4px 0 0; font-size: 13px;"><strong>Generated:</strong> ${new Date().toLocaleString('en-GB')}</p>
        </div>
        ${isCSV ? `
          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 12px; color: #92400e;">📎 <strong>Note:</strong> Your CSV report data is included below. Copy and paste into a spreadsheet application.</p>
          </div>
          <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 11px; overflow-x: auto; white-space: pre-wrap;">${reportContent}</pre>
        ` : `
          <p style="color: #666; font-size: 12px; margin-top: 16px;">The full report is included below:</p>
        `}
      </div>
      <div style="background: #0F1F3C; color: white; padding: 16px 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; opacity: 0.8;">This is an automated email from ${orgName} 🇸🇱</p>
      </div>
    </div>
    ${!isCSV ? reportContent : ''}
  `;

  try {
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@trial-neqvygmxv2zl0p7w.mlsender.net',
          name: orgName
        },
        to: [{ email: to }],
        subject: subject,
        html: emailBody
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Email failed: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function calculateNextRun(schedule) {
  const now = new Date();
  const [hours, minutes] = (schedule.time || '08:00').split(':').map(Number);
  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  switch (schedule.frequency) {
    case 'daily':
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      break;
    case 'weekly':
      const targetDay = schedule.day_of_week || 1; // Monday default
      let daysUntil = targetDay - now.getDay();
      if (daysUntil <= 0 || (daysUntil === 0 && next <= now)) {
        daysUntil += 7;
      }
      next.setDate(next.getDate() + daysUntil);
      break;
    case 'monthly':
      const targetDate = schedule.day_of_month || 1;
      next.setDate(targetDate);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      break;
  }

  return next.toISOString();
}