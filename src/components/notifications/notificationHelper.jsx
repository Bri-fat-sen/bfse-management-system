
import { base44 } from "@/api/base44Client";

/**
 * Helper to create notifications for various actions
 */
export async function createNotification({
  orgId,
  recipientId,
  recipientEmail,
  type,
  title,
  message,
  link = null,
  priority = 'normal'
}) {
  try {
    await base44.entities.Notification.create({
      organisation_id: orgId,
      recipient_id: recipientId,
      recipient_email: recipientEmail,
      type,
      title,
      message,
      link,
      priority,
      is_read: false
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

/**
 * Notify multiple recipients
 */
export async function notifyMultiple({
  orgId,
  recipients, // Array of { id, email }
  type,
  title,
  message,
  link = null,
  priority = 'normal'
}) {
  const promises = recipients.map(recipient =>
    createNotification({
      orgId,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      type,
      title,
      message,
      link,
      priority
    })
  );
  
  await Promise.all(promises);
}

/**
 * Notify admins and managers
 */
export async function notifyAdmins({
  orgId,
  employees,
  type,
  title,
  message,
  link = null,
  priority = 'normal',
  sendEmail = false
}) {
  const admins = employees.filter(e => 
    ['super_admin', 'org_admin', 'hr_admin', 'warehouse_manager'].includes(e.role)
  );
  
  await notifyMultiple({
    orgId,
    recipients: admins.map(a => ({ id: a.id, email: a.user_email || a.email })),
    type,
    title,
    message,
    link,
    priority
  });
  
  // Send email for critical alerts
  if (sendEmail && (priority === 'high' || priority === 'urgent')) {
    try {
      await base44.functions.invoke('sendNotificationEmail', {
        recipients: admins.map(a => a.user_email || a.email).filter(Boolean),
        title,
        message,
        priority
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }
}
