import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, toName, subject, htmlContent, textContent, attachments, fromName, replyTo } = await req.json();

    if (!to || !subject) {
      return Response.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
    }

    const apiKey = Deno.env.get("MAILERSEND_API_KEY");
    if (!apiKey) {
      return Response.json({ error: 'MailerSend API key not configured' }, { status: 500 });
    }

    // Build email payload
    const emailPayload = {
      from: {
        email: "noreply@brifatsenenterprise.com",
        name: fromName || "Business Management"
      },
      to: Array.isArray(to) 
        ? to.map((email, i) => ({ email, name: Array.isArray(toName) ? toName[i] : toName || email }))
        : [{ email: to, name: toName || to }],
      subject: subject,
      html: htmlContent || `<p>${textContent || ''}</p>`,
      text: textContent || htmlContent?.replace(/<[^>]*>/g, '') || ''
    };

    // Add reply-to if provided
    if (replyTo) {
      emailPayload.reply_to = [{ email: replyTo }];
    }

    // Add attachments if provided (base64 encoded)
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content, // base64 encoded content
        disposition: att.disposition || 'attachment'
      }));
    }

    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MailerSend error:', errorData);
      return Response.json({ error: 'Failed to send email', details: errorData }, { status: response.status });
    }

    // MailerSend returns 202 with empty body on success
    return Response.json({ 
      success: true, 
      message: `Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}` 
    });

  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});