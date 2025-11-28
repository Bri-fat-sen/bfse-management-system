import React from "react";

// Generate HTML email template for user invitations
// Default app domain - update this to your custom domain
const APP_DOMAIN = "https://app.brifatsensystems.com";

export function generateInviteEmailHTML({ 
  recipientName, 
  organisationName, 
  organisationLogo,
  role,
  inviterName,
  loginUrl = APP_DOMAIN 
}) {
  const roleLabels = {
    'super_admin': 'Super Administrator',
    'org_admin': 'Organisation Administrator',
    'hr_admin': 'HR Administrator',
    'payroll_admin': 'Payroll Administrator',
    'warehouse_manager': 'Warehouse Manager',
    'retail_cashier': 'Retail Cashier',
    'vehicle_sales': 'Vehicle Sales',
    'driver': 'Driver',
    'accountant': 'Accountant',
    'support_staff': 'Support Staff',
    'read_only': 'Read Only Access'
  };

  const roleLabel = roleLabels[role] || role;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${organisationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Sierra Leone Flag Stripe Header -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="33.33%" style="background-color: #1EB053; height: 8px;"></td>
                  <td width="33.33%" style="background-color: #FFFFFF; height: 8px;"></td>
                  <td width="33.33%" style="background-color: #0072C6; height: 8px;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Logo Section -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px;">
                    ${organisationLogo ? `
                      <img src="${organisationLogo}" alt="${organisationName}" style="max-width: 150px; max-height: 80px; object-fit: contain;">
                    ` : `
                      <div style="width: 80px; height: 60px; background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 24px; font-weight: bold;">${organisationName?.charAt(0) || 'B'}</span>
                      </div>
                    `}
                  </td>
                </tr>
              </table>

              <!-- Welcome Message -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 40px 20px 40px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0F1F3C;">
                      Welcome to the Team! 🎉
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 40px 20px 40px;">
                    <p style="margin: 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                      Dear <strong>${recipientName || 'Team Member'}</strong>,
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Main Content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                      You have been invited to join <strong style="color: #1EB053;">${organisationName}</strong>'s business management system${inviterName ? ` by ${inviterName}` : ''}.
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                      Your role has been set as:
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Role Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 40px 30px 40px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%); padding: 12px 32px; border-radius: 50px;">
                      <span style="color: #ffffff; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        ${roleLabel}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 40px 30px 40px;">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1EB053 0%, #178f43 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(30, 176, 83, 0.4);">
                      Access Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border-left: 4px solid #1EB053;">
                      <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #0F1F3C; text-transform: uppercase; letter-spacing: 0.5px;">
                        Getting Started
                      </h3>
                      <ol style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                        <li>Click the button above to access the system</li>
                        <li>Log in with your registered email address</li>
                        <li>Set up your profile and preferences</li>
                        <li>Start using the features available for your role</li>
                      </ol>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Features Preview -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0F1F3C;">
                      What You Can Do:
                    </h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="padding: 8px 8px 8px 0; vertical-align: top;">
                          <div style="display: flex; align-items: center;">
                            <span style="color: #1EB053; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4a5568; font-size: 14px;">Sales & Transactions</span>
                          </div>
                        </td>
                        <td width="50%" style="padding: 8px 0 8px 8px; vertical-align: top;">
                          <div style="display: flex; align-items: center;">
                            <span style="color: #1EB053; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4a5568; font-size: 14px;">Inventory Management</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 8px 8px 8px 0; vertical-align: top;">
                          <div style="display: flex; align-items: center;">
                            <span style="color: #1EB053; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4a5568; font-size: 14px;">Team Communication</span>
                          </div>
                        </td>
                        <td width="50%" style="padding: 8px 0 8px 8px; vertical-align: top;">
                          <div style="display: flex; align-items: center;">
                            <span style="color: #1EB053; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4a5568; font-size: 14px;">Reports & Analytics</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent);"></div>
                  </td>
                </tr>
              </table>

              <!-- Support Section -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 30px 40px;">
                    <p style="margin: 0; font-size: 14px; color: #718096; line-height: 1.6; text-align: center;">
                      Need help? Contact your administrator or reply to this email for support.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <!-- Mini Flag -->
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                      <tr>
                        <td width="20" style="background-color: #1EB053; height: 12px; border-radius: 2px 0 0 2px;"></td>
                        <td width="20" style="background-color: #FFFFFF; height: 12px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;"></td>
                        <td width="20" style="background-color: #0072C6; height: 12px; border-radius: 0 2px 2px 0;"></td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #718096;">
                      <strong style="color: #0F1F3C;">${organisationName}</strong>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                      Proudly serving businesses in Sierra Leone 🇸🇱
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom Flag Stripe -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="33.33%" style="background-color: #1EB053; height: 4px; border-radius: 4px 0 0 4px;"></td>
                  <td width="33.33%" style="background-color: #FFFFFF; height: 4px;"></td>
                  <td width="33.33%" style="background-color: #0072C6; height: 4px; border-radius: 0 4px 4px 0;"></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate plain text version
export function generateInviteEmailText({ 
  recipientName, 
  organisationName, 
  role,
  inviterName,
  loginUrl = APP_DOMAIN 
}) {
  const roleLabels = {
    'super_admin': 'Super Administrator',
    'org_admin': 'Organisation Administrator',
    'hr_admin': 'HR Administrator',
    'payroll_admin': 'Payroll Administrator',
    'warehouse_manager': 'Warehouse Manager',
    'retail_cashier': 'Retail Cashier',
    'vehicle_sales': 'Vehicle Sales',
    'driver': 'Driver',
    'accountant': 'Accountant',
    'support_staff': 'Support Staff',
    'read_only': 'Read Only Access'
  };

  const roleLabel = roleLabels[role] || role;

  return `
Welcome to ${organisationName}!

Dear ${recipientName || 'Team Member'},

You have been invited to join ${organisationName}'s business management system${inviterName ? ` by ${inviterName}` : ''}.

Your Role: ${roleLabel}

Access Your Account: ${loginUrl}

Getting Started:
1. Click the link above to access the system
2. Log in with your registered email address
3. Set up your profile and preferences
4. Start using the features available for your role

What You Can Do:
- Sales & Transactions
- Inventory Management
- Team Communication
- Reports & Analytics

Need help? Contact your administrator for support.

---
${organisationName}
Proudly serving businesses in Sierra Leone
  `.trim();
}

export default { generateInviteEmailHTML, generateInviteEmailText };