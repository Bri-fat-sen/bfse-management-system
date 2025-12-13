import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, requestId, employeeData, rejectionReason } = await req.json();

    // Verify user has permission
    const employees = await base44.entities.Employee.filter({ user_email: user.email });
    const currentEmployee = employees[0];
    
    if (!currentEmployee || !['super_admin', 'org_admin'].includes(currentEmployee.role)) {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    if (action === 'approve') {
      // Create employee record
      const newEmployee = await base44.asServiceRole.entities.Employee.create(employeeData);
      
      // Update join request
      await base44.asServiceRole.entities.OrganisationJoinRequest.update(requestId, {
        status: 'approved',
        approved_by: currentEmployee?.id || user.id,
        approved_by_name: currentEmployee?.full_name || user.full_name,
        approval_date: new Date().toISOString(),
        employee_id: newEmployee.id,
      });

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        organisation_id: employeeData.organisation_id,
        recipient_email: employeeData.user_email,
        type: 'system',
        title: 'Join Request Approved',
        message: `Your request has been approved! You can now access the system.`,
        priority: 'high',
      });

      return Response.json({ 
        success: true, 
        employee: newEmployee 
      });
    }

    if (action === 'reject') {
      const request = await base44.asServiceRole.entities.OrganisationJoinRequest.filter({ id: requestId });
      const joinRequest = request[0];

      await base44.asServiceRole.entities.OrganisationJoinRequest.update(requestId, {
        status: 'rejected',
        approved_by: currentEmployee?.id || user.id,
        approved_by_name: currentEmployee?.full_name || user.full_name,
        approval_date: new Date().toISOString(),
        rejection_reason: rejectionReason,
      });

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        organisation_id: joinRequest.organisation_id,
        recipient_email: joinRequest.user_email,
        type: 'system',
        title: 'Join Request Update',
        message: `Your join request was not approved at this time.`,
        priority: 'normal',
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Handle join request error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});