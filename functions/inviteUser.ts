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

    // Check if employee already exists
    if (organisation_id) {
      const existing = await base44.asServiceRole.entities.Employee.filter({ 
        organisation_id, 
        email 
      });
      
      if (existing.length > 0) {
        return Response.json({ 
          error: 'Employee already exists with this email in this organisation'
        }, { status: 409 });
      }
    }

    // Create employee record (User account auto-created on first Google SSO login)
    let employee = null;
    if (organisation_id) {
      const existingEmployees = await base44.asServiceRole.entities.Employee.filter({ organisation_id });
      const employeeCode = `EMP${String(existingEmployees.length + 1).padStart(4, '0')}`;

      employee = await base44.asServiceRole.entities.Employee.create({
        organisation_id,
        employee_code: employeeCode,
        email: email,
        user_email: email, // Link to User account (auto-created on first Google SSO login)
        first_name: full_name.split(' ')[0] || '',
        last_name: full_name.split(' ').slice(1).join(' ') || '',
        full_name,
        role: role || 'read_only',
        department: department || '',
        position: position || '',
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0],
      });
      console.log('Created employee record:', employeeCode);
    }

    // Send welcome email via MailerSend
    let emailSent = false;
    if (send_email) {
      const MAILERSEND_API_KEY = Deno.env.get('MAILERSEND_API_KEY');
      if (MAILERSEND_API_KEY) {
        try {
          const org = organisation_id ? 
            await base44.asServiceRole.entities.Organisation.filter({ id: organisation_id }).then(r => r[0]) : 
            null;

          const emailBody = `
            <h2>Welcome to ${org?.name || 'the platform'}!</h2>
            <p>Hi ${full_name},</p>
            <p>You've been invited to join ${org?.name || 'our platform'}. Your account will be created when you first sign in.</p>
            <p><strong>Your Email:</strong> ${email}</p>
            <p><strong>Your Role:</strong> ${role}</p>
            ${department ? `<p><strong>Department:</strong> ${department}</p>` : ''}
            ${position ? `<p><strong>Position:</strong> ${position}</p>` : ''}
            <p>To get started, please visit the login page and sign in with your Google account using the email address above.</p>
            <p>If you have any questions, please contact your administrator.</p>
            <p>Best regards,<br>${org?.name || 'The Team'}</p>
          `;

          const emailResponse = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: { email: 'noreply@trial-0r83ql3jx1wg9yjw.mlsender.net', name: org?.name || 'Platform' },
              to: [{ email }],
              subject: `Welcome to ${org?.name || 'the platform'}!`,
              html: emailBody,
            }),
          });

          if (emailResponse.ok) {
            emailSent = true;
            console.log('Welcome email sent to:', email);
          } else {
            const errorText = await emailResponse.text();
            console.error('Email sending failed:', emailResponse.status, errorText);
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
        }
      } else {
        console.warn('MAILERSEND_API_KEY not found');
      }
    }

    return Response.json({
      success: true,
      employee,
      email_sent: emailSent,
      message: emailSent 
        ? 'User invited successfully. Welcome email sent.' 
        : 'User invited successfully. They can sign in with Google SSO using their email.'
    });

  } catch (error) {
    console.error('Invite user error:', error);
    return Response.json({ 
      error: 'Failed to invite user',
      details: error.message 
    }, { status: 500 });
  }
});