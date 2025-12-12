import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authenticated user is admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { target_organisation_id } = await req.json();

    if (!target_organisation_id) {
      return Response.json({ error: 'target_organisation_id is required' }, { status: 400 });
    }

    // Get all employees
    const allEmployees = await base44.asServiceRole.entities.Employee.list();
    
    // Filter employees from other organisations
    const employeesToMove = allEmployees.filter(emp => emp.organisation_id !== target_organisation_id);

    // Update each employee to the target organisation
    const results = [];
    for (const emp of employeesToMove) {
      await base44.asServiceRole.entities.Employee.update(emp.id, {
        organisation_id: target_organisation_id
      });
      results.push(emp.id);
    }

    return Response.json({
      success: true,
      moved_count: results.length,
      employee_ids: results
    });

  } catch (error) {
    console.error('Consolidate employees error:', error);
    return Response.json({ 
      error: 'Failed to consolidate employees',
      details: error.message 
    }, { status: 500 });
  }
});