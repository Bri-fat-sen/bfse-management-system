import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the requesting user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { email, full_name } = await req.json();

    // Validate inputs
    if (!email || !full_name) {
      return Response.json({ 
        error: 'Email and full name are required' 
      }, { status: 400 });
    }

    // Check if user already exists
    const allUsers = await base44.asServiceRole.entities.User.list();
    const existingUser = allUsers.find(u => u.email === email);

    if (existingUser) {
      return Response.json({ 
        error: 'User already exists with this email',
        user: existingUser 
      }, { status: 409 });
    }

    // Create Base44 User account
    const newUser = await base44.asServiceRole.entities.User.create({
      email,
      full_name,
      role: 'user' // Base44 platform role
    });

    console.log('Created User account:', email);

    return Response.json({
      success: true,
      user: newUser,
      message: 'User account created successfully'
    });

  } catch (error) {
    console.error('Create user account error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create user account' 
    }, { status: 500 });
  }
});