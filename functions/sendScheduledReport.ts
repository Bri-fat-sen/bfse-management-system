import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// This function can be called by a cron job or webhook to send scheduled reports
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify the request is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_id, test_mode } = await req.json();

    // Get the report
    const reports = await base44.entities.SavedReport.filter({ id: report_id });
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

    // Fetch report data based on type
    const orgId = report.organisation_id;
    let data = [];

    switch (report.report_type) {
      case 'sales':
        data = await base44.entities.Sale.filter({ organisation_id: orgId });
        break;
      case 'inventory':
        data = await base44.entities.Product.filter({ organisation_id: orgId });
        break;
      case 'payroll':
        data = await base44.entities.Payroll.filter({ organisation_id: orgId });
        break;
      case 'transport':
        data = await base44.entities.Trip.filter({ organisation_id: orgId });
        break;
    }

    // Apply date filter based on schedule frequency
    const now = new Date();
    let startDate;
    
    switch (report.schedule?.frequency) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    data = data.filter(item => {
      const itemDate = new Date(item.created_date || item.date || item.period_start);
      return itemDate >= startDate;
    });

    // Generate report content
    const visibleColumns = report.columns?.filter(c => c.visible) || [];
    const headers = visibleColumns.map(c => c.label).join(' | ');
    const rows = data.slice(0, 100).map(row => 
      visibleColumns.map(c => {
        const val = row[c.field];
        if (val === null || val === undefined) return '-';
        if (typeof val === 'number') return val.toLocaleString();
        return String(val);
      }).join(' | ')
    ).join('\n');

    // Calculate totals for numeric columns with sum aggregate
    const totals = {};
    visibleColumns.filter(c => c.aggregate === 'sum').forEach(col => {
      totals[col.label] = data.reduce((sum, item) => sum + (Number(item[col.field]) || 0), 0);
    });

    const totalsHtml = Object.entries(totals).length > 0 
      ? `<h3>Summary Totals</h3><ul>${Object.entries(totals).map(([label, value]) => 
          `<li><strong>${label}:</strong> ${value.toLocaleString()}</li>`
        ).join('')}</ul>`
      : '';

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 20px; color: white;">
          <h1 style="margin: 0;">${report.name}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${report.description || 'Scheduled Report'}</p>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <p><strong>Report Type:</strong> ${report.report_type}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Records:</strong> ${data.length}</p>
          
          ${totalsHtml}
          
          <h3>Data Preview</h3>
          <div style="overflow-x: auto;">
            <pre style="background: white; padding: 15px; border-radius: 8px; font-size: 12px; border: 1px solid #e5e7eb;">
${headers}
${'─'.repeat(80)}
${rows}
            </pre>
          </div>
          
          ${data.length > 100 ? '<p style="color: #6b7280; font-style: italic;">Showing first 100 records...</p>' : ''}
        </div>
        
        <div style="padding: 15px 20px; background: #f3f4f6; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>This is an automated report from your business management system.</p>
        </div>
      </div>
    `;

    // Send emails to all recipients
    const results = [];
    for (const recipient of recipients) {
      try {
        await base44.integrations.Core.SendEmail({
          to: recipient,
          subject: `${report.schedule?.frequency === 'daily' ? 'Daily' : report.schedule?.frequency === 'weekly' ? 'Weekly' : 'Monthly'} Report: ${report.name}`,
          body: emailBody
        });
        results.push({ email: recipient, status: 'sent' });
      } catch (error) {
        results.push({ email: recipient, status: 'failed', error: error.message });
      }
    }

    // Update last_sent timestamp
    await base44.entities.SavedReport.update(report.id, {
      schedule: {
        ...report.schedule,
        last_sent: new Date().toISOString()
      }
    });

    return Response.json({ 
      success: true, 
      report: report.name,
      recipients_count: recipients.length,
      records_count: data.length,
      results 
    });

  } catch (error) {
    console.error('Error sending scheduled report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});