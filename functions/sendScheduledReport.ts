import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get report ID from request body
    const { reportId, forceRun } = await req.json();
    
    if (!reportId) {
      return Response.json({ error: 'Report ID is required' }, { status: 400 });
    }

    // Get report details using service role
    const reports = await base44.asServiceRole.entities.SavedReport.filter({ id: reportId });
    const report = reports[0];
    
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    if (!report.schedule?.enabled && !forceRun) {
      return Response.json({ error: 'Report scheduling is disabled' }, { status: 400 });
    }

    const recipients = report.schedule?.recipients || [];
    if (recipients.length === 0) {
      return Response.json({ error: 'No recipients configured' }, { status: 400 });
    }

    const orgId = report.organisation_id;

    // Fetch report data based on type
    let reportData = [];
    let totalValue = 0;
    let recordCount = 0;

    switch (report.report_type) {
      case 'sales':
        reportData = await base44.asServiceRole.entities.Sale.filter({ 
          organisation_id: orgId 
        }, '-created_date', 100);
        totalValue = reportData.reduce((sum, s) => sum + (s.total_amount || 0), 0);
        recordCount = reportData.length;
        break;
      case 'expenses':
        reportData = await base44.asServiceRole.entities.Expense.filter({ 
          organisation_id: orgId 
        }, '-date', 100);
        totalValue = reportData.reduce((sum, e) => sum + (e.amount || 0), 0);
        recordCount = reportData.length;
        break;
      case 'payroll':
        reportData = await base44.asServiceRole.entities.Payroll.filter({ 
          organisation_id: orgId 
        }, '-created_date', 100);
        totalValue = reportData.reduce((sum, p) => sum + (p.net_pay || 0), 0);
        recordCount = reportData.length;
        break;
      case 'transport':
        reportData = await base44.asServiceRole.entities.Trip.filter({ 
          organisation_id: orgId 
        }, '-date', 100);
        totalValue = reportData.reduce((sum, t) => sum + (t.net_revenue || 0), 0);
        recordCount = reportData.length;
        break;
      case 'inventory':
        reportData = await base44.asServiceRole.entities.Product.filter({ 
          organisation_id: orgId 
        });
        totalValue = reportData.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0);
        recordCount = reportData.length;
        break;
    }

    // Get organisation details
    const orgs = await base44.asServiceRole.entities.Organisation.filter({ id: orgId });
    const org = orgs[0];

    // Generate email HTML
    const now = new Date();
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #1EB053, #0072C6); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1EB053; }
          .stat-label { font-size: 12px; color: #666; }
          .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #1EB053; color: white; padding: 10px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${org?.name || 'Business'}</h1>
          <h2>${report.name}</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Here is your scheduled ${report.report_type} report for <strong>${report.filters?.start_date || 'N/A'}</strong> to <strong>${report.filters?.end_date || 'N/A'}</strong>.</p>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${recordCount}</div>
              <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">Le ${totalValue.toLocaleString()}</div>
              <div class="stat-label">Total Value</div>
            </div>
          </div>
          
          ${report.description ? `<p><em>${report.description}</em></p>` : ''}
          
          <p>Log in to your dashboard to view the complete report with detailed breakdowns and charts.</p>
        </div>
        <div class="footer">
          <p>This is an automated report generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}</p>
          <p>Schedule: ${report.schedule?.frequency === 'daily' ? 'Daily' : report.schedule?.frequency === 'weekly' ? 'Weekly' : 'Monthly'} at ${report.schedule?.time || '09:00'}</p>
        </div>
      </body>
      </html>
    `;

    // Send email to all recipients
    const emailPromises = recipients.map(email => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `[${org?.name || 'Business'}] Scheduled Report: ${report.name}`,
        body: emailBody
      })
    );

    await Promise.all(emailPromises);

    // Calculate next run time
    const calculateNextRun = (schedule) => {
      const nextRun = new Date();
      const [hours, minutes] = (schedule.time || '09:00').split(':').map(Number);
      nextRun.setHours(hours, minutes, 0, 0);

      switch (schedule.frequency) {
        case 'daily':
          if (nextRun <= new Date()) nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          while (nextRun.getDay() !== schedule.day_of_week || nextRun <= new Date()) {
            nextRun.setDate(nextRun.getDate() + 1);
          }
          break;
        case 'monthly':
          nextRun.setDate(schedule.day_of_month || 1);
          if (nextRun <= new Date()) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
          break;
      }
      return nextRun;
    };

    const nextRun = calculateNextRun(report.schedule);

    // Update report with last_sent and next_run
    await base44.asServiceRole.entities.SavedReport.update(reportId, {
      schedule: {
        ...report.schedule,
        last_sent: now.toISOString(),
        next_run: nextRun.toISOString()
      }
    });

    return Response.json({ 
      success: true, 
      message: `Report sent to ${recipients.length} recipient(s)`,
      next_run: nextRun.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});