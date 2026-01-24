import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      recipient_employee_id,
      notification_type,
      title,
      message,
      link,
      priority = 'normal',
      metadata = {}
    } = await req.json();

    if (!recipient_employee_id || !notification_type || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get recipient employee and their preferences
    const employees = await base44.asServiceRole.entities.Employee.filter({ id: recipient_employee_id });
    const employee = employees[0];

    if (!employee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get notification preferences
    const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ 
      employee_id: recipient_employee_id 
    });
    const preferences = prefs[0];

    // Default preferences if none exist
    const defaultPrefs = {
      in_app: true,
      email: true
    };

    let typePrefs = defaultPrefs;
    if (preferences && preferences[notification_type]) {
      typePrefs = preferences[notification_type];
    }

    const results = {
      in_app: null,
      email: null
    };

    // Check quiet hours
    const isQuietHours = () => {
      if (!preferences?.quiet_hours?.enabled) return false;
      
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = preferences.quiet_hours.start_time.split(':').map(Number);
      const [endH, endM] = preferences.quiet_hours.end_time.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes < endMinutes) {
        return currentTime >= startMinutes && currentTime <= endMinutes;
      } else {
        return currentTime >= startMinutes || currentTime <= endMinutes;
      }
    };

    // Send in-app notification
    if (typePrefs.in_app) {
      try {
        const notification = await base44.asServiceRole.entities.Notification.create({
          organisation_id: employee.organisation_id,
          recipient_id: recipient_employee_id,
          recipient_email: employee.user_email || employee.email,
          type: notification_type,
          title,
          message,
          link: link || null,
          priority,
          is_read: false,
          metadata
        });
        results.in_app = { success: true, id: notification.id };
      } catch (error) {
        results.in_app = { success: false, error: error.message };
      }
    }

    // Send email notification
    if (typePrefs.email && !isQuietHours()) {
      const recipientEmail = employee.user_email || employee.email;
      
      if (recipientEmail) {
        try {
          const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

          if (accessToken) {
            // Get organisation
            const orgs = await base44.asServiceRole.entities.Organisation.filter({ 
              id: employee.organisation_id 
            });
            const org = orgs[0];

            const priorityEmojis = {
              low: '💬',
              normal: '📢',
              high: '⚠️',
              urgent: '🚨'
            };

            const priorityColors = {
              low: '#94a3b8',
              normal: '#0072C6',
              high: '#f59e0b',
              urgent: '#ef4444'
            };

            const emoji = priorityEmojis[priority] || '📢';
            const color = priorityColors[priority] || '#0072C6';

            const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); color: white; padding: 30px; text-align: center; }
    .stripe { height: 6px; display: flex; }
    .content { background: white; padding: 30px; }
    .notification-box { background: #f8f9fa; border-left: 4px solid ${color}; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .priority-badge { background: ${color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
    .button { display: inline-block; background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="stripe">
      <div style="flex: 1; background: #1EB053;"></div>
      <div style="flex: 1; background: #FFFFFF;"></div>
      <div style="flex: 1; background: #0072C6;"></div>
    </div>
    <div class="header">
      <h1>${emoji} ${title}</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${employee.first_name || 'Team Member'}</strong>,</p>
      
      <div class="notification-box">
        <div style="margin-bottom: 10px;">
          <span class="priority-badge">${priority.toUpperCase()}</span>
        </div>
        <p style="margin: 0; font-size: 16px;">${message}</p>
      </div>
      
      ${link ? `<a href="${link}" class="button">View Details</a>` : ''}
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This is an automated notification from ${org?.name || 'your organisation'}. 
        You can manage your notification preferences in your account settings.
      </p>
    </div>
    <div class="footer">
      <div class="stripe" style="height: 4px; margin-bottom: 15px;">
        <div style="flex: 1; background: #1EB053;"></div>
        <div style="flex: 1; background: #FFFFFF;"></div>
        <div style="flex: 1; background: #0072C6;"></div>
      </div>
      <p><strong>${org?.name || 'Organisation'}</strong></p>
      <p>🇸🇱 ${org?.city || 'Sierra Leone'}</p>
    </div>
  </div>
</body>
</html>`;

            const emailLines = [
              `To: ${recipientEmail}`,
              `Subject: ${emoji} ${title}`,
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

            const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ raw: encodedMessage })
            });

            if (gmailResponse.ok) {
              const gmailResult = await gmailResponse.json();
              results.email = { success: true, messageId: gmailResult.id };
            } else {
              const errorData = await gmailResponse.json().catch(() => ({}));
              results.email = { success: false, error: errorData.error?.message || 'Failed to send email' };
            }
          } else {
            results.email = { success: false, error: 'Gmail not authorized' };
          }
        } catch (error) {
          results.email = { success: false, error: error.message };
        }
      } else {
        results.email = { success: false, error: 'No email address' };
      }
    } else if (isQuietHours()) {
      results.email = { success: false, error: 'Skipped (quiet hours)' };
    }

    return Response.json({
      success: true,
      results,
      quiet_hours_active: isQuietHours()
    });

  } catch (error) {
    console.error('Send unified notification error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});