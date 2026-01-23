import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payroll_id, employee_email, employee_name, custom_message } = await req.json();

    if (!payroll_id || !employee_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get payroll details
    const payrolls = await base44.entities.Payroll.filter({ id: payroll_id });
    const payroll = payrolls[0];

    if (!payroll) {
      return Response.json({ error: 'Payroll not found' }, { status: 404 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    if (!accessToken) {
      return Response.json({ error: 'Gmail not connected. Please authorize Gmail access.' }, { status: 403 });
    }

    // Get organisation details
    const orgs = await base44.asServiceRole.entities.Organisation.filter({ id: payroll.organisation_id });
    const org = orgs[0];

    // Format email content
    const subject = `💼 Payroll Notification - ${payroll.period_start ? new Date(payroll.period_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Current Period'}`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .stripe { height: 8px; display: flex; }
    .stripe > div { flex: 1; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
    .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .label { font-weight: 600; color: #666; }
    .value { font-weight: 700; color: #1EB053; }
    .net-pay { font-size: 32px; color: #0072C6; font-weight: 900; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .flag { background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%); }
  </style>
</head>
<body>
  <div class="container">
    <div class="stripe flag"></div>
    <div class="header">
      <h1>🇸🇱 Payroll Notification</h1>
      <p>${org?.name || 'BRI-FAT-SEN Enterprise'}</p>
    </div>
    <div class="content">
      <p>Dear <strong>${employee_name || 'Employee'}</strong>,</p>
      
      ${custom_message ? `<p>${custom_message}</p>` : `<p>Your payroll for the period <strong>${payroll.period_start ? new Date(payroll.period_start).toLocaleDateString() : ''}</strong> to <strong>${payroll.period_end ? new Date(payroll.period_end).toLocaleDateString() : ''}</strong> has been processed.</p>`}
      
      <div class="summary">
        <h3 style="margin-top: 0; color: #0F1F3C;">💰 Payroll Summary</h3>
        
        <div class="summary-row">
          <span class="label">Gross Pay:</span>
          <span class="value">Le ${(payroll.gross_pay || 0).toLocaleString()}</span>
        </div>
        
        ${payroll.total_allowances > 0 ? `
        <div class="summary-row">
          <span class="label">Allowances:</span>
          <span class="value">Le ${(payroll.total_allowances || 0).toLocaleString()}</span>
        </div>` : ''}
        
        ${payroll.total_bonuses > 0 ? `
        <div class="summary-row">
          <span class="label">Bonuses:</span>
          <span class="value">Le ${(payroll.total_bonuses || 0).toLocaleString()}</span>
        </div>` : ''}
        
        <div class="summary-row">
          <span class="label">NASSIT (5%):</span>
          <span style="color: #666;">-Le ${(payroll.nassit_employee || 0).toLocaleString()}</span>
        </div>
        
        <div class="summary-row">
          <span class="label">PAYE Tax:</span>
          <span style="color: #666;">-Le ${(payroll.paye_tax || 0).toLocaleString()}</span>
        </div>
        
        ${payroll.other_deductions > 0 ? `
        <div class="summary-row">
          <span class="label">Other Deductions:</span>
          <span style="color: #666;">-Le ${(payroll.other_deductions || 0).toLocaleString()}</span>
        </div>` : ''}
        
        <hr style="margin: 20px 0; border: none; border-top: 2px solid #e0e0e0;">
        
        <div class="summary-row">
          <span class="label" style="font-size: 18px;">NET PAY:</span>
          <span class="net-pay">Le ${(payroll.net_pay || 0).toLocaleString()}</span>
        </div>
      </div>
      
      <p style="margin-top: 20px;">
        <strong>Payment Status:</strong> 
        <span style="background: ${payroll.status === 'paid' ? '#1EB053' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
          ${payroll.status?.toUpperCase() || 'PENDING'}
        </span>
      </p>
      
      ${payroll.payment_date ? `<p><strong>Payment Date:</strong> ${new Date(payroll.payment_date).toLocaleDateString()}</p>` : ''}
      ${payroll.payment_method ? `<p><strong>Payment Method:</strong> ${payroll.payment_method.replace(/_/g, ' ').toUpperCase()}</p>` : ''}
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        If you have any questions about your payroll, please contact the HR department.
      </p>
    </div>
    <div class="footer">
      <div class="stripe flag" style="height: 4px; margin-bottom: 15px;"></div>
      <p><strong>${org?.name || 'BRI-FAT-SEN Enterprise'}</strong></p>
      <p>${org?.address || ''} ${org?.city ? '• ' + org.city : ''}</p>
      <p>${org?.email || ''} ${org?.phone ? '• ' + org.phone : ''}</p>
      <p style="margin-top: 10px; font-size: 11px; color: #999;">
        🇸🇱 This is an automated payroll notification from ${org?.name || 'your organisation'}
      </p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
Payroll Notification

Dear ${employee_name || 'Employee'},

Your payroll has been processed for the period ${payroll.period_start ? new Date(payroll.period_start).toLocaleDateString() : ''} to ${payroll.period_end ? new Date(payroll.period_end).toLocaleDateString() : ''}.

Gross Pay: Le ${(payroll.gross_pay || 0).toLocaleString()}
NASSIT (5%): -Le ${(payroll.nassit_employee || 0).toLocaleString()}
PAYE Tax: -Le ${(payroll.paye_tax || 0).toLocaleString()}
${payroll.total_deductions ? `Total Deductions: -Le ${payroll.total_deductions.toLocaleString()}` : ''}

NET PAY: Le ${(payroll.net_pay || 0).toLocaleString()}

Status: ${payroll.status?.toUpperCase() || 'PENDING'}
${payroll.payment_date ? `Payment Date: ${new Date(payroll.payment_date).toLocaleDateString()}` : ''}

${org?.name || 'BRI-FAT-SEN Enterprise'}
`;

    // Create email message in RFC 2822 format
    const emailLines = [
      `To: ${employee_email}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody
    ];
    
    const rawMessage = emailLines.join('\r\n');
    const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gmail API error:', errorData);
      return Response.json({ 
        error: 'Failed to send email',
        details: errorData.error?.message || response.statusText
      }, { status: response.status });
    }

    const result = await response.json();

    return Response.json({
      success: true,
      message: 'Payroll notification sent successfully',
      messageId: result.id,
      recipient: employee_email
    });

  } catch (error) {
    console.error('Send payroll notification error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});