import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipients, title, message, priority } = await req.json();
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ error: 'Recipients required' }, { status: 400 });
    }

    const priorityEmojis = {
      urgent: '🚨',
      high: '⚠️',
      normal: 'ℹ️',
      low: '📝'
    };

    const emoji = priorityEmojis[priority] || 'ℹ️';
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Sierra Leone Flag Header -->
        <div style="height: 8px; display: flex;">
          <div style="flex: 1; background: #1EB053;"></div>
          <div style="flex: 1; background: #FFFFFF;"></div>
          <div style="flex: 1; background: #0072C6;"></div>
        </div>
        
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">${emoji}</div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
          ${priority === 'urgent' || priority === 'high' ? `<p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Requires immediate attention</p>` : ''}
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <div style="background: #f9fafb; border-left: 4px solid ${priority === 'urgent' ? '#ef4444' : priority === 'high' ? '#f59e0b' : '#1EB053'}; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Log in to your Business Management System to view details and take action.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            This is an automated notification from your Business Management System
          </p>
        </div>
        
        <!-- Sierra Leone Flag Footer -->
        <div style="height: 6px; display: flex;">
          <div style="flex: 1; background: #1EB053;"></div>
          <div style="flex: 1; background: #FFFFFF;"></div>
          <div style="flex: 1; background: #0072C6;"></div>
        </div>
      </div>
    `;

    // Send email to each recipient
    for (const email of recipients) {
      if (!email) continue;
      
      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `${emoji} ${title}`,
          body: emailBody
        });
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    }

    return Response.json({ 
      success: true,
      recipients_count: recipients.length 
    });

  } catch (error) {
    console.error('Send notification email error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification email' 
    }, { status: 500 });
  }
});