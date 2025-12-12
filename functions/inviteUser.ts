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

    // Check if user already exists
    let existingUser = null;
    try {
      const allUsers = await base44.asServiceRole.entities.User.list();
      existingUser = allUsers.find(u => u.email === email);
    } catch (e) {
      console.log('Could not check existing users:', e.message);
    }

    // Create Base44 User account if doesn't exist
    let newUser = existingUser;
    if (!existingUser) {
      try {
        newUser = await base44.asServiceRole.entities.User.create({
          email,
          full_name,
          role: 'user', // Base44 role, not organization role
        });
        console.log('Created new User account:', email);
      } catch (error) {
        console.error('Failed to create User account:', error);
        return Response.json({ 
          error: 'Failed to create user account: ' + error.message 
        }, { status: 500 });
      }
    } else {
      console.log('User account already exists:', email);
    }

    // Create employee record
    let employee = null;
    if (organisation_id) {
      const existingEmployees = await base44.entities.Employee.filter({ organisation_id });
      const employeeCode = `EMP${String(existingEmployees.length + 1).padStart(4, '0')}`;

      employee = await base44.entities.Employee.create({
        organisation_id,
        employee_code: employeeCode,
        user_email: email,
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
      console.log('Created employee record:', employeeCode);
    }

    // Send welcome email
    if (send_email) {
      const MAILERSEND_API_KEY = Deno.env.get('MAILERSEND_API_KEY');
      if (MAILERSEND_API_KEY) {
        const org = organisation_id ? 
          await base44.entities.Organisation.filter({ id: organisation_id }).then(r => r[0]) : 
          null;

        const emailBody = `
          <h2>Welcome to ${org?.name || 'the platform'}!</h2>
          <p>Hi ${full_name},</p>
          <p>You've been invited to join ${org?.name || 'our platform'}. Your account has been created and you can now log in.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>To get started, please visit the login page and sign in with your Google account using the email above.</p>
          <p>If you have any questions, please contact your administrator.</p>
          <p>Best regards,<br>${org?.name || 'The Team'}</p>
        `;

        await fetch('https://api.mailersend.com/v1/email', {
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
      }
    }

    return Response.json({
      success: true,
      employee,
      message: 'User invited successfully. They can sign in with Google SSO using their email.'
    });

  } catch (error) {
    console.error('Invite user error:', error);
    return Response.json({ 
      error: 'Failed to invite user',
      details: error.message 
    }, { status: 500 });
  }
});