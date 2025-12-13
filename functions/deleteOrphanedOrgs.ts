import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated and has admin privileges
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all organisations and employees
    const [allOrgs, allEmployees, allProducts, allWarehouses, allVehicles, allSuppliers, allCustomers] = await Promise.all([
      base44.asServiceRole.entities.Organisation.list(),
      base44.asServiceRole.entities.Employee.list(),
      base44.asServiceRole.entities.Product.list(),
      base44.asServiceRole.entities.Warehouse.list(),
      base44.asServiceRole.entities.Vehicle.list(),
      base44.asServiceRole.entities.Supplier.list(),
      base44.asServiceRole.entities.Customer.list(),
    ]);

    // Find orphaned organisations
    const orphanedOrgs = allOrgs.filter(org => {
      const hasEmployees = allEmployees.some(emp => emp.organisation_id === org.id);
      const hasProducts = allProducts.some(p => p.organisation_id === org.id);
      const hasWarehouses = allWarehouses.some(w => w.organisation_id === org.id);
      const hasVehicles = allVehicles.some(v => v.organisation_id === org.id);
      const hasSuppliers = allSuppliers.some(s => s.organisation_id === org.id);
      const hasCustomers = allCustomers.some(c => c.organisation_id === org.id);
      
      return !hasEmployees && !hasProducts && !hasWarehouses && !hasVehicles && !hasSuppliers && !hasCustomers;
    });

    if (orphanedOrgs.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No orphaned organisations found',
        deleted: 0 
      });
    }

    // Delete all orphaned organisations
    const deletedIds = [];
    for (const org of orphanedOrgs) {
      await base44.asServiceRole.entities.Organisation.delete(org.id);
      deletedIds.push(org.id);
    }

    return Response.json({ 
      success: true, 
      message: `Deleted ${deletedIds.length} orphaned organisation(s)`,
      deleted: deletedIds.length,
      deletedOrgs: orphanedOrgs.map(o => ({ id: o.id, name: o.name }))
    });

  } catch (error) {
    console.error('Delete orphaned orgs error:', error);
    return Response.json({ 
      error: 'Failed to delete orphaned organisations', 
      details: error.message 
    }, { status: 500 });
  }
});