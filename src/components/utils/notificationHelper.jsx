import { base44 } from "@/api/base44Client";

/**
 * Centralized notification helper
 * Sends notifications via in-app and/or email based on user preferences
 */
export async function sendNotification({
  recipientEmployeeId,
  notificationType,
  title,
  message,
  link = null,
  priority = 'normal',
  metadata = {}
}) {
  try {
    const response = await base44.functions.invoke('sendUnifiedNotification', {
      recipient_employee_id: recipientEmployeeId,
      notification_type: notificationType,
      title,
      message,
      link,
      priority,
      metadata
    });

    return response.data;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send notifications to multiple recipients
 */
export async function sendBulkNotifications(notifications) {
  const results = [];
  
  for (const notification of notifications) {
    const result = await sendNotification(notification);
    results.push({
      ...notification,
      result
    });
  }
  
  return results;
}

/**
 * Quick notification types with defaults
 */
export const NotificationTypes = {
  PAYROLL_PROCESSED: 'payroll_updates',
  LEAVE_APPROVED: 'leave_requests',
  LEAVE_REJECTED: 'leave_requests',
  DOCUMENT_EXPIRING: 'document_expirations',
  EXPENSE_APPROVED: 'expense_approvals',
  EXPENSE_REJECTED: 'expense_approvals',
  LOW_STOCK: 'stock_alerts',
  MEETING_REMINDER: 'meeting_reminders',
  SYSTEM_ERROR: 'system_errors',
  CHAT_MESSAGE: 'chat_messages'
};

/**
 * Helper to create payroll notification
 */
export async function notifyPayrollProcessed(employeeId, payrollData, orgId) {
  return sendNotification({
    recipientEmployeeId: employeeId,
    notificationType: NotificationTypes.PAYROLL_PROCESSED,
    title: '💰 Payroll Processed',
    message: `Your payroll for ${payrollData.period} has been processed. Net pay: Le ${(payrollData.net_pay || 0).toLocaleString()}`,
    link: '/EmployeeSelfService',
    priority: 'normal',
    metadata: { payroll_id: payrollData.id, organisation_id: orgId }
  });
}

/**
 * Helper to create leave request notification
 */
export async function notifyLeaveRequest(employeeId, leaveData, approved) {
  return sendNotification({
    recipientEmployeeId: employeeId,
    notificationType: NotificationTypes.LEAVE_APPROVED,
    title: approved ? '✅ Leave Request Approved' : '❌ Leave Request Rejected',
    message: `Your ${leaveData.leave_type} leave request from ${leaveData.start_date} to ${leaveData.end_date} has been ${approved ? 'approved' : 'rejected'}.`,
    priority: approved ? 'normal' : 'high',
    metadata: { leave_id: leaveData.id, approved }
  });
}

/**
 * Helper to create document expiration alert
 */
export async function notifyDocumentExpiring(employeeId, documentName, expiryDate) {
  const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return sendNotification({
    recipientEmployeeId: employeeId,
    notificationType: NotificationTypes.DOCUMENT_EXPIRING,
    title: '📄 Document Expiring Soon',
    message: `Your ${documentName} will expire in ${daysUntilExpiry} days on ${new Date(expiryDate).toLocaleDateString()}.`,
    priority: daysUntilExpiry <= 7 ? 'high' : 'normal',
    metadata: { document_name: documentName, expiry_date: expiryDate }
  });
}

/**
 * Helper to create expense approval notification
 */
export async function notifyExpenseApproval(employeeId, expenseData, approved) {
  return sendNotification({
    recipientEmployeeId: employeeId,
    notificationType: NotificationTypes.EXPENSE_APPROVED,
    title: approved ? '✅ Expense Approved' : '❌ Expense Rejected',
    message: `Your ${expenseData.category} expense of Le ${(expenseData.amount || 0).toLocaleString()} has been ${approved ? 'approved' : 'rejected'}.${!approved && expenseData.rejection_reason ? ` Reason: ${expenseData.rejection_reason}` : ''}`,
    priority: 'normal',
    metadata: { expense_id: expenseData.id, approved }
  });
}

/**
 * Helper to create low stock alert
 */
export async function notifyLowStock(employeeId, productName, currentStock, threshold) {
  return sendNotification({
    recipientEmployeeId: employeeId,
    notificationType: NotificationTypes.LOW_STOCK,
    title: '📦 Low Stock Alert',
    message: `${productName} is running low (${currentStock} units remaining, threshold: ${threshold}).`,
    link: '/Inventory',
    priority: currentStock === 0 ? 'urgent' : 'high',
    metadata: { product_name: productName, current_stock: currentStock }
  });
}

/**
 * Helper to create meeting reminder
 */
export async function notifyMeetingReminder(employeeId, meetingTitle, meetingTime) {
  return sendNotification({
    recipientEmployeeId: employeeId,
    notificationType: NotificationTypes.MEETING_REMINDER,
    title: '📅 Meeting Reminder',
    message: `"${meetingTitle}" starts at ${new Date(meetingTime).toLocaleTimeString()}.`,
    link: '/Calendar',
    priority: 'normal',
    metadata: { meeting_title: meetingTitle, meeting_time: meetingTime }
  });
}