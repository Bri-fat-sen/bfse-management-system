import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function sendUnifiedNotification(base44, recipientEmployeeId, notificationType, title, message, options = {}) {
  try {
    await base44.functions.invoke('sendUnifiedNotification', {
      recipient_employee_id: recipientEmployeeId,
      notification_type: notificationType,
      title,
      message,
      link: options.link || null,
      priority: options.priority || 'normal',
      metadata: options.metadata || {}
    });
  } catch (error) {
    console.error('Failed to send unified notification:', error);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { expense_id, action, rejection_reason } = await req.json();

    if (!expense_id || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employees = await base44.entities.Employee.filter({ user_email: user.email });
    const currentEmployee = employees[0];
    
    if (!currentEmployee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if user has approval permissions
    const canApprove = ['super_admin', 'org_admin', 'accountant'].includes(currentEmployee.role);
    if (!canApprove) {
      return Response.json({ error: 'Insufficient permissions to approve expenses' }, { status: 403 });
    }

    // Get the expense
    const expenses = await base44.asServiceRole.entities.Expense.filter({ id: expense_id });
    const expense = expenses[0];

    if (!expense) {
      return Response.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== 'pending') {
      return Response.json({ error: `Expense is already ${expense.status}` }, { status: 400 });
    }

    // Update expense status
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: currentEmployee.id,
      approved_by_name: currentEmployee.full_name,
      approval_date: new Date().toISOString(),
    };

    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    await base44.asServiceRole.entities.Expense.update(expense_id, updateData);

    // Create activity log
    await base44.asServiceRole.entities.ActivityLog.create({
      organisation_id: expense.organisation_id,
      employee_id: currentEmployee.id,
      employee_name: currentEmployee.full_name,
      action_type: 'expense',
      module: 'Finance',
      description: `${action === 'approve' ? 'Approved' : 'Rejected'} expense: ${expense.description || 'N/A'} - Le ${expense.amount}`,
      entity_type: 'Expense',
      entity_id: expense_id,
    });

    // Send unified notification (in-app + email based on preferences)
    if (expense.recorded_by) {
      await sendUnifiedNotification(
        base44,
        expense.recorded_by,
        'expense_approvals',
        action === 'approve' ? '✅ Expense Approved' : '❌ Expense Rejected',
        action === 'approve' 
          ? `Your ${expense.category} expense of Le ${expense.amount?.toLocaleString()} has been approved by ${currentEmployee.full_name}.`
          : `Your ${expense.category} expense of Le ${expense.amount?.toLocaleString()} was rejected.${rejection_reason ? ` Reason: ${rejection_reason}` : ''}`,
        {
          link: '/Finance',
          priority: action === 'approve' ? 'normal' : 'high',
          metadata: { expense_id: expense.id, approved: action === 'approve' }
        }
      );
    }

    return Response.json({ 
      success: true, 
      message: `Expense ${action}d successfully`,
      expense: { ...expense, ...updateData }
    });

  } catch (error) {
    console.error('Error handling expense approval:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});