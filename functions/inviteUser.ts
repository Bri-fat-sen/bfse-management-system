import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authenticated user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email, full_name, organisation_id, role = 'read_only', department, position, send_email = true } = await req.json();

    if (!email || !full_name) {
      return Response.json({ error: 'Email and full name are required' }, { status: 400 });
    }

    // Check if user already exists (using regular entities API)
    try {
      const existingUsers = await base44.entities.User.list();
      const userExists = existingUsers.find(u => u.email === email);

      if (userExists) {
        return Response.json({ 
          error: 'User already exists with this email',
          user: userExists 
        }, { status: 409 });
      }
    } catch (e) {
      // User might not have permission to list all users, that's okay
      console.log('Could not check existing users:', e.message);
    }

    // Create employee record (user will be auto-linked via SSO on first login)
    let employee = null;
    if (organisation_id) {
      const existingEmployees = await base44.entities.Employee.filter({ organisation_id });
      const employeeCode = `EMP${String(existingEmployees.length + 1).padStart(4, '0')}`;

      employee = await base44.entities.Employee.create({
        organisation_id,
        employee_code: employeeCode,
        email: email,
        first_name: full_name.split(' ')[0] || '',
        last_name: full_name.split(' ').slice(1).join(' ') || '',
        full_name,
        role: role || 'read_only',
        department: department || '',
        position: position || '',
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0],
      });
    }

    // Send welcome email
    let emailSent = false;
    let emailError = null;
    
    if (send_email) {
      const MAILERSEND_API_KEY = Deno.env.get('MAILERSEND_API_KEY');
      if (MAILERSEND_API_KEY) {
        try {
          const org = organisation_id ? 
            await base44.entities.Organisation.filter({ id: organisation_id }).then(r => r[0]) : 
            null;

          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-flex; height: 4px; width: 100px;">
                  <div style="flex: 1; background: #1EB053;"></div>
                  <div style="flex: 1; background: white;"></div>
                  <div style="flex: 1; background: #0072C6;"></div>
                </div>
              </div>
              <h2 style="color: #1EB053;">Welcome to ${org?.name || 'the platform'}!</h2>
              <p>Hi ${full_name},</p>
              <p>You've been invited to join <strong>${org?.name || 'our platform'}</strong>. Your employee account has been created.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 10px 0 0 0;"><strong>Role:</strong> ${role}</p>
              </div>
              <p>To get started, please visit the login page and sign in with your Google account using the email above.</p>
              <p>If you have any questions, please contact your administrator.</p>
              <p>Best regards,<br>${org?.name || 'The Team'}</p>
            </div>
          `;

          const emailResponse = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: { email: 'noreply@trial-0r83ql3jx1wg9yjw.mlsender.net', name: org?.name || 'Platform' },
              to: [{ email, name: full_name }],
              subject: `Welcome to ${org?.name || 'the platform'}!`,
              html: emailBody,
            }),
          });

          if (emailResponse.ok) {
            emailSent = true;
            console.log('Welcome email sent successfully to:', email);
          } else {
            const errorText = await emailResponse.text();
            emailError = `MailerSend API error: ${emailResponse.status} - ${errorText}`;
            console.error('Failed to send email:', emailError);
          }
        } catch (error) {
          emailError = error.message;
          console.error('Email sending error:', error);
        }
      } else {
        emailError = 'MAILERSEND_API_KEY not configured';
        console.warn('Cannot send email: MAILERSEND_API_KEY not set');
      }
    }

    return Response.json({
      success: true,
      employee,
      email_sent: emailSent,
      email_error: emailError,
      message: emailSent 
        ? 'User invited successfully and welcome email sent.'
        : `User invited successfully. ${emailError ? `Email not sent: ${emailError}` : 'Email sending was skipped.'}`
    });

  } catch (error) {
    console.error('Invite user error:', error);
    return Response.json({ 
      error: 'Failed to invite user',
      details: error.message 
    }, { status: 500 });
  }
});