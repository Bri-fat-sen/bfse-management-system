import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { expense_id } = await req.json();

    if (!expense_id) {
      return Response.json({ error: 'Missing expense_id' }, { status: 400 });
    }

    // Get the expense
    const expenses = await base44.asServiceRole.entities.Expense.filter({ id: expense_id });
    const expense = expenses[0];

    if (!expense) {
      return Response.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Get the employee who submitted the expense
    const submitters = await base44.asServiceRole.entities.Employee.filter({ id: expense.recorded_by });
    const submitter = submitters[0];

    // Determine who should be notified
    const approvers = [];

    // 1. If employee has a designated manager, notify them
    if (submitter?.manager_id) {
      const managers = await base44.asServiceRole.entities.Employee.filter({ id: submitter.manager_id });
      if (managers[0]) {
        approvers.push(managers[0]);
      }
    }

    // 2. Also notify all super_admins, org_admins, and accountants in the organization
    const allEmployees = await base44.asServiceRole.entities.Employee.filter({ 
      organisation_id: expense.organisation_id,
      status: 'active'
    });

    const additionalApprovers = allEmployees.filter(emp => 
      ['super_admin', 'org_admin', 'accountant'].includes(emp.role) &&
      emp.id !== expense.recorded_by // Don't notify the submitter
    );

    approvers.push(...additionalApprovers);

    // Remove duplicates
    const uniqueApprovers = Array.from(new Map(approvers.map(a => [a.id, a])).values());

    // Send notifications and emails to all approvers
    for (const approver of uniqueApprovers) {
      // Create in-app notification
      await base44.asServiceRole.entities.Notification.create({
        organisation_id: expense.organisation_id,
        recipient_id: approver.id,
        recipient_email: approver.user_email,
        type: 'approval',
        title: 'Expense Pending Approval',
        message: `${submitter?.full_name || 'An employee'} submitted an expense of Le ${expense.amount.toLocaleString()} for ${expense.description || 'N/A'}. Please review and approve.`,
        priority: expense.amount > 100000 ? 'high' : 'normal',
        link: `/ExpenseManagement`,
      });

      // Send email notification
      if (approver.email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: approver.email,
            subject: `Expense Approval Required - Le ${expense.amount.toLocaleString()}`,
            body: `
              <h2>Expense Approval Required</h2>
              <p><strong>Submitted by:</strong> ${submitter?.full_name || 'Unknown'}</p>
              <p><strong>Amount:</strong> Le ${expense.amount.toLocaleString()}</p>
              <p><strong>Category:</strong> ${expense.category}</p>
              <p><strong>Description:</strong> ${expense.description || 'N/A'}</p>
              <p><strong>Vendor:</strong> ${expense.vendor || 'N/A'}</p>
              <p><strong>Date:</strong> ${expense.date}</p>
              ${expense.notes ? `<p><strong>Notes:</strong> ${expense.notes}</p>` : ''}
              
              <p style="margin-top: 20px;">
                Please log in to the system to review and approve or reject this expense.
              </p>
            `,
          });
        } catch (emailError) {
          console.error(`Email notification failed for ${approver.email}:`, emailError);
        }
      }
    }

    // Create activity log
    await base44.asServiceRole.entities.ActivityLog.create({
      organisation_id: expense.organisation_id,
      employee_id: expense.recorded_by,
      employee_name: submitter?.full_name || 'Unknown',
      action_type: 'expense',
      module: 'Finance',
      description: `Submitted expense for approval: ${expense.description || 'N/A'} - Le ${expense.amount}. Notified ${uniqueApprovers.length} approver(s).`,
      entity_type: 'Expense',
      entity_id: expense_id,
    });

    return Response.json({ 
      success: true, 
      notified_count: uniqueApprovers.length,
      notified_approvers: uniqueApprovers.map(a => ({ id: a.id, name: a.full_name, role: a.role }))
    });

  } catch (error) {
    console.error('Error notifying expense approvers:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});