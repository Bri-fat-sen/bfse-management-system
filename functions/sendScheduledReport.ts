import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Helper to generate CSV content
function generateCSV(columns, data) {
  const headers = columns.map(c => `"${c.label}"`).join(',');
  const rows = data.map(row => 
    columns.map(c => {
      const val = row[c.field];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'number') return val;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

// Helper to generate HTML report
function generateHTMLReport(report, data, organisation, totals) {
  const columns = report.columns?.filter(c => c.visible) || [];
  const orgName = organisation?.name || 'Organisation';
  const orgAddress = organisation?.address || '';
  const orgPhone = organisation?.phone || '';
  const orgEmail = organisation?.email || '';
  
  const frequencyLabel = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly'
  }[report.schedule?.frequency] || 'Scheduled';

  const tableRows = data.slice(0, 200).map(row => `
    <tr>
      ${columns.map(c => {
        const val = row[c.field];
        let display = '-';
        if (val !== null && val !== undefined) {
          if (typeof val === 'number') {
            display = val.toLocaleString();
          } else if (c.field.includes('date') && val) {
            display = new Date(val).toLocaleDateString('en-GB');
          } else {
            display = String(val);
          }
        }
        return `<td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${display}</td>`;
      }).join('')}
    </tr>
  `).join('');

  const totalsHTML = Object.entries(totals).length > 0 ? `
    <div style="margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%); border-radius: 8px;">
      <h3 style="margin: 0 0 10px 0; color: #0F1F3C; font-size: 14px;">Summary Totals</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 15px;">
        ${Object.entries(totals).map(([label, value]) => `
          <div style="background: white; padding: 10px 15px; border-radius: 6px; border-left: 3px solid #1EB053;">
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">${label}</div>
            <div style="font-size: 18px; font-weight: bold; color: #1EB053;">${typeof value === 'number' ? value.toLocaleString() : value}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${report.name} - ${frequencyLabel} Report</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6;">
      <div style="max-width: 800px; margin: 0 auto; background: white;">
        <!-- Flag Stripe -->
        <div style="height: 8px; background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);"></div>
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%); color: white; padding: 25px 30px;">
          <h1 style="margin: 0; font-size: 24px;">${orgName}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 12px;">
            ${orgAddress ? `📍 ${orgAddress}` : ''} 
            ${orgPhone ? ` | 📞 ${orgPhone}` : ''} 
            ${orgEmail ? ` | ✉️ ${orgEmail}` : ''}
          </p>
        </div>
        
        <!-- Report Title -->
        <div style="background: linear-gradient(90deg, rgba(30,176,83,0.1) 0%, rgba(0,114,198,0.05) 100%); padding: 20px 30px; border-bottom: 3px solid; border-image: linear-gradient(90deg, #1EB053 0%, #0072C6 100%) 1;">
          <h2 style="margin: 0; color: #0F1F3C; font-size: 20px;">📊 ${report.name}</h2>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 13px;">${report.description || frequencyLabel + ' Report'}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px 30px;">
          <div style="display: flex; gap: 20px; margin-bottom: 20px; font-size: 13px; color: #374151;">
            <div><strong>Report Type:</strong> ${report.report_type?.charAt(0).toUpperCase() + report.report_type?.slice(1)}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleString('en-GB')}</div>
            <div><strong>Records:</strong> ${data.length}</div>
          </div>
          
          ${totalsHTML}
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #0F1F3C 0%, #1a3a6e 100%);">
                  ${columns.map(c => `<th style="padding: 12px 10px; text-align: left; color: white; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">${c.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          
          ${data.length > 200 ? '<p style="color: #6b7280; font-style: italic; margin-top: 15px; font-size: 12px;">Showing first 200 records. Full data available in CSV attachment.</p>' : ''}
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 11px;">This is an automated ${frequencyLabel.toLowerCase()} report from ${orgName}.</p>
          <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 10px;">🇸🇱 Proudly serving Sierra Leone</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_id, test_mode } = await req.json();

    // Get the report
    const reports = await base44.asServiceRole.entities.SavedReport.filter({ id: report_id });
    const report = reports[0];

    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    if (!report.schedule?.enabled && !test_mode) {
      return Response.json({ error: 'Report is not scheduled' }, { status: 400 });
    }

    const recipients = report.schedule?.recipients || [];
    if (recipients.length === 0) {
      return Response.json({ error: 'No recipients configured' }, { status: 400 });
    }

    // Get organisation details
    const orgs = await base44.asServiceRole.entities.Organisation.filter({ id: report.organisation_id });
    const organisation = orgs[0];

    // Fetch report data based on type
    const orgId = report.organisation_id;
    let data = [];

    switch (report.report_type) {
      case 'sales':
        data = await base44.asServiceRole.entities.Sale.filter({ organisation_id: orgId });
        break;
      case 'inventory':
        data = await base44.asServiceRole.entities.Product.filter({ organisation_id: orgId });
        break;
      case 'payroll':
        data = await base44.asServiceRole.entities.Payroll.filter({ organisation_id: orgId });
        break;
      case 'transport':
        data = await base44.asServiceRole.entities.Trip.filter({ organisation_id: orgId });
        break;
    }

    // Apply date filter based on schedule frequency
    const now = new Date();
    let startDate = new Date();
    
    switch (report.schedule?.frequency) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    data = data.filter(item => {
      const itemDate = new Date(item.created_date || item.date || item.period_start);
      return itemDate >= startDate;
    });

    // Calculate totals for columns with sum aggregate
    const visibleColumns = report.columns?.filter(c => c.visible) || [];
    const totals = {};
    visibleColumns.filter(c => c.aggregate === 'sum').forEach(col => {
      totals[col.label] = data.reduce((sum, item) => sum + (Number(item[col.field]) || 0), 0);
    });

    // Determine format
    const format = report.schedule?.format || 'pdf';
    const frequencyLabel = {
      daily: 'Daily',
      weekly: 'Weekly', 
      monthly: 'Monthly'
    }[report.schedule?.frequency] || 'Scheduled';

    // Generate content based on format
    let emailBody = '';
    let attachmentInfo = '';

    if (format === 'csv') {
      // CSV only - simple email with CSV content description
      const csvData = generateCSV(visibleColumns, data);
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 20px; color: white;">
            <h1 style="margin: 0;">${report.name}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${frequencyLabel} Report - CSV Format</p>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p><strong>Report Type:</strong> ${report.report_type}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString('en-GB')}</p>
            <p><strong>Records:</strong> ${data.length}</p>
            ${Object.entries(totals).length > 0 ? `
              <h3>Summary</h3>
              <ul>
                ${Object.entries(totals).map(([label, value]) => 
                  `<li><strong>${label}:</strong> ${value.toLocaleString()}</li>`
                ).join('')}
              </ul>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280;">CSV Data Preview (first 10 rows):</p>
            <pre style="background: white; padding: 15px; border-radius: 8px; font-size: 11px; overflow-x: auto; border: 1px solid #e5e7eb;">${csvData.split('\n').slice(0, 11).join('\n')}</pre>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;"><em>Note: Full CSV data should be requested from the system dashboard.</em></p>
          </div>
          <div style="padding: 15px 20px; background: #f3f4f6; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
            <p>🇸🇱 Automated report from ${organisation?.name || 'your business'}</p>
          </div>
        </div>
      `;
    } else {
      // PDF or both - generate full HTML report
      emailBody = generateHTMLReport(report, data, organisation, totals);
    }

    // Send emails to all recipients
    const results = [];
    for (const recipient of recipients) {
      try {
        await base44.integrations.Core.SendEmail({
          to: recipient,
          subject: `${frequencyLabel} Report: ${report.name}`,
          body: emailBody
        });
        results.push({ email: recipient, status: 'sent' });
      } catch (error) {
        results.push({ email: recipient, status: 'failed', error: error.message });
      }
    }

    // Calculate next run time
    const nextRun = new Date();
    switch (report.schedule?.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
    
    if (report.schedule?.time) {
      const [hours, minutes] = report.schedule.time.split(':');
      nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Update last_sent and next_run timestamps
    await base44.asServiceRole.entities.SavedReport.update(report.id, {
      schedule: {
        ...report.schedule,
        last_sent: new Date().toISOString(),
        next_run: nextRun.toISOString()
      }
    });

    return Response.json({ 
      success: true, 
      report: report.name,
      format: format,
      recipients_count: recipients.length,
      records_count: data.length,
      next_run: nextRun.toISOString(),
      results 
    });

  } catch (error) {
    console.error('Error sending scheduled report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});